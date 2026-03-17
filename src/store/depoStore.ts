// ============================================
// DEPO STORE - Standardize Silme Stratejisi
// ============================================
// PR-1: Aktif/Pasif durum yönetimi + Hard Delete sadece pasif kayıtlarda
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare } from '@/utils/masterDataUtils';
import type { Depo, DepoFormData } from '@/types';

interface DepoState {
  depolar: Depo[];
  
  // Actions
  addDepo: (data: DepoFormData) => { success: boolean; error?: string };
  updateDepo: (id: string, data: Partial<DepoFormData>) => { success: boolean; error?: string };
  deleteDepo: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getDepoById: (id: string) => Depo | undefined;
  getNextDepoKodu: () => number;
  isDepoReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Referanslı depo ID'leri (simülasyon)
const referansliDepoIds = ['1'];

export const useDepoStore = create<DepoState>()(
  persist(
    (set, get) => ({
      depolar: [],

      addDepo: (data) => {
        const { depolar } = get();
        
        // Case-insensitive unique kontrol (depoKodu'yu string'e çevirerek)
        const normalizedKod = normalizeForCompare(String(data.depoKodu));
        const exists = depolar.some(
          d => normalizeForCompare(String(d.depoKodu)) === normalizedKod
        );
        if (exists) {
          return { success: false, error: 'Bu depo kodu zaten kullanılıyor.' };
        }

        const newDepo: Depo = {
          id: generateId(),
          ...data,
          durum: 'AKTIF', // Yeni kayıt varsayılan olarak aktif
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ depolar: [...state.depolar, newDepo] }));
        return { success: true };
      },

      updateDepo: (id, data) => {
        const { depolar } = get();
        const depo = depolar.find(d => d.id === id);
        
        if (!depo) {
          return { success: false, error: 'Depo bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.depoKodu !== undefined) {
          const normalizedKod = normalizeForCompare(String(data.depoKodu));
          const exists = depolar.some(
            d => d.id !== id && normalizeForCompare(String(d.depoKodu)) === normalizedKod
          );
          if (exists) {
            return { success: false, error: 'Bu depo kodu zaten kullanılıyor.' };
          }
        }

        set(state => ({
          depolar: state.depolar.map(d =>
            d.id === id ? { ...d, ...data, updatedAt: getCurrentTimestamp() } : d
          )
        }));

        return { success: true };
      },

      deleteDepo: (id) => {
        const { depolar } = get();
        const depo = depolar.find(d => d.id === id);
        
        if (!depo) {
          return { success: false, error: 'Depo bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (depo.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı depo silinemez
        if (referansliDepoIds.includes(id)) {
          return { success: false, error: 'Bu depo kullanımda olduğu için silinemez.' };
        }

        set(state => ({ depolar: state.depolar.filter(d => d.id !== id) }));
        return { success: true };
      },

      pasifYap: (id) => {
        const { depolar } = get();
        const depo = depolar.find(d => d.id === id);
        
        if (!depo) {
          return { success: false, error: 'Depo bulunamadı.' };
        }

        set(state => ({
          depolar: state.depolar.map(d =>
            d.id === id ? { ...d, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : d
          )
        }));

        return { success: true };
      },

      aktifYap: (id) => {
        const { depolar } = get();
        const depo = depolar.find(d => d.id === id);
        
        if (!depo) {
          return { success: false, error: 'Depo bulunamadı.' };
        }

        set(state => ({
          depolar: state.depolar.map(d =>
            d.id === id ? { ...d, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : d
          )
        }));

        return { success: true };
      },

      getDepoById: (id) => {
        return get().depolar.find(d => d.id === id);
      },

      getNextDepoKodu: () => {
        const { depolar } = get();
        const maxKod = depolar.reduce((max, depo) => {
          const kodNum = depo.depoKodu;
          return !isNaN(kodNum) && kodNum > max ? kodNum : max;
        }, 1000);
        return maxKod + 1;
      },

      isDepoReferansli: (id) => {
        return referansliDepoIds.includes(id);
      },

      seedData: () => {
        const seedDepolar: Depo[] = [
          {
            id: '1',
            depoKodu: 1001,
            depoAdi: 'Ana Depo',
            depoTipi: 'IC_DEPO',
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
          {
            id: '2',
            depoKodu: 1002,
            depoAdi: 'Dış Depo',
            depoTipi: 'DIS_DEPO',
            disDepoAdres: 'İstanbul, Türkiye',
            disDepoVKN: '1234567890',
            disDepoVergiDairesi: 'İstanbul VD',
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
        ];

        const { depolar } = get();
        if (depolar.length > 0) {
          const updated = depolar.map((d: any) => ({ ...d, durum: d.durum || 'AKTIF' }));
          set({ depolar: updated });
          return;
        }
        set({ depolar: seedDepolar });
      },
    }),
    {
      name: 'oys-depo-store-v2',
    }
  )
);
