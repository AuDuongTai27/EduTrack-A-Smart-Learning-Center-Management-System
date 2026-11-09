using System.Text;
using System.Text.RegularExpressions;

namespace EduTrack.DatabaseOperations;

public sealed record PrivilegeNeed(string Stage, string Privilege, string? Schema, string? Table, string Reason);
public sealed record PrivilegeDecision(PrivilegeNeed Need, bool Granted, string[] Evidence);
public sealed record DatabaseInventory(string Schema, string[] Tables, string[] Views, int Triggers, int Routines, int Events);

// Input must be SHOW GRANTS FOR CURRENT_USER() USING <only enabled roles>, captured
// on the SAME connection as ENABLED_ROLES. A role assignment alone is never a grant.
public sealed class EffectivePrivileges
{
    private sealed record Grant(bool Revoke, string Privilege, string Schema, string Table,
        bool Global, bool SchemaWide, bool ColumnLimited, string Source);
    private readonly List<Grant> grants = [];
    private readonly bool partialRevokes;
    private readonly bool ignoreCase;
    public List<string> Errors { get; } = [];

    // ALL is expanded only to STATIC privileges valid at that level. It does not
    // establish dynamic privileges such as SET_USER_ID, SHOW_ROUTINE or FLUSH_TABLES.
    private static readonly HashSet<string> GlobalStatic = new(StringComparer.Ordinal)
    {
        "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "RELOAD", "SHUTDOWN",
        "PROCESS", "FILE", "REFERENCES", "INDEX", "ALTER", "SHOW DATABASES", "SUPER",
        "CREATE TEMPORARY TABLES", "LOCK TABLES", "EXECUTE", "REPLICATION SLAVE",
        "REPLICATION CLIENT", "CREATE VIEW", "SHOW VIEW", "CREATE ROUTINE", "ALTER ROUTINE",
        "CREATE USER", "EVENT", "TRIGGER", "CREATE TABLESPACE", "CREATE ROLE", "DROP ROLE"
    };
    private static readonly HashSet<string> SchemaStatic = new(StringComparer.Ordinal)
    {
        "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "REFERENCES", "INDEX", "ALTER",
        "CREATE TEMPORARY TABLES", "LOCK TABLES", "EXECUTE", "CREATE VIEW", "SHOW VIEW",
        "CREATE ROUTINE", "ALTER ROUTINE", "EVENT", "TRIGGER"
    };
    private static readonly HashSet<string> TableStatic = new(StringComparer.Ordinal)
    {
        "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "REFERENCES", "INDEX", "ALTER",
        "CREATE VIEW", "SHOW VIEW", "TRIGGER"
    };

    public EffectivePrivileges(IEnumerable<string> effectiveGrants, bool partialRevokes, int lowerCaseTableNames)
    {
        this.partialRevokes = partialRevokes;
        ignoreCase = lowerCaseTableNames != 0;
        foreach (var line in effectiveGrants)
        {
            try { Parse(line); }
            catch (FormatException ex) { Errors.Add(ex.Message); }
        }
    }

    public PrivilegeDecision Check(PrivilegeNeed need)
    {
        if (Errors.Count != 0) return new(need, false, ["Unrecognized grant syntax; manual review required."]);
        var privilege = need.Privilege.ToUpperInvariant();
        var sources = new List<string>();
        foreach (var grant in grants.Where(g => !g.Revoke && !g.ColumnLimited))
        {
            var all = grant.Privilege is "ALL" or "ALL PRIVILEGES";
            var scopePrivileges = grant.Global ? GlobalStatic : grant.SchemaWide ? SchemaStatic : TableStatic;
            if (grant.Privilege != privilege && !(all && scopePrivileges.Contains(privilege))) continue;
            if (grant.Global)
            {
                // Restrictions apply to the global grant, not independent table/schema grants.
                var restrictions = grants.Where(g => g.Revoke && (g.Privilege == privilege ||
                    (g.Privilege is "ALL" or "ALL PRIVILEGES" && SchemaStatic.Contains(privilege))));
                if (need.Schema is null ? restrictions.Any() : restrictions.Any(g => SchemaMatches(g.Schema, need.Schema))) continue;
            }
            else
            {
                if (need.Schema is null || !SchemaMatches(grant.Schema, need.Schema)) continue;
                if (!grant.SchemaWide && (need.Table is null || !Same(grant.Table, need.Table))) continue;
            }
            sources.Add(grant.Source);
        }
        return new(need, sources.Count != 0, sources.Distinct().ToArray());
    }

