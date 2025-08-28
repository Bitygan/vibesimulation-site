# PowerShell script to add AdSense meta tag to all HTML pages
Set-Location "C:\Users\btgan\OneDrive\Biggie Ganyo Files Backup\BTG\1-PROJECTS\Vibe Simulation-Site"

$pages = @(
    "vibesimulation-site/about.html",
    "vibesimulation-site/advanced.html",
    "vibesimulation-site/ai.html",
    "vibesimulation-site/basics.html",
    "vibesimulation-site/contact.html",
    "vibesimulation-site/intermediate.html"
)

$metaTag = '		<meta name="google-adsense-account" content="ca-pub-1357596091010556">'

foreach ($page in $pages) {
    Write-Host "Updating $page..."

    # Read the file content
    $content = Get-Content $page -Raw

    # Add meta tag after the keywords meta tag
    $pattern = '<meta name="keywords"[^>]*>'
    $replacement = $pattern + "`n" + $metaTag

    if ($content -match $pattern) {
        $content = $content -replace $pattern, $replacement
        Write-Host "Added meta tag to $page"
    } else {
        Write-Host "Keywords meta tag not found in $page, adding after description meta tag"
        $pattern = '<meta name="description"[^>]*>'
        $replacement = $pattern + "`n" + $metaTag
        $content = $content -replace $pattern, $replacement
    }

    # Write back to file
    $content | Set-Content $page -NoNewline
    Write-Host "Updated $page successfully!"
}

Write-Host "`nAdSense meta tag added to all pages successfully!"
