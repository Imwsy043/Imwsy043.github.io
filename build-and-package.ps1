$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$distPath = Join-Path $projectRoot "dist"
$deployZipPath = Join-Path (Split-Path -Parent $projectRoot) "stella-blog-deploy.zip"

Push-Location $projectRoot
try {
    pnpm.cmd build
    if ($LASTEXITCODE -ne 0) {
        throw "Astro build failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path -LiteralPath $distPath -PathType Container)) {
    throw "The dist directory was not created."
}

$oversizedFontPath = Join-Path $distPath "fonts\LXGWWenKaiScreen.ttf"
if (Test-Path -LiteralPath $oversizedFontPath -PathType Leaf) {
    Remove-Item -LiteralPath $oversizedFontPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $deployZipPath -PathType Leaf) {
    Remove-Item -LiteralPath $deployZipPath -Force
}

$zipStream = [System.IO.File]::Open(
    $deployZipPath,
    [System.IO.FileMode]::CreateNew
)

try {
    $zipArchive = New-Object System.IO.Compression.ZipArchive(
        $zipStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $false
    )

    try {
        Get-ChildItem -LiteralPath $distPath -Recurse -File | ForEach-Object {
            $entryName = $_.FullName.Substring($distPath.Length + 1).Replace("\", "/")
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zipArchive,
                $_.FullName,
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $zipArchive.Dispose()
    }
}
finally {
    $zipStream.Dispose()
}

Write-Host "Deployment package created: $deployZipPath"
