'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  Layers, 
  Table as TableIcon,
  Percent,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { LineItem } from '../../types/invoice';
import { HsnSacSelector } from './HsnSacSelector';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

function NumberInput({ value, onChange, placeholder = '0', className, max }: NumberInputProps) {
  const safeNum = typeof value === 'number' && !isNaN(value) ? value : (Number(value) || 0);
  const [displayValue, setDisplayValue] = useState<string>(safeNum === 0 ? '' : String(safeNum));

  React.useEffect(() => {
    const num = parseFloat(displayValue) || 0;
    const currentSafe = typeof value === 'number' && !isNaN(value) ? value : (Number(value) || 0);
    if (num !== currentSafe) {
      setDisplayValue(currentSafe === 0 ? '' : String(currentSafe));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    if (raw === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    if (!/^\d*\.?\d*$/.test(raw)) return;

    if (/^0\d+/.test(raw)) {
      raw = raw.replace(/^0+/, '');
      if (raw === '') raw = '0';
    }

    setDisplayValue(raw);
    let parsed = parseFloat(raw) || 0;
    if (max !== undefined && parsed > max) {
      parsed = max;
      setDisplayValue(String(max));
    }
    onChange(parsed);
  };

  const handleBlur = () => {
    if (displayValue === '' || displayValue === '.') {
      setDisplayValue('');
      onChange(0);
    } else {
      const parsed = parseFloat(displayValue) || 0;
      setDisplayValue(parsed === 0 ? '' : String(parsed));
      onChange(parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => e.target.select()}
      className={className}
    />
  );
}

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currencySymbol: string;
  showTax?: boolean;
}

export function LineItemsTable({ items, onChange, currencySymbol, showTax = true }: LineItemsTableProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...safeItems];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      onChange(updated);
    }
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      description: '',
      hsnSac: '',
      quantity: 1,
      unit: 'Pcs',
      rate: 0,
      isTaxInclusive: false,
      discountPercent: 0,
      discountAmount: 0,
      gstPercent: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cessPercent: 0,
      cessAmount: 0,
      taxableValue: 0,
      finalAmount: 0
    };
    onChange([...safeItems, newItem]);
  };

  const duplicateItem = (index: number) => {
    if (!safeItems[index]) return;
    const itemToClone = safeItems[index];
    const clonedItem: LineItem = {
      ...itemToClone,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [...safeItems];
    updated.splice(index + 1, 0, clonedItem);
    onChange(updated);
  };

  const deleteItem = (index: number) => {
    const updated = safeItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0 || !safeItems[index] || !safeItems[index - 1]) return;
    const updated = [...safeItems];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index >= safeItems.length - 1 || !safeItems[index] || !safeItems[index + 1]) return;
    const updated = [...safeItems];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
  };

  // Helper calculations for visual breakdown
  const getItemBreakdown = (item: LineItem) => {
    const qty = Number(item?.quantity) || 0;
    const rate = Number(item?.rate) || 0;
    const disc = Number(item?.discountPercent) || 0;
    const gstRate = showTax ? (Number(item?.gstPercent) || 0) : 0;
    const cessRate = showTax ? (Number(item?.cessPercent) || 0) : 0;
    const totalTaxPercent = gstRate + cessRate;

    let baseRate = rate;
    let taxable = 0;
    let taxAmount = 0;
    let finalAmount = 0;

    if (item?.isTaxInclusive) {
      baseRate = totalTaxPercent > 0 ? rate / (1 + totalTaxPercent / 100) : rate;
      const discountedBase = baseRate * (1 - disc / 100);
      taxable = discountedBase * qty;
      const discountedGross = rate * (1 - disc / 100);
      finalAmount = discountedGross * qty;
      taxAmount = finalAmount - taxable;
    } else {
      const discountedRate = rate * (1 - disc / 100);
      taxable = discountedRate * qty;
      taxAmount = taxable * (totalTaxPercent / 100);
      finalAmount = taxable + taxAmount;
    }

    return {
      baseRate: isNaN(baseRate) ? 0 : baseRate,
      taxable: isNaN(taxable) ? 0 : taxable,
      taxAmount: isNaN(taxAmount) ? 0 : taxAmount,
      finalAmount: isNaN(finalAmount) ? 0 : finalAmount
    };
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Actions & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Line Items & Pricing</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add products, services, quantities, rates, discounts and taxes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* GST Inclusivity Bulk Action */}
          {showTax && safeItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const anyUnchecked = safeItems.some((i) => !i.isTaxInclusive);
                const updated = safeItems.map((item) => ({
                  ...item,
                  isTaxInclusive: anyUnchecked,
                }));
                onChange(updated);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                safeItems.every((i) => i.isTaxInclusive)
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-800 shadow-2xs'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground border-border/70'
              }`}
              title="Toggle all items to include GST in rates"
            >
              <span>{safeItems.every((i) => i.isTaxInclusive) ? '✓ All Rates With GST' : 'Make All With GST'}</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Spacious Form Card View (Recommended)"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Form Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Compact Spreadsheet Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {safeItems.length === 0 && (
        <div className="p-8 sm:p-12 border-2 border-dashed border-border/80 rounded-2xl text-center bg-card flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">No Line Items Added</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Add your billable items, products or services with rates and taxes.
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Product Item</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODE 1: SPACIOUS CARD FORM LAYOUT (Identical to Document Info) */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'cards' && safeItems.length > 0 && (
        <div className="space-y-4">
          {safeItems.map((item, idx) => {
            const { baseRate, taxable, taxAmount, finalAmount } = getItemBreakdown(item);

            return (
              <div
                key={item.id}
                className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 relative hover:border-blue-500/40 transition-colors"
              >
                {/* Card Header Toolbar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900">
                      Item #{idx + 1}
                    </span>
                    <span className="font-semibold text-xs text-foreground/80 line-clamp-1">
                      {item.name || 'Untitled Product / Service'}
                    </span>
                  </div>

                  {/* Actions: Move Up, Move Down, Duplicate, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-30 text-foreground transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === safeItems.length - 1}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-30 text-foreground transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateItem(idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-900 transition-colors cursor-pointer"
                      title="Duplicate this item"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields Grid - Matched to GstMetadataSection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Field 1: Product Name */}
                  <div className={showTax ? 'sm:col-span-2 lg:col-span-2' : 'sm:col-span-2 lg:col-span-3'}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Product / Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Website Development, Consulting, or Product Model"
                      value={item.name || ''}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Field 2: HSN/SAC Code */}
                  {showTax && (
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        HSN / SAC Code
                      </label>
                      <HsnSacSelector
                        value={item.hsnSac || ''}
                        onChange={(code) => handleItemChange(idx, 'hsnSac', code)}
                        currentGstPercent={item.gstPercent}
                        inputClassName="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Field 3: Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <NumberInput
                      value={item.quantity}
                      onChange={(val) => handleItemChange(idx, 'quantity', val)}
                      placeholder="1"
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-center"
                    />
                  </div>

                  {/* Field 4: Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Unit
                    </label>
                    <select
                      value={item.unit || 'Pcs'}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="Nos">Nos (Numbers)</option>
                      <option value="Kgs">Kgs (Kilograms)</option>
                      <option value="Box">Box (Boxes)</option>
                      <option value="Hrs">Hrs (Hours)</option>
                      <option value="Days">Days</option>
                      <option value="Ltr">Ltr (Litres)</option>
                      <option value="Mtr">Mtr (Metres)</option>
                      <option value="Service">Service</option>
                      <option value="Set">Set</option>
                      <option value="Unit">Unit</option>
                      <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                      <option value="Ton">Ton (Metric Ton)</option>
                      <option value="Pack">Pack</option>
                    </select>
                  </div>

                  {/* Field 5: Rate */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Rate ({currencySymbol}) <span className="text-red-500">*</span>
                    </label>
                    <NumberInput
                      value={item.rate}
                      onChange={(val) => handleItemChange(idx, 'rate', val)}
                      placeholder="0"
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                    />
                  </div>

                  {/* Field 6: Discount % */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Discount %
                    </label>
                    <NumberInput
                      value={item.discountPercent}
                      onChange={(val) => handleItemChange(idx, 'discountPercent', val)}
                      placeholder="0"
                      max={100}
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-center"
                    />
                  </div>

                  {/* Field 7: GST % */}
                  {showTax && (
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        GST Tax Rate %
                      </label>
                      <select
                        value={item.gstPercent ?? 18}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', parseInt(e.target.value, 10) || 0)}
                        className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="0">0% (Nil / Exempt)</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Standard)</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>
                  )}

                  {/* Tax Inclusivity Checkbox */}
                  {showTax && (
                    <div className="sm:col-span-2 lg:col-span-2 flex items-center pt-2">
                      <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 hover:border-blue-500/40 bg-secondary/30 hover:bg-secondary/50 cursor-pointer select-none transition-all w-full">
                        <input
                          type="checkbox"
                          checked={!!item.isTaxInclusive}
                          onChange={(e) => handleItemChange(idx, 'isTaxInclusive', e.target.checked)}
                          className="rounded border-border h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className={`text-xs font-bold ${item.isTaxInclusive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                            Rate Includes GST (Tax-inclusive)
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {item.isTaxInclusive
                              ? `Base: ${currencySymbol}${baseRate.toFixed(2)} | GST (${item.gstPercent || 0}%): ${currencySymbol}${((Number(item?.rate) || 0) - baseRate).toFixed(2)}`
                              : `Base price is ${currencySymbol}${(Number(item?.rate) || 0).toFixed(2)} + ${item.gstPercent || 0}% GST`}
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Card Subtotal Summary Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 bg-secondary/20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-4 sm:px-5 py-3 rounded-b-2xl">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Taxable Value: <strong className="text-foreground">{currencySymbol}{taxable.toFixed(2)}</strong>
                    </span>
                    {showTax && (
                      <span>
                        Tax ({item.gstPercent}%): <strong className="text-foreground">{currencySymbol}{taxAmount.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Line Total:</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      {currencySymbol}{finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Prominent Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="w-full py-4 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border-2 border-dashed border-blue-300/80 dark:border-blue-800/80 hover:border-blue-500 rounded-2xl text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Another Product Item</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODE 2: COMPACT SPREADSHEET TABLE VIEW */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && items.length > 0 && (
        <div className="overflow-x-auto border border-border/60 rounded-2xl shadow-xs">
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/60 text-muted-foreground font-bold uppercase text-[11px] tracking-wider">
                <th className="px-2 py-3.5 w-[50px] text-center">No.</th>
                <th className="px-3.5 py-3.5 min-w-[280px]">Item Name</th>
                {showTax && <th className="px-3.5 py-3.5 w-[160px] min-w-[160px]">HSN/SAC</th>}
                <th className="px-3.5 py-3.5 w-[100px] min-w-[100px]">Qty</th>
                <th className="px-3.5 py-3.5 w-[140px] min-w-[140px]">Unit</th>
                <th className="px-3.5 py-3.5 w-[180px] min-w-[180px]">Rate ({currencySymbol})</th>
                <th className="px-3.5 py-3.5 w-[110px] min-w-[110px]">Discount %</th>
                {showTax && <th className="px-3.5 py-3.5 w-[140px] min-w-[140px]">GST %</th>}
                <th className="px-3.5 py-3.5 w-[140px] min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-border/30 bg-card hover:bg-secondary/30 transition-colors align-top"
                >
                  <td className="px-2 py-3 text-center text-muted-foreground font-bold text-xs pt-4">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      placeholder="Item Name (Required)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full h-10 px-3.5 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold shadow-xs"
                    />
                  </td>
                  {showTax && (
                    <td className="px-3 py-3">
                      <HsnSacSelector
                        value={item.hsnSac || ''}
                        onChange={(code) => handleItemChange(idx, 'hsnSac', code)}
                        currentGstPercent={item.gstPercent}
                      />
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.quantity}
                      onChange={(val) => handleItemChange(idx, 'quantity', val)}
                      placeholder="1"
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold shadow-xs text-center"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold cursor-pointer shadow-xs"
                    >
                      <option value="Pcs">Pcs</option>
                      <option value="Nos">Nos</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Box">Box</option>
                      <option value="Hrs">Hrs</option>
                      <option value="Days">Days</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Mtr">Mtr</option>
                      <option value="Service">Service</option>
                      <option value="Set">Set</option>
                      <option value="Unit">Unit</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.rate}
                      onChange={(val) => handleItemChange(idx, 'rate', val)}
                      placeholder="0"
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold shadow-xs"
                    />
                    {showTax && (
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] mt-1.5 text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={!!item.isTaxInclusive}
                          onChange={(e) => handleItemChange(idx, 'isTaxInclusive', e.target.checked)}
                          className="rounded border-border h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={item.isTaxInclusive ? "font-bold text-blue-600 dark:text-blue-400" : ""}>
                          With GST
                        </span>
                      </label>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.discountPercent}
                      onChange={(val) => handleItemChange(idx, 'discountPercent', val)}
                      placeholder="0"
                      max={100}
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold shadow-xs text-center"
                    />
                  </td>
                  {showTax && (
                    <td className="px-3 py-3">
                      <select
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', parseInt(e.target.value, 10) || 0)}
                        className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold cursor-pointer shadow-xs"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                  )}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(idx)}
                        disabled={idx === safeItems.length - 1}
                        className="p-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateItem(idx)}
                        className="p-1 rounded text-indigo-600 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 transition-colors"
                        title="Duplicate Row"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(idx)}
                        className="p-1 rounded text-red-600 bg-red-50 dark:bg-red-950 hover:bg-red-100 transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LineItemsTable;
