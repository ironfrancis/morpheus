import React from 'react';
import type { TimelineEvent } from '../types';
import { Calendar, User, ClipboardList, CheckCircle2, Tag } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  // Sort events by date ascending
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto">
      <div className="relative border-l-2 border-primary/20 dark:border-primary/30 ml-4 md:ml-32">
        {sortedEvents.map((evt) => {
          const importanceColors = [
            'bg-rose-500 border-rose-300 dark:border-rose-950 text-rose-500', // P0 - Red
            'bg-orange-500 border-orange-300 dark:border-orange-950 text-orange-500', // P1 - Orange
            'bg-amber-500 border-amber-300 dark:border-amber-950 text-amber-500', // P2 - Yellow
            'bg-primary border-primary-light text-primary', // P3 - Purple
            'bg-sky-500 border-sky-300 dark:border-sky-950 text-sky-500', // P4 - Blue
            'bg-slate-400 border-slate-200 dark:border-slate-800 text-slate-400' // P5 - Gray
          ];
          
          const iconColor = importanceColors[evt.importance] || importanceColors[3];
          const hasSubtasks = evt.subtasks && evt.subtasks.length > 0;
          const completedSubtasks = evt.subtasks?.filter(s => s.completed).length || 0;
          const totalSubtasks = evt.subtasks?.length || 0;
          const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

          return (
            <div key={evt.id} className="mb-10 relative pl-6 md:pl-8 group">
              {/* Date Column on left for md screen size */}
              <div className="hidden md:flex absolute -left-36 top-1.5 w-28 text-right flex-col">
                <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{evt.date}</span>
                <span className="text-xs text-gray-400 font-mono capitalize">{evt.typeSlug}</span>
              </div>

              {/* Central dot timeline indicator */}
              <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${iconColor} bg-white dark:bg-dark-bg z-10 transition-transform duration-300 group-hover:scale-125`} />

              {/* Event card content */}
              <div className="bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md rounded-xl p-5 shadow-sm border border-light-border dark:border-dark-border hover:shadow-md transition-shadow">
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col">
                    {/* Small mobile date */}
                    <div className="flex md:hidden items-center gap-2 text-xs font-mono text-gray-400 mb-1">
                      <Calendar size={12} />
                      <span>{evt.date}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-surface rounded capitalize">{evt.typeSlug}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {evt.title}
                      {evt.importance <= 1 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                          P{evt.importance}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {evt.assignee && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-light-surface dark:bg-dark-surface rounded-full">
                        <User size={10} />
                        {evt.assignee}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body / Summary */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-line leading-relaxed">
                  {evt.summary}
                </p>

                {/* Subtasks checklist rendering */}
                {hasSubtasks && (
                  <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <ClipboardList size={12} />
                        子任务清单 ({completedSubtasks}/{totalSubtasks})
                      </span>
                      <span className="text-[10px] font-mono font-bold text-primary">{progressPercent}%</span>
                    </div>

                    {/* Simple progress bar */}
                    <div className="w-full bg-gray-100 dark:bg-dark-surface h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evt.subtasks?.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 size={13} className={sub.completed ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                          <span className={`truncate ${sub.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags on bottom */}
                {evt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                    {evt.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-0.5 text-[10px] text-primary bg-primary-light dark:bg-primary/20 px-2 py-0.5 rounded-md font-medium">
                        <Tag size={8} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
