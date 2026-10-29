# Persistent Tunnel Script
while ($true) {
    Write-Host "Starting persistent tunnel on port 3000..."
    & npx --yes localtunnel --port 3000 --subdomain cb-battery-soa
    Start-Sleep -Seconds 2
}
