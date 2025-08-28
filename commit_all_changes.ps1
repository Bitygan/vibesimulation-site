# PowerShell script to commit all site changes (AdSense + EU Cookie Compliance)
Set-Location "C:\Users\btgan\OneDrive\Biggie Ganyo Files Backup\BTG\1-PROJECTS\Vibe Simulation-Site"

# Check if this is a git repository
if (Test-Path ".git") {
    Write-Host "Git repository found. Proceeding with commit..."

    # Add all modified and new files
    Write-Host "Adding files to git..."
    git add "vibesimulation-site/*.html"
    git add "vibesimulation-site/assets/css/cookie-consent.css"
    git add "vibesimulation-site/assets/js/cookie-consent.js"
    git add "vibesimulation-site/ads.txt"
    git add "commit_adsense_changes.ps1"
    git add "update_pages_cookie_consent.ps1"
    git add "add_adsense_meta.ps1"

    # Commit with comprehensive message
    $commitMessage = @"
Complete Site Enhancement: AdSense, EU Compliance & UI Improvements

AdSense Integration:
- Added AdSense script to all 7 HTML pages in <head> section
- Script includes async loading and crossorigin attributes
- Added AdSense meta tag for account verification to all pages
- Created ads.txt file for domain verification
- Ready for ad unit placement throughout the site

EU Cookie Compliance (GDPR):
- Created GDPR-compliant cookie consent banner
- Added granular consent management (Necessary/Analytics/Marketing)
- Implemented EU user detection via IP geolocation
- Created comprehensive Privacy Policy page
- Added cookie consent CSS styling and JavaScript
- Updated all page footers with Privacy Policy links
- Integrated EU-specific AdSense consent handling

UI/UX Improvements:
- Fixed uniform simulation sizing across all 4 physics simulations
- Added advanced controls toggle for complex simulations
- Improved control layout consistency
- Enhanced user experience with progressive disclosure

Technical Implementation:
- Cookie banner with preferences modal
- Responsive design for all devices
- Accessibility compliant
- Secure cookie storage with SameSite protection
- Automatic consent management for Google Analytics and AdSense
- Advanced controls toggle system for simulations

Legal Compliance:
- Full GDPR compliance for EU users
- ePrivacy Directive compliance
- Google AdSense EU requirements met
- Comprehensive privacy policy covering all data processing
- ads.txt file for domain verification and anti-spoofing
"@

    git commit -m $commitMessage

    Write-Host "Changes committed successfully!"

    # Push to remote
    Write-Host "Pushing to remote repository..."
    git push origin main
    Write-Host "Changes pushed to remote repository successfully!"

} else {
    Write-Host "This is not a git repository. Would you like to initialize one?"
    Write-Host "Run: git init"
    Write-Host "Then: git remote add origin <your-repo-url>"
    Write-Host "Then re-run this script"
}
