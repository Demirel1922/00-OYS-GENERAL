// ============================================
// LOOKUP STORE - Zustand
// ============================================
// Bedenler, Tipler, Cinsiyetler için ortak store
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LookupItem, LookupItemFormData, LookupType } from '@/types';

interface LookupState {
  items: LookupItem[];
  
  // Actions
  addItem: (data: LookupItemFormData) => { success: boolean; error?: string };
  updateItem: (id: string, data: Partial<LookupItemFormData>) => { success: boolean; error?: string };
  deleteItem: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getItemById: (id: string) => LookupItem | undefined;
  getItemsByType: (type: LookupType) => LookupItem[];
  getSortedItemsByType: (type: LookupType) => LookupItem[];
  checkKodExists: (kod: string, excludeId?: string) => boolean;
  checkAdExists: (ad: string, excludeId?: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const getCurrentTimestamp = () => new Date().toISOString();

// Varsayılan lookup verileri (seed data)
const defaultItems: LookupItem[] = [
  // --- BEDENLER ---
  { id: 'b1', lookupType: 'BEDEN', kod: 'BEDEN_35_38', ad: '35-38', sira: 1, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b2', lookupType: 'BEDEN', kod: 'BEDEN_39_42', ad: '39-42', sira: 2, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b3', lookupType: 'BEDEN', kod: 'BEDEN_43_46', ad: '43-46', sira: 3, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b4', lookupType: 'BEDEN', kod: 'BEDEN_47_50', ad: '47-50', sira: 4, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b5', lookupType: 'BEDEN', kod: 'BEDEN_0_6', ad: '0-6 Ay', sira: 5, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b6', lookupType: 'BEDEN', kod: 'BEDEN_6_12', ad: '6-12 Ay', sira: 6, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b7', lookupType: 'BEDEN', kod: 'BEDEN_12_18', ad: '12-18 Ay', sira: 7, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'b8', lookupType: 'BEDEN', kod: 'BEDEN_18_24', ad: '18-24 Ay', sira: 8, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // --- TİPLER ---
  { id: 't1', lookupType: 'TIP', kod: 'TIP_PATIK', ad: 'Patik Çorap', sira: 1, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't2', lookupType: 'TIP', kod: 'TIP_KISA', ad: 'Kısa Çorap', sira: 2, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't3', lookupType: 'TIP', kod: 'TIP_ORTA', ad: 'Orta Boy Çorap', sira: 3, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't4', lookupType: 'TIP', kod: 'TIP_DIZ', ad: 'Diz Altı Çorap', sira: 4, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't5', lookupType: 'TIP', kod: 'TIP_DIZUSTU', ad: 'Diz Üstü Çorap', sira: 5, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't6', lookupType: 'TIP', kod: 'TIP_TAYT', ad: 'Tayt', sira: 6, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 't7', lookupType: 'TIP', kod: 'TIP_CORAP_TAYT', ad: 'Çorap Tayt', sira: 7, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // --- CİNSİYETLER ---
  { id: 'c1', lookupType: 'CINSIYET', kod: 'CINSIYET_ERKEK', ad: 'Erkek', sira: 1, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'c2', lookupType: 'CINSIYET', kod: 'CINSIYET_KADIN', ad: 'Kadın', sira: 2, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'c3', lookupType: 'CINSIYET', kod: 'CINSIYET_UNISEX', ad: 'Unisex', sira: 3, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'c4', lookupType: 'CINSIYET', kod: 'CINSIYET_COCUK', ad: 'Çocuk', sira: 4, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'c5', lookupType: 'CINSIYET', kod: 'CINSIYET_BEBEK', ad: 'Bebek', sira: 5, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // --- BİRİMLER ---
  { id: 'br1', lookupType: 'BIRIM', kod: 'BIRIM_CIFT', ad: 'Çift', sira: 1, carpan: 1, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'br2', lookupType: 'BIRIM', kod: 'BIRIM_DUZINE', ad: 'Düzine', sira: 2, carpan: 12, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'br3', lookupType: 'BIRIM', kod: 'BIRIM_TEKLI', ad: 'Tekli Paket', sira: 3, carpan: 1, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'br4', lookupType: 'BIRIM', kod: 'BIRIM_2LI', ad: '2\'li Paket', sira: 4, carpan: 2, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'br5', lookupType: 'BIRIM', kod: 'BIRIM_3LU', ad: '3\'lü Paket', sira: 5, carpan: 3, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'br6', lookupType: 'BIRIM', kod: 'BIRIM_KOLI', ad: 'Koli', sira: 6, carpan: 24, durum: 'AKTIF', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const useLookupStore = create<LookupState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (data) => {
        const { items } = get();
        
        // Kod unique kontrolü
        if (items.some(i => i.kod === data.kod)) {
          return { 
            success: false, 
            error: `Kod "${data.kod}" zaten kullanılıyor.` 
          };
        }

        // Ad unique kontrolü (aynı tip içinde)
        const sameTypeItems = items.filter(i => i.lookupType === data.lookupType);
        if (sameTypeItems.some(i => i.ad === data.ad)) {
          return { 
            success: false, 
            error: `"${data.lookupType}" tipinde "${data.ad}" adı zaten kullanılıyor.` 
          };
        }

        const yeniItem: LookupItem = {
          id: generateId(),
          ...data,
          durum: 'AKTIF',
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({
          items: [...state.items, yeniItem]
        }));

        return { success: true };
      },

      updateItem: (id, data) => {
        const { items } = get();
        const item = items.find(i => i.id === id);
        
        if (!item) {
          return { success: false, error: 'Kayıt bulunamadı.' };
        }

        // Kod unique kontrolü (kendisi hariç)
        if (data.kod !== undefined && data.kod !== item.kod) {
          const exists = items.some(
            i => i.kod === data.kod && i.id !== id
          );
          if (exists) {
            return { 
              success: false, 
              error: `Kod "${data.kod}" başka kayıtta kullanılıyor.` 
            };
          }
        }

        // Ad unique kontrolü (kendisi hariç, aynı tip içinde)
        if (data.ad !== undefined && data.ad !== item.ad) {
          const lookupType = data.lookupType || item.lookupType;
          const exists = items.some(
            i => i.lookupType === lookupType && i.ad === data.ad && i.id !== id
          );
          if (exists) {
            return { 
              success: false, 
              error: `"${lookupType}" tipinde "${data.ad}" adı başka kayıtta kullanılıyor.` 
            };
          }
        }

        set(state => ({
          items: state.items.map(i =>
            i.id === id
              ? { ...i, ...data, updatedAt: getCurrentTimestamp() }
              : i
          )
        }));

        return { success: true };
      },

      deleteItem: (id) => {
        const { items } = get();
        const item = items.find(i => i.id === id);
        
        if (!item) {
          return { success: false, error: 'Kayıt bulunamadı.' };
        }

        // TODO: Backend entegrasyonunda sipariş/üretim kontrolü
        // Eğer bu lookup kullanılıyorsa silme engellenecek
        const kullanilanIds: string[] = []; // Örnek kullanılan ID'ler
        if (kullanilanIds.includes(id)) {
          return {
            success: false,
            error: `Bu kayıt sipariş/üretim kartlarında kullanıldığı için silinemez.`
          };
        }

        set(state => ({
          items: state.items.filter(i => i.id !== id)
        }));

        return { success: true };
      },

      pasifYap: (id) => {
        const { items } = get();
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, error: 'Kayıt bulunamadı.' };
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, durum: 'PASIF' as const, updatedAt: getCurrentTimestamp() } : i)
        }));
        return { success: true };
      },

