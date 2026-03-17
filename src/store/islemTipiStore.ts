// ============================================
// İŞLEM TİPİ STORE - Zustand
// ============================================
// PR-2: Ortak utils kullanımı
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare, toTitleCase } from '@/utils/masterDataUtils';
import type { IslemTipi, IslemTipiFormData, HareketYonu } from '@/types';

interface IslemTipiState {
  islemTipleri: IslemTipi[];
  
  // Actions
  addIslemTipi: (data: IslemTipiFormData) => { success: boolean; error?: string };
  updateIslemTipi: (id: string, data: Partial<IslemTipiFormData>) => { success: boolean; error?: string };
  deleteIslemTipi: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getIslemTipiById: (id: string) => IslemTipi | undefined;
  getAktifIslemTipleri: () => IslemTipi[];
  getIslemTipleriByYon: (yon: HareketYonu) => IslemTipi[];
  checkIslemAdiExists: (adi: string, excludeId?: string) => boolean;
  isReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Seed İşlem Tipleri
const seedIslemTipleri: IslemTipi[] = [
  // Giriş işlemleri
  { id: '1', islemAdi: 'İplik Alımı', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', islemAdi: 'Üretim İade', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', islemAdi: 'Boyamadan Gelen', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', islemAdi: 'Numune İade', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', islemAdi: 'Diğer Giriş', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', islemAdi: 'Dışarı Depodan Gelen', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', islemAdi: 'Hurda İade', hareketYonu: 'GIRIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Çıkış işlemleri
  { id: '8', islemAdi: 'Üretim', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', islemAdi: 'Satış', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '10', islemAdi: 'Numune Üretimi', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '11', islemAdi: 'Fire', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '12', islemAdi: 'Boyamaya Giden', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '13', islemAdi: 'Diğer Çıkış', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '14', islemAdi: 'Tedarikçi İade', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '15', islemAdi: 'Hurda Çıkış', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '16', islemAdi: 'Dışarı Depoya Giden', hareketYonu: 'CIKIS', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const useIslemTipiStore = create<IslemTipiState>()(
  persist(
    (set, get) => ({
      islemTipleri: [],

      addIslemTipi: (data) => {
        const { islemTipleri } = get();
        const normalizedAd = toTitleCase(data.islemAdi);
        
        // Case-insensitive unique kontrol
        if (islemTipleri.some(i => normalizeForCompare(i.islemAdi) === normalizeForCompare(normalizedAd))) {
          return { success: false, error: `"${normalizedAd}" işlem tipi zaten tanımlı.` };
        }

        const yeniIslem: IslemTipi = {
          id: generateId(),
          ...data,
          islemAdi: normalizedAd,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ islemTipleri: [...state.islemTipleri, yeniIslem] }));
        return { success: true };
      },

      updateIslemTipi: (id, data) => {
        const { islemTipleri } = get();
        const islem = islemTipleri.find(i => i.id === id);
        
        if (!islem) {
          return { success: false, error: 'İşlem tipi bulunamadı.' };
        }

        // İsim değişiyorsa unique kontrol
        if (data.islemAdi !== undefined) {
          const normalizedAd = toTitleCase(data.islemAdi);
          const exists = islemTipleri.some(
            i => normalizeForCompare(i.islemAdi) === normalizeForCompare(normalizedAd) && i.id !== id
          );
          if (exists) {
            return { success: false, error: `"${normalizedAd}" işlem tipi zaten tanımlı.` };
          }
          data.islemAdi = normalizedAd;
        }

        // Referanslı kayıtta hareket yönü değiştirilemez (simülasyon)
        const referansliIslemIds = ['1', '8']; // İplik Alımı ve Üretim referanslı
        if (referansliIslemIds.includes(id) && data.hareketYonu !== undefined && data.hareketYonu !== islem.hareketYonu) {
          return { success: false, error: 'Bu işlem tipi kullanımda olduğu için hareket yönü değiştirilemez.' };
        }

        set(state => ({
          islemTipleri: state.islemTipleri.map(i =>
            i.id === id ? { ...i, ...data, updatedAt: getCurrentTimestamp() } : i
          )
        }));

        return { success: true };
      },

      deleteIslemTipi: (id) => {
        const { islemTipleri } = get();
        const islem = islemTipleri.find(i => i.id === id);
        
        if (!islem) {
          return { success: false, error: 'İşlem tipi bulunamadı.' };
        }

        // Sadece PASIF kayıtlar silinebilir
        if (islem.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı işlem silinemez
        const referansliIslemIds = ['1', '8'];
        if (referansliIslemIds.includes(id)) {
          return { success: false, error: 'Bu işlem tipi kullanımda olduğu için silinemez.' };
        }

        set(state => ({ islemTipleri: state.islemTipleri.filter(i => i.id !== id) }));
        return { success: true };
      },

      pasifYap: (id) => {
        const { islemTipleri } = get();
        const islem = islemTipleri.find(i => i.id === id);
        
        if (!islem) {
          return { success: false, error: 'İşlem tipi bulunamadı.' };
        }

        set(state => ({
          islemTipleri: state.islemTipleri.map(i =>
            i.id === id ? { ...i, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : i
          )
        }));

        return { success: true };
      },

      aktifYap: (id) => {
        const { islemTipleri } = get();
        const islem = islemTipleri.find(i => i.id === id);
        
        if (!islem) {
          return { success: false, error: 'İşlem tipi bulunamadı.' };
        }

        set(state => ({
          islemTipleri: state.islemTipleri.map(i =>
            i.id === id ? { ...i, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : i
          )
        }));

        return { success: true };
      },

      isReferansli: (id) => {
        const referansliIslemIds = ['1', '8'];
        return referansliIslemIds.includes(id);
      },

      getIslemTipiById: (id) => {
        return get().islemTipleri.find(i => i.id === id);
      },

      getAktifIslemTipleri: () => {
        return get().islemTipleri.filter(i => i.durum === 'AKTIF');
      },

      getIslemTipleriByYon: (yon) => {
        return get().islemTipleri.filter(i => i.hareketYonu === yon);
      },

      checkIslemAdiExists: (adi, excludeId) => {
        return get().islemTipleri.some(
          i => normalizeForCompare(i.islemAdi) === normalizeForCompare(adi) && i.id !== excludeId
        );
      },

      seedData: () => {
        set({ islemTipleri: seedIslemTipleri });
      },
    }),
    {
      name: 'oys-islem-tipi-store-v2',
    }
  )
);
