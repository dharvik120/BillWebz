'use client';

import React from 'react';
import { Trash2, Copy, Plus, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { LineItem } from '../../types/invoice';

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
        <button
          type="button"
          onClick={addItem}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Add Product Item
        </button>
      </div>

      <div className="overflow-x-auto border border-border/60 rounded-xl">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-secondary/40 border-b border-border/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
              <th className="px-2 py-3 w-[40px]"></th>
              <th className="px-3 py-3 w-[340px]">Item Details</th>
              {showTax && <th className="px-3 py-3 w-[120px]">HSN/SAC</th>}
              <th className="px-3 py-3 w-[90px]">Qty</th>
              <th className="px-3 py-3 w-[100px]">Unit</th>
              <th className="px-3 py-3 w-[130px]">Rate ({currencySymbol})</th>
              <th className="px-3 py-3 w-[90px]">Discount %</th>
              {showTax && <th className="px-3 py-3 w-[110px]">GST %</th>}
              <th className="px-3 py-3 w-[130px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={showTax ? 9 : 7} className="py-10 text-center text-muted-foreground font-medium bg-card">
                  No items added. Click &quot;Add Product Item&quot; to begin.
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
                  className="border-b border-border/30 bg-card hover:bg-muted/5 transition-colors align-top"
                >
                  {/* Drag Handle */}
                  <td className="px-2 py-4 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                    <GripVertical className="h-4 w-4 mx-auto" />
                  </td>

                  {/* Item name and description */}
                  <td className="px-3 py-3 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Item Name (Required)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                    <textarea
                      placeholder="Item Description (Optional)"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                    />
                  </td>

                  {/* HSN/SAC */}
                  {showTax && (
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        placeholder="HSN/SAC"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                        className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </td>
                  )}

                  {/* Quantity */}
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      min="0"
                      step="any"
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </td>

                  {/* Unit */}
                  <td className="px-3 py-3">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    </select>
                  </td>

                  {/* Rate */}
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      min="0"
                      step="any"
                      onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </td>

                  {/* Discount */}
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      placeholder="%"
                      value={item.discountPercent}
                      min="0"
                      max="100"
                      onChange={(e) => handleItemChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* GST */}
                  {showTax && (
                    <td className="px-3 py-3">
                      <select
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 border border-border/80 rounded-md text-[13px] bg-background focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      >
                        <option value="0">0% GST</option>
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