    private bool Same(string a, string b) => string.Equals(a, b,
        ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);

    private bool SchemaMatches(string pattern, string schema)
    {
        // With partial_revokes=ON, MySQL treats unescaped %/_ literally.
        var regex = new StringBuilder("\\A");
        for (var i = 0; i < pattern.Length; i++)
        {
            if (pattern[i] == '\\' && i + 1 < pattern.Length) regex.Append(Regex.Escape(pattern[++i].ToString()));
            else if (!partialRevokes && pattern[i] == '%') regex.Append(".*");
            else if (!partialRevokes && pattern[i] == '_') regex.Append('.');
            else regex.Append(Regex.Escape(pattern[i].ToString()));
        }
        regex.Append("\\z");
        return Regex.IsMatch(schema, regex.ToString(), RegexOptions.CultureInvariant |
            (ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None), TimeSpan.FromSeconds(1));
    }

    private sealed record Token(string Text, bool Quoted = false);
    private static bool Is(Token t, string text) => !t.Quoted && t.Text.Equals(text, StringComparison.OrdinalIgnoreCase);

    private void Parse(string line)
    {
        var tokens = Lex(line);
        if (tokens.Count == 0) throw new FormatException("Empty grant output.");
        var revoke = Is(tokens[0], "REVOKE");
        if (!revoke && !Is(tokens[0], "GRANT")) throw new FormatException("Unsupported grant statement.");
        var on = tokens.FindIndex(1, t => Is(t, "ON"));
        if (on < 0)
        {
            // GRANT `role`@`host`, ... TO user: roles are expanded by the server,
            // never by trusting their names, availability, or WITH ADMIN OPTION.
            if (!revoke && tokens.Count > 3 && tokens[1].Quoted && tokens.Any(t => t.Text == "@") &&
                tokens.Any(t => Is(t, "TO"))) return;
            throw new FormatException("Unsupported role/privilege statement.");
        }
        var privileges = new List<(string Name, bool ColumnLimited)>();
        var start = 1; var depth = 0;
        for (var i = 1; i <= on; i++)
        {
            if (i < on && tokens[i].Text == "(") depth++;
            if (i < on && tokens[i].Text == ")") depth--;
            if (depth < 0) throw new FormatException("Invalid column grant.");
            if (i == on || (tokens[i].Text == "," && depth == 0))
            {
                var part = tokens.GetRange(start, i - start);
                var column = part.FindIndex(t => t.Text == "(");
                var name = string.Join(" ", (column < 0 ? part : part.Take(column)).Select(t => t.Text)).ToUpperInvariant();
                if (name.Length == 0 || part.Any(t => t.Quoted && column < 0)) throw new FormatException("Invalid privilege name.");
                privileges.Add((name, column >= 0)); start = i + 1;
            }
        }
        if (depth != 0) throw new FormatException("Unbalanced column grant.");
        var target = on + 1;
        if (target >= tokens.Count) throw new FormatException("Missing grant scope.");
        if (privileges.Count == 1 && privileges[0].Name == "PROXY") return; // Account proxy is not object access.
        if (Is(tokens[target], "PROCEDURE") || Is(tokens[target], "FUNCTION")) return; // Not table/schema privileges.
        if (Is(tokens[target], "TABLE")) target++;
        if (target + 3 >= tokens.Count || tokens[target + 1].Text != "." ||
            !Is(tokens[target + 3], revoke ? "FROM" : "TO")) throw new FormatException("Unsupported privilege scope.");
        var schema = tokens[target].Text; var table = tokens[target + 2].Text;
        var schemaStar = Is(tokens[target], "*"); var tableStar = Is(tokens[target + 2], "*");
        if (schemaStar && !tableStar) throw new FormatException("Invalid global scope.");
        if (revoke && (!partialRevokes || schemaStar || !tableStar)) throw new FormatException("Unsupported REVOKE restriction.");
        foreach (var (name, column) in privileges)
            grants.Add(new(revoke, name, schema, table, schemaStar && tableStar, tableStar, column,
                (revoke ? "REVOKE " : "GRANT ") + name + " ON " + schema + "." + table));
    }

