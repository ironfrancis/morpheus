import React, { useEffect, useRef } from 'react';
import type { GraphNode, GraphLink } from '../types';

interface SimpleForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  theme: 'light' | 'dark';
}

export const SimpleForceGraph: React.FC<SimpleForceGraphProps> = ({ nodes, links, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Resize handler
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 600;
      canvas.height = rect?.height || 400;
      width = canvas.width;
      height = canvas.height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Deep copy nodes and setup initial layout coordinates
    const graphNodes = nodes.map((node, index) => {
      // Circle layout initially
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
      };
    });

    // Create a fast map for node lookup
    const nodeMap = new Map(graphNodes.map(n => [n.id, n]));

    // Prepare links
    const graphLinks = links
      .map(link => {
        const sourceNode = nodeMap.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
        const targetNode = nodeMap.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
        if (sourceNode && targetNode) {
          return {
            source: sourceNode,
            target: targetNode,
            type: link.type,
          };
        }
        return null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    // Simulation parameters
    const forceStrength = 0.05;
    const linkDistance = 80;
    const chargeStrength = -120;
    const gravity = 0.03;
    const friction = 0.85;

    // Drag-and-drop state
    let draggedNode: typeof graphNodes[0] | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Find clicked node
      for (const node of graphNodes) {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        const radius = node.val || 8;
        if (dist < radius + 5) {
          draggedNode = node;
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedNode) return;
      const rect = canvas.getBoundingClientRect();
      draggedNode.x = e.clientX - rect.left;
      draggedNode.y = e.clientY - rect.top;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    };

    const handleMouseUp = () => {
      draggedNode = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Simulation step loop
    const tick = () => {
      // 1. Repulsion (Charge force - n^2 repulsion)
      for (let i = 0; i < graphNodes.length; i++) {
        const nodeA = graphNodes[i];
        for (let j = i + 1; j < graphNodes.length; j++) {
          const nodeB = graphNodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.hypot(dx, dy) || 1;
          
          if (dist < 300) {
            // Repulsion formula
            const force = (chargeStrength / (dist * dist)) * forceStrength * 15;
            const fx = dx * force;
            const fy = dy * force;
            
            if (nodeA !== draggedNode) {
              nodeA.vx += fx;
              nodeA.vy += fy;
            }
            if (nodeB !== draggedNode) {
              nodeB.vx -= fx;
              nodeB.vy -= fy;
            }
          }
        }
      }

      // 2. Link attraction force
      for (const link of graphLinks) {
        const source = link.source;
        const target = link.target;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.hypot(dx, dy) || 1;
        
        // Attraction force
        const force = (dist - linkDistance) * forceStrength * 0.2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (source !== draggedNode) {
          source.vx += fx;
          source.vy += fy;
        }
        if (target !== draggedNode) {
          target.vx -= fx;
          target.vy -= fy;
        }
      }

      // 3. Gravity/Center force and position updates
      const cx = width / 2;
      const cy = height / 2;

      for (const node of graphNodes) {
        if (node === draggedNode) continue;

        // Gravity pulling to center
        node.vx += (cx - node.x) * gravity * forceStrength;
        node.vy += (cy - node.y) * gravity * forceStrength;

        // Apply velocities with friction
        node.vx *= friction;
        node.vy *= friction;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraint
        const radius = node.val || 8;
        if (node.x < radius) { node.x = radius; node.vx = 0; }
        if (node.x > width - radius) { node.x = width - radius; node.vx = 0; }
        if (node.y < radius) { node.y = radius; node.vy = 0; }
        if (node.y > height - radius) { node.y = height - radius; node.vy = 0; }
      }

      // 4. Render frame
      ctx.clearRect(0, 0, width, height);

      // Colors configuration depending on theme
      const isDark = theme === 'dark';
      const lineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
      const arrowColor = isDark ? 'rgba(170, 59, 255, 0.4)' : 'rgba(170, 59, 255, 0.3)';
      const nodeTextHeaderColor = isDark ? '#f3f4f6' : '#08060d';

      // Draw links/edges
      ctx.lineWidth = 1.5;
      for (const link of graphLinks) {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();

        // Draw relationship name at midpoint
        const mx = (link.source.x + link.target.x) / 2;
        const my = (link.source.y + link.target.y) / 2;
        ctx.fillStyle = arrowColor;
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(link.type, mx, my - 4);
      }

      // Draw nodes
      for (const node of graphNodes) {
        const radius = (node.val || 8) + 2;

        // Get colors depending on node type
        let fill = '#aa3bff';
        let stroke = 'rgba(170, 59, 255, 0.4)';
        
        if (node.type === 'project') {
          fill = '#aa3bff'; // look-shan primary purple
          stroke = isDark ? '#c084fc' : '#8a2be2';
        } else if (node.type === 'event') {
          fill = '#10b981'; // emerald
          stroke = 'rgba(16, 185, 129, 0.3)';
        } else if (node.type === 'document') {
          fill = '#3b82f6'; // blue
          stroke = 'rgba(59, 130, 246, 0.3)';
        } else if (node.type === 'task') {
          fill = '#f59e0b'; // amber
          stroke = 'rgba(245, 158, 11, 0.3)';
        } else if (node.type === 'tag') {
          fill = '#6b7280'; // gray
          stroke = 'rgba(107, 114, 128, 0.3)';
        }

        // Draw outer glow/border
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
        ctx.fillStyle = stroke;
        ctx.fill();

        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? '#16171d' : '#ffffff';
        ctx.stroke();

        // Node label
        ctx.fillStyle = nodeTextHeaderColor;
        ctx.font = node.type === 'project' ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + radius + 13);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [nodes, links, theme]);

  return (
    <div className="w-full h-full min-h-[450px] relative overflow-hidden bg-white/40 dark:bg-dark-surface/40 rounded-xl border border-light-border dark:border-dark-border">
      <div className="absolute top-3 left-4 flex gap-4 text-xs font-medium text-gray-500 pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#aa3bff]" />项目</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />日程事件</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />技术文档</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />看板任务</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6b7280]" />标签</span>
      </div>
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
