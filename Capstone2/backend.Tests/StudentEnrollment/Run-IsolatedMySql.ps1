param(
    [Parameter(Mandatory = $true)][string]$TestAssemblyPath,
    [string]$DotnetPath = 'dotnet',
    [string]$MySqlBin = 'C:/Program Files/MySQL/MySQL Server 8.0/bin',
    [switch]$Http,
    [string]$FrontendRoot = ''
)
$ErrorActionPreference = 'Stop'
$probe = New-Object System.Net.Sockets.TcpClient
try {
    $probe.Connect('127.0.0.1', 33308)
    throw 'Test port 33308 is already occupied; refusing to reuse an unknown server.'
} catch [System.Net.Sockets.SocketException] {
    # No server is listening; it is safe to start our own instance.
} finally { $probe.Dispose() }
$testRoot = Join-Path $env:TEMP ('edutrack-enrollment-mysql-' + [guid]::NewGuid().ToString('N'))
$testData = Join-Path $testRoot 'data'
New-Item -ItemType Directory -Path $testRoot | Out-Null
& (Join-Path $MySqlBin 'mysqld.exe') --no-defaults --initialize-insecure "--datadir=$testData" "--log-error=$testRoot/initialize.log"
if ($LASTEXITCODE -ne 0) { throw "Test server initialization failed; see $testRoot" }
$server = Start-Process -FilePath (Join-Path $MySqlBin 'mysqld.exe') -ArgumentList @('--no-defaults', "--datadir=$testData", '--port=33308', '--bind-address=127.0.0.1', '--mysqlx=0', '--innodb-buffer-pool-size=64M', "--log-error=$testRoot/server.log", '--skip-log-bin') -WindowStyle Hidden -PassThru
try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 50; $attempt++) {
        $connectionProbe = New-Object System.Net.Sockets.TcpClient
        try { $connectionProbe.Connect('127.0.0.1', 33308); $ready = $true; break }
        catch [System.Net.Sockets.SocketException] { }
        finally { $connectionProbe.Dispose() }
        Start-Sleep -Milliseconds 200
    }
    if (!$ready) { throw "Test server did not start; see $testRoot" }
    $env:EDUTRACK_TEST_MYSQL_BIN = $MySqlBin
    if ($Http) {
        if ($FrontendRoot) { $env:EDUTRACK_TEST_FRONTEND_ROOT = (Resolve-Path -LiteralPath $FrontendRoot).Path }
        & $DotnetPath $TestAssemblyPath --mysql --http
    } else {
        & $DotnetPath $TestAssemblyPath --mysql
    }
    if ($LASTEXITCODE -ne 0) { throw 'Isolated MySQL assertions failed.' }
} finally {
    $actualData = (& (Join-Path $MySqlBin 'mysql.exe') --no-defaults --protocol=TCP --host=127.0.0.1 --port=33308 --user=root --connect-timeout=3 --batch --raw --skip-column-names '--execute=SELECT @@datadir').Trim().Replace('\', '/').TrimEnd('/')
    if ($actualData -ine $testData.Replace('\', '/').TrimEnd('/')) { throw 'Test server identity mismatch; refusing shutdown.' }
    & (Join-Path $MySqlBin 'mysqladmin.exe') --no-defaults --protocol=TCP --host=127.0.0.1 --port=33308 --user=root --connect-timeout=3 shutdown
    if ($LASTEXITCODE -ne 0) { throw 'Isolated test server shutdown failed.' }
    Write-Output "Stopped isolated MySQL process $($server.Id). Diagnostic files: $testRoot"
}
