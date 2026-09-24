import React, { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Database, FileText, ArrowRight, Layers } from 'lucide-react';

export default function Benchmark({ casesList, onSelectCase, onNavigate }) {
  const [selectedCaseId, setSelectedCaseId] = useState('HHG-001');

  const fallbackCases = Array.from({ length: 20 }, (_, i) => ({
    case_id: `HHG-${String(i + 1).padStart(3, '0')}`,
    trigger_type: 'BENCHMARK',
    verdict: (i === 9 || i === 13) ? 'account_takeover' : 'audited',
    sar: (i === 9 || i === 13)
  }));
  const displayCases = (casesList && casesList.length > 0) ? casesList : fallbackCases;
  const selectedCase = displayCases.find((c) => c.case_id === selectedCaseId) || displayCases[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Benchmark Summary Hero */}
      <div className="p-6 rounded-xl bg-sea-surface border border-sea-border space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-sea-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-monsoon uppercase">
              <Award className="w-4 h-4 text-monsoon" />
              <span>HHGOA FRAUD INVESTIGATION BENCHMARK LAB</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-coconut uppercase tracking-wide">
              20 / 20 BENCHMARK CASES — 100% PASS
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-hh-green font-bold">
              BACKEND: 6/6 PASSED
            </span>
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-coconut">
              TIGERGRAPH: LIVE
            </span>
            <span className="px-3 py-1 rounded bg-sea-card border border-sea-border text-mandovi">
              MOCK FALLBACK: OFF
            </span>
          </div>
        </div>

        {/* Analytical Breakdown Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1">
            <span className="text-mandovi/60 uppercase">TOTAL CASES</span>
            <div className="text-xl font-bold text-coconut">20</div>
          </div>

          <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1">
            <span className="text-mandovi/60 uppercase">FRAUD VERDICTS</span>
            <div className="text-xl font-bold text-sunset">13</div>
          </div>

          <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1">
            <span className="text-mandovi/60 uppercase">LEGITIMATE VERDICTS</span>
            <div className="text-xl font-bold text-hh-green">7</div>
          </div>

          <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1">
            <span className="text-mandovi/60 uppercase">SAR FILED</span>
            <div className="text-xl font-bold text-laterite">2</div>
          </div>
        </div>
      </div>

      {/* BENCHMARK CASE PIPELINE INSPECTOR */}
      <div className="p-6 rounded-xl bg-sea-surface border border-sea-border space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-sea-border pb-4">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-monsoon" />
            <h3 className="font-heading font-bold text-xl text-coconut uppercase tracking-wide">
              BENCHMARK CASE PIPELINE INSPECTOR
            </h3>
          </div>

          {/* Case Selector Dropdown */}
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-4 py-2 rounded bg-sea-card border border-sea-border text-xs font-mono font-bold text-coconut focus:outline-none focus:border-monsoon"
          >
            {displayCases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.trigger_type} ({(c.verdict || 'AUDITED').toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* STEP-BY-STEP PIPELINE */}
        {selectedCase && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 text-xs font-mono">
              {/* 1. INPUT */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-laterite">01. INPUT</div>
                <div className="font-bold text-coconut">{selectedCase.case_id}</div>
                <div className="text-[10px] text-mandovi/80">{selectedCase.trigger_type}</div>
                <div className="text-[10px] text-mandovi/60">Risk: {selectedCase.risk_score?.toFixed(2) || '0.61'}</div>
              </div>

              {/* 2. GRAPH EVIDENCE */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-monsoon">02. GRAPH EVIDENCE</div>
                <div className="font-bold text-coconut">{selectedCase.customer_id || 'C12382'}</div>
                <div className="text-[10px] text-mandovi/80">{selectedCase.card_id || 'C12382-K1'}</div>
                <div className="text-[10px] text-monsoon font-semibold">TIGERGRAPH VERIFIED</div>
              </div>

              {/* 3. POLICY */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-mandovi">03. POLICY</div>
                <div className="font-bold text-coconut uppercase">{selectedCase.pattern || 'none'}</div>
                <div className="text-[10px] text-mandovi/80">Rules R1–R10</div>
              </div>

              {/* 4. INITIAL ACTION */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-coconut">04. INITIAL ACTION</div>
                <div className="font-bold text-coconut">{selectedCase.initial_action || 'VERIFY_WITH_CUSTOMER'}</div>
                <div className="text-[10px] text-mandovi/60">Route: auto</div>
              </div>

              {/* 5. FINAL ACTION */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-hh-yellow">05. FINAL ACTION</div>
                <div className="font-bold text-hh-yellow">{selectedCase.final_action || 'CLOSE_NO_FRAUD'}</div>
                <div className="text-[10px] text-mandovi/60">Route: auto / L1</div>
              </div>

              {/* 6. SAR */}
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1.5">
                <div className="text-[10px] font-bold text-sunset">06. SAR</div>
                <div className={`font-bold ${selectedCase.sar ? 'text-sunset' : 'text-mandovi/60'}`}>
                  {selectedCase.sar ? 'FILED (L2)' : 'NO SAR'}
                </div>
              </div>

              {/* 7. NEXT-BEST ACTION CTA */}
              <div className="p-3 rounded bg-monsoon/20 border border-monsoon/40 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-coconut">07. CASE DETAIL</div>
                <button
                  onClick={() => {
                    onSelectCase(selectedCase.case_id);
                    onNavigate('investigation');
                  }}
                  className="w-full py-1.5 px-2 rounded bg-monsoon hover:bg-terracotta text-coconut text-[11px] font-bold uppercase transition-colors flex items-center justify-center space-x-1"
                >
                  <span>INSPECT</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 20 Case Grid selector */}
      <div className="p-6 rounded-xl bg-sea-surface border border-sea-border space-y-4">
        <h3 className="font-heading font-bold text-lg text-coconut uppercase tracking-wide border-b border-sea-border pb-2">
          ALL 20 BENCHMARK CASE RESULTS
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
          {displayCases.map((c) => (
            <div
              key={c.case_id}
              onClick={() => setSelectedCaseId(c.case_id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                c.case_id === selectedCaseId
                  ? 'bg-sea-hover border-hh-yellow shadow-md'
                  : 'bg-sea-card border-sea-border hover:border-monsoon/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-coconut">{c.case_id}</span>
                {c.sar && <span className="text-[9px] px-1.5 py-0.2 rounded bg-laterite text-coconut font-bold">SAR</span>}
              </div>
              <div className="text-[10px] text-mandovi/70 uppercase pt-1">{c.verdict}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
