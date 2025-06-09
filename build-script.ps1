# Build script for advanced-metal-calculator
Write-Host "Starting build process..." -ForegroundColor Green

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_ENV = "production"

# Clean previous build
if (Test-Path ".next") {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
    } catch {
        Write-Host "Warning: Could not remove .next directory completely" -ForegroundColor Yellow
    }
}

# Create .next directory with proper permissions
Write-Host "Creating build directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".next" -Force | Out-Null

try {
    # Grant full permissions to current user
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    icacls ".next" /grant "${currentUser}:F" /T | Out-Null
} catch {
    Write-Host "Warning: Could not set permissions" -ForegroundColor Yellow
}

# Run the build
Write-Host "Running Next.js build..." -ForegroundColor Green
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "Build process encountered an error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Build script completed." -ForegroundColor Blue 