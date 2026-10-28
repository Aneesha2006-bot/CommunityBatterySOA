# Script: verify-contract-break.ps1
# Requirement B5 / CO4: Deliberately break event contract schema, prove failure, capture evidence, restore and verify pass.

$ErrorActionPreference = "Continue"

$schemaFile = "docs/events/DischargeRequested.v1.schema.json"
$evidenceDir = "docs/evidence"
if (-not (Test-Path $evidenceDir)) {
    New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
}

$failureLog = "$evidenceDir/contract-break-failure.txt"
$restoredLog = "$evidenceDir/contract-break-restored.txt"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Intentionally breaking contract schema..." -ForegroundColor Yellow
Write-Host "Renaming 'grantedKwh' to 'grantedEnergyKwh' in $schemaFile"
Write-Host "=========================================================="

# Backup original schema
$originalContent = Get-Content $schemaFile -Raw
$brokenContent = $originalContent.Replace('"grantedKwh"', '"grantedEnergyKwh"')
Set-Content -Path $schemaFile -Value $brokenContent -NoNewline

Write-Host "STEP 2: Running schema validation contract test to demonstrate failure..." -ForegroundColor Yellow
$outputFailure = & mvn test "-Dtest=DischargeRequestedEventSchemaTest#validDischargeRequestedEvent_PassesSchema" "-Dsurefire.failIfNoSpecifiedTests=false" -pl discharge-allocation-service -am 2>&1 | Out-String

Set-Content -Path $failureLog -Value $outputFailure
Write-Host "Captured failure output to $failureLog" -ForegroundColor Magenta

if ($outputFailure -match "BUILD FAILURE" -or $outputFailure -match "FAILURE") {
    Write-Host "CONFIRMED: Contract test failed as expected when schema was mutated!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Expected contract test failure was not detected." -ForegroundColor Red
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Restoring original schema..." -ForegroundColor Yellow
Write-Host "=========================================================="
Set-Content -Path $schemaFile -Value $originalContent -NoNewline

Write-Host "STEP 4: Verifying contract test passes after restoring schema..." -ForegroundColor Yellow
$outputRestored = & mvn test "-Dtest=DischargeRequestedEventSchemaTest#validDischargeRequestedEvent_PassesSchema" "-Dsurefire.failIfNoSpecifiedTests=false" -pl discharge-allocation-service -am 2>&1 | Out-String

Set-Content -Path $restoredLog -Value $outputRestored
Write-Host "Captured restored pass output to $restoredLog" -ForegroundColor Magenta

if ($outputRestored -match "BUILD SUCCESS") {
    Write-Host "SUCCESS: Contract test cleanly passed after schema restoration!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Contract test failed even after restoring schema." -ForegroundColor Red
    exit 1
}

Write-Host "Contract break verification complete. Evidence preserved in $evidenceDir." -ForegroundColor Cyan
