// ============================================
// İPLİK DETAY STORE - Zustand
// ============================================
// Kategori > Cins > Detay hiyerarşisi
// PR-3: Non-null assertion kaldırıldı, utils'den import edildi
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getCurrentTimestamp, normalizeForCompare, toTitleCase } from '@/utils/masterDataUtils';
import type { IplikKategori, IplikCins, IplikDetay, IplikKategoriFormData, IplikCinsFormData, IplikDetayFormData } from '@/types';

interface IplikDetayState {
  kategoriler: IplikKategori[];
  cinsler: IplikCins[];
  detaylar: IplikDetay[];
  
  // Kategori Actions
  addKategori: (data: IplikKategoriFormData) => { success: boolean; error?: string };
  updateKategori: (id: string, data: Partial<IplikKategoriFormData>) => { success: boolean; error?: string };
  deleteKategori: (id: string) => { success: boolean; error?: string };
  pasifKategori: (id: string) => { success: boolean; error?: string };
  aktifKategori: (id: string) => { success: boolean; error?: string };
  
  // Cins Actions
  addCins: (data: IplikCinsFormData) => { success: boolean; error?: string };
  updateCins: (id: string, data: Partial<IplikCinsFormData>) => { success: boolean; error?: string };
  deleteCins: (id: string) => { success: boolean; error?: string };
  pasifCins: (id: string) => { success: boolean; error?: string };
  aktifCins: (id: string) => { success: boolean; error?: string };
  
  // Detay Actions
  addDetay: (data: IplikDetayFormData) => { success: boolean; error?: string };
  updateDetay: (id: string, data: Partial<IplikDetayFormData>) => { success: boolean; error?: string };
  deleteDetay: (id: string) => { success: boolean; error?: string };
  pasifDetay: (id: string) => { success: boolean; error?: string };
  aktifDetay: (id: string) => { success: boolean; error?: string };
  
  // Getters
  getKategoriById: (id: string) => IplikKategori | undefined;
  getCinsById: (id: string) => IplikCins | undefined;
  getDetayById: (id: string) => IplikDetay | undefined;
  getCinslerByKategori: (kategoriId: string) => IplikCins[];
  getDetaylarByCins: (cinsId: string) => IplikDetay[];
  getFullDetayList: () => { detay: IplikDetay; cins: IplikCins; kategori: IplikKategori }[];
  getAktifKategoriler: () => IplikKategori[];
  getAktifCinsler: () => IplikCins[];
  getAktifDetaylar: () => IplikDetay[];
  isDetayReferansli: (id: string) => boolean;
  
  // Seed data
  seedData: () => void;
}