      aktifYap: (id) => {
        const { items } = get();
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, error: 'Kayıt bulunamadı.' };
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, durum: 'AKTIF' as const, updatedAt: getCurrentTimestamp() } : i)
        }));
        return { success: true };
      },

      getItemById: (id) => {
        return get().items.find(i => i.id === id);
      },

      getItemsByType: (type) => {
        return get().items.filter(i => i.lookupType === type);
      },

      getSortedItemsByType: (type) => {
        return get()
          .items
          .filter(i => i.lookupType === type && i.durum === 'AKTIF')
          .sort((a, b) => {
            // Önce sıra numarasına göre, sonra ada göre sırala
            if (a.sira !== undefined && b.sira !== undefined) {
              return a.sira - b.sira;
            }
            if (a.sira !== undefined) return -1;
            if (b.sira !== undefined) return 1;
            return a.ad.localeCompare(b.ad);
          });
      },

      checkKodExists: (kod, excludeId) => {
        return get().items.some(
          i => i.kod === kod && i.id !== excludeId
        );
      },

      checkAdExists: (ad, excludeId) => {
        return get().items.some(
          i => i.ad === ad && i.id !== excludeId
        );
      },

      seedData: () => {
        const { items } = get();
        if (items.length === 0) {
          set({ items: defaultItems });
        } else {
          // Mevcut kayıtlara durum yoksa AKTIF ekle
          const updated = items.map(i => ({
            ...i,
            durum: i.durum || ('AKTIF' as const),
          }));
          set({ items: updated });
        }
      },
    }),
    {
      name: 'oys-lookup-store',
    }
  )
);
