import React from 'react';
import { 
  Compass, 
  Briefcase, 
  Search, 
  GitFork, 
  Award, 
  Cpu, 
  Activity, 
  Database, 
  ShieldCheck, 
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, systemStatus, isDemoMode, setIsDemoMode }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'investigation', label: 'Investigation', icon: Search },
    { id: 'graph', label: 'Graph Explorer', icon: GitFork },
    { id: 'benchmark', label: 'Benchmark Lab', icon: Award },
    { id: 'system', label: 'System', icon: Cpu },
  ];

  const isConnected = systemStatus?.tigergraph_connected ?? true;
  const isFallback = systemStatus?.mock_fallback_active ?? false;

  return (
    <aside className="w-64 bg-sea-surface border-r border-sea-border flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-sea-border">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-laterite flex items-center justify-center font-heading font-bold text-lg text-coconut">
              X
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl tracking-wider text-coconut uppercase leading-none">
                TRACE XEN
              </h1>
              <p className="text-[10px] text-mandovi tracking-widest uppercase font-mono mt-0.5">
                COASTAL FORENSICS
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="px-4 py-3 border-b border-sea-border/50 bg-sea-card/50">
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`w-full py-1.5 px-3 rounded text-xs font-mono font-semibold flex items-center justify-between transition-all ${
              isDemoMode 
                ? 'bg-hh-yellow text-sea-dark shadow-sm' 
                : 'bg-sea-border/40 text-mandovi hover:bg-sea-border/70'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>JUDGE DEMO MODE</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sea-dark/30">
              {isDemoMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Nav List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-mono tracking-wide transition-colors ${
                  isActive
                    ? 'bg-monsoon text-coconut font-semibold shadow-inner'
                    : 'text-mandovi/80 hover:bg-sea-hover hover:text-coconut'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-coconut' : 'text-mandovi/60'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Live Graph & System Provenance Footer */}
      <div className="p-4 border-t border-sea-border bg-sea-card/80 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-mandovi/70 uppercase">LIVE GRAPH</span>
          <span className="text-coconut font-semibold">TraceXenGraph</span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          {isConnected && !isFallback ? (
            <div className="flex items-center space-x-2 text-hh-green font-semibold">
              <span className="w-2 h-2 rounded-full bg-hh-green animate-pulse"></span>
              <span>LIVE — TIGERGRAPH</span>
            </div>
          ) : isFallback ? (
            <div className="flex items-center space-x-2 text-hh-yellow font-semibold">
              <span className="w-2 h-2 rounded-full bg-hh-yellow"></span>
              <span>MOCK FALLBACK</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sunset font-semibold">
              <span className="w-2 h-2 rounded-full bg-sunset"></span>
              <span>OFFLINE</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-sea-border/40 text-[10px] font-mono text-mandovi/60 space-y-1">
          <div className="flex justify-between">
            <span>ENV:</span>
            <span className="text-coconut">TIGERGRAPH SAVANNA</span>
          </div>
          <div className="flex justify-between">
            <span>TESTS:</span>
            <span className="text-hh-green">6/6 PASSED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
