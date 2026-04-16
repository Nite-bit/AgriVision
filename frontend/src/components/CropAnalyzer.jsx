import React, { useState } from 'react';
import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';

const CropAnalyzer = ({ onCropIdentified }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState(null);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selected);
      setResult(null);
      setAdvice(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    // 1. Analyze Image (Vision API)
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const visionRes = await axios.post('/api/vision/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const visionData = visionRes.data.data;
      setResult(visionData);
      
      if (visionData.crop_name && onCropIdentified) {
        onCropIdentified(visionData.crop_name);
      }
      
      // 2. Based on vision result, ask for Advice (LLM generation)
      if (visionData && visionData.status !== 'error') {
        getAdvice(visionData.condition);
      }
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult({ status: 'error', message: 'Failed to connect to AI server.' });
      setIsAnalyzing(false);
    }
  };

  const getAdvice = async (condition) => {
    try {
      const adviceRes = await axios.post('/api/llm/advice', {
        disease: condition,
        weather: "Dry spell expected",
        market_status: "Prices peaking"
      });
      setAdvice(adviceRes.data.data);
    } catch (error) {
      console.error(error);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="glass-card" style={{ gridRow: 'span 2' }}>
      <div className="card-header">
        <Camera size={24} />
        <h3>Crop Disease Analyzer</h3>
      </div>
      
      {!imagePreview ? (
        <div style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '3rem 1rem',
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <ImageIcon size={48} color="var(--primary-green)" style={{ margin: '0 auto', opacity: 0.7 }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Tap to take photo or upload leaf image</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
           <img src={imagePreview} alt="Crop Leaf" className="image-preview" />
           <button 
             style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
             onClick={() => { setImagePreview(null); setFile(null); setResult(null); setAdvice(null); }}
           >
             ✕
           </button>
        </div>
      )}

      {imagePreview && !result && (
        <button onClick={analyzeImage} disabled={isAnalyzing} style={{ marginTop: '1rem', width: '100%' }}>
          {isAnalyzing ? "Processing with AI..." : "Analyze Health & Get Advice"}
        </button>
      )}

      {result && (
        <div className="result-box" style={{ marginTop: '1rem', borderTop: result.status === 'healthy' ? '4px solid var(--primary-green)' : '4px solid var(--accent-orange)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              {result.status === 'healthy' ? <CheckCircle color="var(--primary-green)"/> : <AlertTriangle color="var(--accent-orange)"/>}
              <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
                {result.status === 'error' ? 'Analysis Error' : result.condition} {result.confidence && `(${result.confidence}%)`}
              </h4>
           </div>
           
           {result.status === 'error' ? (
             <p style={{ color: 'var(--accent-orange)' }}>{result.message}</p>
           ) : (
             advice ? (
               <div>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} color="var(--accent-blue)"/> Agronomist Advice:
                  </strong>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{advice.advice_text}</p>
               </div>
             ) : (
               <p>Generating recommended actions...</p>
             )
           )}
        </div>
      )}
    </div>
  );
};

export default CropAnalyzer;
