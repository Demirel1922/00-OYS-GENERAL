// ============================================
// ARTİKEL TANIMLARI STORE
// ============================================
// Kalıcı referans veri havuzu — Zustand + persist
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare } from '@/utils/masterDataUtils';
import type { Artikel, ArtikelFormData } from '@/types';

interface ArtikelState {
  artikeller: Artikel[];

  // Actions
  addArtikel: (data: ArtikelFormData) => { success: boolean; error?: string };
  updateArtikel: (id: string, data: Partial<ArtikelFormData>) => { success: boolean; error?: string };
  deleteArtikel: (id: string) => { success: boolean; error?: string };
  pasifYap: (id: string) => { success: boolean; error?: string };
  aktifYap: (id: string) => { success: boolean; error?: string };
  getArtikelById: (id: string) => Artikel | undefined;

  // Seed data
  seedData: () => void;
}

export const useArtikelStore = create<ArtikelState>()(
  persist(
    (set, get) => ({
      artikeller: [],

      addArtikel: (data) => {
        const { artikeller } = get();

        // Duplicate kontrolü
        // 1. numuneNo doluysa → numuneNo üzerinden kontrol
        if (data.numuneNo.trim()) {
          const normalizedNumuneNo = normalizeForCompare(data.numuneNo);
          const exists = artikeller.some(
            a => normalizeForCompare(a.numuneNo) === normalizedNumuneNo
          );
          if (exists) {
            return { success: false, error: 'Bu Numune No ile zaten bir artikel tanımı mevcut.' };
          }
        }

        // 2. numuneNo boşsa → musteriKodu + musteriArtikelNo kombinasyonu
        if (!data.numuneNo.trim()) {
          if (!data.musteriKodu.trim() || !data.musteriArtikelNo.trim()) {
            return { success: false, error: 'Numune No boş ise Müşteri Kodu ve Müşteri Artikel No zorunludur.' };
          }
          const normalizedMusteriKodu = normalizeForCompare(data.musteriKodu);
          const normalizedArtikelNo = normalizeForCompare(data.musteriArtikelNo);
          const exists = artikeller.some(
            a => normalizeForCompare(a.musteriKodu) === normalizedMusteriKodu &&
                 normalizeForCompare(a.musteriArtikelNo) === normalizedArtikelNo
          );
          if (exists) {
            return { success: false, error: 'Bu Müşteri Kodu ve Müşteri Artikel No kombinasyonu zaten mevcut.' };
          }
        }

        const newArtikel: Artikel = {
          id: generateId(),
          ...data,
          kaynak: 'manuel',
          durum: 'AKTIF',
          numuneId: null,
          olusturmaTarihi: getCurrentTimestamp(),
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ artikeller: [...state.artikeller, newArtikel] }));
        return { success: true };
      },

      updateArtikel: (id, data) => {
        const { artikeller } = get();
        const artikel = artikeller.find(a => a.id === id);

        if (!artikel) {
          return { success: false, error: 'Artikel bulunamadı.' };
        }

        // Duplicate kontrolü (kendi kaydı hariç)
        const updatedNumuneNo = data.numuneNo !== undefined ? data.numuneNo : artikel.numuneNo;
        const updatedMusteriKodu = data.musteriKodu !== undefined ? data.musteriKodu : artikel.musteriKodu;
        const updatedArtikelNo = data.musteriArtikelNo !== undefined ? data.musteriArtikelNo : artikel.musteriArtikelNo;

        if (updatedNumuneNo.trim()) {
          const normalizedNumuneNo = normalizeForCompare(updatedNumuneNo);
          const exists = artikeller.some(
            a => a.id !== id && normalizeForCompare(a.numuneNo) === normalizedNumuneNo
          );
          if (exists) {
            return { success: false, error: 'Bu Numune No ile zaten bir artikel tanımı mevcut.' };
          }
        }

        if (!updatedNumuneNo.trim()) {
          if (!updatedMusteriKodu.trim() || !updatedArtikelNo.trim()) {
            return { success: false, error: 'Numune No boş ise Müşteri Kodu ve Müşteri Artikel No zorunludur.' };
          }
          const normalizedMusteriKodu = normalizeForCompare(updatedMusteriKodu);
          const normalizedArtikelNo = normalizeForCompare(updatedArtikelNo);
          const exists = artikeller.some(
            a => a.id !== id &&
                 normalizeForCompare(a.musteriKodu) === normalizedMusteriKodu &&
                 normalizeForCompare(a.musteriArtikelNo) === normalizedArtikelNo
          );
          if (exists) {
            return { success: false, error: 'Bu Müşteri Kodu ve Müşteri Artikel No kombinasyonu zaten mevcut.' };
          }
        }

        set(state => ({
          artikeller: state.artikeller.map(a =>
            a.id === id ? { ...a, ...data, updatedAt: getCurrentTimestamp() } : a
          )
        }));

        return { success: true };
      },

      deleteArtikel: (id) => {
        const { artikeller } = get();
        const artikel = artikeller.find(a => a.id === id);

        if (!artikel) {
          return { success: false, error: 'Artikel bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (artikel.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        set(state => ({ artikeller: state.artikeller.filter(a => a.id !== id) }));
        return { success: true };
      },

      pasifYap: (id) => {
        const { artikeller } = get();
        const artikel = artikeller.find(a => a.id === id);

        if (!artikel) {
          return { success: false, error: 'Artikel bulunamadı.' };
        }

        set(state => ({
          artikeller: state.artikeller.map(a =>
            a.id === id ? { ...a, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : a
          )
        }));

        return { success: true };
      },

      aktifYap: (id) => {
        const { artikeller } = get();
        const artikel = artikeller.find(a => a.id === id);

        if (!artikel) {
          return { success: false, error: 'Artikel bulunamadı.' };
        }

        set(state => ({
          artikeller: state.artikeller.map(a =>
            a.id === id ? { ...a, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : a
          )
        }));

        return { success: true };
      },

      getArtikelById: (id) => {
        return get().artikeller.find(a => a.id === id);
      },

      seedData: () => {
        const { artikeller } = get();
        if (artikeller.length > 0) {
          // Mevcut kayıtlara durum yoksa AKTIF ekle
          const updated = artikeller.map((a: Artikel) => ({ ...a, durum: a.durum || 'AKTIF' }));
          set({ artikeller: updated });
          return;
        }
        // Boş başla — seed veri yok
        set({ artikeller: [] });
      },
    }),
    {
      name: 'oys-artikel-store-v1',
    }
  )
);
