import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = "Processing reports with multimodal AI..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 animate-ping"></div>
        {/* Spinner */}
        <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
      <p className="text-brand-text font-medium text-center text-lg animate-pulse">{message}</p>
      <p className="text-brand-muted text-xs text-center mt-2 max-w-sm">
        Analyzing file content, calling Google Gemini and Random Forest ML classifier. Please wait...
      </p>
    </div>
  );
}
