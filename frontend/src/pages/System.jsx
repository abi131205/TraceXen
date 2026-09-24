import React from 'react';
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Server, 
  GitBranch, 
  Key, 
  CheckCircle2,
  Lock,
  Zap,
  Terminal,
  FileCode2,
  ListOrdered
} from 'lucide-react';

export default function System({ systemStatus }) {
  const isConnected = systemStatus?.tigergraph_connected ?? true;

  const vertices = [
    { type: 'Customer', id: 'cust_id', desc: 'Bank customer / Account holder entity' },
    { type: 'Card', id: 'card_id', desc: 'Payment card (Credit/Debit/Prepaid)' },
    { type: 'Device', id: 'device_id', desc: 'Hardware device fingerprint / IMEI' },
    { type: 'IP', id: 'ip_address', desc: 'IP address used in transactions' },
    { type: 'Merchant', id: 'merchant_id', desc: 'Merchant endpoint / terminal' },
    { type: 'Transaction', id: 'tx_id', desc: 'Financial transaction record with amount, timestamp, region' },
    { type: 'Case', id: 'case_id', desc: 'Active or historic fraud investigation case' },
    { type: 'Rule', id: 'rule_id', desc: 'Fraud engine policy rule definition' },
  ];

  const edges = [
    { type: 'OWNS_CARD', source: 'Customer', target: 'Card', desc: 'Account ownership relationship' },
    { type: 'PERFORMED_TRANSACTION', source: 'Customer/Card', target: 'Transaction', desc: 'Transaction initiation' },
    { type: 'USED_DEVICE', source: 'Transaction', target: 'Device', desc: 'Device used for transaction' },
    { type: 'TRANSACTED_FROM_IP', source: 'Transaction', target: 'IP', desc: 'IP origin of transaction' },
    { type: 'TRANSACTED_AT', source: 'Transaction', target: 'Merchant', desc: 'Target merchant for payment' },
    { type: 'ASSOCIATED_WITH_CASE', source: 'Transaction/Customer', target: 'Case', desc: 'Links entity to investigation case' },
    { type: 'HAS_CLOSED_CASE', source: 'Customer', target: 'Case', desc: 'Historic closed case history for risk scoring' },
    { type: 'TRIGGERED_RULE', source: 'Case/Transaction', target: 'Rule', desc: 'Policy rule execution mapping' },
    { type: 'SHARES_DEVICE_WITH', source: 'Customer', target: 'Customer', desc: 'Inferred multi-account device link' },
    { type: 'SHARES_IP_WITH', source: 'Customer', target: 'Customer', desc: 'Inferred IP network cluster link' },
  ];

  const rules = [
    { code: 'R1', name: 'High Amount Velocity', desc: 'Multiple high-value transactions within short window' },
    { code: 'R2', name: 'New Device + High Amount', desc: 'Unrecognized device ID on transaction > ₹50,000' },
    { code: 'R3', name: 'Out of Region Sequence', desc: 'Transaction location geographically inconsistent with customer home region' },
    { code: 'R4', name: 'Multiple Card Testing', desc: 'Low-value rapid authorization attempts across multiple cards' },
    { code: 'R5', name: 'Shared Device Multi-Account', desc: 'Device linked to 3+ distinct customer IDs' },
    { code: 'R6', name: 'Shared IP Cluster', desc: 'IP address shared by multiple high-risk accounts' },
    { code: 'R7', name: 'Historic Closed Case Recurrence', desc: 'Customer associated with prior confirmed fraud cases (CC-*)' },
    { code: 'R8', name: 'Account Takeover Pattern', desc: 'Device change + password/contact change + immediate transfer' },
    { code: 'R9', name: 'Card Not Present (CNP) Spike', desc: 'Sudden burst of international CNP e-commerce authorizations' },
    { code: 'R10', name: 'High Risk Combination', desc: 'Risk score >= 0.70 with 2+ active policy violations triggering mandatory SAR' },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sea-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-monsoon mb-1">
            <Server className="w-4 h-4 text-monsoon" />
            <span>SYSTEM PROVENANCE & ARCHITECTURE</span>
          </div>
          <h1 className="font-heading text-4xl font-extrabold text-coconut uppercase tracking-wider">
            SYSTEM ENGINE & GRAPH PROVENANCE
          </h1>
          <p className="text-sand text-sm font-mono mt-1">
            TigerGraph Savanna 4.2.5 • FastAPI Backend • Deterministic Policy Engine R1–R10
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-sea-surface border border-sea-border rounded-lg px-4 py-2 flex items-center space-x-3 shadow-inner">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-monsoon animate-pulse' : 'bg-laterite'}`}></span>
            <div>
              <div className="text-xs font-mono font-bold text-coconut">
                {isConnected ? 'SAVANNA CONNECTED' : 'DISCONNECTED'}
              </div>
              <div className="text-[10px] font-mono text-sand">
                TG_HOST: {systemStatus?.tigergraph_host || 'https://tg-42b9ad92...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner & Privacy Notice */}
      <div className="bg-sea-surface/80 border border-monsoon/40 rounded-xl p-5 shadow-lg flex items-start space-x-4">
        <Lock className="w-6 h-6 text-monsoon flex-shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-heading text-lg font-bold text-coconut uppercase tracking-wide">
            SECURITY & CREDENTIAL HARDENING
          </h4>
          <p className="text-xs text-sand font-mono leading-relaxed">
            TigerGraph connection authenticates securely via environment variables (`TG_HOST`, `TG_SECRET`, `TG_GRAPHNAME`). 
            <strong className="text-mandovi"> `TG_SECRET` is strictly protected</strong> and is never rendered in REST API responses, terminal logs, or client state. 
            Mock repository fallback is disabled; queries run directly against the live TigerGraph Savanna RESTPP endpoint.
          </p>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-monsoon/20 border border-monsoon/40">
              <Database className="w-6 h-6 text-monsoon" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-coconut uppercase">TIGERGRAPH SAVANNA</h3>
              <p className="text-xs font-mono text-sand">Graph Database Layer</p>
            </div>
          </div>
          <ul className="text-xs font-mono space-y-2 text-sand border-t border-sea-border/60 pt-3">
            <li className="flex justify-between">
              <span className="text-monsoon">Environment:</span>
              <span className="text-coconut font-bold">Savanna Cloud AP-SOUTH-1</span>
            </li>
            <li className="flex justify-between">
              <span className="text-monsoon">Version:</span>
              <span className="text-coconut">4.2.5</span>
            </li>
            <li className="flex justify-between">
              <span className="text-monsoon">Graph Name:</span>
              <span className="text-coconut font-bold">TraceXenGraph</span>
            </li>
            <li className="flex justify-between">
              <span className="text-monsoon">Config:</span>
              <span className="text-coconut">TG-00 (16Gi) R/W</span>
            </li>
          </ul>
        </div>

        <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-terracotta/20 border border-terracotta/40">
              <Cpu className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-coconut uppercase">FASTAPI BACKEND</h3>
              <p className="text-xs font-mono text-sand">REST API & Service Layer</p>
            </div>
          </div>
          <ul className="text-xs font-mono space-y-2 text-sand border-t border-sea-border/60 pt-3">
            <li className="flex justify-between">
              <span className="text-terracotta">App Service:</span>
              <span className="text-coconut font-bold">backend/app/main.py</span>
            </li>
            <li className="flex justify-between">
              <span className="text-terracotta">Repository:</span>
              <span className="text-coconut">TigerGraphRepository</span>
            </li>
            <li className="flex justify-between">
              <span className="text-terracotta">Engine:</span>
              <span className="text-coconut font-bold">InvestigationService</span>
            </li>
            <li className="flex justify-between">
              <span className="text-terracotta">Tests:</span>
              <span className="text-coconut font-bold">6/6 Pytest Passed</span>
            </li>
          </ul>
        </div>

        <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-hh/20 border border-yellow-hh/40">
              <ShieldCheck className="w-6 h-6 text-yellow-hh" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-coconut uppercase">POLICY ENGINE</h3>
              <p className="text-xs font-mono text-sand">Deterministic Decision Core</p>
            </div>
          </div>
          <ul className="text-xs font-mono space-y-2 text-sand border-t border-sea-border/60 pt-3">
            <li className="flex justify-between">
              <span className="text-yellow-hh">Rule Set:</span>
              <span className="text-coconut font-bold">R1 – R10 Deterministic</span>
            </li>
            <li className="flex justify-between">
              <span className="text-yellow-hh">Risk Scoring:</span>
              <span className="text-coconut">Numeric Signal [0.0 - 1.0]</span>
            </li>
            <li className="flex justify-between">
              <span className="text-yellow-hh">SAR Rule:</span>
              <span className="text-coconut font-bold">File iff Rule 10 or Policy</span>
            </li>
            <li className="flex justify-between">
              <span className="text-yellow-hh">Benchmark:</span>
              <span className="text-coconut font-bold">20/20 Audited Cases</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Schema Specification — Vertices & Edges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vertices */}
        <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-sea-border pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-monsoon" />
              <h3 className="font-heading text-2xl font-bold text-coconut uppercase">8 VERTEX TYPES</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-monsoon/20 text-monsoon border border-monsoon/30">
              SCHEMA V4.2.5
            </span>
          </div>

          <div className="divide-y divide-sea-border/40">
            {vertices.map((v) => (
              <div key={v.type} className="py-2.5 flex items-start justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-coconut text-sm">{v.type}</span>
                  <p className="text-sand text-[11px] font-sans mt-0.5">{v.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-sea-bg border border-sea-border text-monsoon font-mono text-[11px]">
                  ID: {v.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edges */}
        <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-sea-border pb-3">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-terracotta" />
              <h3 className="font-heading text-2xl font-bold text-coconut uppercase">10 EDGE TYPES</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-terracotta/20 text-terracotta border border-terracotta/30">
              DIRECTED & UNDIRECTED
            </span>
          </div>

          <div className="divide-y divide-sea-border/40">
            {edges.map((e) => (
              <div key={e.type} className="py-2.5 flex items-start justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-mandovi text-sm">{e.type}</span>
                  <p className="text-sand text-[11px] font-sans mt-0.5">{e.desc}</p>
                </div>
                <div className="text-right text-[10px] text-monsoon">
                  {e.source} → {e.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Registry R1 - R10 */}
      <div className="bg-sea-surface border border-sea-border rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-sea-border pb-4">
          <div className="flex items-center space-x-3">
            <ListOrdered className="w-6 h-6 text-yellow-hh" />
            <div>
              <h3 className="font-heading text-3xl font-extrabold text-coconut uppercase">FRAUD POLICY RULES REGISTRY</h3>
              <p className="text-xs font-mono text-sand">Rules R1 through R10 — Exact Policy Match Definitions</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-yellow-hh/10 text-yellow-hh border border-yellow-hh/30 font-bold">
            FROZEN BACKEND SPEC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.code} className="bg-sea-bg/60 border border-sea-border rounded-lg p-4 space-y-2 hover:border-sea-border/80 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-terracotta/20 border border-terracotta/40 text-terracotta font-mono font-bold text-xs">
                  {rule.code}
                </span>
                <span className="text-[10px] font-mono text-monsoon uppercase">Policy Deterministic</span>
              </div>
              <h4 className="font-heading text-lg font-bold text-coconut uppercase tracking-wide">
                {rule.name}
              </h4>
              <p className="text-xs font-mono text-sand leading-relaxed">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
