'use client';

import React from 'react';
import { Trash2, Copy, Plus, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
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
  const [displayValue, setDisplayValue] = React.useState<string>(value === 0 ? '' : String(value));

  React.useEffect(() => {
    const num = parseFloat(displayValue) || 0;
    if (num !== value) {
      setDisplayValue(value === 0 ? '' : String(value));
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
  
  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
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
      gstPercent: 18, // default 18% GST standard
      cgst: 0,
      sgst: 0,
      igst: 0,
      cessPercent: 0,
      cessAmount: 0,
      taxableValue: 0,
      finalAmount: 0
    };
    onChange([...items, newItem]);
  };

  const duplicateItem = (index: number) => {
    const itemToClone = items[index];
    const clonedItem: LineItem = {
      ...itemToClone,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [...items];
    updated.splice(index + 1, 0, clonedItem);
    onChange(updated);
  };

  const deleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
  };

  // Drag and drop HTML5 reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...items];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm text-foreground/80 uppercase tracking-wider">Product Line Items</h3>
        <div className="flex items-center gap-2">
          {showTax && items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const anyUnchecked = items.some((i) => !i.isTaxInclusive);
                const updated = items.map((item) => ({
                  ...item,
                  isTaxInclusive: anyUnchecked,
                }));
                onChange(updated);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                items.every((i) => i.isTaxInclusive)
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground border-border/60'
              }`}
              title="Toggle all items to include GST in their rates"
            >
              <span>{items.every((i) => i.isTaxInclusive) ? '✓ All Rates With GST' : 'Make All With GST'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={addItem}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Add Product Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border/60 rounded-2xl shadow-xs">
        <table className="w-full text-left text-xs border-collapse min-w-[1180px]">
          <thead>
            <tr className="bg-secondary/50 border-b border-border/60 text-muted-foreground font-bold uppercase text-[11px] tracking-wider">
              <th className="px-2 py-3.5 w-[40px]"></th>
              <th className="px-2 py-3.5 w-[50px] text-center">No.</th>
              <th className="px-3.5 py-3.5 min-w-[280px]">Item Name</th>
              {showTax && <th className="px-3.5 py-3.5 w-[160px] min-w-[160px]">HSN/SAC</th>}
              <th className="px-3.5 py-3.5 w-[100px] min-w-[100px]">Qty</th>
              <th className="px-3.5 py-3.5 w-[145px] min-w-[145px]">Unit</th>
              <th className="px-3.5 py-3.5 w-[180px] min-w-[180px]">Rate ({currencySymbol})</th>
              <th className="px-3.5 py-3.5 w-[110px] min-w-[110px]">Discount %</th>
              {showTax && <th className="px-3.5 py-3.5 w-[150px] min-w-[150px]">GST %</th>}
              <th className="px-3.5 py-3.5 w-[140px] min-w-[140px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={showTax ? 10 : 8} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No items added yet. Click &quot;+ Add Product Item&quot; to begin creating your invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  className="border-b border-border/30 bg-card hover:bg-secondary/30 transition-colors align-top"
                >
                  {/* Drag Handle */}
                  <td className="px-2 py-3 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                    <GripVertical className="h-4 w-4 mx-auto mt-2.5" />
                  </td>

                  {/* Serial Number */}
                  <td className="px-2 py-3 text-center text-muted-foreground font-bold text-xs pt-4">
                    {idx + 1}
                  </td>

                  {/* Item Name */}
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      placeholder="Item Name (Required)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full h-10 px-3.5 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold shadow-xs"
                    />
                  </td>

                  {/* HSN/SAC with Catalogue Selector */}
                  {showTax && (
                    <td className="px-3 py-3">
                      <HsnSacSelector
                        value={item.hsnSac || ''}
                        onChange={(code) => handleItemChange(idx, 'hsnSac', code)}
                        currentGstPercent={item.gstPercent}
                      />
                    </td>
                  )}

                  {/* Quantity */}
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.quantity}
                      onChange={(val) => handleItemChange(idx, 'quantity', val)}
                      placeholder="1"
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold shadow-xs text-center"
                    />
                  </td>

                  {/* Unit */}
                  <td className="px-3 py-3">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold cursor-pointer shadow-xs"
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
                    </select>
                  </td>

                  {/* Rate */}
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.rate}
                      onChange={(val) => handleItemChange(idx, 'rate', val)}
                      placeholder="0"
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold shadow-xs"
                    />
                    {showTax && (
                      <div className="mt-1.5 space-y-1">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={!!item.isTaxInclusive}
                            onChange={(e) => handleItemChange(idx, 'isTaxInclusive', e.target.checked)}
                            className="rounded border-border h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={item.isTaxInclusive ? "font-bold text-blue-600 dark:text-blue-400" : "text-muted-foreground"}>
                            With GST (Incl.)
                          </span>
                        </label>
                        {item.isTaxInclusive && item.rate > 0 && item.gstPercent > 0 && (
                          <div className="text-[10px] text-muted-foreground font-mono bg-blue-50/60 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                            <div>Base: {currencySymbol}{(item.rate / (1 + (item.gstPercent + (item.cessPercent || 0)) / 100)).toFixed(2)}</div>
                            <div className="text-blue-600 dark:text-blue-400 font-bold">GST: {currencySymbol}{(item.rate - (item.rate / (1 + (item.gstPercent + (item.cessPercent || 0)) / 100))).toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-3 py-3">
                    <NumberInput
                      value={item.discountPercent}
                      onChange={(val) => handleItemChange(idx, 'discountPercent', val)}
                      placeholder="0"
                      max={100}
                      className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold shadow-xs text-center"
                    />
                  </td>

                  {/* GST */}
                  {showTax && (
                    <td className="px-3 py-3">
                      <select
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', parseInt(e.target.value, 10) || 0)}
                        className="w-full h-10 px-3 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold cursor-pointer shadow-xs"
                      >
                        <option value="0">0% (Nil)</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST</option>
                        <option value="28">28% GST</option>
                      </select>
                    </td>
                  )}

                  {/* Actions column */}
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
                        disabled={idx === items.length - 1}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LineItemsTable;
