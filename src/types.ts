export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'petugas';
  createdAt: string;
}

export interface Asset {
  id: string;
  kodeAset: string;
  namaAset: string;
  alamat: string;
  luas: number;
  pewakif: string;
  status: string; // e.g., 'Sertifikat Wakaf (Milik)', 'Wakaf Belum Sertifikat', 'Sertifikat Hak Milik (SHM)', 'Girik/Letter C'
  noSertifikat?: string;
  tanggalSertifikat?: string;
  peruntukan: string; // e.g., 'Masjid/Musholla', 'Sekolah/Madrasah', 'Panti Asuhan', 'Kantor Organisasi', 'Lahan Pertanian/Perkebunan', 'Lainnya'
  pengelola: string; // e.g., 'PCM Kajen', 'PRM Gejlig', 'Majelis Dikdasmen', 'Pimpinan Ranting Nasyiah'
  ranting: string; // Ranting Muhammadiyah (PRM)
  latitude: number;
  longitude: number;
  dokumenNama?: string;
  dokumenBase64?: string; // stored base64 file data
  createdBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  activity: string;
  detail: string;
  createdAt: string;
}

export interface PRMInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
}

// Predefined 19 PRM (Pimpinan Ranting Muhammadiyah) in Kecamatan Kajen, Pekalongan
export const PREDEFINED_PRMS: PRMInfo[] = [
  { id: 'kajen-kota', name: 'PRM Kajen Kota', latitude: -6.9947, longitude: 109.5786, color: '#10B981' },
  { id: 'gejlig', name: 'PRM Gejlig', latitude: -6.9805, longitude: 109.5852, color: '#3B82F6' },
  { id: 'rowolaku', name: 'PRM Rowolaku', latitude: -7.0125, longitude: 109.5930, color: '#EF4444' },
  { id: 'tanjungsari', name: 'PRM Tanjungsari', latitude: -7.0255, longitude: 109.5699, color: '#F59E0B' },
  { id: 'kebonagung', name: 'PRM Kebonagung', latitude: -6.9880, longitude: 109.5620, color: '#8B5CF6' },
  { id: 'pekiringan-alit', name: 'PRM Pekiringan Alit', latitude: -7.0010, longitude: 109.5710, color: '#EC4899' },
  { id: 'pekiringan-ageng', name: 'PRM Pekiringan Ageng', latitude: -7.0040, longitude: 109.5650, color: '#14B8A6' },
  { id: 'sambiroto', name: 'PRM Sambiroto', latitude: -6.9720, longitude: 109.5750, color: '#F97316' },
  { id: 'nyamok', name: 'PRM Nyamok', latitude: -6.9912, longitude: 109.5912, color: '#6366F1' },
  { id: 'salit', name: 'PRM Salit', latitude: -7.0210, longitude: 109.6050, color: '#06B6D4' },
  { id: 'sangkanjoyo', name: 'PRM Sangkanjoyo', latitude: -7.0350, longitude: 109.5850, color: '#84CC16' },
  { id: 'sinangoh-prendeng', name: 'PRM Sinangoh Prendeng', latitude: -6.9830, longitude: 109.5980, color: '#A855F7' },
  { id: 'kulu', name: 'PRM Kulu', latitude: -7.0120, longitude: 109.5630, color: '#F43F5E' },
  { id: 'tambakroto', name: 'PRM Tambakroto', latitude: -7.0510, longitude: 109.5700, color: '#10B981' },
  { id: 'sokoyoso', name: 'PRM Sokoyoso', latitude: -6.9690, longitude: 109.5930, color: '#3B82F6' },
  { id: 'pringsurat', name: 'PRM Pringsurat', latitude: -7.0450, longitude: 109.5520, color: '#64748B' },
  { id: 'karangari', name: 'PRM Karangari', latitude: -7.0050, longitude: 109.5500, color: '#475569' },
  { id: 'sabarwangi', name: 'PRM Sabarwangi', latitude: -7.0290, longitude: 109.5950, color: '#D97706' },
  { id: 'wonorejo', name: 'PRM Wonorejo', latitude: -7.0620, longitude: 109.5850, color: '#059669' },
];

export const ASSET_STATUSES = [
  'Sertifikat Wakaf (Milik Muhammadiyah)',
  'Wakaf Proses Sertifikasi',
  'Wakaf Belum Sertifikat (Akte Ikrar Wakaf/AIW)',
  'Sertifikat Hak Milik (SHM) atas nama Persyarikatan',
  'Girik / Letter C / Petok D',
  'Hibah Belum Balik Nama',
  'Lainnya',
];

export const ASSET_PERUNTUKANS = [
  'Masjid / Musholla',
  'Gedung Sekolah / Madrasah / TK ABA',
  'Kantor Organisasi (PCM/PRM/Ortom)',
  'Panti Asuhan / Amal Usaha Sosial',
  'Klinik / Rumah Sakit / Amal Usaha Kesehatan',
  'Lahan Pertanian / Perkebunan / Sawah',
  'Tanah Kosong (Cadangan Pengembangan)',
  'Lainnya',
];

export const ASSET_PENGELOLAS = [
  'PCM Kajen',
  'PRM Setempat',
  'Majelis Dikdasmen PCM Kajen',
  'Majelis Pembina Kesejahteraan Sosial (MPKS)',
  'Pimpinan Cabang Aisyiyah (PCA) Kajen',
  'Takmir Masjid / Musholla',
  'Lainnya',
];
