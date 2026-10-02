'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, MapPin } from 'lucide-react';

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

interface StateSelectorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function StateSelector({
  value,
  onChange,
  placeholder = 'Select or type state...',
  className = '',
  id
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

  const filteredStates = useMemo(() => {
    if (!searchTerm.trim()) return INDIAN_STATES;
    const term = searchTerm.toLowerCase();
    return INDIAN_STATES.filter((s) => s.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} pr-9`}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
          title="Open State dropdown menu"
          aria-expanded={isOpen}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[240px] max-w-[340px] bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl z-[80] p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Indian State / UT..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            {filteredStates.length === 0 ? (
              <div className="py-3 text-center text-muted-foreground text-[11px]">
                No predefined state found. You can type any custom state name directly!
              </div>
            ) : (
              filteredStates.map((state) => {
                const isSelected = (value || '').trim().toLowerCase() === state.toLowerCase();
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => {
                      onChange(state);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                      <span>{state}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>Or keep typing manually</span>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-red-500 hover:underline font-semibold"
              >
                Clear State
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
