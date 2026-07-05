import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Image as ImageIcon, Video, Mic, StopCircle, Upload, Check, AlertCircle, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Loader from '../components/Loader';

function LocationPicker({ latitude, longitude, setLatitude, setLongitude }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  if (!latitude || !longitude) {
    return null;
  }

  return <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />;
}

export default function Report() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(''); // text, image, video, voice
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const mime = selectedFile.type;
      if (mime.startsWith('image/')) {
        setFileType('image');
      } else if (mime.startsWith('video/')) {
        setFileType('video');
      } else if (mime.startsWith('audio/')) {
        setFileType('voice');
      } else {
        setFileType('text');
      }
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const captureLocation = async () => {
    setLocationError('');
    try {
      const position = await getCurrentLocation();
      if (position?.coords) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
      }
    } catch (err) {
      console.warn('Location capture failed', err);
      setLocationError('Could not capture location. Check browser permissions or use a secure origin (localhost/https).');
    }
  };

  const removeAttachedFile = () => {
    setFile(null);
    setFileType('');
  };

  // Web Audio Recording
  const startRecording = async () => {
    try {
      setError('');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const voiceFile = new File([audioBlob], `voice_report_${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        setFile(voiceFile);
        setFileType('voice');
        // Stop all audio tracks to free device
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone permission/access error:", err);
      setError("Microphone permission denied or device unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !description.trim()) {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    setError('');
    setLocationError('');

    const formData = new FormData();
    if (description) {
      formData.append('description', description);
    }
    if (file) {
      formData.append('file', file);
    }

    const deviceTimestamp = new Date().toISOString();
    formData.append('reported_at', deviceTimestamp);

    try {
      let lat = latitude;
      let lng = longitude;

      if (!lat || !lng) {
        const position = await getCurrentLocation();
        if (position?.coords) {
          const latValue = position.coords.latitude;
          const lngValue = position.coords.longitude;
          lat = latValue.toString();
          lng = lngValue.toString();
          setLatitude(lat);
          setLongitude(lng);
        }
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
        setError('Location is required. Enter latitude and longitude manually or allow location access.');
        setLoading(false);
        return;
      }

      formData.append('latitude', parsedLat);
      formData.append('longitude', parsedLng);
    } catch (err) {
      console.warn('Location capture failed', err);
      setLocationError('Could not capture location automatically. Please enter latitude and longitude manually.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/feed');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'An error occurred while uploading. Ensure your backend is running.'
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <Loader message="RoadSense AI is parsing content and predicting traffic impact..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-heading">
          Report Traffic Incident
        </h2>
        <p className="text-brand-muted text-sm leading-relaxed">
          Submit unstructured text, snap an image, record a video, or leave a voice memo. 
          The Decision Intelligence Platform will extract GPS, hazard classification and traffic impact automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center space-x-3 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {locationError && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl flex items-center space-x-3 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{locationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Description Box */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-text">
            Incident Description (Text)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you see: e.g., 'A two-car collision occurred on Highway 10. Heavy traffic building up, visibility is poor due to fog...'"
            className="w-full h-36 px-4 py-3 bg-brand-card border border-brand-border rounded-xl text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary transition-colors text-sm"
          />
        </div>

        {/* Media Option Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Drop Zone */}
          <div className="bg-brand-card border border-brand-border hover:border-brand-primary/40 rounded-xl p-5 flex flex-col items-center justify-center relative cursor-pointer group transition-colors min-h-[140px]">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="h-8 w-8 text-brand-muted group-hover:text-brand-primary mb-3 transition-colors" />
            <span className="text-sm font-semibold text-brand-text">Attach Media</span>
            <span className="text-[11px] text-brand-muted mt-1 text-center">
              Supports Images, Videos or Audio files
            </span>
          </div>

          {/* Voice Note Recorder (Web MediaRecorder) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col items-center justify-center min-h-[140px]">
            {isRecording ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-red-500/20 animate-ping"></span>
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                </div>
                <div className="text-sm font-semibold text-white">
                  Recording: {recordingDuration}s
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Stop & Attach</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Mic className="h-8 w-8 text-brand-muted hover:text-brand-primary cursor-pointer mb-3 transition-colors" onClick={startRecording} />
                <span className="text-sm font-semibold text-brand-text">Record Voice Memo</span>
                <button
                  type="button"
                  onClick={startRecording}
                  className="mt-2.5 px-4 py-1.5 bg-brand-border/60 hover:bg-brand-border text-brand-text text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Start Recording</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Attached File Status Display */}
        {file && (
          <div className="bg-brand-border/40 border border-brand-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-bg rounded-lg text-brand-primary">
                {fileType === 'image' && <ImageIcon className="h-5 w-5" />}
                {fileType === 'video' && <Video className="h-5 w-5" />}
                {fileType === 'voice' && <Mic className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-text truncate max-w-[200px] sm:max-w-md">
                  {file.name}
                </div>
                <div className="text-xs text-brand-muted uppercase font-bold tracking-wider mt-0.5">
                  Attached {fileType} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={removeAttachedFile}
              className="text-brand-muted hover:text-red-400 p-1 hover:bg-brand-bg rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-text">
                Latitude (required)
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter latitude or capture location"
                className="w-full px-4 py-3 bg-brand-card border border-brand-border rounded-xl text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-text">
                Longitude (required)
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter longitude or capture location"
                className="w-full px-4 py-3 bg-brand-card border border-brand-border rounded-xl text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={captureLocation}
              className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              {latitude && longitude ? 'Location Captured' : 'Capture Current Location'}
            </button>
            <p className="text-xs text-brand-muted">
              {latitude && longitude
                ? `Captured: ${latitude}, ${longitude}`
                : 'Location is required. Capture it or select it on the map.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-text">Tap map to select location</p>
              <p className="text-xs text-brand-muted">Click anywhere on the map below to set latitude and longitude.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">Map picker</span>
          </div>
          <div className="h-80 rounded-xl overflow-hidden border border-brand-border">
            <MapContainer
              center={latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : [12.9716, 77.5946]}
              zoom={latitude && longitude ? 13 : 5}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
              />
            </MapContainer>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-center flex items-center justify-center space-x-2"
        >
          <span>Process Decision Intelligence Report</span>
        </button>
      </form>
    </div>
  );
}
