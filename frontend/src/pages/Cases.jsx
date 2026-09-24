import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowRight, ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function Cases({ casesList, onSelectCase, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sarFilter, setSarFilter] = useState('ALL');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const filteredCases = useMemo(() => {
    if (!casesList) return [];
    return casesList.filter((c) => {
      const matchSearch =
        c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.card_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.flagged_txn_id.includes(searchTerm);

      const matchSar =
        sarFilter === 'ALL' ? true : sarFilter === 'YES' ? c.sar : !c.sar;

      const matchVerdict =
        verdictFilter === 'ALL'
          ? true
          : c.verdict.toLowerCase() === verdictFilter.toLowerCase();

      return matchSearch && matchSar && matchVerdict;
    });
  }, [casesList, searchTerm, sarFilter, verdictFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-sea-surface p-4 rounded-xl border border-sea-border">
        <div>
          <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-coconut">
            BENCHMARK INVESTIGATION CASES
          </h2>
          <p className="text-xs font-mono text-mandovi/70">
            20 Authoritative Exam Cases from case_pack.csv
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-mandovi/50" />
            <input
              type="text"
              placeholder="Search Case ID, Customer, Card..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-md bg-sea-card border border-sea-border text-xs font-mono text-coconut placeholder-mandovi/40 focus:outline-none focus:border-monsoon"
            />
          </div>

          {/* SAR Filter */}
          <select
            value={sarFilter}
            onChange={(e) => setSarFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-sea-card border border-sea-border text-xs font-mono text-coconut focus:outline-none focus:border-monsoon"
          >
            <option value="ALL">SAR: ALL</option>
            <option value="YES">SAR FILED (2)</option>
            <option value="NO">NO SAR (18)</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-sea-card border border-sea-border text-xs font-mono text-coconut focus:outline-none focus:border-monsoon"
          >
            <option value="ALL">VERDICT: ALL</option>
            <option value="FRAUD">FRAUD (13)</option>
            <option value="LEGITIMATE">LEGITIMATE (7)</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl bg-sea-surface border border-sea-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse select-none">
            <thead>
              <tr className="border-b border-sea-border bg-sea-card/80 text-mandovi/70 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">CASE ID</th>
                <th className="py-3.5 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3.5 px-4 font-semibold">CARD</th>
                <th className="py-3.5 px-4 font-semibold">RISK SCORE</th>
                <th className="py-3.5 px-4 font-semibold">TRIGGER</th>
                <th className="py-3.5 px-4 font-semibold">PATTERN</th>
                <th className="py-3.5 px-4 font-semibold">INITIAL ACTION</th>
                <th className="py-3.5 px-4 font-semibold">FINAL ACTION</th>
                <th className="py-3.5 px-4 font-semibold">SAR</th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sea-border/50 text-coconut">
              {filteredCases.map((c) => {
                const isFraud = c.verdict === 'fraud';
                return (
                  <tr
                    key={c.case_id}
                    onClick={() => {
                      onSelectCase(c.case_id);
                      onNavigate('investigation');
                    }}
                    className="hover:bg-sea-hover/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-mandovi">{c.case_id}</td>
                    <td className="py-3 px-4 text-coconut">{c.customer_id}</td>
                    <td className="py-3 px-4 text-mandovi/80">{c.card_id}</td>
                    
                    {/* RISK SCORE DISPLAYED AS NUMERIC VALUE (NOT FRAUD VERDICT) */}
                    <td className="py-3 px-4">
                      {c.risk_score !== null && c.risk_score !== undefined ? (
                        <span className="font-semibold text-coconut bg-sea-card px-2 py-0.5 rounded border border-sea-border">
                          {c.risk_score.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-mandovi/40">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-mandovi/90 uppercase">{c.trigger_type}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-sea-card border border-sea-border text-monsoon">
                        {c.pattern}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-mandovi/80">{c.initial_action}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.final_action === 'CLOSE_NO_FRAUD'
                            ? 'bg-hh-green/20 text-hh-green border border-hh-green/40'
                            : 'bg-laterite/20 text-sunset border border-laterite/40'
                        }`}
                      >
                        {c.final_action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.sar ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-laterite text-coconut border border-sunset">
                          FILED
                        </span>
                      ) : (
                        <span className="text-mandovi/40">NO</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-3 py-1 rounded bg-sea-card hover:bg-monsoon text-coconut text-[11px] transition-colors flex items-center space-x-1 ml-auto">
                        <span>INVESTIGATE</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
