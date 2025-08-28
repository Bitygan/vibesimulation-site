# PowerShell script to add cookie consent to all HTML pages

$pages = @(
    "vibesimulation-site/about.html",
    "vibesimulation-site/advanced.html",
    "vibesimulation-site/ai.html",
    "vibesimulation-site/basics.html",
    "vibesimulation-site/contact.html",
    "vibesimulation-site/intermediate.html"
)

foreach ($page in $pages) {
    Write-Host "Updating $page..."

    # Read the file content
    $content = Get-Content $page -Raw

    # Add CSS link to head section
    $cssPattern = '<link rel="stylesheet" href="assets/css/main\.css" />'
    $cssReplacement = '<link rel="stylesheet" href="assets/css/main.css" />`n`t`t<link rel="stylesheet" href="assets/css/cookie-consent.css" />'
    $content = $content -replace $cssPattern, $cssReplacement

    # Add JavaScript before closing body tag
    $jsPattern = '<script src="assets/js/main\.js"></script>'
    $jsReplacement = '<script src="assets/js/main.js"></script>`n`t`t`t<script src="assets/js/cookie-consent.js"></script>'
    $content = $content -replace $jsPattern, $jsReplacement

    # Update footer to include privacy policy link
    $footerPattern = '<ul class="copyright">`n`t`t`t`t<li>&copy; VibeSimulation\. All rights reserved\.</li><li>Design: <a href="http://html5up\.net">HTML5 UP</a></li>`n`t`t`t</ul>'
    $footerReplacement = '<ul class="copyright">`n`t`t`t`t<li>&copy; VibeSimulation. All rights reserved.</li>`n`t`t`t`t<li><a href="privacy-policy.html">Privacy Policy</a></li>`n`t`t`t`t<li>Design: <a href="http://html5up.net">HTML5 UP</a></li>`n`t`t`t</ul>'
    $content = $content -replace $footerPattern, $footerReplacement

    # Write back to file
    $content | Set-Content $page -NoNewline

    Write-Host "Updated $page successfully!"
}

Write-Host "`nAll pages updated with cookie consent functionality!"