// Seed Veriler
const seedKategoriler: IplikKategori[] = [
  { id: 'k1', kategoriAdi: 'Doğal Elyaf', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'k2', kategoriAdi: 'Sentetik Elyaf', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const seedCinsler: IplikCins[] = [
  // Doğal Elyaf altındaki cinsler
  { id: 'c1', kategoriId: 'k1', cinsAdi: 'Pamuk', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'c2', kategoriId: 'k1', cinsAdi: 'Melanj', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'c3', kategoriId: 'k1', cinsAdi: 'Yün Ve Yün Karışımlılar', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'c4', kategoriId: 'k1', cinsAdi: 'Bambu', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Sentetik Elyaf altındaki cinsler
  { id: 'c5', kategoriId: 'k2', cinsAdi: 'Polyester', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'c6', kategoriId: 'k2', cinsAdi: 'Naylon', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const seedDetaylar: IplikDetay[] = [
  // Pamuk detayları
  { id: 'd1', cinsId: 'c1', detayAdi: 'Karde', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd2', cinsId: 'c1', detayAdi: 'Penye', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd3', cinsId: 'c1', detayAdi: 'Organik Karde', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Melanj detayları
  { id: 'd4', cinsId: 'c2', detayAdi: '100 Pamuk Melanj', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Yün detayları
  { id: 'd5', cinsId: 'c3', detayAdi: 'Yün', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd6', cinsId: 'c3', detayAdi: 'Yün Akrilik', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd7', cinsId: 'c3', detayAdi: 'Yün Kaşmir', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Bambu detayları
  { id: 'd8', cinsId: 'c4', detayAdi: 'Bambu', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Polyester detayları
  { id: 'd9', cinsId: 'c5', detayAdi: 'Parlak', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd10', cinsId: 'c5', detayAdi: 'Mat', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  // Naylon detayları
  { id: 'd11', cinsId: 'c6', detayAdi: 'Naylon', durum: 'AKTIF', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const useIplikDetayStore = create<IplikDetayState>()(
  persist(
    (set, get) => ({
      kategoriler: [],
      cinsler: [],
      detaylar: [],

      // ========== KATEGORİ ACTIONS ==========
      addKategori: (data) => {
        const { kategoriler } = get();
        
        // Case-insensitive unique kontrol
        const normalizedAdi = normalizeForCompare(data.kategoriAdi);
        const exists = kategoriler.some(
          k => normalizeForCompare(k.kategoriAdi) === normalizedAdi
        );
        if (exists) {
          return { success: false, error: 'Bu kategori adı zaten mevcut.' };
        }

        const newKategori: IplikKategori = {
          id: generateId(),
          kategoriAdi: toTitleCase(data.kategoriAdi),
          durum: data.durum || 'AKTIF',
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ kategoriler: [...state.kategoriler, newKategori] }));
        return { success: true };
      },

      updateKategori: (id, data) => {
        const { kategoriler } = get();
        const kategori = kategoriler.find(k => k.id === id);
        
        if (!kategori) {
          return { success: false, error: 'Kategori bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.kategoriAdi) {
          const normalizedAdi = normalizeForCompare(data.kategoriAdi);
          const exists = kategoriler.some(
            k => k.id !== id && normalizeForCompare(k.kategoriAdi) === normalizedAdi
          );
          if (exists) {
            return { success: false, error: 'Bu kategori adı zaten mevcut.' };
          }
        }

        set(state => ({
          kategoriler: state.kategoriler.map(k =>
            k.id === id ? { ...k, ...data, kategoriAdi: data.kategoriAdi ? toTitleCase(data.kategoriAdi) : k.kategoriAdi, updatedAt: getCurrentTimestamp() } : k
          )
        }));

        return { success: true };
      },

      deleteKategori: (id) => {
        const { kategoriler, cinsler } = get();
        const kategori = kategoriler.find(k => k.id === id);
        
        if (!kategori) {
          return { success: false, error: 'Kategori bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (kategori.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Alt cinsler varsa silinemez
        const altCinsler = cinsler.filter(c => c.kategoriId === id);
        if (altCinsler.length > 0) {
          return { success: false, error: 'Bu kategori altında cinsler bulunduğu için silinemez. Önce alt cinsleri silin.' };
        }

        set(state => ({ kategoriler: state.kategoriler.filter(k => k.id !== id) }));
        return { success: true };
      },

      pasifKategori: (id) => {
        set(state => ({
          kategoriler: state.kategoriler.map(k =>
            k.id === id ? { ...k, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : k
          )
        }));
        return { success: true };
      },

      aktifKategori: (id) => {
        set(state => ({
          kategoriler: state.kategoriler.map(k =>
            k.id === id ? { ...k, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : k
          )
        }));
        return { success: true };
      },

      // ========== CİNS ACTIONS ==========
      addCins: (data) => {
        const { cinsler } = get();
        
        // Case-insensitive unique kontrol (kategori içinde)
        const normalizedAdi = normalizeForCompare(data.cinsAdi);
        const exists = cinsler.some(
          c => c.kategoriId === data.kategoriId && normalizeForCompare(c.cinsAdi) === normalizedAdi
        );
        if (exists) {
          return { success: false, error: 'Bu cins adı bu kategori içinde zaten mevcut.' };
        }

        const newCins: IplikCins = {
          id: generateId(),
          ...data,
          cinsAdi: toTitleCase(data.cinsAdi),
          durum: data.durum || 'AKTIF',
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ cinsler: [...state.cinsler, newCins] }));
        return { success: true };
      },

      updateCins: (id, data) => {
        const { cinsler } = get();
        const cins = cinsler.find(c => c.id === id);
        
        if (!cins) {
          return { success: false, error: 'Cins bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.cinsAdi) {
          const normalizedAdi = normalizeForCompare(data.cinsAdi);
          const exists = cinsler.some(
            c => c.id !== id && c.kategoriId === (data.kategoriId || cins.kategoriId) && normalizeForCompare(c.cinsAdi) === normalizedAdi
          );
          if (exists) {
            return { success: false, error: 'Bu cins adı bu kategori içinde zaten mevcut.' };
          }
        }

        set(state => ({
          cinsler: state.cinsler.map(c =>
            c.id === id ? { ...c, ...data, cinsAdi: data.cinsAdi ? toTitleCase(data.cinsAdi) : c.cinsAdi, updatedAt: getCurrentTimestamp() } : c
          )
        }));

        return { success: true };
      },

      deleteCins: (id) => {
        const { cinsler, detaylar } = get();
        const cins = cinsler.find(c => c.id === id);
        
        if (!cins) {
          return { success: false, error: 'Cins bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (cins.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Alt detaylar varsa silinemez
        const altDetaylar = detaylar.filter(d => d.cinsId === id);
        if (altDetaylar.length > 0) {
          return { success: false, error: 'Bu cins altında detaylar bulunduğu için silinemez. Önce alt detayları silin.' };
        }

        set(state => ({ cinsler: state.cinsler.filter(c => c.id !== id) }));
        return { success: true };
      },

      pasifCins: (id) => {
        set(state => ({
          cinsler: state.cinsler.map(c =>
            c.id === id ? { ...c, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : c
          )
        }));
        return { success: true };
      },

      aktifCins: (id) => {
        set(state => ({
          cinsler: state.cinsler.map(c =>
            c.id === id ? { ...c, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : c
          )
        }));
        return { success: true };
      },

      // ========== DETAY ACTIONS ==========
      addDetay: (data) => {
        const { detaylar } = get();
        
        // Case-insensitive unique kontrol (cins içinde)
        const normalizedAdi = normalizeForCompare(data.detayAdi);
        const exists = detaylar.some(
          d => d.cinsId === data.cinsId && normalizeForCompare(d.detayAdi) === normalizedAdi
        );
        if (exists) {
          return { success: false, error: 'Bu detay adı bu cins içinde zaten mevcut.' };
        }

        const newDetay: IplikDetay = {
          id: generateId(),
          ...data,
          detayAdi: toTitleCase(data.detayAdi),
          durum: data.durum || 'AKTIF',
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set(state => ({ detaylar: [...state.detaylar, newDetay] }));
        return { success: true };
      },

      updateDetay: (id, data) => {
        const { detaylar } = get();
        const detay = detaylar.find(d => d.id === id);
        
        if (!detay) {
          return { success: false, error: 'Detay bulunamadı.' };
        }

        // Case-insensitive unique kontrol (kendi kaydı hariç)
        if (data.detayAdi) {
          const normalizedAdi = normalizeForCompare(data.detayAdi);
          const exists = detaylar.some(
            d => d.id !== id && d.cinsId === (data.cinsId || detay.cinsId) && normalizeForCompare(d.detayAdi) === normalizedAdi
          );
          if (exists) {
            return { success: false, error: 'Bu detay adı bu cins içinde zaten mevcut.' };
          }
        }

        set(state => ({
          detaylar: state.detaylar.map(d =>
            d.id === id ? { ...d, ...data, detayAdi: data.detayAdi ? toTitleCase(data.detayAdi) : d.detayAdi, updatedAt: getCurrentTimestamp() } : d
          )
        }));

        return { success: true };
      },

      deleteDetay: (id) => {
        const { detaylar } = get();
        const detay = detaylar.find(d => d.id === id);
        
        if (!detay) {
          return { success: false, error: 'Detay bulunamadı.' };
        }

        // Sadece pasif kayıtlar silinebilir
        if (detay.durum === 'AKTIF') {
          return { success: false, error: 'Aktif kayıtlar silinemez. Önce pasif yapın.' };
        }

        // Referanslı detay silinemez
        const referansliDetayIds = ['d1', 'd5'];
        if (referansliDetayIds.includes(id)) {
          return { success: false, error: 'Bu detay kullanımda olduğu için silinemez.' };
        }

        set(state => ({ detaylar: state.detaylar.filter(d => d.id !== id) }));
        return { success: true };
      },

      pasifDetay: (id) => {
        set(state => ({
          detaylar: state.detaylar.map(d =>
            d.id === id ? { ...d, durum: 'PASIF', updatedAt: getCurrentTimestamp() } : d
          )
        }));
        return { success: true };
      },

      aktifDetay: (id) => {
        set(state => ({
          detaylar: state.detaylar.map(d =>
            d.id === id ? { ...d, durum: 'AKTIF', updatedAt: getCurrentTimestamp() } : d
          )
        }));
        return { success: true };
      },

      isDetayReferansli: (id) => {
        const referansliDetayIds = ['d1', 'd5'];
        return referansliDetayIds.includes(id);
      },

      // ========== GETTERS ==========
      getKategoriById: (id) => get().kategoriler.find(k => k.id === id),
      getCinsById: (id) => get().cinsler.find(c => c.id === id),
      getDetayById: (id) => get().detaylar.find(d => d.id === id),
      getCinslerByKategori: (kategoriId) => get().cinsler.filter(c => c.kategoriId === kategoriId),
      getDetaylarByCins: (cinsId) => get().detaylar.filter(d => d.cinsId === cinsId),
      
      // PR-3: Non-null assertion kaldırıldı, güvenli hale getirildi
      getFullDetayList: () => {
        const { kategoriler, cinsler, detaylar } = get();
        const result: { detay: IplikDetay; cins: IplikCins; kategori: IplikKategori }[] = [];
        
        for (const detay of detaylar) {
          const cins = cinsler.find(c => c.id === detay.cinsId);
          if (!cins) continue;
          
          const kategori = kategoriler.find(k => k.id === cins.kategoriId);
          if (!kategori) continue;
          
          result.push({ detay, cins, kategori });
        }
        
        return result;
      },

      getAktifKategoriler: () => get().kategoriler.filter(k => k.durum === 'AKTIF'),
      getAktifCinsler: () => get().cinsler.filter(c => c.durum === 'AKTIF'),
      getAktifDetaylar: () => get().detaylar.filter(d => d.durum === 'AKTIF'),

      seedData: () => {
        set({ kategoriler: seedKategoriler, cinsler: seedCinsler, detaylar: seedDetaylar });
      },
    }),
    {
      name: 'oys-iplik-detay-store-v2',
    }
  )
);
