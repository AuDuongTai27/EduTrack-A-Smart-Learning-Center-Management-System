using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using MySqlConnector;

namespace EduTrack.DatabaseOperations;

public static class LiveInspection
{
    public static async Task<int> Run(string repo, string evidenceDirectory)
    {
        repo = Path.GetFullPath(repo);
        evidenceDirectory = Path.GetFullPath(evidenceDirectory);
        var privateRoot = Path.Combine(repo, "Capstone2", "db", "backups") + Path.DirectorySeparatorChar;
        if (!evidenceDirectory.StartsWith(privateRoot, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Evidence must be inside the Git-ignored private backup directory.");
        // Do not initialize an output directory with unexpectedly broad inherited ACLs.
        if (!Directory.Exists(evidenceDirectory)) throw new InvalidOperationException("Prepare a private evidence directory first.");
        var output = Path.Combine(evidenceDirectory, "privilege-inspection.json");
        if (File.Exists(output)) throw new InvalidOperationException("Refusing to overwrite prior evidence.");

        var settings = JsonNode.Parse(await File.ReadAllTextAsync(Path.Combine(repo, "Capstone2/backend/appsettings.json")))!;
        var connectionString = settings["ConnectionStrings"]?["DefaultConnection"]?.GetValue<string>();
        var dev = Path.Combine(repo, "Capstone2/backend/appsettings.Development.json");
        if (File.Exists(dev)) connectionString = JsonNode.Parse(await File.ReadAllTextAsync(dev))?["ConnectionStrings"]?["DefaultConnection"]?.GetValue<string>() ?? connectionString;
        connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") ?? connectionString;
        if (string.IsNullOrWhiteSpace(connectionString)) throw new InvalidOperationException("Development connection is not configured.");
        var config = new MySqlConnectionStringBuilder(connectionString) { Pooling = false, ConnectionTimeout = 10, DefaultCommandTimeout = 15 };
        if (config.Server is not ("localhost" or "127.0.0.1") || config.Port != 3306 || config.Database != "edutrack_db")
            throw new InvalidOperationException("Unexpected development endpoint; no connection attempted.");

        await using var connection = new MySqlConnection(config.ConnectionString);
        await connection.OpenAsync();
        var queries = new List<string>();
        async Task<List<Dictionary<string, string?>>> Read(string sql)
        {
            // This tool has no SQL-file execution or write mode. SHOW/SELECT probes
            // use a single fresh, unpooled session with an explicitly read-only transaction.
            if (!(sql.StartsWith("SELECT ", StringComparison.Ordinal) || sql.StartsWith("SHOW ", StringComparison.Ordinal) ||
                sql is "SET SESSION TRANSACTION READ ONLY" or "START TRANSACTION READ ONLY" or "ROLLBACK"))
                throw new InvalidOperationException("Read-only SQL allowlist rejected a statement.");
            queries.Add(sql);
            await using var command = new MySqlCommand(sql, connection);
            await using var reader = await command.ExecuteReaderAsync();
            var rows = new List<Dictionary<string, string?>>();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
                for (var i = 0; i < reader.FieldCount; i++)
                    row[reader.GetName(i)] = reader.IsDBNull(i) ? null : Convert.ToString(reader.GetValue(i), CultureInfo.InvariantCulture);
                rows.Add(row);
            }
            return rows;
        }
        static string Q(string name) => "`" + name.Replace("`", "``") + "`";

        await Read("SET SESSION TRANSACTION READ ONLY");
        await Read("START TRANSACTION READ ONLY");
        try
        {
            var server = (await Read("SELECT DATABASE() AS schema_name, @@hostname AS hostname, @@port AS port, @@server_uuid AS uuid, VERSION() AS version, CURRENT_USER() AS account, CURRENT_ROLE() AS active_roles, @@global.partial_revokes AS partial_revokes, @@lower_case_table_names AS lower_case_table_names, @@global.gtid_mode AS gtid_mode, @@global.log_bin AS log_bin, @@global.log_bin_trust_function_creators AS trust_function_creators, @@transaction_read_only AS transaction_read_only")).Single();
            if (server["schema_name"] != "edutrack_db" || server["port"] != "3306" || server["version"] != "8.0.44" ||
                server["uuid"] != "9eb85238-f949-11f0-ad01-9c6b00a7788b" || server["transaction_read_only"] != "1")
                throw new InvalidOperationException("Server identity/version/read-only state differs from reviewed development target.");

            var roles = await Read("SELECT ROLE_NAME, ROLE_HOST FROM information_schema.ENABLED_ROLES ORDER BY ROLE_NAME, ROLE_HOST");
            var direct = (await Read("SHOW GRANTS")).Select(r => r.Values.Single()!).ToArray();
            var expandedSql = "SHOW GRANTS FOR CURRENT_USER()" + (roles.Count == 0 ? "" : " USING " +
                string.Join(", ", roles.Select(r => Q(r["ROLE_NAME"]!) + "@" + Q(r["ROLE_HOST"]!))));
            var expanded = (await Read(expandedSql)).Select(r => r.Values.Single()!).ToArray();
            var evaluator = new EffectivePrivileges(expanded, server["partial_revokes"] == "1", int.Parse(server["lower_case_table_names"]!, CultureInfo.InvariantCulture));
            // First prove complete schema visibility; otherwise information_schema can
            // silently hide objects and cannot be treated as a complete inventory.
            var visibility = evaluator.Check(new("preflight", "SELECT", config.Database, null, "Complete inventory visibility"));
            var visibilityErrors = evaluator.Errors.ToArray();
            if (!visibility.Granted)
            {
                await File.WriteAllTextAsync(output, JsonSerializer.Serialize(new { server, roles, direct, expanded, visibility, errors = visibilityErrors }, new JsonSerializerOptions { WriteIndented = true }));
                Console.WriteLine("BLOCK: SELECT on the whole target schema is not verified; inventory not assumed complete.");
                return 1;
            }

            var objects = await Read("SELECT TABLE_NAME, TABLE_TYPE, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME");
            var counts = (await Read("SELECT (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE()) AS triggers_count, (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE()) AS routines_count, (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA=DATABASE()) AS events_count")).Single();
            var inventory = new DatabaseInventory(config.Database,
                objects.Where(r => r["TABLE_TYPE"] == "BASE TABLE").Select(r => r["TABLE_NAME"]!).ToArray(),
                objects.Where(r => r["TABLE_TYPE"] == "VIEW").Select(r => r["TABLE_NAME"]!).ToArray(),
                int.Parse(counts["triggers_count"]!), int.Parse(counts["routines_count"]!), int.Parse(counts["events_count"]!));
            var decisions = PrivilegePolicy.Source(inventory).Select(evaluator.Check).ToArray();
            var missing = decisions.Where(d => !d.Granted).ToArray();
            var readProbes = new List<string>();
            if (missing.Length == 0)
            {
                // Read-only probes confirm that source privileges work. DDL privileges
                // are checked from server-reported grants, never by a trial ALTER.
                foreach (var table in inventory.Tables)
                {
                    await Read("SELECT * FROM " + Q(table) + " LIMIT 0");
                    await Read("SHOW CREATE TABLE " + Q(table));
                    readProbes.Add("SELECT LIMIT 0 / SHOW CREATE TABLE: " + table);
                }
                await Read("SHOW FULL TABLES");
                await Read("SHOW TRIGGERS");
                await Read("SHOW EVENTS");
                await Read("SHOW PROCEDURE STATUS WHERE Db = DATABASE()");
                await Read("SHOW FUNCTION STATUS WHERE Db = DATABASE()");
                await Read("SELECT trx_id, trx_mysql_thread_id FROM information_schema.INNODB_TRX WHERE trx_mysql_thread_id<>CONNECTION_ID()");
                await Read("SELECT ID, COMMAND FROM information_schema.PROCESSLIST WHERE DB=DATABASE() AND ID<>CONNECTION_ID()");
                foreach (var view in inventory.Views) await Read("SHOW CREATE VIEW " + Q(view));
                readProbes.Add("Metadata, routine/event/trigger visibility and maintenance observation queries");
            }
            var baseline = await Read("SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory ORDER BY MigrationId");
            var snapshot = (await Read("SELECT (SELECT COUNT(*) FROM users) AS users_count, (SELECT COUNT(*) FROM grades) AS grades_count, (SELECT COUNT(*) FROM student_classes) AS enrollment_count, (SELECT COUNT(*) FROM tuition_invoices) AS invoices_count, (SELECT COUNT(*) FROM payment) AS payment_count, (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='grade_id') AS new_column_count, (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND INDEX_NAME='IX_users_grade_id') AS new_index_count, (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='FK_users_grades_grade_id') AS new_fk_count")).Single();
            var after = (await Read("SELECT CURRENT_ROLE() AS active_roles, @@transaction_read_only AS transaction_read_only")).Single();
            if (after["active_roles"] != server["active_roles"] || after["transaction_read_only"] != "1")
                throw new InvalidOperationException("Session roles/read-only state changed during inspection.");
            var restorePlan = PrivilegePolicy.Restore(inventory with { Schema = "edutrack_student_grade_restore" });
            await File.WriteAllTextAsync(output, JsonSerializer.Serialize(new
            {
                inspectedUtc = DateTime.UtcNow, server, roles, direct, expanded, inventory, decisions,
                errors = evaluator.Errors, missing, readProbes, baseline, snapshot, queries,
                sourcePrivilegesVerified = missing.Length == 0 && evaluator.Errors.Count == 0,
                restore = new { status = "NOT_VERIFIED_NO_RESTORE_CONNECTION", requirements = restorePlan,
                    note = "Verify on independent instance later; inspect actual dump and DEFINER/binlog requirements before restore. Source rights do not establish restore rights." },
                dumpOptions = "--single-transaction --quick --skip-lock-tables --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces --skip-add-locks",
                authorization = "READ_ONLY_ONLY_NO_BACKUP_RESTORE_OR_MIGRATION"
            }, new JsonSerializerOptions { WriteIndented = true }));
            foreach (var stage in decisions.GroupBy(d => d.Need.Stage))
                Console.WriteLine(stage.Key + ": " + (stage.All(d => d.Granted) ? "PASS" : "BLOCK") + " (" + stage.Count() + " requirements)");
            foreach (var d in missing) Console.WriteLine("MISSING: " + d.Need.Stage + " " + d.Need.Privilege + " on " + (d.Need.Schema ?? "*") + "." + (d.Need.Table ?? "*"));
            Console.WriteLine("Enabled roles: " + roles.Count + "; tables: " + inventory.Tables.Length + "; views: " + inventory.Views.Length);
            Console.WriteLine("Restore account: NOT VERIFIED (no restore instance opened).");
            Console.WriteLine("Read-only evidence: " + output);
            return missing.Length == 0 && evaluator.Errors.Count == 0 ? 0 : 1;
        }
        finally { await Read("ROLLBACK"); }
    }
}
