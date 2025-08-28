# VibeSimulation - Git Commit and Push Script
# This script commits all changes and pushes to the remote repository

Write-Host "🚀 Starting VibeSimulation commit and push process..." -ForegroundColor Cyan

# Function to check if we're in a git repository
function Test-GitRepository {
    try {
        $null = git rev-parse --git-dir 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Function to get current branch name
function Get-CurrentBranch {
    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        return $branch
    }
    catch {
        return $null
    }
}

# Check if we're in a git repository
if (-not (Test-GitRepository)) {
    Write-Host "❌ Error: Not in a Git repository. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = Get-CurrentBranch
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "📝 Found changes to commit:" -ForegroundColor Green
    Write-Host $gitStatus -ForegroundColor White
    Write-Host ""

    # Add all changes
    Write-Host "➕ Adding all changes..." -ForegroundColor Yellow
    git add .

    # Check if add was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes staged successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Failed to stage changes" -ForegroundColor Red
        exit 1
    }

    # Create commit message
    $commitDate = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMessage = "feat: Update VibeSimulation website - $commitDate

- Added comprehensive blog section with main article
- Updated sitemap with blog pages
- Enhanced navigation with blog link
- Added SEO optimizations and structured data
- Improved responsive design and styling"

    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    Write-Host "Commit message:" -ForegroundColor Cyan
    Write-Host "$commitMessage" -ForegroundColor White
    Write-Host ""

    git commit -m $commitMessage

    # Check if commit was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changes committed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Failed to commit changes" -ForegroundColor Red
        exit 1
    }

} else {
    Write-Host "ℹ️ No changes to commit" -ForegroundColor Yellow

    # Check if we have unpushed commits
    $aheadCount = git rev-list --count "origin/$currentBranch..HEAD" 2>$null
    if ($aheadCount -gt 0) {
        Write-Host "📤 Found $aheadCount unpushed commits" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Everything is up to date" -ForegroundColor Green
        exit 0
    }
}

# Push changes
Write-Host "📤 Pushing to remote repository..." -ForegroundColor Yellow
git push origin $currentBranch

# Check if push was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to remote repository" -ForegroundColor Green
    Write-Host "🎉 All changes have been committed and pushed!" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Failed to push changes" -ForegroundColor Red
    Write-Host "💡 You may need to pull latest changes first: git pull origin $currentBranch" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "- Blog section added with main article" -ForegroundColor White
Write-Host "- Sitemap updated with new pages" -ForegroundColor White
Write-Host "- Navigation and footer updated" -ForegroundColor White
Write-Host "- SEO optimizations applied" -ForegroundColor White
Write-Host "- All changes pushed to remote repository" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Your website is ready! Visit: https://vibesimulation.com" -ForegroundColor Green

