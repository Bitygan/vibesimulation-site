# PowerShell script to commit and push final changes
Write-Host "=== Committing and Pushing Final Changes ===" -ForegroundColor Green

# Stage all changes
Write-Host "Staging all changes..." -ForegroundColor Yellow
git add .

# Check status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status --porcelain

# Commit with descriptive message
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
Final cleanup and fixes for VibeSimulation site

- Fixed undefined text display issue
- Cleaned up leftover HTML template content
- Ensured all physics simulations work properly
- Added comprehensive physics gallery layout
- Integrated Google AdSense
- Added EU cookie consent compliance
- Fixed UI/UX issues with simulation controls
- Optimized site for mobile responsiveness
"@

git commit -m $commitMessage

# Push to repository
Write-Host "Pushing to repository..." -ForegroundColor Yellow
git push

Write-Host "=== Commit and Push Complete ===" -ForegroundColor Green
Write-Host "Repository has been updated with all changes!" -ForegroundColor Green
