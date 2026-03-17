// ============================================
// MÜŞTERİ STORE - Standardize Silme Stratejisi
// ============================================
// PR-1: Aktif/Pasif durum yönetimi + Hard Delete sadece pasif kayıtlarda
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare } from '@/utils/masterDataUtils';
import type { Musteri, MusteriFormData } from '@/types';

interface MusteriState {
  musteriler: Musteri[];
  
  // Actions
  addMusteri: (data: MusteriFormData) => { success: boolean; error?: string };
  updateMusteri: (id: string, data: Partial<MusteriFormData>) => { success: boolean; error?: string };
  deleteMusteri: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getMusteriById: (id: string) => Musteri | undefined;
  isMusteriReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Referanslı müşteri ID'leri (simülasyon)
const referansliMusteriIds = ['1'];

export const useMusteriStore = create<MusteriState>()(
  persist(
    (set, get) => ({
      musteriler: [],

      addMusteri: (data) => {
        const { musteriler } = get();
        
        // Case-insensitive unique kontrol
        const normalizedKisaKod = normalizeForCompare(data.musteriKisaKod);
        const normalizedOrmeciNo = normalizeForCompare(data.ormeciMusteriNo);
        
        const existsKisaKod = musteriler.some(
          m => normalizeForCompare(m.musteriKisaKod) === normalizedKisaKod
        );
        if (existsKisaKod) {
          return { success: false, error: 'Bu kısa kod zaten kullanılıyor.' };
        }

        const existsOrmeciNo = musteriler.some(
          m => normalizeForCompare(m.ormeciMusteriNo) === normalizedOrmeciNo
        );
        if (existsOrmeciNo) {
          return { success: false, error: 'Bu Örmeci Müşteri No zaten kullanılıyor.' };
        }

        const newMusteri: Musteri = {
          id: generateId(),
          ...data,
          durum: 'AKTIF', // Yeni kayıt varsayılan olarak aktif
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ musteriler: [...state.musteriler, newMusteri] }));
        return { success: true };
      },

      updateMusteri: (id, data) => {
        const { musteriler } = get();
        const musteri = musteriler.find(m => m.id === id);
        
        if (!musteri) {
          return { success: false, error: 'Müşteri bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.musteriKisaKod) {
          const normalizedKisaKod = normalizeForCompare(data.musteriKisaKod);
          const exists = musteriler.some(
            m => m.id !== id && normalizeForCompare(m.musteriKisaKod) === normalizedKisaKod
          );
          if (exists) {
            return { success: false, error: 'Bu kısa kod zaten kullanılıyor.' };
          }
        }

        if (data.ormeciMusteriNo) {
          const normalizedOrmeciNo = normalizeForCompare(data.ormeciMusteriNo);
          const exists = musteriler.some(
            m => m.id !== id && normalizeForCompare(m.ormeciMusteriNo) === normalizedOrmeciNo
          );
          if (exists) {
            return { success: false, error: 'Bu Örmeci Müşteri No zaten kullanılıyor.' };
          }
        }

        set(state => ({
          musteriler: state.musteriler.map(m =>
            m.id === id ? { ...m, ...data, updatedAt: getCurrentTimestamp() } : m
          )
        }));

        return { success: true };
      },

      deleteMusteri: (id) => {
        const { musteriler } = get();
        const musteri = musteriler.find(m => m.id === id);
        
        if (!musteri) {
          return { success: false, error: 'Müşteri bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (musteri.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı müşteri silinemez
        if (referansliMusteriIds.includes(id)) {
          return { success: false, error: 'Bu müşteri kullanımda olduğu için silinemez.' };
        }

        set(state => ({ musteriler: state.musteriler.filter(m => m.id !== id) }));
        return { success: true };
      },

      pasifYap: (id) => {
        const { musteriler } = get();
        const musteri = musteriler.find(m => m.id === id);
        
        if (!musteri) {
          return { success: false, error: 'Müşteri bulunamadı.' };
        }

        set(state => ({
          musteriler: state.musteriler.map(m =>
            m.id === id ? { ...m, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : m
          )
        }));

        return { success: true };
      },

      aktifYap: (id) => {
        const { musteriler } = get();
        const musteri = musteriler.find(m => m.id === id);
        
        if (!musteri) {
          return { success: false, error: 'Müşteri bulunamadı.' };
        }

        set(state => ({
          musteriler: state.musteriler.map(m =>
            m.id === id ? { ...m, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : m
          )
        }));

        return { success: true };
      },

      getMusteriById: (id) => {
        return get().musteriler.find(m => m.id === id);
      },

      isMusteriReferansli: (id) => {
        return referansliMusteriIds.includes(id);
      },

      seedData: () => {
        const seedMusteriler: Musteri[] = [
          {
            id: '1',
            ormeciMusteriNo: '39',
            musteriKisaKod: 'ECC',
            musteriUnvan: 'ECC GmbH',
            bolge: 'IHRACAT',
            ulke: 'Almanya',
            adres: 'Musterstraße 1, 12345 Berlin',
            vergiNo: 'DE123456789',
            odemeVadesiDeger: 60,
            odemeVadesiBirim: 'GUN',
            odemeTipi: 'Akreditif',
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
          {
            id: '2',
            ormeciMusteriNo: '42',
            musteriKisaKod: 'ABC',
            musteriUnvan: 'ABC Tekstil Ltd. Şti.',
            bolge: 'IC_PIYASA',
            ulke: 'Türkiye',
            adres: 'İstanbul, Türkiye',
            vergiNo: '1234567890',
            odemeVadesiDeger: 30,
            odemeVadesiBirim: 'GUN',
            odemeTipi: 'Açık Hesap',
            durum: 'AKTIF',
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
          },
        ];

        const { musteriler } = get();
        if (musteriler.length > 0) {
          // Mevcut kayıtlara durum yoksa AKTIF ekle
          const updated = musteriler.map((m: any) => ({ ...m, durum: m.durum || 'AKTIF' }));
          set({ musteriler: updated });
          return;
        }
        set({ musteriler: seedMusteriler });
      },
    }),
    {
      name: 'oys-musteri-store-v2',
    }
  )
);
