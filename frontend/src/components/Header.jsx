import React from 'react';
import { Activity, ShieldCheck, Database, Search } from 'lucide-react';

export default function Header({ activeTab, selectedCaseId, systemStatus, onSearch }) {
  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'SYSTEM OVERVIEW & SIGNAL MONITOR';
      case 'cases': return 'FRAUD INVESTIGATION BENCHMARK CASES';
      case 'investigation': return `INVESTIGATION CONSOLE — ${selectedCaseId || 'HHG-001'}`;
      case 'graph': return 'TIGERGRAPH KNOWLEDGE GRAPH EXPLORER';
      case 'benchmark': return 'BENCHMARK LAB & POLICY AUDIT';
      case 'system': return 'SYSTEM PROVENANCE & TECHNICAL ARCHITECTURE';
      default: return 'TRACEXEN CONSOLE';
    }
  };

  const isConnected = systemStatus?.tigergraph_connected ?? true;

  return (
    <header className="h-14 bg-sea-surface border-b border-sea-border px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center space-x-3">
        <h2 className="font-heading font-bold text-xl uppercase tracking-wide text-coconut">
          {getTitle()}
        </h2>
        <span className="text-xs text-mandovi/60 font-mono hidden md:inline">
          | TRACE THE SIGNAL. EXPOSE THE NETWORK.
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Connection Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-sea-card border border-sea-border text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-monsoon" />
          <span className="text-mandovi">TIGERGRAPH SAVANNA:</span>
          {isConnected ? (
            <span className="text-hh-green font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-hh-green animate-pulse"></span>
              <span>READY</span>
            </span>
          ) : (
            <span className="text-sunset font-semibold">OFFLINE</span>
          )}
        </div>
      </div>
    </header>
  );
}
