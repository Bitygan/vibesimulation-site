// Quick test script for VibeSimulation
// Run this in the browser console on the main page

console.log('🧪 Starting VibeSimulation Quick Test...\n');

// Test 1: Check if simulations are loaded
console.log('1️⃣ Testing Simulation Instances:');
const sims = {
  'PaintedSky': window.paintedSkySim,
  'ChargePainter': window.chargePainterSim,
  'ResonantCanvas': window.resonantCanvasSim,
  'DragRangefinder': window.dragRangefinderSim
};

let simCount = 0;
Object.entries(sims).forEach(([name, sim]) => {
  const status = sim ? '✅' : '❌';
  console.log(`   ${status} ${name}: ${sim ? 'Loaded' : 'Not loaded'}`);
  if (sim) simCount++;
});
console.log(`   📊 ${simCount}/4 simulations loaded\n`);

// Test 2: Check if Reasoning Reels recorder is working
console.log('2️⃣ Testing Reasoning Reels Recorder:');
const recorder = window.reasoningReelsRecorder;
if (recorder) {
  console.log('   ✅ Recorder found');
  console.log(`   📊 Events recorded: ${recorder.eventCount || 0}`);
  console.log(`   🎥 Rows: ${recorder.rows ? recorder.rows.length : 0}`);

  // Try to record a test event
  try {
    recorder.log({
      t: Date.now() / 1000,
      type: 'test',
      message: 'Quick test event'
    });
    console.log('   ✅ Event recording works');
  } catch (error) {
    console.log(`   ❌ Event recording failed: ${error.message}`);
  }
} else {
  console.log('   ❌ Recorder not found');
}
console.log('');

// Test 3: Check Evidence Drawer components
console.log('3️⃣ Testing Evidence Drawer:');
if (typeof createFloatingButton === 'function') {
  console.log('   ✅ createFloatingButton function loaded');
} else {
  console.log('   ❌ createFloatingButton function missing');
}

if (typeof spotCheck === 'function') {
  console.log('   ✅ spotCheck function loaded');
} else {
  console.log('   ❌ spotCheck function missing');
}

if (typeof accreditationMode === 'function') {
  console.log('   ✅ accreditationMode function loaded');
} else {
  console.log('   ❌ accreditationMode function missing');
}

if (typeof showDrawer === 'function') {
  console.log('   ✅ showDrawer function loaded');
} else {
  console.log('   ❌ showDrawer function missing');
}
console.log('');

// Test 4: Check hash functions
console.log('4️⃣ Testing Hash Functions:');
const hashTests = ['hex', 'canonicalize', 'canonicalString', 'concatBytes'];
hashTests.forEach(func => {
  if (typeof window[func] === 'function') {
    console.log(`   ✅ ${func} available`);
  } else {
    console.log(`   ❌ ${func} missing`);
  }
});
console.log('');

// Test 5: Check floating button
console.log('5️⃣ Testing Floating Button:');
const button = document.querySelector('button[style*="fixed"]');
if (button) {
  console.log('   ✅ Floating button found');
  console.log(`   🎯 Button text: ${button.textContent}`);

  // Test button functionality
  button.click();
  console.log('   ✅ Button click simulated');
} else {
  console.log('   ❌ Floating button not found');
}
console.log('');

// Test 6: Check current simulation detection
console.log('6️⃣ Testing Simulation Detection:');
function getCurrentSimName(){
  const cards = document.querySelectorAll('.physics-card');
  for(const card of cards){
    if(card.style.display === 'none') continue;
    const id = card.id;
    if(id === 'fluid-dynamics') return 'PaintedSky';
    if(id === 'electrostatics') return 'ChargePainter';
    if(id === 'wave-physics') return 'ResonantCanvas';
    if(id === 'drag-rangefinder') return 'DragRangefinder';
  }
  return null;
}

const currentSim = getCurrentSimName();
if (currentSim) {
  console.log(`   ✅ Current simulation: ${currentSim}`);
} else {
  console.log('   ❌ No current simulation detected');
}
console.log('');

// Summary
console.log('📋 TEST SUMMARY:');
console.log(`   🎮 Simulations: ${simCount}/4 loaded`);
console.log(`   📹 Recorder: ${recorder ? 'Working' : 'Not working'}`);
console.log(`   🧪 Evidence Drawer: ${typeof createFloatingButton === 'function' ? 'Ready' : 'Issues'}`);
console.log(`   🔧 Hash Functions: ${hashTests.every(f => typeof window[f] === 'function') ? 'All available' : 'Some missing'}`);
console.log(`   🎯 Floating Button: ${button ? 'Visible' : 'Not visible'}`);
console.log(`   🎮 Current Sim: ${currentSim || 'None'}`);

if (simCount === 4 && recorder && typeof createFloatingButton === 'function' && button) {
  console.log('\n🎉 ALL SYSTEMS OPERATIONAL! Everything should be working.');
} else {
  console.log('\n⚠️ SOME ISSUES DETECTED. Check the errors above.');
}

console.log('\n💡 If issues persist, try:');
console.log('   1. Refresh the page');
console.log('   2. Check browser console for errors');
console.log('   3. Visit /comprehensive-diagnostic.html for detailed testing');
console.log('   4. Visit /fix-loading-order.html for quick fixes');
