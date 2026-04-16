import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const FarmInsights = ({ selectedCrop }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/insights/daily?crop=${selectedCrop}`);
      setInsight(response.data.data);
    } catch (error) {
      console.error("Failed to load insights", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCrop) {
      fetchInsight();
    }
  }, [selectedCrop]);

  return (
    <div className="glass-card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lightbulb size={24} color="var(--accent-orange)" />
          <h3>Farm Insights</h3>
        </div>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.4rem', borderRadius: '50%' }}
          onClick={fetchInsight}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      <div className="result-box" style={{ 
        minHeight: '100px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        borderLeft: insight && insight.alert_level === 'High' ? '4px solid #ef4444' : 
                    insight && insight.alert_level === 'Medium' ? '4px solid var(--accent-orange)' : 
                    '4px solid var(--primary-green)'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Generating daily insight...</p>
        ) : insight ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {insight.alert_level === 'High' ? <AlertTriangle size={16} color="#ef4444" /> : 
               insight.alert_level === 'Medium' ? <AlertTriangle size={16} color="var(--accent-orange)" /> :
               <CheckCircle size={16} color="var(--primary-green)" />}
               <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 AI Alert Level: <span style={{ color: 'var(--text-main)' }}>{insight.alert_level}</span>
               </strong>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {insight.insight}
            </p>
          </div>
        ) : (
          <p>Unable to fetch insights. Check connection.</p>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default FarmInsights;
