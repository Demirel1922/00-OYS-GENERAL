// ============================================
// SORTABLE TABLE - Reusable sıralama hook ve header
// ============================================
import { useState, useCallback, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortDir = 'asc' | 'desc';

export function useSort<T>(defaultField: string = '', defaultDir: SortDir = 'asc') {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const sortFn = useCallback((list: T[], getVal: (item: T, field: string) => string | number) => {
    if (!sortField) return list;
    return [...list].sort((a, b) => {
      const va = getVal(a, sortField);
      const vb = getVal(b, sortField);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), 'tr');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortField, sortDir]);

  return { sortField, sortDir, toggleSort, sortFn };
}

export function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30 inline" />;
  return sortDir === 'asc' 
    ? <ArrowUp className="w-3 h-3 ml-1 inline" /> 
    : <ArrowDown className="w-3 h-3 ml-1 inline" />;
}
