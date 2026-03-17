// ============================================
// RENK STORE - Zustand
// ============================================
// PR-2: Ortak utils kullanımı
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare, toTitleCase } from '@/utils/masterDataUtils';
import type { Renk, RenkFormData } from '@/types';

interface RenkState {
  renkler: Renk[];
  
  // Actions
  addRenk: (data: RenkFormData) => { success: boolean; error?: string };
  updateRenk: (id: string, data: Partial<RenkFormData>) => { success: boolean; error?: string };
  deleteRenk: (id: string) => { success: boolean; error?: string };
  pasifRenk: (id: string) => { success: boolean; error?: string };
  aktifRenk: (id: string) => { success: boolean; error?: string };
  getRenkById: (id: string) => Renk | undefined;
  getAktifRenkler: () => Renk[];
  checkRenkAdiExists: (adi: string, excludeId?: string) => boolean;
  isRenkReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Seed Renkler
const seedRenkler: Renk[] = [
  // Beyazlar
  { id: 'r1', renkAdi: 'Beyaz', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r2', renkAdi: 'Kırık Beyaz', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r3', renkAdi: 'Ekru', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r4', renkAdi: 'Krem', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Siyahlar
  { id: 'r5', renkAdi: 'Siyah', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r6', renkAdi: 'Antrasit', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r7', renkAdi: 'Gri', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r8', renkAdi: 'Açık Gri', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Maviler
  { id: 'r9', renkAdi: 'Lacivert', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r10', renkAdi: 'Gece Mavisi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r11', renkAdi: 'Mavi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r12', renkAdi: 'Açık Mavi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r13', renkAdi: 'Petrol Mavisi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r14', renkAdi: 'Turkuaz', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Yeşiller
  { id: 'r15', renkAdi: 'Yeşil', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r16', renkAdi: 'Koyu Yeşil', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r17', renkAdi: 'Haki', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r18', renkAdi: 'Zeytin Yeşili', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Sarılar
  { id: 'r19', renkAdi: 'Sarı', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r20', renkAdi: 'Hardal', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Turuncu
  { id: 'r21', renkAdi: 'Turuncu', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Kırmızılar
  { id: 'r22', renkAdi: 'Kırmızı', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r23', renkAdi: 'Bordo', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r24', renkAdi: 'Vişne', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Pembeler
  { id: 'r25', renkAdi: 'Pembe', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r26', renkAdi: 'Pudra', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Morlar
  { id: 'r27', renkAdi: 'Mor', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r28', renkAdi: 'Lila', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Kahveler
  { id: 'r29', renkAdi: 'Kahverengi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r30', renkAdi: 'Açık Kahverengi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r31', renkAdi: 'Bej', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r32', renkAdi: 'Kum Beji', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r33', renkAdi: 'Ten Rengi', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Metalik
  { id: 'r34', renkAdi: 'Metalik Gümüş', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r35', renkAdi: 'Metalik Altın', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const useRenkStore = create<RenkState>()(
  persist(
    (set, get) => ({
      renkler: [],

      addRenk: (data) => {
        const { renkler } = get();
        const normalizedAd = toTitleCase(data.renkAdi);
        
        // Case-insensitive unique kontrol
        if (renkler.some(r => normalizeForCompare(r.renkAdi) === normalizeForCompare(normalizedAd))) {
          return { success: false, error: `"${normalizedAd}" rengi zaten tanımlı.` };
        }

        const yeniRenk: Renk = {
          id: generateId(),
          ...data,
          renkAdi: normalizedAd,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ renkler: [...state.renkler, yeniRenk] }));
        return { success: true };
      },

      updateRenk: (id, data) => {
        const { renkler } = get();
        const renk = renkler.find(r => r.id === id);
        
        if (!renk) {
          return { success: false, error: 'Renk bulunamadı.' };
        }

        if (data.renkAdi !== undefined) {
          const normalizedAd = toTitleCase(data.renkAdi);
          const exists = renkler.some(
            r => normalizeForCompare(r.renkAdi) === normalizeForCompare(normalizedAd) && r.id !== id
          );
          if (exists) {
            return { success: false, error: `"${normalizedAd}" rengi zaten tanımlı.` };
          }
          data.renkAdi = normalizedAd;
        }

        set(state => ({
          renkler: state.renkler.map(r =>
            r.id === id ? { ...r, ...data, updatedAt: getCurrentTimestamp() } : r
          )
        }));
        return { success: true };
      },

      deleteRenk: (id) => {
        const { renkler } = get();
        const renk = renkler.find(r => r.id === id);
        
        if (!renk) {
          return { success: false, error: 'Renk bulunamadı.' };
        }

        // Sadece PASIF kayıtlar silinebilir
        if (renk.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı renk silinemez
        const referansliIds = ['r1', 'r5'];
        if (referansliIds.includes(id)) {
          return { success: false, error: 'Bu renk kullanımda olduğu için silinemez.' };
        }

        set(state => ({ renkler: state.renkler.filter(r => r.id !== id) }));
        return { success: true };
      },

      pasifRenk: (id) => {
        set(state => ({
          renkler: state.renkler.map(r =>
            r.id === id ? { ...r, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : r
          )
        }));
        return { success: true };
      },

      aktifRenk: (id) => {
        set(state => ({
          renkler: state.renkler.map(r =>
            r.id === id ? { ...r, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : r
          )
        }));
        return { success: true };
      },

      isRenkReferansli: (id) => {
        const referansliIds = ['r1', 'r5'];
        return referansliIds.includes(id);
      },

      getRenkById: (id) => {
        return get().renkler.find(r => r.id === id);
      },

      getAktifRenkler: () => {
        return get().renkler.filter(r => r.durum === 'AKTIF');
      },

      checkRenkAdiExists: (adi, excludeId) => {
        return get().renkler.some(
          r => normalizeForCompare(r.renkAdi) === normalizeForCompare(adi) && r.id !== excludeId
        );
      },

      seedData: () => {
        set({ renkler: seedRenkler });
      },
    }),
    {
      name: 'oys-renk-store-v2',
    }
  )
);
