namespace EduTrack.DatabaseOperations;

public static class PolicyTests
{
    public static int Run()
    {
        var passed = 0;
        void Expect(string name, bool result)
        {
            if (!result) throw new InvalidOperationException("FAIL: " + name);
            passed++; Console.WriteLine("PASS: " + name);
        }
        EffectivePrivileges Parse(params string[] grants) => new(grants, false, 1);
        static PrivilegeNeed Need(string p, string? s = "edutrack_db", string? t = "users") => new("test", p, s, t, "fixture");
        static bool Has(EffectivePrivileges p, string privilege, string? schema = "edutrack_db", string? table = "users") => p.Check(Need(privilege, schema, table)).Granted;
        static bool Stage(EffectivePrivileges p, IEnumerable<PrivilegeNeed> needs, string stage) => needs.Where(n => n.Stage == stage).All(n => p.Check(n).Granted);
        var inventory = new DatabaseInventory("edutrack_db", ["users", "grades", "__EFMigrationsHistory"], [], 0, 0, 0);
        var source = PrivilegePolicy.Source(inventory);

        var all = Parse("GRANT ALL PRIVILEGES ON *.* TO `operator`@`localhost`");
        Expect("ALL PRIVILEGES global satisfies source profile", source.All(n => all.Check(n).Granted));
        Expect("ALL global does not invent dynamic privileges", !Has(all, "SHOW_ROUTINE", null, null));
        Expect("ALL global excludes GRANT OPTION", !Has(all, "GRANT OPTION", null, null));
        var schema = Parse("GRANT ALL PRIVILEGES ON `edutrack_db`.* TO `operator`@`localhost`");
        Expect("ALL schema satisfies migration", Stage(schema, source, "migration"));
        Expect("ALL schema cannot grant global PROCESS", !Has(schema, "PROCESS", null, null));
        Expect("ALL schema cannot grant global SELECT for routines dump", !Stage(schema, source, "mysqldump"));
        Expect("ALL schema not valid for another schema", !Has(schema, "ALTER", "other_db"));
        var full = Parse("GRANT SELECT, PROCESS ON *.* TO `operator`@`localhost`",
            "GRANT INSERT, CREATE, ALTER, INDEX, REFERENCES, TRIGGER, EVENT ON `edutrack_db`.* TO `operator`@`localhost`");
        Expect("complete individual global/schema grants satisfy all stages", source.All(n => full.Check(n).Granted));
        var missing = Parse("GRANT SELECT, PROCESS ON *.* TO `operator`@`localhost`",
            "GRANT INSERT, CREATE, ALTER, INDEX, TRIGGER, EVENT ON `edutrack_db`.* TO `operator`@`localhost`");
        Expect("missing REFERENCES blocks migration", !Stage(missing, source, "migration"));
        Expect("missing privilege identifies referenced table", source.Where(n => !missing.Check(n).Granted).Single().Table == "grades");
        var wrong = Parse("GRANT ALL PRIVILEGES ON `another_db`.* TO `operator`@`localhost`");
        Expect("wrong schema cannot satisfy migration", !Stage(wrong, source, "migration"));
        Expect("USAGE is not SELECT", !Has(Parse("GRANT USAGE ON *.* TO `x`@`%`"), "SELECT"));
        Expect("WITH GRANT OPTION is not privilege access by itself", !Has(Parse("GRANT USAGE ON *.* TO `x`@`%` WITH GRANT OPTION"), "ALTER"));
        Expect("privileges from multiple grant lines combine", Has(full, "ALTER") && Has(full, "SELECT"));
        var table = Parse("GRANT ALTER, CREATE, INSERT, INDEX ON `edutrack_db`.`users` TO `operator`@`localhost`",
            "GRANT REFERENCES ON `edutrack_db`.`grades` TO `operator`@`localhost`",
            "GRANT INSERT ON `edutrack_db`.`__EFMigrationsHistory` TO `operator`@`localhost`");
        Expect("precise table grants satisfy migration", Stage(table, source, "migration"));
        Expect("table grants do not imply schema visibility", !Has(table, "SELECT", "edutrack_db", null));
        Expect("table grants do not grant another table", !Has(table, "ALTER", "edutrack_db", "grades"));
        Expect("REFERENCES on users cannot replace REFERENCES on grades", !Has(Parse("GRANT REFERENCES ON `edutrack_db`.`users` TO `x`@`%`"), "REFERENCES", "edutrack_db", "grades"));
        Expect("ALL table cannot grant PROCESS", !Has(Parse("GRANT ALL ON `edutrack_db`.`users` TO `x`@`%`"), "PROCESS"));
        Expect("column SELECT cannot become table SELECT", !Has(Parse("GRANT SELECT (`user_id`, `full_name`) ON `edutrack_db`.`users` TO `x`@`%`"), "SELECT"));
        Expect("mixed column and full-table privileges kept separate", Has(Parse("GRANT SELECT (`user_id`), ALTER ON `edutrack_db`.`users` TO `x`@`%`"), "ALTER"));
        Expect("schema grant spelling is case insensitive on Windows", Has(schema, "ALTER", "EDUTRACK_DB", "USERS"));
        Expect("case sensitivity follows server lower_case_table_names", !new EffectivePrivileges(["GRANT SELECT ON `EduTrack`.* TO `x`@`%`"], false, 0).Check(Need("SELECT", "edutrack")).Granted);
        Expect("database wildcard matches when partial_revokes OFF", Has(Parse("GRANT SELECT ON `edutrack%`.* TO `x`@`%`"), "SELECT"));
        Expect("underscore database wildcard matches when OFF", Has(Parse("GRANT SELECT ON `edutrack_db`.* TO `x`@`%`"), "SELECT", "edutrackXdb"));
        Expect("escaped underscore is literal", !Has(Parse("GRANT SELECT ON `edutrack\\_db`.* TO `x`@`%`"), "SELECT", "edutrackXdb"));
        Expect("escaped underscore matches exact schema", Has(Parse("GRANT SELECT ON `edutrack\\_db`.* TO `x`@`%`"), "SELECT"));
        Expect("partial_revokes ON treats wildcard literally", !new EffectivePrivileges(["GRANT SELECT ON `edutrack%`.* TO `x`@`%`"], true, 1).Check(Need("SELECT")).Granted);
        Expect("literal schema underscore works with partial_revokes ON", new EffectivePrivileges(["GRANT SELECT ON `edutrack_db`.* TO `x`@`%`"], true, 1).Check(Need("SELECT")).Granted);
        var restriction = new EffectivePrivileges(["GRANT SELECT, ALTER ON *.* TO `x`@`%`", "REVOKE ALTER ON `edutrack_db`.* FROM `x`@`%`"], true, 1);
        Expect("partial revoke blocks global privilege on target schema", !Has(restriction, "ALTER"));
        Expect("partial revoke preserves different privilege", Has(restriction, "SELECT"));
        Expect("partial revoke preserves other schema", Has(restriction, "ALTER", "other_db"));
        Expect("restricted global privilege not certified as unrestricted global", !Has(restriction, "ALTER", null, null));
        var regrant = new EffectivePrivileges(["GRANT SELECT ON *.* TO `x`@`%`", "REVOKE SELECT ON `edutrack_db`.* FROM `x`@`%`", "GRANT SELECT ON `edutrack_db`.`users` TO `x`@`%`"], true, 1);
        Expect("table regrant independent of global restriction", Has(regrant, "SELECT"));
        Expect("table regrant does not restore all tables", !Has(regrant, "SELECT", "edutrack_db", null));
        Expect("unexpected REVOKE with partial_revokes OFF fails closed", Parse("GRANT SELECT ON *.* TO `x`@`%`", "REVOKE SELECT ON `edutrack_db`.* FROM `x`@`%`").Errors.Count != 0);
        var rolesOnly = Parse("GRANT `migration_role`@`%` TO `x`@`%`");
        Expect("assigned but unexpanded role does not grant ALTER", !Has(rolesOnly, "ALTER"));
        var expandedRole = Parse("GRANT USAGE ON *.* TO `x`@`%`", "GRANT ALTER ON `edutrack_db`.* TO `x`@`%`", "GRANT `migration_role`@`%` TO `x`@`%`");
        Expect("server-expanded active role provides privilege", Has(expandedRole, "ALTER"));
        Expect("active role with wrong schema does not help", !Has(Parse("GRANT SELECT ON `other_db`.* TO `x`@`%`", "GRANT `reader`@`%` TO `x`@`%`"), "SELECT"));
        Expect("multiple active roles merged by SHOW GRANTS USING", Has(Parse("GRANT ALTER ON `edutrack_db`.* TO `x`@`%`", "GRANT INDEX ON `edutrack_db`.* TO `x`@`%`", "GRANT `a`@`%`, `b`@`%` TO `x`@`%`"), "INDEX"));
        Expect("nested role name alone never implies privileges", !Has(Parse("GRANT `nested_admin`@`%` TO `x`@`%` WITH ADMIN OPTION"), "ALTER"));
        Expect("proxy grant ignored as object access", !Has(Parse("GRANT PROXY ON ''@'' TO `x`@`%` WITH GRANT OPTION"), "SELECT"));
        Expect("routine EXECUTE does not imply table SELECT", !Has(Parse("GRANT EXECUTE ON PROCEDURE `edutrack_db`.`users` TO `x`@`%`"), "SELECT"));
        Expect("dynamic PROCESS-like name is not PROCESS", !Has(Parse("GRANT PROCESS_ADMIN ON *.* TO `x`@`%`"), "PROCESS", null, null));
        Expect("quoted identifier containing ON parsed correctly", Has(Parse("GRANT SELECT ON `ON`.`a``b` TO `x`@`%`"), "SELECT", "ON", "a`b"));
        Expect("malformed grant blocks even alongside valid grant", !Has(Parse("GRANT ALL ON *.* TO `x`@`%`", "UNEXPECTED OUTPUT"), "ALTER"));
        Expect("empty grants fail closed", !Has(Parse(), "ALTER"));
        Expect("unterminated identifier fails closed", Parse("GRANT ALL ON `edutrack_db.* TO `x`@`%`").Errors.Count != 0);
        Expect("quoted literal star not global wildcard", !Has(Parse("GRANT SELECT ON `*`.* TO `x`@`%`"), "SELECT"));

        Expect("CREATE prerequisite for ALTER is required", source.Any(n => n.Stage == "migration" && n.Privilege == "CREATE" && n.Table == "users"));
        Expect("INSERT prerequisite for ALTER is required", source.Any(n => n.Stage == "migration" && n.Privilege == "INSERT" && n.Table == "users"));
        Expect("main migration does not require DROP or GRANT OPTION", !source.Any(n => n.Stage == "migration" && n.Privilege is "DROP" or "GRANT OPTION"));
        Expect("fixed no-tablespaces dump does not need PROCESS for dump itself", !source.Any(n => n.Stage == "mysqldump" && n.Privilege == "PROCESS"));
        Expect("fixed single-transaction GTID OFF dump needs no LOCK TABLES or RELOAD", !source.Any(n => n.Stage == "mysqldump" && n.Privilege is "LOCK TABLES" or "RELOAD" or "FLUSH_TABLES"));
        var withViews = PrivilegePolicy.Source(inventory with { Views = ["student_view"] });
        Expect("SHOW VIEW required when views present", withViews.Any(n => n.Privilege == "SHOW VIEW" && n.Table == "student_view"));
        var restore = PrivilegePolicy.Restore(inventory with { Schema = "restore_only" });
        Expect("source-only schema rights do not prove restore privileges", !restore.All(n => schema.Check(n).Granted));
        Expect("restore scoped account satisfies basic empty-instance profile", restore.All(n => Parse("GRANT CREATE, DROP, INSERT, ALTER, REFERENCES, SELECT ON `restore_only`.* TO `x`@`%`").Check(n).Granted));
        Expect("restore without CREATE is rejected", !restore.All(n => Parse("GRANT DROP, INSERT, ALTER, REFERENCES, SELECT ON `restore_only`.* TO `x`@`%`").Check(n).Granted));
        Expect("restore profile includes objects conditionally", PrivilegePolicy.Restore(inventory with { Views = ["v"], Triggers = 1, Routines = 1, Events = 1 }).Select(n => n.Privilege).ToHashSet().IsSupersetOf(["CREATE VIEW", "SHOW VIEW", "TRIGGER", "EVENT", "CREATE ROUTINE", "ALTER ROUTINE"]));
        Console.WriteLine("Result: " + passed + " assertions passed; no database connection opened.");
        return 0;
    }
}
