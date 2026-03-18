// ============================================
// ARTİKEL TANIMLARI STORE
// ============================================
// Kalıcı referans veri havuzu — Zustand + persist
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare } from '@/utils/masterDataUtils';
import type { Artikel, ArtikelFormData } from '@/types';

// FAZ 2B: Numune → Artikel aktarım parametreleri
interface NumuneArtikelData {
  numuneId: string;
  numuneNo: string;
  musteriKodu: string;
  musteriArtikelNo: string;
  urunTanimi: string;
  corapGrubu?: string;
  corapTipi?: string;
}

// FAZ 2B: Aktarım sonucu
interface ArtikelFromNumuneResult {
  success: boolean;
  error?: string;
  skipped?: boolean;
  linked?: boolean;
  created?: boolean;
}

interface ArtikelState {
  artikeller: Artikel[];

  // Actions
  addArtikel: (data: ArtikelFormData) => { success: boolean; error?: string };
  addArtikelFromNumune: (data: NumuneArtikelData) => ArtikelFromNumuneResult;
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

      // ============================================
      // FAZ 2B: Numune onayından otomatik artikel oluşturma / bağlama
      // 3 katmanlı duplicate kontrol: numuneId → numuneNo → musteriKodu+musteriArtikelNo
      // ============================================
      addArtikelFromNumune: (data) => {
        const { artikeller } = get();
        const { numuneId, numuneNo, musteriKodu, musteriArtikelNo, urunTanimi, corapGrubu, corapTipi } = data;

        // Katman 1: numuneId eşleşmesi → aynı numune zaten aktarılmış, atla
        const numuneIdMatch = artikeller.find(a => a.numuneId === numuneId);
        if (numuneIdMatch) {
          return { success: true, skipped: true };
        }

        // Katman 2: numuneNo eşleşmesi → mevcut kaydı bağla (sadece meta alanlar)
        if (numuneNo.trim()) {
          const normalizedNumuneNo = normalizeForCompare(numuneNo);
          const numuneNoMatch = artikeller.find(
            a => a.numuneNo.trim() && normalizeForCompare(a.numuneNo) === normalizedNumuneNo
          );
          if (numuneNoMatch) {
            set(state => ({
              artikeller: state.artikeller.map(a =>
                a.id === numuneNoMatch.id
                  ? { ...a, numuneId, kaynak: 'numune' as const, updatedAt: getCurrentTimestamp() }
                  : a
              )
            }));
            return { success: true, linked: true };
          }
        }

        // Katman 3: musteriKodu + musteriArtikelNo eşleşmesi (mevcut kaydın numuneNo'su boşsa) → bağla
        if (musteriKodu.trim() && musteriArtikelNo.trim()) {
          const normalizedMusteriKodu = normalizeForCompare(musteriKodu);
          const normalizedArtikelNo = normalizeForCompare(musteriArtikelNo);
          const musteriMatch = artikeller.find(
            a => !a.numuneNo.trim() &&
                 normalizeForCompare(a.musteriKodu) === normalizedMusteriKodu &&
                 normalizeForCompare(a.musteriArtikelNo) === normalizedArtikelNo
          );
          if (musteriMatch) {
            set(state => ({
              artikeller: state.artikeller.map(a =>
                a.id === musteriMatch.id
                  ? {
                      ...a,
                      numuneId,
                      numuneNo,
                      kaynak: 'numune' as const,
                      updatedAt: getCurrentTimestamp(),
                    }
                  : a
              )
            }));
            return { success: true, linked: true };
          }
        }

        // Eşleşme yok → yeni artikel kaydı oluştur (snapshot)
        const newArtikel: Artikel = {
          id: generateId(),
          ormeciArtikelNo: '',
          numuneNo,
          musteriKodu,
          musteriArtikelNo,
          urunTanimi,
          corapGrubu: corapGrubu || '',
          corapTipi: corapTipi || '',
          kaynak: 'numune',
          durum: 'AKTIF',
          numuneId,
          olusturmaTarihi: getCurrentTimestamp(),
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ artikeller: [...state.artikeller, newArtikel] }));
        return { success: true, created: true };
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
          // Mevcut kayıtlara eksik alanlar varsa varsayılan ekle
          const updated = artikeller.map((a: Artikel) => ({
            ...a,
            durum: a.durum || 'AKTIF',
            ormeciArtikelNo: a.ormeciArtikelNo || '',
            corapGrubu: a.corapGrubu || '',
            corapTipi: a.corapTipi || '',
          }));
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
