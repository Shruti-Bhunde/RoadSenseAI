import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertCircle, Search, SlidersHorizontal } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import Loader from '../components/Loader';

export default function Feed() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [impactFilter, setImpactFilter] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/incidents');
      setIncidents(res.data);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this incident report?")) {
      try {
        await api.delete(`/api/incident/${id}`);
        // Filter out deleted incident local state
        setIncidents(incidents.filter(inc => inc.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete incident.");
      }
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = 
      incident.incident_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.ai_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === '' || incident.severity?.toLowerCase() === severityFilter.toLowerCase();
    const matchesImpact = impactFilter === '' || incident.traffic_impact?.toLowerCase() === impactFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesImpact;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-heading">
            Decision Intelligence Feed
          </h2>
          <p className="text-brand-muted text-sm leading-relaxed">
            A real-time list of community-reported hazards, structured by Gemini and analyzed by our Random Forest impact classifier.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident types, summaries..."
            className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary text-sm"
          />
        </div>

        {/* Severity filter */}
        <div className="w-full md:w-44 flex items-center space-x-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-text text-sm focus:outline-none focus:border-brand-primary"
          >
            <option value="">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        {/* Impact filter */}
        <div className="w-full md:w-44">
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-text text-sm focus:outline-none focus:border-brand-primary"
          >
            <option value="">All Impacts</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader message="Loading decision intelligence feed..." />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl flex items-center space-x-4">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Failed to connect</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="border border-dashed border-brand-border rounded-xl p-12 text-center">
          <AlertCircle className="h-8 w-8 text-brand-muted mx-auto mb-3" />
          <h3 className="font-semibold text-brand-text mb-1">No Incident Reports</h3>
          <p className="text-brand-muted text-sm max-w-md mx-auto">
            {searchTerm || severityFilter || impactFilter 
              ? "No reports match your current filters. Try resetting search parameters."
              : "No road incidents have been submitted yet. Go to Report Incident to submit the first one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
