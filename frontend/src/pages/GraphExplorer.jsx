import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView';
import { searchGraph } from '../services/api';
import { Search, GitFork, Layers, Database, Sparkles } from 'lucide-react';

export default function GraphExplorer({ selectedCaseId, casesList, onSelectCase, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState(selectedCaseId || 'HHG-001');
  const [graphData, setGraphData] = useState(null);
  const [viewMode, setViewMode] = useState('CASE_VIEW'); // CASE_VIEW vs NETWORK_VIEW
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const fallbackCases = Array.from({ length: 20 }, (_, i) => ({
    case_id: `HHG-${String(i + 1).padStart(3, '0')}`
  }));
  const displayCases = (casesList && casesList.length > 0) ? casesList : fallbackCases;

  useEffect(() => {
    if (selectedCaseId) {
      setSearchQuery(selectedCaseId);
    }
  }, [selectedCaseId]);

  const executeSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery || 'HHG-001').trim();
    if (!q) return;

    setLoading(true);
    try {
      const data = await searchGraph(q);
      setGraphData(data);
    } catch (err) {
      console.error('Graph search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch(searchQuery);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-full flex flex-col select-none">
      {/* Search & View Toggle Header */}
      <div className="p-4 rounded-xl bg-sea-surface border border-sea-border flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1 max-w-2xl">
          {/* Quick Case Selector */}
          <select
            value={searchQuery.toUpperCase().startsWith('HHG-') ? searchQuery : ''}
            onChange={(e) => {
              if (e.target.value) {
                setSearchQuery(e.target.value);
                if (onSelectCase) onSelectCase(e.target.value);
              }
            }}
            className="px-3 py-1.5 rounded-md bg-sea-card border border-sea-border text-xs font-mono font-bold text-coconut focus:outline-none focus:border-monsoon"
          >
            <option value="">SELECT BENCHMARK CASE...</option>
            {displayCases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-mandovi/50" />
            <input
              type="text"
              placeholder="Search Case ID (HHG-001), Customer (C12382), Card, Txn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-md bg-sea-card border border-sea-border text-xs font-mono text-coconut placeholder-mandovi/40 focus:outline-none focus:border-monsoon"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-monsoon hover:bg-terracotta text-coconut text-xs font-mono font-bold uppercase transition-colors"
          >
            SEARCH GRAPH
          </button>
        </form>

        {/* Case View vs Network View Toggle */}
        <div className="flex items-center space-x-1 bg-sea-card p-1 rounded-md border border-sea-border text-xs font-mono">
          <button
            onClick={() => setViewMode('CASE_VIEW')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'CASE_VIEW'
                ? 'bg-monsoon text-coconut font-bold'
                : 'text-mandovi/70 hover:text-coconut'
            }`}
          >
            CASE VIEW
          </button>
          <button
            onClick={() => setViewMode('NETWORK_VIEW')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'NETWORK_VIEW'
                ? 'bg-monsoon text-coconut font-bold'
                : 'text-mandovi/70 hover:text-coconut'
            }`}
          >
            NETWORK VIEW
          </button>
        </div>
      </div>

      {/* Main Interactive Graph View & Node Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[500px]">
        <div className="lg:col-span-9 min-h-[450px]">
          <GraphView
            graphData={graphData}
            onSelectNode={(node) => setSelectedNode(node)}
            isPulseActive={true}
          />
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-sea-surface border border-sea-border space-y-4 overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-sea-border pb-2">
            <Sparkles className="w-4 h-4 text-monsoon" />
            <h4 className="font-heading font-bold text-base text-coconut uppercase">
              NODE INSPECTOR
            </h4>
          </div>

          {selectedNode ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-sea-card border border-sea-border space-y-1">
                <span className="text-[10px] text-monsoon uppercase font-bold">{selectedNode.type}</span>
                <div className="font-bold text-coconut text-sm">{selectedNode.id}</div>
              </div>

              {selectedNode.type === 'InvestigationCase' && (
                <button
                  onClick={() => {
                    const cid = selectedNode.id.replace('CASE-', '');
                    onSelectCase(cid);
                    onNavigate('investigation');
                  }}
                  className="w-full py-2 px-3 rounded bg-laterite hover:bg-terracotta text-coconut text-xs font-bold uppercase transition-colors"
                >
                  OPEN INVESTIGATION
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-mandovi/50 text-center py-8">
              Click any node in the graph to inspect properties and connected relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
