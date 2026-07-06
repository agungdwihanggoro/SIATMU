import { useState, useMemo } from 'react';
import { Asset, PREDEFINED_PRMS, ASSET_STATUSES, ASSET_PERUNTUKANS } from '../types';
import { Search, Filter, Download, Printer, Edit2, Trash2, Eye, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  isLoggedIn: boolean;
  selectedRantingFilter: string | null;
  onSelectRantingFilter: (ranting: string | null) => void;
}

export default function AssetList({
  assets,
  onEdit,
  onDelete,
  isLoggedIn,
  selectedRantingFilter,
  onSelectRantingFilter
}: AssetListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [peruntukanFilter, setPeruntukanFilter] = useState('');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'namaAset' | 'luas' | 'kodeAset'>('kodeAset');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.namaAset.toLowerCase().includes(search.toLowerCase()) ||
        asset.kodeAset.toLowerCase().includes(search.toLowerCase()) ||
        (asset.pewakif && asset.pewakif.toLowerCase().includes(search.toLowerCase())) ||
        asset.alamat.toLowerCase().includes(search.toLowerCase());
      
      const matchesRanting = selectedRantingFilter ? asset.ranting === selectedRantingFilter : true;
      const matchesStatus = statusFilter ? asset.status === statusFilter : true;
      const matchesPeruntukan = peruntukanFilter ? asset.peruntukan === peruntukanFilter : true;

      return matchesSearch && matchesRanting && matchesStatus && matchesPeruntukan;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assets, search, selectedRantingFilter, statusFilter, peruntukanFilter, sortBy, sortOrder]);

  // Export Filtered to CSV (Excel)
  const exportToExcel = () => {
    // CSV Header with BOM for Excel UTF-8 support
    let csvContent = '\uFEFF';
    csvContent += 'No,Kode Aset,Nama Aset,Ranting (PRM),Luas (m²),Pewakif,Status,No Sertifikat,Peruntukan,Pengelola,Alamat,Latitude,Longitude,Tanggal Input\r\n';

    filteredAssets.forEach((asset, idx) => {
      const row = [
        idx + 1,
        `"${asset.kodeAset}"`,
        `"${asset.namaAset.replace(/"/g, '""')}"`,
        `"${asset.ranting}"`,
        asset.luas,
        `"${(asset.pewakif || '').replace(/"/g, '""')}"`,
        `"${asset.status}"`,
        `"${(asset.noSertifikat || '').replace(/"/g, '""')}"`,
        `"${asset.peruntukan}"`,
        `"${asset.pengelola}"`,
        `"${asset.alamat.replace(/"/g, '""')}"`,
        asset.latitude,
        asset.longitude,
        `"${asset.createdAt.substring(0, 10)}"`
      ].join(',');
      csvContent += row + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Aset_Tanah_Muhammadiyah_Kajen_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Layout Action (opens print dialog with CSS print rules active)
  const printReport = () => {
    window.print();
  };

  // Trigger base64 file download
  const downloadDocument = (asset: Asset) => {
    if (!asset.dokumenBase64) return;
    const link = document.createElement('a');
    link.href = asset.dokumenBase64;
    link.download = asset.dokumenNama || `${asset.kodeAset}_sertifikat`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: 'namaAset' | 'luas' | 'kodeAset') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      
      {/* Search and Filters panel */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg">Daftar Inventaris & Legalitas Aset</h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredAssets.length} dari {assets.length} aset terdaftar
            </p>
          </div>

          {/* Action Buttons: Print PDF & Excel Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              disabled={filteredAssets.length === 0}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Ekspor Excel (CSV)
            </button>
            <button
              onClick={printReport}
              disabled={filteredAssets.length === 0}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan PDF
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aset, pewakif, kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Ranting Filter */}
          <div>
            <select
              value={selectedRantingFilter || ''}
              onChange={(e) => onSelectRantingFilter(e.target.value || null)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600"
            >
              <option value="">Semua Ranting (PRM)</option>
              {PREDEFINED_PRMS.map(prm => (
                <option key={prm.id} value={prm.name}>
                  {prm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600"
            >
              <option value="">Semua Status Sertifikat</option>
              {ASSET_STATUSES.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Peruntukan Filter */}
          <div>
            <select
              value={peruntukanFilter}
              onChange={(e) => setPeruntukanFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600"
            >
              <option value="">Semua Peruntukan</option>
              {ASSET_PERUNTUKANS.map(pe => (
                <option key={pe} value={pe}>
                  {pe}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table for Desktop/Mobile Cards */}
      <div className="overflow-x-auto w-full no-print">
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium">Tidak ada data aset tanah yang cocok dengan kriteria filter.</p>
            <button 
              onClick={() => { setSearch(''); onSelectRantingFilter(null); setStatusFilter(''); setPeruntukanFilter(''); }}
              className="text-xs text-emerald-700 font-semibold mt-2 hover:underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('kodeAset')}>
                  Kode Aset {sortBy === 'kodeAset' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('namaAset')}>
                  Nama Aset {sortBy === 'namaAset' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4">Ranting (PRM)</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('luas')}>
                  Luas {sortBy === 'luas' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4">Status & Peruntukan</th>
                <th className="py-3 px-4 text-center">Berkas</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAssets.map((asset, index) => {
                const hasFile = !!asset.dokumenBase64;
                
                // Color badges for status
                let statusBadge = 'bg-slate-50 text-slate-600 border border-slate-200';
                if (asset.status.includes('Milik')) statusBadge = 'bg-emerald-50 text-emerald-800 border border-emerald-100';
                else if (asset.status.includes('Proses')) statusBadge = 'bg-blue-50 text-blue-800 border border-blue-100';
                else if (asset.status.includes('Belum')) statusBadge = 'bg-amber-50 text-amber-800 border border-amber-100';

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{asset.kodeAset}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{asset.namaAset}</div>
                      <div className="text-[10px] text-slate-400 max-w-[200px] truncate" title={asset.alamat}>
                        {asset.alamat}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{asset.ranting}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {asset.luas.toLocaleString('id-ID')} m²
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge}`}>
                        {asset.status.replace(' (Milik Muhammadiyah)', '')}
                      </span>
                      <div className="text-[10px] text-slate-500 font-medium">
                        📍 {asset.peruntukan}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasFile ? (
                        <button
                          onClick={() => downloadDocument(asset)}
                          title={`Unduh: ${asset.dokumenNama}`}
                          className="p-1 text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition inline-flex"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px]" title="Tidak ada dokumen terunggah">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAssetDetail(asset)}
                          title="Lihat Rincian"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isLoggedIn && (
                          <>
                            <button
                              onClick={() => onEdit(asset)}
                              title="Ubah Data"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus data aset '${asset.namaAset}'?`)) {
                                  onDelete(asset.id);
                                }
                              }}
                              title="Hapus Aset"
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* -------------------- PRINT-ONLY REPORT TEMPLATE -------------------- */}
      <div className="print-only p-8 bg-white text-black space-y-6">
        <div className="text-center space-y-1.5 border-b-2 border-double border-black pb-4">
          <h2 className="text-xl font-bold uppercase">PERSYARIKATAN MUHAMMADIYAH KAJEN</h2>
          <h3 className="text-lg font-bold uppercase tracking-wide">MAJELIS WAKAF DAN KEHARTABENDAAN</h3>
          <p className="text-xs text-slate-600">
            Kecamatan Kajen, Kabupaten Pekalongan, Provinsi Jawa Tengah, Indonesia
          </p>
          <div className="text-xs font-mono font-bold mt-1">
            LAPORAN INVENTARISASI ASET TANAH PERSYARIKATAN • TANGGAL CETAK: {new Date().toLocaleDateString('id-ID')}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div>
            <strong>Kriteria Filter Cetak:</strong> Ranting: {selectedRantingFilter || 'Semua'}, Status: {statusFilter || 'Semua'}, Peruntukan: {peruntukanFilter || 'Semua'}
          </div>
          <div>
            <strong>Jumlah Terpilih:</strong> {filteredAssets.length} Bidang Tanah (Total Luas: {filteredAssets.reduce((sum, item) => sum + item.luas, 0).toLocaleString('id-ID')} m²)
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-slate-800">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-800 font-bold text-[10px]">
              <th className="border border-slate-800 p-2 text-center w-8">No</th>
              <th className="border border-slate-800 p-2">Kode Aset</th>
              <th className="border border-slate-800 p-2">Nama Aset / Lokasi</th>
              <th className="border border-slate-800 p-2">Ranting</th>
              <th className="border border-slate-800 p-2">Luas (m²)</th>
              <th className="border border-slate-800 p-2">Pewakif</th>
              <th className="border border-slate-800 p-2">Status Sertifikat / No. Akte</th>
              <th className="border border-slate-800 p-2">Peruntukan</th>
              <th className="border border-slate-800 p-2">Nazhir/Pengelola</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset, index) => (
              <tr key={asset.id} className="border-b border-slate-800">
                <td className="border border-slate-800 p-2 text-center">{index + 1}</td>
                <td className="border border-slate-800 p-2 font-mono font-bold">{asset.kodeAset}</td>
                <td className="border border-slate-800 p-2">
                  <div className="font-bold">{asset.namaAset}</div>
                  <div className="text-[9px] text-slate-600 leading-tight">{asset.alamat}</div>
                </td>
                <td className="border border-slate-800 p-2">{asset.ranting}</td>
                <td className="border border-slate-800 p-2 font-bold font-mono">{asset.luas.toLocaleString('id-ID')}</td>
                <td className="border border-slate-800 p-2">{asset.pewakif || '-'}</td>
                <td className="border border-slate-800 p-2">
                  <div>{asset.status}</div>
                  <div className="font-mono text-[9px] text-slate-600">{asset.noSertifikat || '-'}</div>
                </td>
                <td className="border border-slate-800 p-2">{asset.peruntukan}</td>
                <td className="border border-slate-800 p-2">{asset.pengelola}</td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold border-t border-slate-800">
              <td colSpan={4} className="border border-slate-800 p-2 text-right">TOTAL LUAS ASET TANAH:</td>
              <td className="border border-slate-800 p-2 font-mono text-base font-extrabold text-slate-900">
                {filteredAssets.reduce((sum, item) => sum + item.luas, 0).toLocaleString('id-ID')} m²
              </td>
              <td colSpan={4} className="border border-slate-800 p-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 text-center text-xs pt-12">
          <div className="space-y-16">
            <div>Mengetahui,</div>
            <div className="font-bold underline">K.H. Drs. Mulyono</div>
            <div className="text-[10px] text-slate-500">Ketua PCM Kajen</div>
          </div>
          <div></div>
          <div className="space-y-16">
            <div>Petugas Pengolah Data Wakaf,</div>
            <div className="font-bold underline">H. M. Syakir</div>
            <div className="text-[10px] text-slate-500">Majelis Wakaf PCM Kajen</div>
          </div>
        </div>
      </div>

      {/* -------------------- DETAIL MODAL POPUP -------------------- */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[9px] rounded-full font-bold">
                  {selectedAssetDetail.kodeAset}
                </span>
                <h4 className="font-display font-bold text-slate-800 text-base mt-1">
                  Rincian Detail Aset Wakaf
                </h4>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Nama Aset Tanah</span>
                <p className="font-bold text-slate-800 text-sm leading-snug">{selectedAssetDetail.namaAset}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Luas Tanah</span>
                  <p className="font-bold text-slate-800 text-sm font-mono">
                    {selectedAssetDetail.luas.toLocaleString('id-ID')} m²
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Ranting (Desa)</span>
                  <p className="font-bold text-slate-800">{selectedAssetDetail.ranting}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Pewakif</span>
                  <p className="font-medium text-slate-800">{selectedAssetDetail.pewakif || 'Muhammadiyah Kajen'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Nazhir/Pengelola</span>
                  <p className="font-medium text-slate-800">{selectedAssetDetail.pengelola}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Legalitas Status</span>
                  <p className="font-medium text-slate-800">{selectedAssetDetail.status}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Nomor Dokumen</span>
                  <p className="font-mono font-medium text-slate-800">{selectedAssetDetail.noSertifikat || 'Tidak Ada'}</p>
                </div>
              </div>

              {selectedAssetDetail.tanggalSertifikat && (
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Tanggal Terbit Dokumen</span>
                  <p className="font-medium text-slate-800">
                    {new Date(selectedAssetDetail.tanggalSertifikat).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Peruntukan Pemanfaatan</span>
                <p className="font-medium text-slate-800">{selectedAssetDetail.peruntukan}</p>
              </div>

              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Alamat Lengkap</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal">
                  {selectedAssetDetail.alamat}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/50">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Koordinat Lintang</span>
                  <p className="font-mono font-bold text-slate-700 text-xs">{selectedAssetDetail.latitude}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Koordinat Bujur</span>
                  <p className="font-mono font-bold text-slate-700 text-xs">{selectedAssetDetail.longitude}</p>
                </div>
              </div>

              {selectedAssetDetail.dokumenBase64 && (
                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] truncate max-w-[200px]">
                        {selectedAssetDetail.dokumenNama}
                      </p>
                      <span className="text-[9px] text-slate-400 font-medium">Sertifikat Digital Terlampir</span>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadDocument(selectedAssetDetail)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    Unduh Berkas
                  </button>
                </div>
              )}

              <div className="pt-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-100">
                <span>Diinput oleh: <strong>{selectedAssetDetail.createdBy}</strong></span>
                <span>Waktu input: {new Date(selectedAssetDetail.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition text-xs"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
