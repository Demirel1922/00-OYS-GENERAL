import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Artikel } from '@/types';

interface ArtikelComboboxProps {
  artikeller: Artikel[];
  value: string; // artikel_no (ormeciArtikelNo)
  onSelect: (artikel: Artikel | null) => void;
  disabled?: boolean;
}

export function ArtikelCombobox({ artikeller, value, onSelect, disabled }: ArtikelComboboxProps) {
  const [open, setOpen] = useState(false);

  // Sadece aktif artikelleri göster
  const aktifArtikeller = artikeller.filter(a => a.durum === 'AKTIF');

  const selectedArtikel = value
    ? aktifArtikeller.find(a => (a.ormeciArtikelNo || '') === value) || null
    : null;

  return (
    <div className="flex gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-9 text-sm"
            disabled={disabled}
          >
            {selectedArtikel
              ? (selectedArtikel.ormeciArtikelNo || selectedArtikel.numuneNo || '-')
              : 'Artikel seçin...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[340px] w-[--radix-popover-trigger-width] p-0 z-[99]" align="start" sideOffset={4}>
          <Command
            filter={(value, search) => {
              const artikel = aktifArtikeller.find(a => a.id === value);
              if (!artikel) return 0;
              const searchLower = search.toLowerCase();
              const searchable = [
                artikel.ormeciArtikelNo || '',
                artikel.musteriArtikelNo || '',
                artikel.urunTanimi || '',
                artikel.musteriKodu || '',
                artikel.numuneNo || '',
              ].join(' ').toLowerCase();
              return searchable.includes(searchLower) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Artikel ara..." className="h-9" />
            <CommandList className="max-h-[220px]">
              <CommandEmpty>Artikel bulunamadı.</CommandEmpty>
              <CommandGroup>
                {aktifArtikeller.map((artikel) => (
                  <CommandItem
                    key={artikel.id}
                    value={artikel.id}
                    onSelect={() => {
                      onSelect(artikel);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === (artikel.ormeciArtikelNo || '') ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-sm whitespace-nowrap">{artikel.ormeciArtikelNo || artikel.numuneNo || '-'}</span>
                        <span className="text-xs text-gray-500 truncate">{artikel.urunTanimi || '-'}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400 truncate">
                        {artikel.corapGrubu && <span>{artikel.corapGrubu}</span>}
                        {artikel.corapTipi && <span>• {artikel.corapTipi}</span>}
                        {artikel.musteriKodu && <span>• Müş: {artikel.musteriKodu}</span>}
                        {artikel.musteriArtikelNo && <span>• {artikel.musteriArtikelNo}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onSelect(null)}
          title="Artikel seçimini temizle"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
