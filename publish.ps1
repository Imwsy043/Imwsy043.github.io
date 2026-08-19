param(
    [string]$Message = "Update blog $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$distRoot = Join-Path $projectRoot "dist"
$pagesRoot = Join-Path $projectRoot ".pages-worktree"
$siteUrl = "https://imwsy043.github.io/"

function Assert-LastCommand([string]$message) {
    if ($LASTEXITCODE -ne 0) {
        throw $message
    }
}

$projectFullPath = [System.IO.Path]::GetFullPath($projectRoot)
$pagesFullPath = [System.IO.Path]::GetFullPath($pagesRoot)
$projectPrefix = $projectFullPath.TrimEnd("\", "/") + [System.IO.Path]::DirectorySeparatorChar

if (-not $pagesFullPath.StartsWith($projectPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "The Pages worktree must stay inside the project directory."
}

Push-Location $projectRoot
try {
    pnpm.cmd build
    Assert-LastCommand "Blog build failed. Fix the error above before publishing."

    $unusedFont = Join-Path $distRoot "fonts\LXGWWenKaiScreen.ttf"
    if (Test-Path -LiteralPath $unusedFont -PathType Leaf) {
        Remove-Item -LiteralPath $unusedFont -Force
    }

    git add -A
    Assert-LastCommand "Could not stage the source files."

    git diff --cached --quiet
    if ($LASTEXITCODE -eq 1) {
        git commit -m $Message
        Assert-LastCommand "Could not commit the source files."
    }
    elseif ($LASTEXITCODE -ne 0) {
        throw "Could not inspect source changes."
    }

    git push -u origin main
    Assert-LastCommand "Could not push the source branch to GitHub."

    git fetch origin gh-pages
    Assert-LastCommand "Could not fetch the gh-pages branch."

    git show-ref --verify --quiet refs/heads/gh-pages
    if ($LASTEXITCODE -eq 1) {
        git branch gh-pages origin/gh-pages
        Assert-LastCommand "Could not create the local gh-pages branch."
    }
    elseif ($LASTEXITCODE -ne 0) {
        throw "Could not inspect the local gh-pages branch."
    }

    if (-not (Test-Path -LiteralPath (Join-Path $pagesRoot ".git") -PathType Leaf)) {
        if (Test-Path -LiteralPath $pagesRoot) {
            throw "The Pages directory exists but is not a Git worktree: $pagesRoot"
        }

        git worktree add $pagesRoot gh-pages
        Assert-LastCommand "Could not create the gh-pages worktree."
    }

    git -C $pagesRoot pull --ff-only origin gh-pages
    Assert-LastCommand "Could not update the gh-pages worktree."

    Get-ChildItem -LiteralPath $pagesRoot -Force |
        Where-Object { $_.Name -ne ".git" } |
        Remove-Item -Recurse -Force

    Get-ChildItem -LiteralPath $distRoot -Force |
        Copy-Item -Destination $pagesRoot -Recurse -Force
    Set-Content -LiteralPath (Join-Path $pagesRoot ".nojekyll") -Value "" -Encoding ascii

    git -C $pagesRoot add -A
    Assert-LastCommand "Could not stage the generated website."

    git -C $pagesRoot diff --cached --quiet
    if ($LASTEXITCODE -eq 1) {
        git -C $pagesRoot commit -m "Publish $Message"
        Assert-LastCommand "Could not commit the generated website."

        git -C $pagesRoot push origin gh-pages
        Assert-LastCommand "Could not publish the generated website."
    }
    elseif ($LASTEXITCODE -ne 0) {
        throw "Could not inspect generated website changes."
    }

    Write-Host "Published: $siteUrl"
}
finally {
    Pop-Location
}
