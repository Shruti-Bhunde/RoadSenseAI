import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

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

// Component to dynamically adjust map center/zoom based on markers
function MapController({ incidents }) {
  const map = useMap();

  useEffect(() => {
    if (incidents && incidents.length > 0) {
      // Find bounding box or just center at the latest incident
      const latest = incidents[0];
      if (latest.latitude && latest.longitude) {
        map.setView([latest.latitude, latest.longitude], map.getZoom());
      }
    }
  }, [incidents, map]);

  return null;
}

export default function MapComponent({ incidents }) {
  const defaultCenter = [12.9716, 77.5946]; // Default to Bangalore (or general city)
  
  // Custom glowing div icon creator depending on impact/severity
  const createCustomIcon = (severity) => {
    let color = '#3B82F6'; // Low (Blue)
    let shadowColor = 'rgba(59, 130, 246, 0.6)';
    
    if (severity?.toLowerCase() === 'high') {
      color = '#EF4444'; // High (Red)
      shadowColor = 'rgba(239, 68, 68, 0.6)';
    } else if (severity?.toLowerCase() === 'medium') {
      color = '#F97316'; // Medium (Orange)
      shadowColor = 'rgba(249, 115, 22, 0.6)';
    }

    return new L.DivIcon({
      html: `<div style="
        position: relative;
        width: 20px;
        height: 20px;
      ">
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.4;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${color};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 8px ${shadowColor};
        "></div>
      </div>`,
      className: 'custom-gps-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-brand-border relative shadow-2xl">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null;
          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createCustomIcon(incident.severity)}
            >
              <Popup>
                <div className="p-1 max-w-[240px]">
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-brand-accent" />
                    <span className="font-bold text-sm text-brand-text leading-none">{incident.incident_type}</span>
                  </div>
                  
                  <p className="text-xs text-brand-muted mb-2 leading-relaxed">
                    {incident.ai_summary || incident.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] uppercase font-bold tracking-wider mb-2">
                    <div className="bg-brand-bg/50 p-1 border border-brand-border/40 rounded flex flex-col items-center">
                      <span className="text-gray-400 text-[8px]">Severity</span>
                      <span className={incident.severity?.toLowerCase() === 'high' ? 'text-red-400' : (incident.severity?.toLowerCase() === 'medium' ? 'text-orange-400' : 'text-blue-400')}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="bg-brand-bg/50 p-1 border border-brand-border/40 rounded flex flex-col items-center">
                      <span className="text-gray-400 text-[8px]">Traffic Impact</span>
                      <span className={incident.traffic_impact?.toLowerCase() === 'high' ? 'text-red-400' : (incident.traffic_impact?.toLowerCase() === 'medium' ? 'text-orange-400' : 'text-emerald-400')}>
                        {incident.traffic_impact}
                      </span>
                    </div>
                  </div>

                  {incident.media_url && (
                    <div className="mb-2 rounded overflow-hidden border border-brand-border bg-black/40">
                      {incident.media_type === 'image' ? (
                        <img src={incident.media_url} alt="Incident" className="w-full h-20 object-cover" />
                      ) : incident.media_type === 'video' ? (
                        <div className="text-[10px] text-center text-brand-muted p-1">📹 Video Attached</div>
                      ) : (
                        <div className="text-[10px] text-center text-brand-muted p-1">🎙️ Voice Attached</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-[9px] text-brand-muted border-t border-brand-border/30 pt-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{incident.reported_at ? parseLocalDateTime(incident.reported_at).toLocaleTimeString() : 'Unknown'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController incidents={incidents} />
      </MapContainer>
    </div>
  );
}
