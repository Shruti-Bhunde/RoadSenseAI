import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, MapPin, Activity, ShieldAlert } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import Loader from '../components/Loader';

export default function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/incidents');
      // Filter out incidents without lat/lng coordinates
      const mapped = res.data.filter((inc) => inc.latitude != null && inc.longitude != null);
      setIncidents(mapped);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not connect to API server. Make sure FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-heading">
          Live Decision Intelligence Map
        </h2>
        <p className="text-brand-muted text-sm leading-relaxed">
          Interactive visualization of reported traffic events. Click markers to check severity, AI descriptions, and Random Forest predicted delays.
        </p>
      </div>

      {loading ? (
        <Loader message="Initializing interactive map..." />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl flex items-center space-x-4">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Failed to connect</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Map area */}
          <div className="flex-1 min-h-[350px] lg:min-h-0 relative">
            <MapComponent incidents={incidents} />
          </div>

          {/* Incident List Sidebar */}
          <div className="w-full lg:w-80 bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col min-h-0">
            <h3 className="font-bold text-base text-brand-text mb-3 flex items-center space-x-2 pb-2 border-b border-brand-border/60 shrink-0">
              <Activity className="h-4 w-4 text-brand-primary" />
              <span>Active Reports ({incidents.length})</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-brand-muted text-xs">
                  No active incidents with valid GPS coordinates to display.
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 bg-brand-bg/50 border border-brand-border/40 hover:border-brand-primary/40 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="font-semibold text-xs text-brand-text truncate group-hover:text-brand-primary transition-colors">
                        {incident.incident_type}
                      </h4>
                      <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                        incident.severity?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-brand-muted line-clamp-2 leading-relaxed mb-2">
                      {incident.ai_summary || incident.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-[9px] text-brand-muted border-t border-brand-border/20 pt-1.5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-2.5 w-2.5 text-brand-accent" />
                        <span>Lat: {incident.latitude?.toFixed(2)}</span>
                      </span>
                      <span>Impact: <strong className="text-brand-text">{incident.traffic_impact}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
