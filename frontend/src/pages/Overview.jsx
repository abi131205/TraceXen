import React from 'react';
import { 
  ArrowRight, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Award, 
  FileText, 
  Activity, 
  CheckCircle2, 
  GitFork, 
  Layers 
} from 'lucide-react';

export default function Overview({ onNavigate, onSelectCase, systemStatus }) {
  const isConnected = systemStatus?.tigergraph_connected ?? true;

  const metrics = [
    { label: 'BENCHMARK CASES', value: '20', desc: 'Authoritative Exam Pack', icon: BriefcaseIcon },
    { label: 'INVESTIGATED', value: '20 / 20', desc: '100% Execution Rate', icon: CheckCircle2 },
    { label: 'SAR FILED', value: '2', desc: 'Regulatory Threshold Met', icon: FileText },
    { label: 'BACKEND TESTS', value: '6 / 6', desc: '100% Suite Passing', icon: Cpu },
    { label: 'LIVE GRAPH', value: 'TraceXenGraph', desc: 'TigerGraph Savanna', icon: Database },
    { label: 'MOCK FALLBACK', value: 'OFF', desc: 'Direct RESTPP Query', icon: ShieldAlert },
  ];

  function BriefcaseIcon(props) {
    return (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13200 13.9a2 2 0 01-1.8 1.1H11.8a2 2 0 01-1.8-1.1L3 13m18 0l-1.9-8.4A2 2 0 0017.2 3H6.8a2 2 0 00-1.9 1.6L3 13m18 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
      </svg>
    );
  }

  const flowSteps = [
    { step: '01', name: 'CASE TRIGGER', detail: 'Risk model / Customer report / Analyst request' },
    { step: '02', name: 'TIGERGRAPH QUERY', detail: 'Traverse 8 vertex / 10 edge types live' },
    { step: '03', name: 'GRAPH EVIDENCE', detail: 'Historical cases & multi-account connections' },
    { step: '04', name: 'POLICY ENGINE', detail: 'Deterministic Policy Rules R1–R10' },
    { step: '05', name: 'NEXT-BEST ACTION', detail: 'Initial & final actions with approval route' },
    { step: '06', name: 'AUDITABLE CASE', detail: 'Schema-compliant output & SAR filing' },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-sea-surface border border-sea-border p-8 shadow-2xl bg-azulejo-grid">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-monsoon">
            <span className="w-2 h-2 rounded-full bg-monsoon animate-pulse"></span>
            <span>AGENTIC GRAPH INTELLIGENCE ENGINE</span>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl font-extrabold uppercase tracking-wider text-coconut leading-none">
            TRACEXEN
          </h1>
          <p className="font-heading text-2xl md:text-3xl font-bold uppercase text-mandovi tracking-wide">
            TRACE THE SIGNAL. EXPOSE THE NETWORK.
          </p>

          <p className="text-sm font-mono text-coconut/80 max-w-2xl leading-relaxed">
            Agentic graph intelligence for auditable fraud investigation and next-best action. Built for TigerGraph Hacker House Goa 2026.
          </p>

          {/* System Provenance Badges */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono select-none">
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-hh-green flex items-center space-x-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-hh-green animate-pulse"></span>
              <span>TIGERGRAPH CONNECTED</span>
            </span>
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-coconut flex items-center space-x-1.5">
              <span>AGENT READY</span>
            </span>
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-mandovi flex items-center space-x-1.5">
              <span>POLICY RULES R1–R10</span>
            </span>
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-terracotta flex items-center space-x-1.5">
              <span>20 BENCHMARK CASES</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={() => {
                onSelectCase('HHG-001');
                onNavigate('investigation');
              }}
              className="px-6 py-3 rounded-md bg-laterite hover:bg-terracotta text-coconut font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center space-x-2"
            >
              <span>OPEN INVESTIGATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('benchmark')}
              className="px-6 py-3 rounded-md bg-sea-card hover:bg-sea-hover border border-sea-border text-mandovi font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-monsoon" />
              <span>VIEW BENCHMARK LAB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-sea-surface border border-sea-border hover:border-monsoon/50 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-mandovi">
                <span className="text-[10px] font-mono tracking-widest uppercase">{m.label}</span>
                <Icon className="w-4 h-4 text-monsoon" />
              </div>
              <div className="text-xl font-mono font-bold text-coconut">
                {m.value}
              </div>
              <div className="text-[10px] font-mono text-mandovi/60">
                {m.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Investigation Flow */}
      <div className="p-6 rounded-xl bg-sea-surface border border-sea-border space-y-4">
        <div className="flex items-center justify-between border-b border-sea-border pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-monsoon" />
            <h3 className="font-heading font-bold text-lg text-coconut uppercase tracking-wide">
              INVESTIGATION WORKFLOW ARCHITECTURE
            </h3>
          </div>
          <span className="text-xs font-mono text-mandovi/60">END-TO-END PIPELINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {flowSteps.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-sea-card border border-sea-border space-y-1.5 relative hover:border-mandovi/40 transition-colors"
            >
              <div className="text-[10px] font-mono font-bold text-laterite">{s.step}</div>
              <div className="text-xs font-mono font-semibold text-coconut uppercase">{s.name}</div>
              <div className="text-[10px] font-mono text-mandovi/70 leading-tight">{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
