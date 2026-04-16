import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import VoiceNoteWidget from './components/VoiceNoteWidget';
import CropAnalyzer from './components/CropAnalyzer';
import MarketForecast from './components/MarketForecast';
import FarmInsights from './components/FarmInsights';
import './index.css';

function App() {
  const [selectedCrop, setSelectedCrop] = useState("General Crop");

  return (
    <div className="app-container">
      <header>
        <h1>
          <Leaf size={32} color="#22c55e" />
          AgriVision
        </h1>
        <div className="badge success">Smart Farm Active</div>
      </header>
      
      <main className="dashboard-grid">
        <CropAnalyzer onCropIdentified={setSelectedCrop} />
        <VoiceNoteWidget />
        <MarketForecast selectedCrop={selectedCrop} />
        <FarmInsights selectedCrop={selectedCrop} />
      </main>
    </div>
  );
}

export default App;
