import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView';
import { fetchCaseDetail, fetchCaseGraph } from '../services/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Investigation({ selectedCaseId, casesList, onSelectCase }) {
  const [caseData, setCaseData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  const currentCaseId = selectedCaseId || 'HHG-001';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([fetchCaseDetail(currentCaseId), fetchCaseGraph(currentCaseId)])
      .then(([cDetail, gDetail]) => {
        if (isMounted) {
          setCaseData(cDetail);
          setGraphData(gDetail);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load investigation data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentCaseId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center space-x-3 text-monsoon font-mono text-sm">
        <Activity className="w-5 h-5 animate-spin" />
        <span>TRACING SIGNAL & FETCHING LIVE GRAPH EVIDENCE...</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center font-mono text-sunset space-y-2">
        <AlertTriangle className="w-8 h-8 mx-auto" />
        <div>FAILED TO LOAD INVESTIGATION CASE {currentCaseId}</div>
      </div>
    );
  }

  const cDetail = caseData.case || {};
  const sarObj = caseData.sar || {};
  const nbActions = caseData.next_best_actions || {};
  const initActs = nbActions.initial || [];
  const finalActs = nbActions.final || [];
  const isFraud = cDetail.verdict === 'fraud';

  const fallbackCases = Array.from({ length: 20 }, (_, i) => ({
    case_id: `HHG-${String(i + 1).padStart(3, '0')}`,
    trigger_type: 'BENCHMARK',
    verdict: 'AUDITED'
  }));
  const displayCases = (casesList && casesList.length > 0) ? casesList : fallbackCases;

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto max-w-[1600px] mx-auto select-none">
      {/* Case Selector Dropdown Header */}
      <div className="flex items-center justify-between bg-sea-surface px-4 py-2.5 rounded-lg border border-sea-border shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-mandovi/70">SELECT BENCHMARK CASE:</span>
          <select
            value={currentCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="px-3 py-1 rounded bg-sea-card border border-sea-border text-xs font-mono font-bold text-coconut focus:outline-none focus:border-monsoon"
          >
            {displayCases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} ({c.trigger_type} — {(c.verdict || 'AUDITED').toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-mandovi">LIVE TIGERGRAPH:</span>
          <span className="text-hh-green font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-hh-green animate-pulse"></span>
            <span>VERIFIED</span>
          </span>
        </div>
      </div>

      {/* CENTERPIECE 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        {/* LEFT COLUMN: COMPACT CASE SUMMARY (3 cols) */}
        <div className="lg:col-span-3 bg-sea-surface p-4 rounded-xl border border-sea-border space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-sea-border pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-mandovi/60 uppercase">CASE ID</span>
                <h3 className="font-heading font-extrabold text-3xl text-coconut leading-none">
                  {currentCaseId}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  isFraud
                    ? 'bg-laterite text-coconut border border-sunset'
                    : 'bg-hh-green/20 text-hh-green border border-hh-green/40'
                }`}
              >
                {cDetail.verdict?.toUpperCase()}
              </span>
            </div>

            {/* Key Metadata Stack */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-sea-card border border-sea-border space-y-0.5">
                <div className="text-[9px] text-mandovi/60 uppercase">FRAUD PROB</div>
                <div className="font-bold text-coconut">
                  {cDetail.fraud_probability?.toFixed(2)}
                </div>
              </div>

              <div className="p-2 rounded bg-sea-card border border-sea-border space-y-0.5">
                <div className="text-[9px] text-mandovi/60 uppercase">EXPOSURE</div>
                <div className="font-bold text-mandovi">
                  ${cDetail.exposure_usd?.toFixed(2)}
                </div>
              </div>

              <div className="p-2 rounded bg-sea-card border border-sea-border space-y-0.5">
                <div className="text-[9px] text-mandovi/60 uppercase">INITIAL ACTION</div>
                <div className="font-bold text-coconut text-[11px] truncate">
                  {initActs[0]?.action || 'VERIFY'}
                </div>
              </div>

              <div className="p-2 rounded bg-sea-card border border-sea-border space-y-0.5">
                <div className="text-[9px] text-mandovi/60 uppercase">FINAL ACTION</div>
                <div className="font-bold text-hh-yellow text-[11px] truncate">
                  {finalActs[0]?.action || 'CLOSE'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1 text-xs font-mono">
              <div className="text-[10px] text-mandovi/60 uppercase">FRAUD PATTERN</div>
              <div className="font-bold text-monsoon uppercase">{cDetail.pattern}</div>
              {cDetail.pattern_description && (
                <div className="text-[10px] text-coconut/80 pt-1 leading-relaxed border-t border-sea-border/40">
                  {cDetail.pattern_description}
                </div>
              )}
            </div>

            {/* Selected Graph Node Details Box */}
            {selectedNodeData && (
              <div className="p-3 rounded bg-sea-hover border border-monsoon/50 space-y-1 text-xs font-mono animate-fadeIn">
                <div className="flex items-center justify-between text-[10px] text-monsoon font-bold uppercase">
                  <span>SELECTED NODE PROPERTIES</span>
                  <span>{selectedNodeData.type}</span>
                </div>
                <div className="text-coconut font-bold">{selectedNodeData.id}</div>
                <div className="text-[10px] text-mandovi/80 space-y-0.5 pt-1 border-t border-sea-border/40">
                  {Object.entries(selectedNodeData.properties || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-mandovi/60">{k}:</span>
                      <span className="text-coconut">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Graph Memory Persistence Note */}
          <div className="p-2.5 rounded bg-sea-card/60 border border-sea-border text-[10px] font-mono text-mandovi/70 flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-monsoon shrink-0" />
            <span>CASE WRITTEN TO TIGERGRAPH AS {cDetail.graph_case_id}</span>
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE GRAPH VISUALIZATION (6 cols) */}
        <div className="lg:col-span-6 min-h-[450px]">
          <GraphView
            graphData={graphData}
            onSelectNode={(nodeData) => setSelectedNodeData(nodeData)}
            isPulseActive={true}
          />
        </div>

        {/* RIGHT COLUMN: EVIDENCE PANEL & POLICY SIGNALS (3 cols) */}
        <div className="lg:col-span-3 bg-sea-surface p-4 rounded-xl border border-sea-border space-y-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="border-b border-sea-border pb-2 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-coconut uppercase tracking-wide">
                EVIDENCE PANEL
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sea-card border border-sea-border text-mandovi">
                {cDetail.evidence?.length || 0} CLAIMS
              </span>
            </div>

            {/* Evidence Items */}
            <div className="space-y-2.5">
              {cDetail.evidence?.map((ev, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-sea-card border border-sea-border space-y-1.5 hover:border-monsoon/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-monsoon/20 text-monsoon uppercase font-semibold">
                      {ev.source}
                    </span>
                    <span className="text-mandovi/60">{ev.ref}</span>
                  </div>
                  <p className="text-xs font-mono text-coconut leading-snug">{ev.claim}</p>
                </div>
              ))}
            </div>

            {/* Historical Closed Cases Memory */}
            {cDetail.similar_prior_cases?.length > 0 && (
              <div className="p-3 rounded-lg bg-sea-card/60 border border-sea-border space-y-1.5">
                <div className="text-[10px] font-mono text-mandovi/70 uppercase font-semibold">
                  HISTORICAL CASE MEMORY RETRIEVED
                </div>
                <div className="flex flex-wrap gap-1">
                  {cDetail.similar_prior_cases.map((cc) => (
                    <span key={cc} className="px-2 py-0.5 rounded text-[10px] font-mono bg-sea-surface text-mandovi border border-sea-border">
                      {cc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: POLICY DECISION, NEXT-BEST ACTION & SAR PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* POLICY DECISION PANEL */}
        <div className="p-4 rounded-xl bg-sea-surface border border-sea-border space-y-3">
          <div className="flex items-center justify-between border-b border-sea-border pb-2">
            <h4 className="font-heading font-bold text-base text-coconut uppercase tracking-wide">
              POLICY DECISION ENGINE
            </h4>
            <span className="text-[10px] font-mono text-mandovi">RULES R1–R10</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {initActs.map((act, i) => (
              <div key={i} className="p-2.5 rounded bg-sea-card border border-sea-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-coconut">{act.action}</span>
                  <span className="px-1.5 py-0.5 rounded bg-sea-surface text-mandovi text-[10px]">
                    ROUTE: {act.route}
                  </span>
                </div>
                <div className="text-[10px] text-mandovi/80">{act.reason}</div>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT-BEST ACTION PANEL */}
        <div className="p-4 rounded-xl bg-sea-surface border border-sea-border space-y-3">
          <div className="flex items-center justify-between border-b border-sea-border pb-2">
            <h4 className="font-heading font-bold text-base text-coconut uppercase tracking-wide">
              NEXT-BEST ACTION
            </h4>
            <span className="text-[10px] font-mono text-hh-yellow font-semibold">FINAL ROUTE</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {finalActs.map((act, i) => (
              <div key={i} className="p-2.5 rounded bg-sea-card border border-sea-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-hh-yellow">{act.action}</span>
                  <span className="px-1.5 py-0.5 rounded bg-monsoon/30 text-coconut text-[10px]">
                    {act.route}
                  </span>
                </div>
                <div className="text-[10px] text-mandovi/80">{act.reason}</div>
              </div>
            ))}

            <div className="pt-2 border-t border-sea-border/40 text-[10px] text-mandovi/70">
              <span className="text-coconut font-semibold">WHAT CHANGED: </span>
              {nbActions.what_changed}
            </div>
          </div>
        </div>

        {/* SAR COMPLIANCE PANEL */}
        <div className="p-4 rounded-xl bg-sea-surface border border-sea-border space-y-3">
          <div className="flex items-center justify-between border-b border-sea-border pb-2">
            <h4 className="font-heading font-bold text-base text-coconut uppercase tracking-wide">
              SAR COMPLIANCE REPORT
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sarObj.file
                  ? 'bg-laterite text-coconut border border-sunset'
                  : 'bg-sea-card text-mandovi/60 border border-sea-border'
              }`}
            >
              {sarObj.file ? 'SAR REQUIRED' : 'NO SAR REQUIRED'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-sea-card border border-sea-border space-y-1">
              <div className="text-[10px] text-mandovi/60 uppercase">REGULATORY REASON</div>
              <div className="text-coconut text-[11px]">{sarObj.reason}</div>
            </div>

            {sarObj.file && sarObj.narrative && (
              <div className="p-2.5 rounded bg-sea-card border border-sea-border space-y-1">
                <div className="text-[10px] text-sunset uppercase font-bold">NARRATIVE</div>
                <p className="text-[10px] text-coconut/90 leading-relaxed">{sarObj.narrative}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVESTIGATION TIMELINE */}
      <div className="p-4 rounded-xl bg-sea-surface border border-sea-border space-y-3">
        <div className="flex items-center space-x-2 border-b border-sea-border pb-2">
          <Clock className="w-4 h-4 text-monsoon" />
          <h4 className="font-heading font-bold text-base text-coconut uppercase tracking-wide">
            INVESTIGATION TIMELINE & DECISION AUDIT
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono select-none">
          <div className="px-3 py-1.5 rounded bg-sea-card border border-sea-border text-mandovi flex items-center space-x-1">
            <span className="text-laterite font-bold">01</span>
            <span>CASE OPENED</span>
          </div>
          <ChevronRight className="w-4 h-4 text-mandovi/40" />

          <div className="px-3 py-1.5 rounded bg-sea-card border border-sea-border text-mandovi flex items-center space-x-1">
            <span className="text-laterite font-bold">02</span>
            <span>TRIGGER: {currentCaseId}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-mandovi/40" />

          <div className="px-3 py-1.5 rounded bg-sea-card border border-sea-border text-mandovi flex items-center space-x-1">
            <span className="text-laterite font-bold">03</span>
            <span>GRAPH TRAVERSAL</span>
          </div>
          <ChevronRight className="w-4 h-4 text-mandovi/40" />

          <div className="px-3 py-1.5 rounded bg-sea-card border border-sea-border text-mandovi flex items-center space-x-1">
            <span className="text-laterite font-bold">04</span>
            <span>POLICY EVALUATED</span>
          </div>
          <ChevronRight className="w-4 h-4 text-mandovi/40" />

          <div className="px-3 py-1.5 rounded bg-sea-card border border-sea-border text-coconut font-bold flex items-center space-x-1">
            <span className="text-hh-yellow font-bold">05</span>
            <span>ACTION: {finalActs[0]?.action || 'CLOSE'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
