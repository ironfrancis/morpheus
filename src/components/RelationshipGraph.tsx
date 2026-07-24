import React, { useEffect, useRef, useState } from 'react';
import { Note } from '../utils/markdown';
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Link2, LayoutDashboard, Grid } from 'lucide-react';

interface RelationshipGraphProps {
  notes: Record<string, Note>;
  onSelectNote: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  selectedNoteId?: string | null;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  note: Note;
}

interface Link {
  source: Node;
  target: Node;
}

type GraphLayoutMode = 'force' | 'status-kanban' | 'priority-kanban';

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  notes,
  onSelectNote,
  onUpdateNote,
  selectedNoteId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('force');

  // 双击手动连线状态
  const [linkingSourceNode, setLinkingSourceNode] = useState<Node | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 力导向图状态
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const draggedNodeRef = useRef<Node | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef<boolean>(false);

  // 检测暗黑模式
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // 1. 初始化和增量更新节点与连线
  useEffect(() => {
    const existingNodes = new Map<string, Node>();
    nodesRef.current.forEach(n => existingNodes.set(noteIdToKey(n.id), n));

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // 辅助：获取节点颜色
    const getNodeColor = (note: Note) => {
      const status = note.frontmatter.status || 'todo';
      if (status === 'done') return '#10b981'; // Emerald
      if (status === 'in_progress') return '#6366f1'; // Indigo
      return '#64748b'; // Slate
    };

    // 辅助：标准键
    const noteIdToKey = (id: string) => id.toLowerCase().replace(/\s+/g, '-');

    // 创建或更新节点
    const newNodes: Node[] = Object.values(notes).map(note => {
      const key = noteIdToKey(note.id);
      const existing = existingNodes.get(key);
      const degree = note.links.length + note.backlinks.length;
      const radius = Math.max(6, Math.min(24, 6 + degree * 1.5));

      if (existing) {
        existing.note = note;
        existing.radius = radius;
        existing.color = getNodeColor(note);
        return existing;
      } else {
        return {
          id: note.id,
          label: note.title,
          x: width / 2 + (Math.random() - 0.5) * 200,
          y: height / 2 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0,
          radius,
          color: getNodeColor(note),
          note,
        };
      }
    });

    nodesRef.current = newNodes;

    // 创建连线
    const nodeMap = new Map<string, Node>();
    newNodes.forEach(n => nodeMap.set(noteIdToKey(n.id), n));

    const newLinks: Link[] = [];
    newNodes.forEach(sourceNode => {
      sourceNode.note.links.forEach(targetId => {
        const targetNode = nodeMap.get(noteIdToKey(targetId));
        if (targetNode && sourceNode.id !== targetNode.id) {
          newLinks.push({ source: sourceNode, target: targetNode });
        }
      });
    });

    linksRef.current = newLinks;
  }, [notes]);

  // 2. 物理模拟与分组排列逻辑
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;

      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;
      const centerX = width / 2;
      const centerY = height / 2;

      if (layoutMode === 'force') {
        // --- 力导向模式物理学模拟 ---
        const kRepulsion = 1500; // 节点排斥力系数
        const kAttraction = 0.04; // 连线吸引力系数
        const kGravity = 0.01; // 向心力系数
        const damping = 0.85; // 阻尼系数

        // 计算排斥力（所有节点对之间）
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 300) {
              const force = kRepulsion / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              n1.vx -= fx;
              n1.vy -= fy;
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }

        // 计算吸引力（连线两端节点之间）
        links.forEach(link => {
          const n1 = link.source;
          const n2 = link.target;
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

          const force = kAttraction * dist;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx += fx;
          n1.vy += fy;
          n2.vx -= fx;
          n2.vy -= fy;
        });

        // 计算向心力
        nodes.forEach(node => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * kGravity;
          node.vy += dy * kGravity;
        });

        // 更新位置
        nodes.forEach(node => {
          if (node === draggedNodeRef.current) return;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;

          // 边界限制
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        });
      } else {
        // --- 多维看板分列布局 (status-kanban / priority-kanban) ---
        // 我们将画布划分为若干个垂直的列，节点会受到一个向其目标列中心靠拢的引力，并在列内部作局部的弹簧排斥。
        let columns: string[] = [];
        let getGroupKey: (node: Node) => string = () => '';

        if (layoutMode === 'status-kanban') {
          columns = ['todo', 'in_progress', 'done'];
          getGroupKey = (node) => node.note.frontmatter.status || 'todo';
        } else if (layoutMode === 'priority-kanban') {
          columns = ['high', 'medium', 'low'];
          getGroupKey = (node) => node.note.frontmatter.priority || 'low';
        }

        const colCount = columns.length;
        const colWidth = width / colCount;

        // 给每列内部节点计算向心引力和微弱阻尼，并在同一列节点间应用较强的排斥力，避免重合
        const kColGravityX = 0.08; // X 轴拉向目标列中心的速度
        const kColGravityY = 0.02; // Y 轴拉向中心的高度
        const kRepulsionLocal = 2500;
        const dampingLocal = 0.75;

        // 1. 同列节点之间的排斥力
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          const g1 = getGroupKey(n1);
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const g2 = getGroupKey(n2);

            // 只有当两者在同一列时，才应用排斥力
            if (g1 === g2) {
              const dx = n2.x - n1.x;
              const dy = n2.y - n1.y;
              const distSq = dx * dx + dy * dy + 0.1;
              const dist = Math.sqrt(distSq);

              if (dist < 150) {
                const force = kRepulsionLocal / distSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                n1.vx -= fx;
                n1.vy -= fy;
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. 引力和位置更新
        nodes.forEach(node => {
          if (node === draggedNodeRef.current) return;

          const groupKey = getGroupKey(node);
          let colIndex = columns.indexOf(groupKey);
          if (colIndex === -1) colIndex = colCount - 1; // 兜底最后一列

          // 计算该列的 X 轴中心
          const targetColCenterX = colIndex * colWidth + colWidth / 2;
          const targetColCenterY = centerY;

          // 施加列中心引力
          const dx = targetColCenterX - node.x;
          const dy = targetColCenterY - node.y;

          node.vx += dx * kColGravityX;
          node.vy += dy * kColGravityY;

          // 应用阻尼和位移
          node.vx *= dampingLocal;
          node.vy *= dampingLocal;
          node.x += node.vx;
          node.y += node.vy;

          // 严格限制 X 轴在当前列的边界内，保留少许间挡
          const minColX = colIndex * colWidth + node.radius + 15;
          const maxColX = (colIndex + 1) * colWidth - node.radius - 15;
          node.x = Math.max(minColX, Math.min(maxColX, node.x));
          node.y = Math.max(node.radius + 15, Math.min(height - node.radius - 40, node.y));
        });
      }

      // 渲染画布
      draw();

      animationFrameId = requestAnimationFrame(tick);
    };

    // 3. 绘制函数
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 如果处于分列看板模式，先绘制分列背景线和列标题
      if (layoutMode !== 'force') {
        const columns = layoutMode === 'status-kanban' 
          ? ['Todo', 'In Progress', 'Done'] 
          : ['High Priority', 'Medium Priority', 'Low Priority'];
        const colCount = columns.length;
        const colWidth = width / colCount;

        // 绘制列分割虚线和列背景
        for (let i = 0; i < colCount; i++) {
          const colX = i * colWidth;
          
          // 列底色略微差异
          ctx.fillStyle = isDark 
            ? (i % 2 === 0 ? 'rgba(30, 41, 59, 0.15)' : 'rgba(15, 23, 42, 0.2)')
            : (i % 2 === 0 ? 'rgba(241, 245, 249, 0.3)' : 'rgba(248, 250, 252, 0.4)');
          ctx.fillRect(colX, 0, colWidth, height);

          // 列分割线
          if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(colX, 0);
            ctx.lineTo(colX, height);
            ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]); // 还原
          }

          // 列标题 (固定在顶部，不随 pan/zoom 偏移)
          ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
          ctx.font = 'bold 12px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(columns[i].toUpperCase(), colX + colWidth / 2, 20);
        }
      }

      ctx.save();
      // 应用平移和缩放
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // 辅助：判断节点是否与当前高亮/选中节点关联
      const isRelated = (node: Node) => {
        if (!selectedNoteId && !hoveredNode) return true;
        const activeId = hoveredNode?.id || selectedNoteId;
        if (!activeId) return true;

        if (node.id === activeId) return true;
        
        // 检查是否是一阶关联
        const activeKey = activeId.toLowerCase().replace(/\s+/g, '-');
        const nodeKey = node.id.toLowerCase().replace(/\s+/g, '-');
        return node.note.links.includes(activeKey) || node.note.backlinks.includes(nodeKey);
      };

      // 3.1 绘制连线
      links.forEach(link => {
        const sourceRelated = isRelated(link.source);
        const targetRelated = isRelated(link.target);
        const isActive = (hoveredNode || selectedNoteId) && sourceRelated && targetRelated;

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        if (hoveredNode || selectedNoteId) {
          if (isActive) {
            ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.6)';
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.15)' : 'rgba(226, 232, 240, 0.4)';
            ctx.lineWidth = 0.5;
          }
        } else {
          ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.3)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      });

      // 3.1.5 绘制正在手动连接的虚线
      if (linkingSourceNode) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(linkingSourceNode.x, linkingSourceNode.y);
        ctx.lineTo(mouseWorldPos.x, mouseWorldPos.y);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]); // 虚线效果
        ctx.stroke();
        ctx.restore();
      }

      // 3.2 绘制节点
      nodes.forEach(node => {
        const isSelected = node.id === selectedNoteId;
        const isHovered = hoveredNode && node.id === hoveredNode.id;
        const isLinkingSource = linkingSourceNode && node.id === linkingSourceNode.id;
        const related = isRelated(node);

        const opacity = (hoveredNode || selectedNoteId) ? (related ? 1 : 0.2) : 1;

        ctx.save();
        ctx.globalAlpha = opacity;

        // 绘制发光/选中外圈
        if (isSelected || isHovered || isLinkingSource) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = isSelected 
            ? 'rgba(99, 102, 241, 0.2)' 
            : isLinkingSource
            ? 'rgba(236, 72, 153, 0.2)' // 粉色发光
            : 'rgba(99, 102, 241, 0.1)';
          ctx.fill();
          ctx.strokeStyle = isLinkingSource ? '#ec4899' : '#6366f1';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 绘制节点主体
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // 绘制节点边框
        ctx.strokeStyle = isDark ? '#020617' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 绘制文字标签
        const fontSize = Math.max(10, Math.min(14, 10 + node.radius * 0.2));
        ctx.font = `${isSelected || isHovered ? 'bold' : 'normal'} ${fontSize}px system-ui`;
        ctx.fillStyle = isDark 
          ? (isSelected ? '#a5b4fc' : '#e2e8f0') 
          : (isSelected ? '#4f46e5' : '#334155');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // 节点文字避让，画在节点下方
        ctx.fillText(node.label, node.x, node.y + node.radius + 4);

        ctx.restore();
      });

      ctx.restore();
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [zoom, pan, hoveredNode, selectedNoteId, isDark, linkingSourceNode, mouseWorldPos, layoutMode]);

  // 4. 窗口大小改变时调整 Canvas 分辨率
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 5. 交互事件处理
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, canvasX: 0, canvasY: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // 转换为 Canvas 内部坐标
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // 逆向应用平移和缩放，计算出在物理世界中的坐标
    const worldX = (canvasX - pan.x) / zoom;
    const worldY = (canvasY - pan.y) / zoom;

    return { x: worldX, y: worldY, canvasX, canvasY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, canvasX, canvasY } = getMousePos(e);

    // 检查是否点击了节点
    let clickedNode: Node | null = null;
    for (const nodeItem of nodesRef.current) {
      const dx = nodeItem.x - x;
      const dy = nodeItem.y - y;
      if (dx * dx + dy * dy < (nodeItem.radius + 5) * (nodeItem.radius + 5)) {
        clickedNode = nodeItem;
        break;
      }
    }

    if (clickedNode) {
      // 如果当前正在连线，点击第二个节点完成连线
      if (linkingSourceNode) {
        if (linkingSourceNode.id !== clickedNode.id) {
          // 建立双链关系
          const sourceNote = notes[linkingSourceNode.id];
          if (sourceNote) {
            const updatedContent = sourceNote.content.trim() + `\n\n> **画布手动关联**：[[${clickedNode.id}]]`;
            onUpdateNote(linkingSourceNode.id, {
              content: updatedContent
            });
            alert(`成功在《${sourceNote.title}》中添加了指向《${clickedNode.label}》的双向链接！`);
          }
        }
        setLinkingSourceNode(null);
        return;
      }

      isDraggingRef.current = true;
      draggedNodeRef.current = clickedNode;
      dragStartRef.current = { x: clickedNode.x - x, y: clickedNode.y - y };
    } else {
      // 点击空白处取消连线
      if (linkingSourceNode) {
        setLinkingSourceNode(null);
        return;
      }

      // 否则为平移画布
      isPanningRef.current = true;
      panStartRef.current = { x: canvasX - pan.x, y: canvasY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, canvasX, canvasY } = getMousePos(e);

    // 实时更新鼠标物理世界坐标，用于绘制连线虚线
    setMouseWorldPos({ x, y });

    if (isDraggingRef.current && draggedNodeRef.current) {
      // 拖拽节点
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isPanningRef.current) {
      // 平移画布
      setPan({
        x: canvasX - panStartRef.current.x,
        y: canvasY - panStartRef.current.y,
      });
    } else {
      // 悬停检测
      let foundHovered: Node | null = null;
      for (const node of nodesRef.current) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy < (node.radius + 5) * (node.radius + 5)) {
          foundHovered = node;
          break;
        }
      }
      if (foundHovered !== hoveredNode) {
        setHoveredNode(foundHovered);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current && draggedNodeRef.current) {
      // 如果拖拽位移极小，视为点击事件
      onSelectNote(draggedNodeRef.current.id);
    }

    isDraggingRef.current = false;
    draggedNodeRef.current = null;
    isPanningRef.current = false;
  };

  // 双击节点触发手动连线
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x } = getMousePos(e);

    // 检查是否双击了节点
    let clickedNode: Node | null = null;
    for (const nodeItem of nodesRef.current) {
      const dx = nodeItem.x - x;
      const dy = nodeItem.y - getMousePos(e).y;
      if (dx * dx + dy * dy < (nodeItem.radius + 5) * (nodeItem.radius + 5)) {
        clickedNode = nodeItem;
        break;
      }
    }

    if (clickedNode) {
      setLinkingSourceNode(clickedNode);
    }
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const boundedZoom = Math.max(0.2, Math.min(4, nextZoom));
    
    // 保持鼠标中心点缩放
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    setZoom(boundedZoom);
    setPan({
      x: mouseX - worldX * boundedZoom,
      y: mouseY - worldY * boundedZoom,
    });
  };

  // 缩放控制
  const zoomIn = () => {
    setZoom(z => Math.min(4, z * 1.2));
  };

  const zoomOut = () => {
    setZoom(z => Math.max(0.2, z / 1.2));
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const autoFit = () => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const graphWidth = maxX - minX + 100;
    const graphHeight = maxY - minY + 100;
    const canvasWidth = containerRef.current?.clientWidth || 800;
    const canvasHeight = containerRef.current?.clientHeight || 600;

    const nextZoom = Math.min(canvasWidth / graphWidth, canvasHeight / graphHeight, 1.5);
    const boundedZoom = Math.max(0.4, nextZoom);

    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    setZoom(boundedZoom);
    setPan({
      x: canvasWidth / 2 - graphCenterX * boundedZoom,
      y: canvasHeight / 2 - graphCenterY * boundedZoom,
    });
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden" ref={containerRef}>
      {/* 顶部工具栏 */}
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">关系图谱引擎</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <span>展示 Markdown 笔记的双向链接。支持滚轮缩放、拖拽。</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">
            <Link2 size={10} />
            <span>双击节点手动连线</span>
          </span>
        </p>
      </div>

      {/* 连线提示 */}
      {linkingSourceNode && (
        <div className="absolute top-24 left-6 z-10 bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg animate-pulse">
          正在从《{linkingSourceNode.label}》拉出链接线，请点击另一个目标节点完成双链建立...
        </div>
      )}

      {/* 右上角多维布局切换器 */}
      <div className="absolute top-6 right-6 z-10 flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          onClick={() => setLayoutMode('force')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            layoutMode === 'force'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          title="经典力导向网络布局"
        >
          <Grid size={13} />
          <span>自由网状</span>
        </button>
        <button
          onClick={() => setLayoutMode('status-kanban')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            layoutMode === 'status-kanban'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          title="按 status 属性垂直分列布局，保留连线"
        >
          <LayoutDashboard size={13} />
          <span>状态分列</span>
        </button>
        <button
          onClick={() => setLayoutMode('priority-kanban')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
            layoutMode === 'priority-kanban'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          title="按 priority 属性垂直分列布局，保留连线"
        >
          <LayoutDashboard size={13} />
          <span>优先级分列</span>
        </button>
      </div>

      {/* 右下角悬浮控制按钮 */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <button
          onClick={zoomIn}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="放大"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="缩小"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetZoom}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="重置缩放"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={autoFit}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="自动适配"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Canvas 画布 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="flex-1 cursor-grab active:cursor-grabbing bg-slate-50 dark:bg-slate-950 transition-colors duration-200"
      />
    </div>
  );
};
