import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';

const VoiceNoteWidget = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      
      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      setRecognition(rec);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        setTranscript('');
        recognition.start();
        setIsListening(true);
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const analyzeNotes = async () => {
    if (!transcript) return;
    setIsLoading(true);
    try {
      const response = await axios.post('/api/llm/classify', {
        text: transcript
      });
      setAnalysis(response.data.data);
    } catch (error) {
      console.error('Failed to analyze audio', error);
      setAnalysis({ category: 'Error', raw_text: 'Failed to connect to backend' });
    }
    setIsLoading(false);
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <Mic size={24} />
        <h3>Voice Field Notes</h3>
      </div>
      
      <button 
        className={`mic-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListen}
        title={isListening ? "Stop Listening" : "Start Listening"}
      >
        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
      </button>
      
      <div className="result-box" style={{ minHeight: '60px' }}>
        {transcript ? transcript : <span style={{ opacity: 0.5 }}>Tap microphone to log observations...</span>}
      </div>

      <button 
        className="btn-secondary" 
        onClick={analyzeNotes}
        disabled={!transcript || isLoading || isListening}
        style={{ width: '100%' }}
      >
        <Send size={18} />
        {isLoading ? 'Analyzing...' : 'Analyze Observations'}
      </button>

      {analysis && (
        <div className="result-box" style={{ marginTop: '1rem', borderLeft: '4px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={16} color="var(--primary-green)"/>
            <strong>Classification:</strong> <span className="badge success">{analysis.category}</span>
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Recorded: {analysis.raw_text || transcript}</p>
          {analysis.message && (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--primary-green)' }}>Agronomist Advice:</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>{analysis.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceNoteWidget;
