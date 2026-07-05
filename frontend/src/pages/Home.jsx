import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Map, ClipboardList, TrendingUp, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-brand-primary text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Map className="h-4 w-4" />
            <span>Next-Gen Traffic Operations Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading leading-tight text-white">
            Transform Multimodal Reports Into <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-orange-400">
              Actionable Traffic Intelligence
            </span>
          </h1>

          <p className="text-brand-muted text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Report incidents via text, voice notes, photos, or videos. Our Gemini-powered system extracts details, and machine learning models instantly predict traffic impact.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-center"
            >
              Report an Incident
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto px-8 py-4 bg-brand-card hover:bg-brand-border/40 text-brand-text border border-brand-border font-semibold rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-2"
            >
              <Map className="h-5 w-5 text-brand-accent" />
              <span>View Live Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-brand-border/40">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-12 text-white">
          Platform Architecture & Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-brand-primary mb-5">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">Multimodal Gemini AI</h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Accepts plain text, speech files, images, or scene recordings. Gemini analyzes the context and returns structured data automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300">
            <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20 text-brand-accent mb-5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">Random Forest Predictions</h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Features like lanes, weather, road type, and visibility are parsed. The scikit-learn ML model dynamically classifies the traffic impact.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-5">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">Decision Dashboard</h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Every report stores seamlessly in TiDB Serverless and visualizes on the Leaflet map with custom GPS trackers showing severity and traffic impact.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