    private static List<Token> Lex(string text)
    {
        var tokens = new List<Token>();
        for (var i = 0; i < text.Length;)
        {
            if (char.IsWhiteSpace(text[i]) || text[i] == ';') { i++; continue; }
            if (text[i] is '`' or '\'' or '"')
            {
                var quote = text[i++]; var value = new StringBuilder(); var closed = false;
                while (i < text.Length)
                {
                    if (text[i] == quote)
                    {
                        i++;
                        if (i < text.Length && text[i] == quote) { value.Append(quote); i++; continue; }
                        closed = true; break;
                    }
                    // SHOW GRANTS emits backtick identifiers. Preserve database pattern
                    // escapes such as \_ and \%; do not silently reinterpret them.
                    value.Append(text[i++]);
                }
                if (!closed) throw new FormatException("Unterminated quoted grant identifier.");
                tokens.Add(new(value.ToString(), true)); continue;
            }
            if (text[i] is '.' or ',' or '@' or '(' or ')' or '*') { tokens.Add(new(text[i++].ToString())); continue; }
            var start = i;
            while (i < text.Length && !char.IsWhiteSpace(text[i]) && !".,@()*;`'\"".Contains(text[i])) i++;
            tokens.Add(new(text[start..i]));
        }
        return tokens;
    }
}

public static class PrivilegePolicy
{
    public static List<PrivilegeNeed> Source(DatabaseInventory inventory)
    {
        var s = inventory.Schema;
        return [
            new("preflight", "SELECT", s, null, "Complete schema/data visibility and read-only fingerprints"),
            new("preflight", "PROCESS", null, null, "Observe INNODB_TRX and other sessions before maintenance"),
            new("mysqldump", "SELECT", null, null, "MySQL 8.0 --routines requires global SELECT"),
            new("mysqldump", "TRIGGER", s, null, "--triggers: ensure no triggers are silently hidden"),
            new("mysqldump", "EVENT", s, null, "--events requires EVENT on dumped schema"),
            .. inventory.Views.Select(v => new PrivilegeNeed("mysqldump", "SHOW VIEW", s, v, "Dump view definition")),
            new("migration", "ALTER", s, "users", "ALTER TABLE users ADD column/FK"),
            new("migration", "CREATE", s, "users", "Documented ALTER TABLE prerequisite"),
            new("migration", "INSERT", s, "users", "Documented ALTER TABLE prerequisite"),
            new("migration", "INDEX", s, "users", "CREATE INDEX IX_users_grade_id"),
            new("migration", "REFERENCES", s, "grades", "Referenced table of new foreign key"),
            new("migration", "INSERT", s, "__EFMigrationsHistory", "Record exactly AddStudentGrade")
        ];
    }

    // A separate account/connection on the independent restore instance must be
    // checked there. These rights cannot be inferred from the main account.
    // Exact dump/DEFINER/function/binlog requirements must be reviewed once a dump
    // exists; this profile covers the present ordinary-table dump, no add-locks.
    public static List<PrivilegeNeed> Restore(DatabaseInventory inventory)
    {
        var needs = new List<PrivilegeNeed>();
        foreach (var privilege in new[] { "CREATE", "DROP", "INSERT", "ALTER", "REFERENCES", "SELECT" })
            needs.Add(new("restore-test", privilege, inventory.Schema, null,
                "Create isolated schema/tables, replay default DROP/INSERT/ALTER DISABLE KEYS, verify data"));
        if (inventory.Views.Length != 0)
            foreach (var privilege in new[] { "CREATE VIEW", "SHOW VIEW" })
                needs.Add(new("restore-test", privilege, inventory.Schema, null, "Restore and inspect views"));
        if (inventory.Triggers != 0) needs.Add(new("restore-test", "TRIGGER", inventory.Schema, null, "Restore triggers"));
        if (inventory.Events != 0) needs.Add(new("restore-test", "EVENT", inventory.Schema, null, "Restore events"));
        if (inventory.Routines != 0)
            foreach (var privilege in new[] { "CREATE ROUTINE", "ALTER ROUTINE" })
                needs.Add(new("restore-test", privilege, inventory.Schema, null, "Restore/drop stored routines"));
        return needs;
    }
}
