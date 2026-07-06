import React, { useState, useEffect } from 'react';
import { Asset, PREDEFINED_PRMS, ASSET_STATUSES, ASSET_PERUNTUKANS, ASSET_PENGELOLAS } from '../types';
import { X, MapPin, Upload, FileCheck, Map, Navigation } from 'lucide-react';

interface AssetFormProps {
  asset?: Asset | null; // If editing
  onSave: (assetData: any) => Promise<void>;
  onClose: () => void;
  username: string;
}

export default function AssetForm({ asset, onSave, onClose, username }: AssetFormProps) {
  const [namaAset, setNamaAset] = useState('');
  const [alamat, setAlamat] = useState('');
  const [luas, setLuas] = useState('');
  const [pewakif, setPewakif] = useState('');
  const [status, setStatus] = useState(ASSET_STATUSES[0]);
  const [noSertifikat, setNoSertifikat] = useState('');
  const [tanggalSertifikat, setTanggalSertifikat] = useState('');
  const [peruntukan, setPeruntukan] = useState(ASSET_PERUNTUKANS[0]);
  const [pengelola, setPengelola] = useState(ASSET_PENGELOLAS[0]);
  const [ranting, setRanting] = useState(PREDEFINED_PRMS[0].name);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Document Upload States
  const [dokumenNama, setDokumenNama] = useState('');
  const [dokumenBase64, setDokumenBase64] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hydrate form if editing an existing asset
  useEffect(() => {
    if (asset) {
      setNamaAset(asset.namaAset);
      setAlamat(asset.alamat);
      setLuas(String(asset.luas));
      setPewakif(asset.pewakif);
      setStatus(asset.status);
      setNoSertifikat(asset.noSertifikat || '');
      setTanggalSertifikat(asset.tanggalSertifikat || '');
      setPeruntukan(asset.peruntukan);
      setPengelola(asset.pengelola);
      setRanting(asset.ranting);
      setLatitude(String(asset.latitude));
      setLongitude(String(asset.longitude));
      setDokumenNama(asset.dokumenNama || '');
      setDokumenBase64(asset.dokumenBase64 || '');
    } else {
      // Clear or set default coordinate center of Kajen
      setLatitude('-6.9947');
      setLongitude('109.5786');
    }
  }, [asset]);

  // Handle auto-populate coordinates from selected Ranting/PRM village
  const handleRantingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setRanting(selectedName);
    const prm = PREDEFINED_PRMS.find(p => p.name === selectedName);
    if (prm) {
      setLatitude(String(prm.latitude));
      setLongitude(String(prm.longitude));
    }
  };

  // Get current GPS location of user
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Gagal mendapatkan lokasi. Silakan isi manual atau pastikan izin GPS diaktifkan.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Convert uploaded file to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file melebihi batas maksimal (10 MB).');
      return;
    }

    setUploadProgress(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDokumenNama(file.name);
      setDokumenBase64(reader.result as string);
      setUploadProgress(false);
      setError('');
    };
    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('Gagal membaca file dokumen.');
      setUploadProgress(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!namaAset || !luas || !status || !peruntukan || !pengelola || !ranting) {
      setError('Mohon lengkapi semua kolom wajib (*)');
      return;
    }

    if (isNaN(Number(luas)) || Number(luas) <= 0) {
      setError('Luas tanah harus berupa angka positif.');
      return;
    }

    if (latitude && isNaN(Number(latitude))) {
      setError('Latitude harus berupa angka koordinat.');
      return;
    }

    if (longitude && isNaN(Number(longitude))) {
      setError('Longitude harus berupa angka koordinat.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        namaAset,
        alamat,
        luas: Number(luas),
        pewakif,
        status,
        noSertifikat,
        tanggalSertifikat: tanggalSertifikat || undefined,
        peruntukan,
        pengelola,
        ranting,
        latitude: Number(latitude) || -6.9947,
        longitude: Number(longitude) || 109.5786,
        dokumenNama: dokumenNama || undefined,
        dokumenBase64: dokumenBase64 || undefined,
        username,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan data aset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-100 max-h-[90vh] flex flex-col my-8">
        
        {/* Form Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-lg">
              {asset ? 'Ubah Rincian Aset Tanah' : 'Input Pendataan Aset Tanah Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {asset ? `Mengubah data aset: ${asset.kodeAset}` : 'Formulir pencatatan aset tanah Muhammadiyah Kajen'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-1">
              1. Identitas & Informasi Dasar
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Aset Tanah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tanah Masjid Al-Muttaqin / SD Muhammadiyah"
                  value={namaAset}
                  onChange={(e) => setNamaAset(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Luas Tanah (m²) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 450"
                  value={luas}
                  onChange={(e) => setLuas(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pimpinan Ranting Muhammadiyah (PRM) *
                </label>
                <select
                  value={ranting}
                  onChange={handleRantingChange}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {PREDEFINED_PRMS.map((prm) => (
                    <option key={prm.id} value={prm.name}>
                      {prm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pewakif (Pemberi Wakaf)
                </label>
                <input
                  type="text"
                  placeholder="Nama individu atau keluarga pemberi wakaf"
                  value={pewakif}
                  onChange={(e) => setPewakif(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap Aset
              </label>
              <textarea
                placeholder="Jl. Pahlawan, No. XX, Dukuh Lor, RT 01/RW 02..."
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              />
            </div>
          </div>

          {/* Section 2: Legalitas & Pengelolaan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-1">
              2. Status Hukum & Pengelolaan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Legalitas Tanah *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {ASSET_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Sertifikat / Nomor AIW
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No. W.10.02.15.01.0021"
                  value={noSertifikat}
                  onChange={(e) => setNoSertifikat(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Terbit Dokumen
                </label>
                <input
                  type="date"
                  value={tanggalSertifikat}
                  onChange={(e) => setTanggalSertifikat(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peruntukan Pemanfaatan *
                </label>
                <select
                  value={peruntukan}
                  onChange={(e) => setPeruntukan(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {ASSET_PERUNTUKANS.map((pe) => (
                    <option key={pe} value={pe}>
                      {pe}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pengelola/Nazhir *
                </label>
                <select
                  value={pengelola}
                  onChange={(e) => setPengelola(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {ASSET_PENGELOLAS.map((pn) => (
                    <option key={pn} value={pn}>
                      {pn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Geotag Koordinat & Upload */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-1">
              3. Geotag Lokasi & Upload Dokumen
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Latitude (Lintang)
                </label>
                <input
                  type="text"
                  placeholder="-6.9947"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  Longitude (Bujur)
                </label>
                <input
                  type="text"
                  placeholder="109.5786"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={loading}
                  className="w-full text-xs px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center justify-center gap-2 transition border border-slate-200"
                >
                  <Navigation className="w-3.5 h-3.5 animate-pulse text-emerald-700" />
                  {loading ? 'Mengambil GPS...' : 'Gunakan GPS HP'}
                </button>
              </div>
            </div>

            {/* Certificate Document Upload */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition relative">
              <input
                type="file"
                id="cert-file"
                accept=".pdf,image/*,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1.5 pointer-events-none">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-600 font-medium">
                  {uploadProgress ? (
                    <span className="text-emerald-600 font-semibold animate-pulse">Mengunggah file...</span>
                  ) : dokumenNama ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                      <FileCheck className="w-4 h-4" /> {dokumenNama}
                    </span>
                  ) : (
                    <span>Tarik file sertifikat di sini atau <strong className="text-emerald-700">Pilih File</strong></span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  Mendukung format PDF, JPG, PNG, DOCX (Maksimal 10 MB)
                </p>
              </div>
            </div>
            {dokumenBase64 && (
              <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 text-xs text-slate-600">
                <span className="truncate max-w-[80%] font-semibold text-emerald-800">📄 Dokumen Tersimpan</span>
                <button
                  type="button"
                  onClick={() => {
                    setDokumenNama('');
                    setDokumenBase64('');
                  }}
                  className="text-red-500 hover:text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

        </form>

        {/* Form Footer */}
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadProgress}
            className="px-4 py-2 text-xs font-bold bg-mu-green hover:bg-mu-green-hover text-white rounded-lg transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Data Aset'}
          </button>
        </div>

      </div>
    </div>
  );
}
