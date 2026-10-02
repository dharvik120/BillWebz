'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BentoCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeColor?: 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
}

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export function BentoCard({
  id,
  title,
  subtitle,
  icon: Icon,
  badgeColor = 'blue',
  isCollapsed = false,
  onToggleCollapse,
  children,
}: BentoCardProps) {
  return (
    <div className="border border-border/80 rounded-2xl bg-card shadow-xs transition-all duration-200 hover:shadow-sm overflow-visible">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${colorMap[badgeColor]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground font-normal">
              {subtitle}
            </p>
          </div>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-6 transition-all duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
