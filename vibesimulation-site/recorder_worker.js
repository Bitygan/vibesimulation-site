// VibeSimulation Reasoning Reels - Background Hash Worker
// Performs incremental SHA-256 hashing off the main thread

// ---------- Utilities (copied from main recorder.js) ----------
const enc = new TextEncoder();

function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const out = {};
  Object.keys(obj).sort().forEach(k => {
    const v = obj[k];
    out[k] = canonicalize(v);
  });
  return out;
}

function canonicalString(obj) {
  return JSON.stringify(canonicalize(obj));
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function hex(buf) {
  const v = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < v.length; i++) s += v[i].toString(16).padStart(2, "0");
  return s;
}

// ---------- Incremental Hash-Chain Worker ----------
class IncrementalHasher {
  constructor() {
    this.currentHash = new Uint8Array(32); // H0 = 32 zeros
    this.eventCount = 0;
  }

  async addEvent(event) {
    const s = canonicalString(event);
    const data = concatBytes(this.currentHash, enc.encode(s));
    this.currentHash = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    this.eventCount++;
  }

  getCurrentRoot() {
    return "sha256-" + hex(this.currentHash);
  }

  getEventCount() {
    return this.eventCount;
  }

  reset() {
    this.currentHash = new Uint8Array(32);
    this.eventCount = 0;
  }
}

// ---------- Worker Message Handler ----------
const hasher = new IncrementalHasher();

self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'add_event':
        await hasher.addEvent(data);
        self.postMessage({
          type: 'event_added',
          eventCount: hasher.getEventCount()
        });
        break;

      case 'get_root':
        self.postMessage({
          type: 'root_result',
          root: hasher.getCurrentRoot(),
          eventCount: hasher.getEventCount()
        });
        break;

      case 'reset':
        hasher.reset();
        self.postMessage({
          type: 'reset_complete'
        });
        break;

      case 'ping':
        self.postMessage({
          type: 'pong',
          eventCount: hasher.getEventCount()
        });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

// ---------- Idle Callback Processing ----------
let eventQueue = [];
let processingEvents = false;

async function processEventQueue() {
  if (processingEvents || eventQueue.length === 0) return;

  processingEvents = true;

  try {
    // Process one event per idle callback to avoid blocking
    const event = eventQueue.shift();
    await hasher.addEvent(event);

    // Notify main thread
    self.postMessage({
      type: 'event_processed',
      remaining: eventQueue.length,
      totalProcessed: hasher.getEventCount()
    });

  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  } finally {
    processingEvents = false;

    // Continue processing if there are more events
    if (eventQueue.length > 0) {
      if ('requestIdleCallback' in self) {
        requestIdleCallback(processEventQueue);
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(processEventQueue, 0);
      }
    }
  }
}

// Extended message handler for queued events
const originalHandler = self.onmessage;
self.onmessage = async function(e) {
  const { type, data } = e.data;

  if (type === 'queue_event') {
    // Add to queue and start processing
    eventQueue.push(data);
    if (!processingEvents) {
      if ('requestIdleCallback' in self) {
        requestIdleCallback(processEventQueue);
      } else {
        setTimeout(processEventQueue, 0);
      }
    }
    return;
  }

  // Handle other messages with original handler
  return originalHandler.call(this, e);
};

// ---------- Worker Ready ----------
self.postMessage({
  type: 'worker_ready'
});

