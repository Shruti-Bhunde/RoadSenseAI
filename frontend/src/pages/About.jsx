import React from 'react';
import { Cpu, Server, Database, Layers, CheckCircle } from 'lucide-react';

export default function About() {
  const stack = [
    {
      category: 'Frontend Client',
      icon: Cpu,
      techs: ['React (Vite)', 'Tailwind CSS', 'Leaflet', 'OpenStreetMap', 'React Router']
    },
    {
      category: 'Backend Server',
      icon: Server,
      techs: ['FastAPI (Python)', 'SQLAlchemy ORM', 'Pydantic validation', 'SQLite / TiDB Serverless']
    },
    {
      category: 'Artificial Intelligence',
      icon: Layers,
      techs: ['Google Gemini 1.5 Flash', 'Multimodal Parsing API (JSON output mode)', 'Context Extraction']
    },
    {
      category: 'Machine Learning',
      icon: Database,
      techs: ['Scikit-learn', 'Random Forest Classifier', 'Joblib serialized pipeline']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-heading">
          About RoadSense AI
        </h2>
        <p className="text-brand-muted text-sm leading-relaxed max-w-xl mx-auto">
          AI-Powered Community Traffic Decision Intelligence Platform designed for swift, unstructured reporting of road hazards.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {stack.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-brand-card border border-brand-border rounded-xl p-5">
              <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-brand-border/60">
                <Icon className="h-5 w-5 text-brand-accent" />
                <h3 className="font-bold text-sm text-brand-text">{item.category}</h3>
              </div>
              <ul className="space-y-2">
                {item.techs.map((tech, tIdx) => (
                  <li key={tIdx} className="flex items-center space-x-2 text-xs text-brand-muted">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* System Flow Diagram (Textual / Beautiful styling) */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6">
        <h3 className="font-bold text-base text-brand-text mb-4">Pipeline Workflow</h3>
        
        <div className="relative border-l-2 border-brand-border pl-6 space-y-6 text-xs text-brand-muted">
          {/* Step 1 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">1</span>
            <h4 className="font-bold text-brand-text mb-1">Multimodal Submission</h4>
            <p>User reports an event using text, uploading photos/videos, or recording voice statements in the app.</p>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">2</span>
            <h4 className="font-bold text-brand-text mb-1">Gemini Analysis</h4>
            <p>FastAPI submits binary media or text to the Google Gemini multimodal model, extracting structured features like lane count, weather, and GPS location via JSON schema.</p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">3</span>
            <h4 className="font-bold text-brand-text mb-1">Machine Learning Impact Classification</h4>
            <p>A trained Random Forest model parses these metrics (lanes, weather, density) to output a traffic delay impact level (Low, Medium, High).</p>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">4</span>
            <h4 className="font-bold text-brand-text mb-1">TiDB Storage & Rendering</h4>
            <p>The structured, classified record is persisted in TiDB/SQLite, automatically updating the feed and pinning markers on the live leaflet map.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
