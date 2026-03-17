// ============================================
// TEDARİKÇİ STORE - Standardize Silme Stratejisi
// ============================================
// PR-1: Aktif/Pasif durum yönetimi + Hard Delete sadece pasif kayıtlarda
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare } from '@/utils/masterDataUtils';
import type { Tedarikci, TedarikciFormData } from '@/types';

interface TedarikciState {
  tedarikciler: Tedarikci[];
  
  // Actions
  addTedarikci: (data: TedarikciFormData) => { success: boolean; error?: string };
  updateTedarikci: (id: string, data: Partial<TedarikciFormData>) => { success: boolean; error?: string };
  deleteTedarikci: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getTedarikciById: (id: string) => Tedarikci | undefined;
  isTedarikciReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Referanslı tedarikçi ID'leri (simülasyon)
const referansliTedarikciIds = ['1'];

export const useTedarikciStore = create<TedarikciState>()(
  persist(
    (set, get) => ({
      tedarikciler: [],

      addTedarikci: (data) => {
        const { tedarikciler } = get();
        
        // Case-insensitive unique kontrol
        const normalizedKod = normalizeForCompare(data.tedarikciKodu);
        const exists = tedarikciler.some(
          t => normalizeForCompare(t.tedarikciKodu) === normalizedKod
        );
        if (exists) {
          return { success: false, error: 'Bu tedarikçi kodu zaten kullanılıyor.' };
        }

        const newTedarikci: Tedarikci = {
          id: generateId(),
          ...data,
          durum: 'AKTIF', // Yeni kayıt varsayılan olarak aktif
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ tedarikciler: [...state.tedarikciler, newTedarikci] }));
        return { success: true };
      },

      updateTedarikci: (id, data) => {
        const { tedarikciler } = get();
        const tedarikci = tedarikciler.find(t => t.id === id);
        
        if (!tedarikci) {
          return { success: false, error: 'Tedarikçi bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.tedarikciKodu) {
          const normalizedKod = normalizeForCompare(data.tedarikciKodu);
          const exists = tedarikciler.some(
            t => t.id !== id && normalizeForCompare(t.tedarikciKodu) === normalizedKod
          );
          if (exists) {
            return { success: false, error: 'Bu tedarikçi kodu zaten kullanılıyor.' };
          }
        }

        set(state => ({
          tedarikciler: state.tedarikciler.map(t =>
            t.id === id ? { ...t, ...data, updatedAt: getCurrentTimestamp() } : t
          )
        }));

        return { success: true };
      },

      deleteTedarikci: (id) => {
        const { tedarikciler } = get();
        const tedarikci = tedarikciler.find(t => t.id === id);
        
        if (!tedarikci) {
          return { success: false, error: 'Tedarikçi bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (tedarikci.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı tedarikçi silinemez
        if (referansliTedarikciIds.includes(id)) {
          return { success: false, error: 'Bu tedarikçi kullanımda olduğu için silinemez.' };
        }

        set(state => ({ tedarikciler: state.tedarikciler.filter(t => t.id !== id) }));
        return { success: true };
      },

      pasifYap: (id) => {
        const { tedarikciler } = get();
        const tedarikci = tedarikciler.find(t => t.id === id);
        
        if (!tedarikci) {
          return { success: false, error: 'Tedarikçi bulunamadı.' };
        }

        set(state => ({
          tedarikciler: state.tedarikciler.map(t =>
            t.id === id ? { ...t, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : t
          )
        }));

        return { success: true };
      },

      aktifYap: (id) => {
        const { tedarikciler } = get();
        const tedarikci = tedarikciler.find(t => t.id === id);
        
        if (!tedarikci) {
          return { success: false, error: 'Tedarikçi bulunamadı.' };
        }

        set(state => ({
          tedarikciler: state.tedarikciler.map(t =>
            t.id === id ? { ...t, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : t
          )
        }));

        return { success: true };
      },

      getTedarikciById: (id) => {
        return get().tedarikciler.find(t => t.id === id);
      },

      isTedarikciReferansli: (id) => {
        return referansliTedarikciIds.includes(id);
      },

      seedData: () => {
        const seedTedarikciler: Tedarikci[] = [
          {
            id: '1',
            tedarikciKodu: 'T001',
            tedarikciAdi: 'Bursa İplik San. A.Ş.',
            tedarikciUnvan: 'Bursa İplik Sanayi Anonim Şirketi',
            bolge: 'IC_PIYASA',
            ulke: 'Türkiye',
            adres: 'Bursa Organize Sanayi Bölgesi',
            vkn: '1234567890',
            vergiDairesi: 'Bursa Vergi Dairesi',
            kategoriIds: ['1'],
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
          {
            id: '2',
            tedarikciKodu: 'T002',
            tedarikciAdi: 'İstanbul Tekstil Ltd.',
            bolge: 'IC_PIYASA',
            ulke: 'Türkiye',
            adres: 'İstanbul',
            vkn: '0987654321',
            vergiDairesi: 'İstanbul Vergi Dairesi',
            kategoriIds: ['1', '2'],
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
        ];

        const { tedarikciler } = get();
        if (tedarikciler.length > 0) {
          const updated = tedarikciler.map((t: any) => ({ ...t, durum: t.durum || 'AKTIF' }));
          set({ tedarikciler: updated });
          return;
        }
        set({ tedarikciler: seedTedarikciler });
      },
    }),
    {
      name: 'oys-tedarikci-store-v2',
    }
  )
);
