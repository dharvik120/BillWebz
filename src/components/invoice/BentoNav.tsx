'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BentoNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
  tabs: NavTabItem[];
}

const activeBgMap = {
  blue: 'bg-blue-600 text-white shadow-xs',
  emerald: 'bg-emerald-600 text-white shadow-xs',
  indigo: 'bg-indigo-600 text-white shadow-xs',
};

export function BentoNav({
  activeSection,
  onSelectSection,
  accentColor = 'blue',
  tabs,
}: BentoNavProps) {
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-2 shadow-xs sticky top-16 z-20">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all duration-150 text-xs font-bold cursor-pointer ${
                isActive
                  ? activeBgMap[accentColor]
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
