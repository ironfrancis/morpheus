import React from 'react';
import type { BoardCard } from '../types';
import { Kanban, Tag, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoardViewProps {
  cards: BoardCard[];
  onCardStatusChange?: (cardId: string, nextStatus: BoardCard['status']) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ cards, onCardStatusChange }) => {
  const columns: { id: BoardCard['status']; label: string; color: string; countColor: string }[] = [
    { id: 'backlog', label: '待规划 (Backlog)', color: 'border-t-gray-400 bg-gray-50/50 dark:bg-gray-900/10', countColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    { id: 'todo', label: '待开始 (Todo)', color: 'border-t-blue-500 bg-blue-50/10 dark:bg-blue-900/5', countColor: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { id: 'in_progress', label: '进行中 (In Progress)', color: 'border-t-amber-500 bg-amber-50/15 dark:bg-amber-900/5', countColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    { id: 'completed', label: '已完成 (Completed)', color: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/5', countColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  ];

  // Helper to trigger success celebrate confetti
  const triggerCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#aa3bff', '#10b981', '#3b82f6', '#ff007f']
    });
  };

  const getPriorityBadge = (priority: BoardCard['priority']) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      normal: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      high: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold animate-pulse'
    };
    return badges[priority] || badges.normal;
  };

  const handleCardCompleteLocal = (cardId: string) => {
    if (onCardStatusChange) {
      onCardStatusChange(cardId, 'completed');
      triggerCelebrate();
    }
  };

  return (
    <div className="py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {columns.map(col => {
          const colCards = cards.filter(c => c.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`rounded-xl border border-light-border dark:border-dark-border border-t-4 ${col.color} p-4 flex flex-col h-full min-h-[500px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <Kanban size={14} className="text-gray-500" />
                  {col.label}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${col.countColor}`}>
                  {colCards.length}
                </span>
              </div>

              {/* Cards list container */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[550px] pr-1">
                {colCards.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-light-border dark:border-dark-border rounded-lg bg-white/20 dark:bg-dark-surface/10">
                    空空如也
                  </div>
                ) : (
                  colCards.map(card => (
                    <div 
                      key={card.id}
                      className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-light-border dark:border-dark-border hover:shadow hover:border-primary/20 dark:hover:border-primary/30 transition-all group relative overflow-hidden"
                    >
                      {/* Priority and checkbox */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${getPriorityBadge(card.priority)}`}>
                          {card.priority}
                        </span>
                        
                        {card.status !== 'completed' && onCardStatusChange && (
                          <button 
                            onClick={() => handleCardCompleteLocal(card.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-md"
                            title="标记为已完成"
                          >
                            <CheckSquare size={13} />
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`font-semibold text-sm mb-1 leading-snug group-hover:text-primary dark:group-hover:text-primary transition-colors ${card.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                        {card.title}
                      </h4>

                      {/* Summary */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-3">
                        {card.summary}
                      </p>

                      {/* Footer: User / Actions / Tags */}
                      <div className="flex flex-wrap gap-1 mt-2 pt-2.5 border-t border-light-border dark:border-dark-border justify-between items-center text-[10px] text-gray-400">
                        <span>{card.assignee || '未指派'}</span>
                        
                        {card.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {card.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-surface/80 rounded text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status Transition buttons for demo/interaction */}
                      {onCardStatusChange && (
                        <div className="mt-3 pt-2 border-t border-dotted border-light-border dark:border-dark-border flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {card.status === 'backlog' && (
                            <button 
                              onClick={() => onCardStatusChange(card.id, 'todo')}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[9px] rounded hover:bg-blue-100"
                            >
                              激活
                            </button>
                          )}
                          {card.status === 'todo' && (
                            <button 
                              onClick={() => onCardStatusChange(card.id, 'in_progress')}
                              className="px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[9px] rounded hover:bg-amber-100"
                            >
                              开始
                            </button>
                          )}
                          {card.status === 'in_progress' && (
                            <button 
                              onClick={() => onCardStatusChange(card.id, 'completed')}
                              className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] rounded hover:bg-emerald-100"
                            >
                              完成 🎉
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
