# Quick Commit Script for VibeSimulation
# Usage: .\quick-commit.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🚀 Quick commit: $CommitMessage" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a Git repository" -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "📝 Staging changes..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes staged" -ForegroundColor Green
} else {
    Write-Host "❌ Error staging changes" -ForegroundColor Red
    exit 1
}

# Commit with provided message
Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m $CommitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "❌ Error committing changes" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "📤 Pushing..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed!" -ForegroundColor Green
} else {
    Write-Host "❌ Error pushing changes" -ForegroundColor Red
    Write-Host "💡 Try: git pull origin $currentBranch" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Done!" -ForegroundColor Green

