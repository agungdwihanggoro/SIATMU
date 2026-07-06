import { useMemo } from 'react';
import { Asset, PREDEFINED_PRMS } from '../types';
import { TrendingUp, Award, Layers, ShieldCheck, Map } from 'lucide-react';

interface StatsDashboardProps {
  assets: Asset[];
}

export default function StatsDashboard({ assets }: StatsDashboardProps) {
  // 1. KPI Calculations
  const totalLuas = useMemo(() => assets.reduce((sum, item) => sum + item.luas, 0), [assets]);
  const totalAssets = assets.length;

  const certifiedCount = useMemo(() => 
    assets.filter(a => a.status.toLowerCase().includes('sertifikat') && !a.status.toLowerCase().includes('proses')).length,
    [assets]
  );

  const pendingCount = useMemo(() => 
    assets.filter(a => a.status.toLowerCase().includes('proses') || a.status.toLowerCase().includes('belum')).length,
    [assets]
  );

  // 2. Data for Status Chart
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    assets.forEach(a => {
      // Group to shorter names for display
      let groupName = 'Lainnya';
      if (a.status.includes('Milik')) groupName = 'Sertifikat Wakaf';
      else if (a.status.includes('Proses')) groupName = 'Proses Sertifikasi';
      else if (a.status.includes('Belum')) groupName = 'Wakaf Belum Sertifikat';
      else if (a.status.includes('SHM')) groupName = 'Sertifikat SHM';
      else if (a.status.includes('Girik') || a.status.includes('Letter')) groupName = 'Girik/C';
      else if (a.status.includes('Hibah')) groupName = 'Hibah';
      
      stats[groupName] = (stats[groupName] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [assets]);

  // 3. Data for Peruntukan Chart
  const peruntukanStats = useMemo(() => {
    const stats: Record<string, { count: number; luas: number }> = {};
    assets.forEach(a => {
      let groupName = 'Lainnya';
      if (a.peruntukan.includes('Masjid') || a.peruntukan.includes('Musholla')) groupName = 'Masjid/Musholla';
      else if (a.peruntukan.includes('Sekolah') || a.peruntukan.includes('TK')) groupName = 'Sekolah/Madrasah';
      else if (a.peruntukan.includes('Kantor')) groupName = 'Kantor/Gedung';
      else if (a.peruntukan.includes('Panti') || a.peruntukan.includes('Amal')) groupName = 'Sosial/Panti';
      else if (a.peruntukan.includes('Klinik') || a.peruntukan.includes('Sakit')) groupName = 'Kesehatan/Klinik';
      else if (a.peruntukan.includes('Lahan') || a.peruntukan.includes('Sawah')) groupName = 'Sawah/Pertanian';
      else if (a.peruntukan.includes('Kosong')) groupName = 'Tanah Kosong';

      if (!stats[groupName]) stats[groupName] = { count: 0, luas: 0 };
      stats[groupName].count += 1;
      stats[groupName].luas += a.luas;
    });
    return Object.entries(stats).map(([name, val]) => ({ name, count: val.count, luas: val.luas }));
  }, [assets]);

  // 4. Data for Ranting Bar Chart
  const topRantings = useMemo(() => {
    const stats: Record<string, { count: number; luas: number }> = {};
    PREDEFINED_PRMS.forEach(prm => {
      stats[prm.name] = { count: 0, luas: 0 };
    });

    assets.forEach(a => {
      if (!stats[a.ranting]) {
        stats[a.ranting] = { count: 0, luas: 0 };
      }
      stats[a.ranting].count += 1;
      stats[a.ranting].luas += a.luas;
    });

    return Object.entries(stats)
      .map(([name, val]) => ({ name: name.replace('PRM ', ''), count: val.count, luas: val.luas }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.luas - a.luas)
      .slice(0, 6); // Top 6 Rantings by Area
  }, [assets]);

  // Colors for charts
  const colors = ['#0c6243', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6 text-mu-green" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Luas Aset</span>
            <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">
              {totalLuas.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">m²</span>
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Terdata di Kajen
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Map className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Jumlah Bidang</span>
            <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">
              {totalAssets} <span className="text-sm font-normal text-slate-500">Lokasi</span>
            </h3>
            <p className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-1">
              Tersebar di {assets.reduce((acc, a) => acc.includes(a.ranting) ? acc : [...acc, a.ranting], [] as string[]).length} Ranting
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sertifikat Terbit</span>
            <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">
              {certifiedCount} <span className="text-sm font-normal text-slate-500">Aset</span>
            </h3>
            <p className="text-[10px] text-teal-600 font-medium mt-1">
              {totalAssets > 0 ? Math.round((certifiedCount / totalAssets) * 100) : 0}% Bersertifikat resmi
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Proses & Non-Sertifikat</span>
            <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">
              {pendingCount} <span className="text-sm font-normal text-slate-500">Aset</span>
            </h3>
            <p className="text-[10px] text-amber-600 font-medium mt-1">
              Dalam pengurusan / ikrar wakaf
            </p>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Ranting Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-7">
          <div className="mb-4">
            <h4 className="font-display font-semibold text-slate-800 text-base">Sebaran Luas Aset per Ranting (m²)</h4>
            <p className="text-xs text-slate-500">Ranting Pimpinan Muhammadiyah dengan total aset terluas di Kajen</p>
          </div>

          {topRantings.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center italic text-slate-400 text-sm">
              Belum ada data untuk ditampilkan grafik sebaran.
            </div>
          ) : (
            <div className="space-y-4">
              {topRantings.map((ranting, idx) => {
                const maxLuas = Math.max(...topRantings.map(r => r.luas));
                const percentage = maxLuas > 0 ? (ranting.luas / maxLuas) * 100 : 0;
                return (
                  <div key={ranting.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                        {ranting.name} <span className="text-slate-400 font-normal">({ranting.count} Bidang)</span>
                      </span>
                      <span className="font-bold text-slate-800">{ranting.luas.toLocaleString('id-ID')} m²</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: colors[idx % colors.length] 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assets by Peruntukan Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h4 className="font-display font-semibold text-slate-800 text-base">Kategori Peruntukan Aset</h4>
              <p className="text-xs text-slate-500">Proporsi alokasi pemanfaatan tanah wakaf</p>
            </div>

            {peruntukanStats.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center italic text-slate-400 text-sm">
                Belum ada data peruntukan.
              </div>
            ) : (
              <div className="space-y-3.5 mt-2">
                {peruntukanStats.map((stat, idx) => {
                  const totalCounts = assets.length;
                  const percent = totalCounts > 0 ? Math.round((stat.count / totalCounts) * 100) : 0;
                  return (
                    <div key={stat.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                        <span className="font-medium text-slate-700 truncate">{stat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400">{stat.count} Bidang ({percent}%)</span>
                        <span className="font-semibold text-slate-800 font-mono w-14 text-right">
                          {stat.luas >= 1000 ? `${(stat.luas/1000).toFixed(1)}k` : stat.luas} m²
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Data per 2026</span>
            <span className="text-mu-green font-semibold">SIAT-MU Kajen</span>
          </div>
        </div>

      </div>

      {/* Bottom Row - Status Sertifikat Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="mb-4">
          <h4 className="font-display font-semibold text-slate-800 text-base">Status Legalitas Hukum Sertifikat</h4>
          <p className="text-xs text-slate-500">Breakdown legalitas seluruh bidang tanah yang dikuasai Muhammadiyah Kajen</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusStats.map((stat, idx) => {
            const count = stat.value;
            const percent = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
            return (
              <div 
                key={stat.name} 
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all text-center space-y-1"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full mx-auto" 
                  style={{ backgroundColor: colors[idx % colors.length] }}
                ></div>
                <h5 className="font-bold text-slate-800 text-lg font-display">{count}</h5>
                <p className="text-[10px] font-semibold text-slate-500 line-clamp-1 truncate" title={stat.name}>{stat.name}</p>
                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full inline-block font-bold">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
