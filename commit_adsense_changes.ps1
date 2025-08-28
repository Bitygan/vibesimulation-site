# PowerShell script to commit AdSense changes
Set-Location "C:\Users\btgan\OneDrive\Biggie Ganyo Files Backup\BTG\1-PROJECTS\Vibe Simulation-Site"

# Check if this is a git repository
if (Test-Path ".git") {
    Write-Host "Git repository found. Checking status..."

    # Add the modified HTML files
    git add "vibesimulation-site/*.html"

    # Commit with descriptive message
    git commit -m "Add Google AdSense script to all HTML pages

- Added AdSense script to all 7 pages in vibesimulation-site/
- Script placed in <head> section for optimal performance
- Includes async loading and crossorigin attributes
- Ready for ad unit placement throughout the site"

    Write-Host "Changes committed successfully!"

    # Push to remote
    git push origin main
    Write-Host "Changes pushed to remote repository!"

} else {
    Write-Host "This is not a git repository. Would you like to initialize one?"
    Write-Host "Run: git init"
    Write-Host "Then: git remote add origin <your-repo-url>"
    Write-Host "Then re-run this script"
}
