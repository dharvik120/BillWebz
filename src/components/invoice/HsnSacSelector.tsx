'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, BookOpen } from 'lucide-react';
import { HsnSacItem, searchHsnSac, HSN_SAC_CATALOGUE } from '../../data/hsnSacCatalogue';

interface HsnSacSelectorProps {
  value: string;
  onChange: (code: string) => void;
  onSelectRate?: (rate: number) => void;
  currentGstPercent?: number;
}

export function HsnSacSelector({ value, onChange, onSelectRate, currentGstPercent }: HsnSacSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'goods' | 'services'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    let items = search ? searchHsnSac(search) : HSN_SAC_CATALOGUE;
    if (activeTab === 'goods') {
      items = items.filter((i) => i.type === 'goods');
    } else if (activeTab === 'services') {
      items = items.filter((i) => i.type === 'services');
    }
    return items.slice(0, 30);
  }, [search, activeTab]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        <input
          type="text"
          placeholder="HSN/SAC"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-border/80 rounded-md text-[12px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 border border-border/80 rounded-md bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Browse HSN / SAC catalogue"
        >
          <BookOpen className="h-3.5 w-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-[320px] max-w-[90vw] bg-popover border border-border rounded-xl shadow-xl z-50 p-2 text-xs">
          {/* Header tabs */}
          <div className="flex items-center justify-between gap-1 mb-2 pb-1 border-b border-border">
            <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">GST Catalogue</span>
            <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('goods')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeTab === 'goods' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                Goods (HSN)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeTab === 'services' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                Services (SAC)
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              placeholder="Search code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-border/80 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-[11px]">
                No matching HSN/SAC found. You can type any custom code directly in the input box!
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.code}
                  onClick={() => {
                    onChange(item.code);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                    value === item.code
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                      : 'hover:bg-secondary/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-foreground">
                    <span className="text-blue-600 dark:text-blue-400">{item.code}</span>
                    <span className="text-[10px] font-sans font-normal text-muted-foreground bg-secondary px-1.5 py-0.2 rounded">
                      {item.type === 'services' ? 'SAC' : 'HSN'} • {item.suggestedGstRate}% GST
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 font-sans leading-tight">
                    {item.description}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Or enter any custom code manually</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
