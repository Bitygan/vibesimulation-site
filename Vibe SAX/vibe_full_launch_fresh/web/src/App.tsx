import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaintedSky from './components/PaintedSky';
import GlassLabyrinth from './components/GlassLabyrinth';
import LedgerWall from './components/LedgerWall';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/painted-sky" element={<PaintedSky />} />
          <Route path="/glass-labyrinth" element={<GlassLabyrinth />} />
          <Route path="/mural" element={<LedgerWall />} />
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-white mb-8">Vibe Simulation</h1>
                <div className="space-y-4">
                  <a href="/painted-sky" className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Painted Sky - Fluid Dynamics
                  </a>
                  <a href="/glass-labyrinth" className="block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Glass Labyrinth - Circuit Learning
                  </a>
                  <a href="/mural" className="block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Community Mural
                  </a>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

