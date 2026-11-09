# MySQL privilege preflight — Task 03

Standalone .NET 8 operations tool. It does not reference or start the API, EF migration runner or DbSeeder. No command can create a dump, restore a dump, change grants/roles, execute migration SQL or write application data.

```powershell
dotnet build Capstone2/db/tools/MySqlPrivilegeCheck/MySqlPrivilegeCheck.csproj
dotnet Capstone2/db/tools/MySqlPrivilegeCheck/bin/Debug/net8.0/MySqlPrivilegeCheck.dll --self-test
```

Read-only development inspection, after preparing an existing private, Git-ignored evidence directory with appropriate ACLs:

```powershell
dotnet Capstone2/db/tools/MySqlPrivilegeCheck/bin/Debug/net8.0/MySqlPrivilegeCheck.dll --inspect-development <repo-root> <private-evidence-directory>
```

The inspector is intentionally pinned to the previously reviewed development server identity/version, local port 3306 and schema `edutrack_db`. It reads application configuration and its development/environment overrides without printing credentials. A different target requires a separate identity review. Output must be beneath `Capstone2/db/backups/`; it refuses to overwrite existing evidence. Check this location remains Git ignored and private before use.

`--self-test` opens no database connection. `--inspect-development` uses one fresh unpooled session, `SET SESSION TRANSACTION READ ONLY`, `START TRANSACTION READ ONLY`, SELECT/SHOW probes and finally ROLLBACK. DDL rights are evaluated from server-reported effective grants; they are not tested with trial DDL. A successful inspection is a point-in-time privilege result, not authorization to execute DDL and not a verified backup.

The evaluator handles ALL/static rights, individual rights, global/schema/table scopes, schema wildcard escaping and `partial_revokes`, table versus column grants, case rules from `lower_case_table_names`, and partial-revoke restrictions. Unknown syntax blocks verification. Proxy/role-assignment/routine-only grants do not become table rights. ALL does not invent dynamic privileges or GRANT OPTION.

Roles are read from `information_schema.ENABLED_ROLES` on the same session as `CURRENT_ROLE()` and `SHOW GRANTS FOR CURRENT_USER() USING ...`. MySQL expands the enabled roles, including their inherited grants; assigned but inactive roles are never activated or counted. An error obtaining expanded grants blocks the check. This tool never executes SET ROLE or GRANT. A later native client must have the same effective role configuration; run the check again if account, connection initialization or default roles change.

The source policy is for the reviewed MySQL 8.0 dump options:

```text
--single-transaction --quick --skip-lock-tables --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces --skip-add-locks
```

It checks global SELECT for `--routines`, SELECT/visibility of the target schema, TRIGGER/EVENT for full object coverage, SHOW VIEW when views exist, and global PROCESS for the existing maintenance observation queries. PROCESS is not required by this dump's `--no-tablespaces`; LOCK TABLES/RELOAD/FLUSH_TABLES are not required by its single-transaction/GTID-OFF options. Changing options requires policy review.

Migration needs ALTER/CREATE/INSERT on `users` (documented ALTER prerequisites), INDEX on `users`, REFERENCES on `grades`, INSERT on `__EFMigrationsHistory`, plus preflight SELECT rights. It does not require DROP, DELETE, UPDATE or GRANT OPTION.

Restore requirements are a separate plan: CREATE/DROP/INSERT/ALTER/REFERENCES/SELECT on the isolated restore schema, with view/trigger/event/routine privileges added when those objects exist. A later approved restore must inspect the actual dump, verify the separate restore account/instance and any DEFINER, stored-function/binlog, SQL_LOG_BIN or GTID requirements. The source inspector always reports restore rights **NOT VERIFIED**; a source PASS must never be used as a restore gate.

Official references: [SHOW GRANTS and role expansion](https://dev.mysql.com/doc/refman/8.0/en/show-grants.html), [partial revokes](https://dev.mysql.com/doc/refman/8.0/en/partial-revokes.html), [privilege definitions](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html), [mysqldump options and required privileges](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html).
