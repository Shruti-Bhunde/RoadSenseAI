import React from 'react';
import { AlertCircle, Calendar, MapPin, Shield, Eye, Trash2, FileText, Image as ImageIcon, Video, Mic } from 'lucide-react';

const baseApiUrl = import.meta.env.VITE_API_BASE_URL || '';

const normalizeMediaUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('/uploads') && baseApiUrl) {
    return `${baseApiUrl}${url}`;
  }
  return url;
};

const parseLocalDateTime = (value) => {
  if (!value) return null;
  const normalized = value.trim().replace(' ', 'T');
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6])
    );
  }
  return new Date(value);
};

export default function IncidentCard({ incident, onDelete }) {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-rose-600/20 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getMediaIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-sky-400" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-400" />;
      case 'voice':
        return <Mic className="h-4 w-4 text-emerald-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formattedDate = incident.reported_at
    ? new Date(incident.reported_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : 'Unknown Date';

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-bg rounded-lg border border-brand-border">
              {getMediaIcon(incident.media_type)}
            </div>
            <h3 className="font-semibold text-lg text-brand-text group-hover:text-brand-primary transition-colors">
              {incident.incident_type}
            </h3>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(incident.id)}
              className="text-brand-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Delete Incident"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${getSeverityColor(incident.severity)}`}>
            Severity: {incident.severity}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${getImpactColor(incident.traffic_impact)}`}>
            Impact: {incident.traffic_impact}
          </span>
          {/* Confidence intentionally hidden from UI */}
        </div>

        {/* Media Preview */}
        {incident.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden border border-brand-border bg-black/40 flex items-center justify-center">
            {incident.media_type === 'image' ? (
              <img
                src={normalizeMediaUrl(incident.media_url)}
                alt={incident.incident_type}
                className="w-full max-h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : incident.media_type === 'video' ? (
              <video
                src={normalizeMediaUrl(incident.media_url)}
                controls
                className="w-full max-h-48 object-contain"
              />
            ) : incident.media_type === 'voice' ? (
              <div className="p-3 w-full flex flex-col items-center">
                <div className="flex items-center space-x-2 text-xs text-brand-muted mb-2">
                  <Mic className="h-3 w-3 animate-pulse text-emerald-400" />
                  <span>Voice Report Recorded Clip</span>
                </div>
                <audio src={normalizeMediaUrl(incident.media_url)} controls className="w-full h-8" />
              </div>
            ) : null}
          </div>
        )}

        {/* AI Summary / Description */}
        <p className="text-brand-muted text-sm leading-relaxed mb-4">
          {incident.ai_summary || incident.description || "No description provided."}
        </p>
      </div>

      {/* Footer Info */}
      <div className="border-t border-brand-border/60 pt-3 mt-4 text-xs text-brand-muted space-y-1.5">
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <MapPin className="h-3.5 w-3.5 text-brand-accent" />
          <span className="truncate">
            Lat: {incident.latitude?.toFixed(4)}, Long: {incident.longitude?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
