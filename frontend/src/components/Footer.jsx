import React from 'react';
import { Github, Activity, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-bg py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-brand-muted">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <ShieldAlert className="h-5 w-5 text-brand-accent animate-pulse" />
          <span>RoadSense AI</span>
        </div>
        <div className="flex items-center space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-text flex items-center space-x-1 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            <span>TiDB & Gemini Integration Active</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
