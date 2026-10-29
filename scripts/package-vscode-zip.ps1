$ErrorActionPreference = 'Stop'
$destination = 'CommunityBatterySOA-VSCode.zip'
if (Test-Path $destination) { Remove-Item $destination -Force }

$tempGuid = [guid]::NewGuid().ToString('N')
$stageDir = Join-Path $env:TEMP "cb_stage_$tempGuid"
New-Item -ItemType Directory -Path $stageDir | Out-Null

Write-Host "Copying project workspace files to clean stage (excluding node_modules, target, .git)..."
$sourceDir = (Get-Location).Path

# Use robocopy with exclusions for high speed and accuracy
# /XD = exclude directories, /XF = exclude files
$null = robocopy $sourceDir $stageDir /E /XD ".git" "node_modules" "target" ".vite" /XF "*.exe" "*.zip" "CommunityBatterySOA*.zip"

Write-Host "Creating optimal zip package: $destination ..."
Compress-Archive -Path "$stageDir/*" -DestinationPath $destination -CompressionLevel Optimal

Remove-Item -Path $stageDir -Recurse -Force
$zipItem = Get-Item $destination
Write-Host "Successfully generated: $($zipItem.FullName) ($([math]::Round($zipItem.Length / 1KB, 2)) KB)"
