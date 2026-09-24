import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { User, CreditCard, DollarSign, Smartphone, FolderCheck, ShieldAlert, Sparkles } from 'lucide-react';

// Custom Custom Node Component for Forensic Graph Styling
function CustomGraphNode({ data, selected }) {
  const nodeType = data.type || 'Transaction';
  const label = data.label || data.id;

  const getNodeStyle = () => {
    switch (nodeType) {
      case 'Customer':
        return {
          bg: 'bg-sea-surface',
          border: 'border-coconut',
          text: 'text-coconut',
          icon: User,
          badgeBg: 'bg-monsoon/30 text-coconut'
        };
      case 'Card':
        return {
          bg: 'bg-sea-surface',
          border: 'border-mandovi',
          text: 'text-mandovi',
          icon: CreditCard,
          badgeBg: 'bg-mandovi/20 text-mandovi'
        };
      case 'Transaction':
        return {
          bg: data.properties?.verdict === 'fraud' ? 'bg-laterite/40' : 'bg-sea-card',
          border: data.properties?.verdict === 'fraud' ? 'border-sunset' : 'border-terracotta',
          text: 'text-terracotta',
          icon: DollarSign,
          badgeBg: 'bg-terracotta/20 text-sunset'
        };
      case 'DeviceProfile':
        return {
          bg: 'bg-sea-surface',
          border: 'border-monsoon',
          text: 'text-monsoon',
          icon: Smartphone,
          badgeBg: 'bg-monsoon/20 text-monsoon'
        };
      case 'ClosedCase':
        return {
          bg: 'bg-sea-surface',
          border: 'border-laterite',
          text: 'text-laterite',
          icon: FolderCheck,
          badgeBg: 'bg-laterite/20 text-laterite'
        };
      case 'InvestigationCase':
        return {
          bg: 'bg-sea-surface',
          border: 'border-hh-yellow',
          text: 'text-hh-yellow',
          icon: ShieldAlert,
          badgeBg: 'bg-hh-yellow/20 text-hh-yellow'
        };
      default:
        return {
          bg: 'bg-sea-surface',
          border: 'border-sea-border',
          text: 'text-coconut',
          icon: Sparkles,
          badgeBg: 'bg-sea-hover text-coconut'
        };
    }
  };

  const style = getNodeStyle();
  const IconComponent = style.icon;

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 shadow-lg transition-all select-none min-w-[140px] ${style.bg} ${style.border} ${
        selected ? 'ring-2 ring-hh-yellow shadow-hh-yellow/30 scale-105' : 'hover:scale-102'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-monsoon !w-2 !h-2" />
      <div className="flex items-center space-x-2">
        <IconComponent className={`w-4 h-4 shrink-0 ${style.text}`} />
        <div className="truncate max-w-[120px]">
          <div className={`text-[11px] font-mono font-semibold leading-tight ${style.text}`}>
            {label}
          </div>
          <span className={`inline-block text-[9px] font-mono uppercase px-1 py-0.2 rounded mt-0.5 ${style.badgeBg}`}>
            {nodeType}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-monsoon !w-2 !h-2" />
    </div>
  );
}

export default function GraphView({ graphData, onSelectNode, isPulseActive = true }) {
  const nodeTypes = useMemo(() => ({ customNode: CustomGraphNode }), []);

  // Compute Layout Nodes and Edges from Backend Graph Data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!graphData || !graphData.nodes) {
      return { initialNodes: [], initialEdges: [] };
    }

    const rawNodes = graphData.nodes || [];
    const rawEdges = graphData.edges || [];

    // Simple Auto Layout Ring / Grid Calculation
    const nodeCount = rawNodes.length;
    const radius = Math.max(160, nodeCount * 25);
    const centerX = 300;
    const centerY = 200;

    const formattedNodes = rawNodes.map((n, i) => {
      let x = centerX;
      let y = centerY;

      if (n.type === 'Customer') {
        x = centerX - 180;
        y = centerY - 80;
      } else if (n.type === 'Card') {
        x = centerX - 40;
        y = centerY - 10;
      } else if (n.type === 'Transaction') {
        x = centerX + 160;
        y = centerY - 10;
      } else if (n.type === 'InvestigationCase') {
        x = centerX + 80;
        y = centerY + 140;
      } else if (n.type === 'ClosedCase') {
        x = centerX - 180;
        y = centerY + 140;
      } else {
        const angle = (i / Math.max(1, nodeCount)) * 2 * Math.PI;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }

      return {
        id: n.id,
        type: 'customNode',
        position: { x, y },
        data: { id: n.id, label: n.label || n.id, type: n.type, properties: n.properties },
      };
    });

    const formattedEdges = rawEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || e.type,
      animated: isPulseActive,
      style: { stroke: '#176B6C', strokeWidth: 2 },
      labelStyle: { fill: '#D8C39A', fontSize: 10, fontFamily: 'Victor Mono' },
      labelBgStyle: { fill: '#071A1D', fillOpacity: 0.8 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#176B6C',
        width: 15,
        height: 15,
      },
    }));

    return { initialNodes: formattedNodes, initialEdges: formattedEdges };
  }, [graphData, isPulseActive]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when graphData changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (onSelectNode) {
        onSelectNode(node.data);
      }
    },
    [onSelectNode]
  );

  return (
    <div className="w-full h-full relative bg-sea-dark overflow-hidden rounded-lg border border-sea-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2.0}
      >
        <Background color="#13393E" gap={24} size={1} />
        <Controls className="!bg-sea-surface !border-sea-border" />
      </ReactFlow>

      {/* Subtle Evidence Pulse Badge Indicator */}
      {isPulseActive && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-monsoon/20 border border-monsoon/40 text-[10px] font-mono text-monsoon flex items-center space-x-1.5 animate-pulse select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-monsoon"></span>
          <span>EVIDENCE PULSE ACTIVE</span>
        </div>
      )}
    </div>
  );
}
