import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, List, Map, Info } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Home', icon: Activity },
    { path: '/report', label: 'Report Incident', icon: AlertTriangle },
    { path: '/feed', label: 'Incident Feed', icon: List },
    { path: '/map', label: 'Live Map', icon: Map },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-brand-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-blue-600/20 p-2 rounded-lg text-brand-primary border border-brand-primary/30 group-hover:scale-105 transition-transform">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-brand-text">
              RoadSense <span className="text-brand-accent">AI</span>
            </span>
            <div className="text-[10px] text-brand-muted font-medium tracking-wider uppercase">Decision Intelligence</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button (always present/simplified for hackathon) */}
        <div className="flex md:hidden space-x-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                title={link.label}
                className={`p-2 rounded-lg transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40'
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
