# All-in-one deploy script for gift-generator.
#
# Run from project root with:
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1
#
# Was passiert:
#   1. Fragt dich nach einer Commit-Message
#   2. git add -A + git commit
#   3. git push zu GitHub (mit PAT-Prompt falls noetig)
#   4. Liest DEPLOY_TOKEN aus .env (gitignored)
#   5. Feuert den Deploy-Webhook auf sophey.vodka
#
# Tokens werden niemals geloggt oder in Config gespeichert.

$ErrorActionPreference = 'Stop'

function Write-Step  ($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok    ($msg) { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn  ($msg) { Write-Host "    $msg" -ForegroundColor Yellow }
function Write-Fail  ($msg) { Write-Host "    $msg" -ForegroundColor Red }

# ---------------------------------------------------------------------------
# 0. Sanity-Check: sind wir im richtigen Repo?
# ---------------------------------------------------------------------------
if (-not (Test-Path ".git")) {
    Write-Fail "Kein .git Ordner gefunden. Bist du im Projekt-Root?"
    exit 1
}
if (-not (Test-Path ".env")) {
    Write-Fail ".env fehlt. Lege sie an (siehe .env.example) und trage DEPLOY_TOKEN ein."
    exit 1
}

# ---------------------------------------------------------------------------
# 1. Commit-Message abfragen
# ---------------------------------------------------------------------------
Write-Step "Was hat sich geaendert?"
Write-Host "    (Kurze Beschreibung, z.B. 'neue templates' oder 'fix footer')" -ForegroundColor DarkGray
$commitMsg = Read-Host "    Commit-Message"

if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    Write-Fail "Leere Commit-Message. Abgebrochen."
    exit 1
}

# ---------------------------------------------------------------------------
# 2. git add + commit  (skip wenn nichts geaendert)
# ---------------------------------------------------------------------------
Write-Step "Staging Aenderungen..."
git add -A

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Warn "Keine Aenderungen zu committen. Ueberspringe Commit, pushe trotzdem (falls lokal vorne)."
} else {
    Write-Step "Erstelle Commit: '$commitMsg'"
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Commit fehlgeschlagen."
        exit 1
    }
    Write-Ok "Commit erstellt."
}

# ---------------------------------------------------------------------------
# 3. Push zu GitHub
#    Erst normaler push (falls Credential Manager / SSH funktioniert).
#    Wenn das scheitert -> PAT abfragen und mit Token-URL pushen.
# ---------------------------------------------------------------------------
Write-Step "Pushe zu GitHub..."
git push 2>&1 | Tee-Object -Variable pushOutput | Out-Host
$pushOk = ($LASTEXITCODE -eq 0)

if (-not $pushOk) {
    Write-Warn "Normaler Push hat nicht geklappt. Wechsle auf PAT-Modus."
    Write-Host ""
    Write-Host "    Hol dir einen Token auf:" -ForegroundColor DarkGray
    Write-Host "    https://github.com/settings/tokens/new" -ForegroundColor DarkGray
    Write-Host "    (Scope: repo, Expiration: 30 days)" -ForegroundColor DarkGray
    Write-Host ""

    $secure = Read-Host -AsSecureString -Prompt "    GitHub Token (versteckt, dann Enter)"
    $token  = [System.Net.NetworkCredential]::new('', $secure).Password

    if (-not $token -or $token.Length -lt 20) {
        Write-Fail "Token sieht zu kurz aus (Laenge: $($token.Length)). Abgebrochen."
        exit 1
    }

    $repoUrl = "https://MissLarifari:$token@github.com/MissLarifari/gift-generator.git"
    git push $repoUrl main
    $pushOk = ($LASTEXITCODE -eq 0)

    # Remote-URL sofort wieder sauber setzen, damit der Token nicht im .git/config landet
    git remote set-url origin https://github.com/MissLarifari/gift-generator.git | Out-Null

    # Token aus Speicher loeschen
    Remove-Variable token, secure, repoUrl -ErrorAction SilentlyContinue
}

if (-not $pushOk) {
    Write-Fail "Push fehlgeschlagen. Deploy-Webhook wird NICHT getriggert."
    exit 1
}
Write-Ok "Push erfolgreich."

# ---------------------------------------------------------------------------
# 4. DEPLOY_TOKEN aus .env lesen
# ---------------------------------------------------------------------------
Write-Step "Lese DEPLOY_TOKEN aus .env..."
$envLine = Get-Content .env | Select-String -Pattern '^\s*DEPLOY_TOKEN\s*=\s*(.+?)\s*$'
if (-not $envLine) {
    Write-Fail "DEPLOY_TOKEN nicht in .env gefunden."
    exit 1
}
$deployToken = $envLine.Matches.Groups[1].Value.Trim('"').Trim("'")
if ([string]::IsNullOrWhiteSpace($deployToken) -or $deployToken -eq 'your_deploy_token_here') {
    Write-Fail "DEPLOY_TOKEN in .env ist leer oder Platzhalter."
    exit 1
}
Write-Ok "Token gefunden (Laenge: $($deployToken.Length))."

# ---------------------------------------------------------------------------
# 5. Deploy-Webhook anpingen
# ---------------------------------------------------------------------------
$apiUrl = "https://sophey.vodka/api/deploy/gift-generator"
Write-Step "Triggere Deploy: $apiUrl"

$response = & curl.exe -sS -w "`nHTTP_STATUS:%{http_code}" -X POST $apiUrl -H "Authorization: Bearer $deployToken"
Remove-Variable deployToken -ErrorAction SilentlyContinue

# HTTP-Status aus der Antwort fischen
$status = "?"
$body   = $response
if ($response -match "HTTP_STATUS:(\d+)") {
    $status = $Matches[1]
    $body   = ($response -replace "HTTP_STATUS:\d+", "").Trim()
}

Write-Host ""
Write-Host "    HTTP-Status: $status" -ForegroundColor DarkGray
if ($body) { Write-Host "    Response:    $body" -ForegroundColor DarkGray }

if ($status -eq "200" -or $status -eq "202") {
    Write-Step "Fertig!"
    Write-Ok "Deploy wurde getriggert."
    Write-Ok "Schau in ~1-2 Minuten auf https://sophey.vodka/gift-generator/"
    Write-Host ""
    exit 0
} else {
    Write-Fail "Deploy-Webhook hat HTTP $status geantwortet. Bitte pruefen."
    exit 1
}
