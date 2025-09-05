#requires -Version 5.1
[CmdletBinding()]
param(
  [switch]$DbPush,
  [switch]$Clean,
  [string]$EnvFile = ".env"
)

function Write-Info($msg){ Write-Host "[zaplog] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[zaplog] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[zaplog] $msg" -ForegroundColor Red }

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path) | Out-Null
Set-Location ..

if (-not (Test-Path $EnvFile)) {
  Write-Warn "Arquivo $EnvFile não encontrado. Copie .env.example para $EnvFile e ajuste os valores."
}

# Carrega variáveis do .env no ambiente da sessão
if (Test-Path $EnvFile) {
  Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^[ \t]*#') { return }
    if ($_ -match '^[ \t]*$') { return }
    if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
      $k,$v = $_.Split('=',2)
      $v = $v.Trim()
      if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Trim('"') }
      if ($v.StartsWith("'") -and $v.EndsWith("'")) { $v = $v.Trim("'") }
      [Environment]::SetEnvironmentVariable($k,$v,'Process')
    }
  }
  Write-Info "Variáveis do $EnvFile carregadas."
}

function Ensure-Node20Portable {
  param([string]$TargetRoot)
  $candidateVersions = @('20.17.0','20.16.0','20.15.1')
  New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null
  foreach ($v in $candidateVersions) {
    $zip = Join-Path $TargetRoot "node-v$v-win-x64.zip"
    $url = "https://nodejs.org/dist/v$v/node-v$v-win-x64.zip"
    try {
      Write-Info "Baixando Node v$v (portable)..."
      Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
      $extract = Join-Path $TargetRoot "node-v$v-win-x64"
      if (-not (Test-Path $extract)) {
        Expand-Archive -Path $zip -DestinationPath $TargetRoot -Force
      }
      if (Test-Path (Join-Path $extract 'node.exe')) { return $extract }
    } catch {
      Write-Warn "Falha ao baixar v$( $v ): $( $_.Exception.Message )"
    } finally {
      if (Test-Path $zip) { Remove-Item $zip -Force }
    }
  }
  return $null
}

# Checa Node e tenta bootstrap portable se necessário
$nodeExe = $null
try { $nodeVer = & node -v 2>$null } catch { $nodeVer = $null }
if (-not $nodeVer) {
  $defaultPath = "$env:ProgramFiles\nodejs\node.exe"
  if (Test-Path $defaultPath) {
    $env:Path = "$env:ProgramFiles\nodejs;$env:Path"
    try { $nodeVer = & node -v 2>$null } catch { $nodeVer = $null }
  }
}
if (-not $nodeVer) {
  $portableRoot = Join-Path (Resolve-Path '.').Path '.local\\node20'
  $nodeDir = Ensure-Node20Portable -TargetRoot $portableRoot
  if ($nodeDir) {
    $env:Path = "$nodeDir;$env:Path"
    $nodeExe = Join-Path $nodeDir 'node.exe'
    try { $nodeVer = & $nodeExe -v } catch { $nodeVer = $null }
  }
}
if (-not $nodeVer) { Write-Err "Node não encontrado e não foi possível baixar portable."; exit 1 }
Write-Info "Node detectado: $nodeVer"
$major = [int]($nodeVer.TrimStart('v').Split('.')[0])
if ($major -lt 20) { Write-Warn "Recomenda-se Node 20.x ou superior. Versão atual: $nodeVer" }

# Função npm: usa npm do PATH se existir; senão chama via npm-cli.js com node
function Npm([Parameter(ValueFromRemainingArguments=$true)][string[]]$NpmArgs){
  $hasNpm = $false
  try { cmd /c npm -v | Out-Null; if ($LASTEXITCODE -eq 0) { $hasNpm = $true } } catch {}
  if ($hasNpm) {
    $argLine = ($NpmArgs -join ' ')
    $cmd = "npm $argLine"
    Write-Info $cmd
    cmd /c $cmd
    return ($LASTEXITCODE -eq 0)
  } else {
    # fallback via npm-cli.js incluído no pacote
    $npmCli = Join-Path (Resolve-Path '.').Path 'node_modules\npm\bin\npm-cli.js'
    if (-not (Test-Path $npmCli)) { throw "npm não encontrado no PATH e npm-cli.js ausente (rode Npm 'ci' após ter node)." }
    $argLine = ($NpmArgs -join ' ')
    $cmd = "node `"$npmCli`" $argLine"
    Write-Info $cmd
    & node $npmCli @NpmArgs
    return ($LASTEXITCODE -eq 0)
  }
}

if ($Clean) {
  if (Test-Path "node_modules") {
    Write-Info "Removendo node_modules (clean)..."
    cmd /c rmdir /s /q node_modules | Out-Null
  }
}

if ($Clean -or -not (Test-Path "node_modules")) {
  $ok = $false
  if (Test-Path "package-lock.json") { $ok = Npm ci }
  if (-not $ok) {
    Write-Warn "Instalação via ci falhou ou sem lock. Tentando npm install..."
    $ok = Npm install
  }
  if (-not $ok) {
    Write-Err "Falha ao instalar dependências. Feche antivírus/IDE e tente novamente."
    exit 1
  }
}

if ($DbPush) {
  if (-not $env:DATABASE_URL) { Write-Err "DATABASE_URL não definido no ambiente."; exit 1 }
  Npm "run db:push"
}

Write-Info "Iniciando em modo desenvolvimento..."
$started = Npm run dev
if (-not $started) { Write-Err "Falha ao iniciar dev"; exit 1 }
