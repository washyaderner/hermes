"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'prompt' | 'enhance' | 'output' | 'end';
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface PromptFlowDiagramProps {
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  onExportJSON?: () => void;
}

export function PromptFlowDiagram({ 
  nodes: initialNodes, 
  edges: initialEdges,
  onExportJSON 
}: PromptFlowDiagramProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes || [
    { id: '1', label: 'Input Prompt', type: 'start', x: 100, y: 50 },
    { id: '2', label: 'Analyze', type: 'prompt', x: 100, y: 150 },
    { id: '3', label: 'Platform Selection', type: 'prompt', x: 100, y: 250 },
    { id: '4', label: 'Enhancement', type: 'enhance', x: 100, y: 350 },
    { id: '5', label: 'Output A', type: 'output', x: 50, y: 450 },
    { id: '6', label: 'Output B', type: 'output', x: 150, y: 450 },
  ]);

  const [edges, setEdges] = useState<FlowEdge[]>(initialEdges || [
    { from: '1', to: '2', label: 'Text' },
    { from: '2', to: '3', label: 'Intent' },
    { from: '3', to: '4', label: 'Platform' },
    { from: '4', to: '5', label: 'Variation 1' },
    { from: '4', to: '6', label: 'Variation 2' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'start': return 'bg-green-500';
      case 'prompt': return 'bg-primary';
      case 'enhance': return 'bg-accent';
      case 'output': return 'bg-blue-500';
      case 'end': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(nodes.map(node =>
      node.id === draggingNode
        ? { ...node, x: Math.max(0, Math.min(x, rect.width - 100)), y: Math.max(0, Math.min(y, rect.height - 60)) }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleExportJSON = () => {
    const workflow = { nodes, edges };
    const json = JSON.stringify(workflow, null, 2);
    
    if (onExportJSON) {
      onExportJSON();
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prompt-workflow.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleAddNode = () => {
    const newNode: FlowNode = {
      id: String(nodes.length + 1),
      label: `Node ${nodes.length + 1}`,
      type: 'prompt',
      x: 200,
      y: 200,
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes(nodes.filter(n => n.id !== selectedNode));
    setEdges(edges.filter(e => e.from !== selectedNode && e.to !== selectedNode));
    setSelectedNode(null);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt Flow Diagram</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Visual workflow representation - Drag nodes to reposition
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddNode}>
              ➕ Add Node
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDeleteNode}
              disabled={!selectedNode}
            >
              🗑️ Delete
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportJSON}>
              💾 Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={canvasRef}
          className="relative bg-[#0a0014] rounded-lg border border-border overflow-hidden"
          style={{ height: '500px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG for edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#6b46c1" />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 50;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 50;
              const y2 = toNode.y;

              return (
                <g key={index}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#6b46c1"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 5}
                      fill="#64748b"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute ${getNodeColor(node.type)} rounded-lg px-4 py-2 cursor-move shadow-lg transition-all ${
                selectedNode === node.id ? 'ring-2 ring-white scale-105' : ''
              } ${draggingNode === node.id ? 'opacity-75' : ''}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '100px',
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onClick={() => setSelectedNode(node.id)}
            >
              <div className="text-white text-sm font-medium text-center truncate">
                {node.label}
              </div>
              <div className="text-xs text-white/70 text-center">
                {node.type}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-gray-400">Prompt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent rounded"></div>
            <span className="text-gray-400">Enhance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-400">Output</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-gray-400 mt-4">
          💡 Click to select nodes, drag to reposition. Export to save workflow as JSON.
        </p>
      </CardContent>
    </Card>
  );
}
