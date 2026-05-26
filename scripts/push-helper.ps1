# Push helper for GitHub HTTPS with Personal Access Token.
# Run from project root with:
#   powershell -ExecutionPolicy Bypass -File .\scripts\push-helper.ps1
#
# The token is read with a hidden prompt and never echoed.
# After the push, the remote URL is reset to the clean version
# so the token never lingers in .git/config.

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "GitHub push helper" -ForegroundColor Cyan
Write-Host "------------------" -ForegroundColor Cyan
Write-Host "Wenn kein Token gespeichert: hol einen auf"
Write-Host "  https://github.com/settings/tokens/new"
Write-Host "(Scope: repo, Expiration: 30 days)."
Write-Host "Token kopieren, dann unten einfuegen."
Write-Host ""

$secure = Read-Host -AsSecureString -Prompt "Token (mit Strg+V einfuegen, dann Enter)"
$token  = [System.Net.NetworkCredential]::new('', $secure).Password

if (-not $token -or $token.Length -lt 20) {
    Write-Host ""
    Write-Host "Token sieht zu kurz aus (Laenge: $($token.Length))." -ForegroundColor Red
    Write-Host "Erneut starten und Token frisch kopieren." -ForegroundColor Red
    exit 1
}

$repo = "https://MissLarifari:$token@github.com/MissLarifari/gift-generator.git"

Write-Host ""
Write-Host "Pushe zu GitHub..." -ForegroundColor Cyan
git push $repo main

Write-Host ""
Write-Host "Setze Remote-URL zurueck (Token nicht im Config)..." -ForegroundColor Cyan
git remote set-url origin https://github.com/MissLarifari/gift-generator.git

Remove-Variable token, secure, repo
Write-Host ""
Write-Host "Fertig. Falls 'main -> main' angezeigt wurde, ist der Push durch." -ForegroundColor Green
Write-Host "Vergiss nicht: temp-Token nach Push wieder auf" -ForegroundColor Yellow
Write-Host "https://github.com/settings/tokens revoken (Delete)." -ForegroundColor Yellow
