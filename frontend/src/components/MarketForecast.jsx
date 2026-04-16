import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const MarketForecast = ({ selectedCrop }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/forecast/prices?crop=${selectedCrop}`);
      setForecast(response.data.data);
    } catch (error) {
      console.error("Failed to load forecast data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedCrop]);

  return (
    <div className="glass-card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={24} />
          <h3>{selectedCrop} Market Forecast</h3>
          <span className="badge" style={{ background: 'var(--accent-blue)', color: 'white', marginLeft: '0.5rem' }}>Location: UP</span>
        </div>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.4rem', borderRadius: '50%' }}
          onClick={fetchForecast}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      <div style={{ padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Running AutoML Models...</p>
          </div>
        ) : forecast ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Predicted Trend</span>
                <div style={{ color: forecast.trend === 'Upward' ? 'var(--primary-green)' : 'var(--accent-orange)', fontWeight: 'bold' }}>
                  {forecast.trend} Trend
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Volatility</span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{forecast.volatility}</div>
              </div>
            </div>
            
            <div style={{ width: '100%', height: 200, marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecast.forecast}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-green)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-green)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split(' ')[1]} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--primary-green)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--primary-green)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="predicted_price" stroke="var(--primary-green)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <AlertCircle size={14} /> Based on historical data & weather patterns.
            </div>
          </>
        ) : (
          <p>Failed to load Market Data.</p>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default MarketForecast;
