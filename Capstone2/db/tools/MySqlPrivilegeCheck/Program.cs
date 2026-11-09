using EduTrack.DatabaseOperations;
using MySqlConnector;

try
{
    if (args is ["--self-test"])
        return PolicyTests.Run();
    if (args is ["--inspect-development", var repo, var evidence])
        return await LiveInspection.Run(repo, evidence);
    Console.Error.WriteLine("Usage: MySqlPrivilegeCheck --self-test | --inspect-development <repo-root> <existing-private-evidence-directory>");
    return 2;
}
catch (MySqlException ex)
{
    // Report the error code, never the connection string, password or server rows.
    Console.Error.WriteLine("BLOCK: MySQL read-only inspection failed (error " + ex.Number + "). No write operation is supported by this tool.");
    return 1;
}
catch (Exception ex)
{
    Console.Error.WriteLine("BLOCK: " + ex.GetType().Name + ": " + ex.Message);
    return 1;
}
