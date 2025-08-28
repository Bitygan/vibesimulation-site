/**
 * Code Access Demonstration
 * This file shows how client-side JavaScript is accessible
 * Run this in browser console to see code extraction
 */

// Simulate what someone can do with developer tools
function demonstrateCodeAccess() {
    console.log('🔍 Code Access Demonstration');
    console.log('==========================');

    // 1. Access any global functions
    if (typeof PaintedSkySimulation !== 'undefined') {
        console.log('✅ Found PaintedSkySimulation class');
        console.log('   Constructor:', PaintedSkySimulation.constructor.toString());
    }

    // 2. Access DOM elements
    const canvas = document.getElementById('painted-sky-canvas');
    if (canvas) {
        console.log('✅ Found canvas element:', canvas);
        console.log('   Canvas dimensions:', canvas.width, 'x', canvas.height);
    }

    // 3. Access CSS styles
    const styles = document.styleSheets;
    console.log('✅ Found', styles.length, 'stylesheets');

    // 4. Access event listeners (if any)
    const allElements = document.querySelectorAll('*');
    console.log('✅ Found', allElements.length, 'DOM elements');

    // 5. Show that code is readable
    console.log('✅ All JavaScript code is readable in Sources tab');
    console.log('✅ HTML structure visible in Elements tab');
    console.log('✅ Network requests visible in Network tab');

    console.log('');
    console.log('💡 Protection Strategies:');
    console.log('   - Minification: Makes code smaller, harder to read');
    console.log('   - Obfuscation: Renames variables, complicates logic');
    console.log('   - Server-side APIs: Move critical logic to backend');
    console.log('   - Legal protection: Copyright, licensing');
}

// Make it globally accessible
window.demonstrateCodeAccess = demonstrateCodeAccess;

console.log('🎯 Code Access Demo loaded!');
console.log('Run: demonstrateCodeAccess() to see what\'s accessible');

// Auto-run demonstration after page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(demonstrateCodeAccess, 2000); // Wait for simulations to load
    });
} else {
    setTimeout(demonstrateCodeAccess, 2000);
}

