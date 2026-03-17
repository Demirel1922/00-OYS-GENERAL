// ============================================
// KALINLIK STORE - Zustand
// ============================================
// PR-2: Ortak utils kullanımı
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, toTitleCase } from '@/utils/masterDataUtils';
import type { Kalinlik, KalinlikFormData, KalinlikBirim } from '@/types';

interface KalinlikState {
  kalinliklar: Kalinlik[];
  
  // Actions
  addKalinlik: (data: KalinlikFormData) => { success: boolean; error?: string };
  updateKalinlik: (id: string, data: Partial<KalinlikFormData>) => { success: boolean; error?: string };
  deleteKalinlik: (id: string) => { success: boolean; error?: string };
  pasifKalinlik: (id: string) => { success: boolean; error?: string };
  aktifKalinlik: (id: string) => { success: boolean; error?: string };
  getKalinlikById: (id: string) => Kalinlik | undefined;
  getAktifKalinliklar: () => Kalinlik[];
  getKalinliklarByBirim: (birim: KalinlikBirim) => Kalinlik[];
  getBirlesikGosterim: (kalinlik: Kalinlik) => string;
  isKalinlikReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Seed Kalınlıklar
const seedKalinliklar: Kalinlik[] = [
  // Ne birimi
  { id: 'n1', birim: 'Ne', deger: '20/1', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'n2', birim: 'Ne', deger: '24/1', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'n3', birim: 'Ne', deger: '30/1', ozellik: 'Ocs', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'n4', birim: 'Ne', deger: '30/1', ozellik: 'Bci', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'n5', birim: 'Ne', deger: '30/2', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'n6', birim: 'Ne', deger: '36/1', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Nm birimi
  { id: 'm1', birim: 'Nm', deger: '50', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'm2', birim: 'Nm', deger: '60', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Dtex birimi
  { id: 'd1', birim: 'Dtex', deger: '150', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd2', birim: 'Dtex', deger: '167', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Denye birimi
  { id: 'de1', birim: 'Denye', deger: '70', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'de2', birim: 'Denye', deger: '100', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const useKalinlikStore = create<KalinlikState>()(
  persist(
    (set, get) => ({
      kalinliklar: [],

      addKalinlik: (data) => {
        const { kalinliklar } = get();
        const normalizedOzellik = data.ozellik ? toTitleCase(data.ozellik) : undefined;
        
        // Unique kontrol: (Birim, Deger, Ozellik)
        const exists = kalinliklar.some(k => 
          k.birim === data.birim && 
          k.deger === data.deger && 
          (k.ozellik || '') === (normalizedOzellik || '')
        );
        
        if (exists) {
          const birlesik = `${data.birim} ${data.deger}${normalizedOzellik ? ' ' + normalizedOzellik : ''}`;
          return { success: false, error: `"${birlesik}" kalınlığı zaten tanımlı.` };
        }

        const yeniKalinlik: Kalinlik = {
          id: generateId(),
          ...data,
          ozellik: normalizedOzellik,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ kalinliklar: [...state.kalinliklar, yeniKalinlik] }));
        return { success: true };
      },

      updateKalinlik: (id, data) => {
        const { kalinliklar } = get();
        const kalinlik = kalinliklar.find(k => k.id === id);
        
        if (!kalinlik) {
          return { success: false, error: 'Kalınlık bulunamadı.' };
        }

        // Referanslı kayıtta birim ve değer değiştirilemez (simülasyon)
        const referansliIds = ['n1', 'n3']; // 20/1 ve 30/1 Ocs referanslı
        if (referansliIds.includes(id)) {
          if ((data.birim !== undefined && data.birim !== kalinlik.birim) ||
              (data.deger !== undefined && data.deger !== kalinlik.deger)) {
            return { success: false, error: 'Bu kalınlık kullanımda olduğu için birim ve değer değiştirilemez.' };
          }
        }

        // Unique kontrol (güncelleme)
        const birim = data.birim || kalinlik.birim;
        const deger = data.deger || kalinlik.deger;
        const ozellik = data.ozellik !== undefined ? (data.ozellik ? toTitleCase(data.ozellik) : undefined) : kalinlik.ozellik;
        
        const exists = kalinliklar.some(k => 
          k.id !== id &&
          k.birim === birim && 
          k.deger === deger && 
          (k.ozellik || '') === (ozellik || '')
        );
        
        if (exists) {
          const birlesik = `${birim} ${deger}${ozellik ? ' ' + ozellik : ''}`;
          return { success: false, error: `"${birlesik}" kalınlığı zaten tanımlı.` };
        }

        set(state => ({
          kalinliklar: state.kalinliklar.map(k =>
            k.id === id ? { ...k, ...data, ozellik, updatedAt: getCurrentTimestamp() } : k
          )
        }));
        return { success: true };
      },

      deleteKalinlik: (id) => {
        const { kalinliklar } = get();
        const kalinlik = kalinliklar.find(k => k.id === id);
        
        if (!kalinlik) {
          return { success: false, error: 'Kalınlık bulunamadı.' };
        }

        // Sadece PASIF kayıtlar silinebilir
        if (kalinlik.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı kalınlık silinemez
        const referansliIds = ['n1', 'n3'];
        if (referansliIds.includes(id)) {
          return { success: false, error: 'Bu kalınlık kullanımda olduğu için silinemez.' };
        }

        set(state => ({ kalinliklar: state.kalinliklar.filter(k => k.id !== id) }));
        return { success: true };
      },

      pasifKalinlik: (id) => {
        set(state => ({
          kalinliklar: state.kalinliklar.map(k =>
            k.id === id ? { ...k, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : k
          )
        }));
        return { success: true };
      },

      aktifKalinlik: (id) => {
        set(state => ({
          kalinliklar: state.kalinliklar.map(k =>
            k.id === id ? { ...k, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : k
          )
        }));
        return { success: true };
      },

      isKalinlikReferansli: (id) => {
        const referansliIds = ['n1', 'n3'];
        return referansliIds.includes(id);
      },

      getKalinlikById: (id) => {
        return get().kalinliklar.find(k => k.id === id);
      },

      getAktifKalinliklar: () => {
        return get().kalinliklar.filter(k => k.durum === 'AKTIF');
      },

      getKalinliklarByBirim: (birim) => {
        return get().kalinliklar.filter(k => k.birim === birim);
      },

      getBirlesikGosterim: (kalinlik) => {
        return `${kalinlik.birim} ${kalinlik.deger}${kalinlik.ozellik ? ' ' + kalinlik.ozellik : ''}`;
      },

      seedData: () => {
        set({ kalinliklar: seedKalinliklar });
      },
    }),
    {
      name: 'oys-kalinlik-store-v2',
    }
  )
);
