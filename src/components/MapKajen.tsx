import { useState, useMemo } from 'react';
import { PRMInfo, Asset, PREDEFINED_PRMS } from '../types';
import { MapPin, ZoomIn, ZoomOut, Compass, Info, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapKajenProps {
  assets: Asset[];
  onSelectRanting: (rantingName: string | null) => void;
  selectedRanting: string | null;
}

export default function MapKajen({ assets, onSelectRanting, selectedRanting }: MapKajenProps) {
  const [hoveredPRM, setHoveredPRM] = useState<PRMInfo | null>(null);
  const [selectedPinAsset, setSelectedPinAsset] = useState<Asset | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'ranting' | 'aset'>('ranting');

  // Map boundaries for projection
  const minLat = -7.07;
  const maxLat = -6.96;
  const minLng = 109.54;
  const maxLng = 109.61;

  const mapWidth = 550;
  const mapHeight = 450;

  // Convert geo coordinates to SVG coordinates
  const getXY = (lat: number, lng: number) => {
    // x coordinate: West to East
    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 60) + 30;
    // y coordinate: North is smaller Y on screen, South is larger Y
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 60) + 30;
    return { x, y };
  };

  // Group assets by Ranting
  const assetsByRanting = useMemo(() => {
    const counts: Record<string, { count: number; totalLuas: number; items: Asset[] }> = {};
    PREDEFINED_PRMS.forEach(prm => {
      counts[prm.name] = { count: 0, totalLuas: 0, items: [] };
    });

    assets.forEach(asset => {
      if (!counts[asset.ranting]) {
        counts[asset.ranting] = { count: 0, totalLuas: 0, items: [] };
      }
      counts[asset.ranting].count += 1;
      counts[asset.ranting].totalLuas += asset.luas;
      counts[asset.ranting].items.push(asset);
    });

    return counts;
  }, [assets]);

  // Connect close points with subtle lines on the map to give it a neat topographic/mesh vibe
  const networkLines = useMemo(() => {
    const lines: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; key: string }> = [];
    const threshold = 0.025; // max distance to connect

    for (let i = 0; i < PREDEFINED_PRMS.length; i++) {
      for (let j = i + 1; j < PREDEFINED_PRMS.length; j++) {
        const p1 = PREDEFINED_PRMS[i];
        const p2 = PREDEFINED_PRMS[j];
        const dist = Math.sqrt(
          Math.pow(p1.latitude - p2.latitude, 2) + Math.pow(p1.longitude - p2.longitude, 2)
        );
        if (dist < threshold) {
          lines.push({
            from: getXY(p1.latitude, p1.longitude),
            to: getXY(p2.latitude, p2.longitude),
            key: `${p1.id}-${p2.id}`,
          });
        }
      }
    }
    return lines;
  }, []);

  return (
    <div id="map-section" className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="font-display font-semibold text-slate-800 flex items-center gap-2 text-lg">
            <Compass className="w-5 h-5 text-mu-green" />
            Peta Sebaran Aset Tanah Muhammadiyah Kajen
          </h3>
          <p className="text-xs text-slate-500">
            Kecamatan Kajen, Kabupaten Pekalongan • {PREDEFINED_PRMS.length} Ranting (PRM)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-slate-200 p-0.5 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => { setViewMode('ranting'); setSelectedPinAsset(null); }}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'ranting' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Fokus Ranting
            </button>
            <button
              onClick={() => setViewMode('aset')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'aset' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Titik Aset ({assets.length})
            </button>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
              title="Zoom In" 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
              title="Zoom Out" 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* SVG Map Container */}
        <div className="lg:col-span-8 bg-slate-950 p-6 relative flex items-center justify-center min-h-[460px] overflow-hidden select-none">
          {/* Compass Rose */}
          <div className="absolute top-4 right-4 text-slate-700 pointer-events-none flex flex-col items-center">
            <Compass className="w-8 h-8 animate-pulse text-slate-800" />
            <span className="text-[10px] font-mono font-bold mt-1">U</span>
          </div>

          <div 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}
            className="relative w-full max-w-[550px] aspect-[550/450]"
          >
            <svg 
              viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
              className="w-full h-full text-slate-400"
            >
              {/* Grid Lines for technical styling */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
              
              {/* Background ambient glow centered around Kajen Kota */}
              {(() => {
                const center = getXY(-6.9947, 109.5786);
                return (
                  <circle 
                    cx={center.x} 
                    cy={center.y} 
                    r="250" 
                    fill="url(#mapGlow)" 
                    className="pointer-events-none"
                  />
                );
              })()}

              {/* Geographic Contour Guide lines (subtle lines connecting PRMs) */}
              <g className="opacity-40">
                {networkLines.map(line => (
                  <line
                    key={line.key}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke="#1E293B"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                ))}
              </g>

              {/* PRM Ranting Circles (Fokus Ranting Mode) */}
              {viewMode === 'ranting' && PREDEFINED_PRMS.map(prm => {
                const { x, y } = getXY(prm.latitude, prm.longitude);
                const info = assetsByRanting[prm.name] || { count: 0, totalLuas: 0 };
                const isSelected = selectedRanting === prm.name;
                
                // Circle size proportional to asset count (base 6, add up to 20 px)
                const radius = Math.min(8 + info.count * 2.5, 24);
                
                return (
                  <g 
                    key={prm.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      onSelectRanting(isSelected ? null : prm.name);
                    }}
                    onMouseEnter={() => setHoveredPRM(prm)}
                    onMouseLeave={() => setHoveredPRM(null)}
                  >
                    {/* Ring outer shadow animation */}
                    {info.count > 0 && (
                      <circle
                        cx={x}
                        cy={y}
                        r={radius + 6}
                        fill="none"
                        stroke={prm.color}
                        strokeWidth="1.5"
                        className="opacity-20 animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {/* Outer glow ring when hovered or selected */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 4}
                      fill="none"
                      stroke={prm.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className={`transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                    />

                    {/* Solid center circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={isSelected ? prm.color : '#0F172A'}
                      stroke={prm.color}
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />

                    {/* Asset count badge inside node */}
                    {info.count > 0 && (
                      <text
                        x={x}
                        y={y + 3.5}
                        textAnchor="middle"
                        fill={isSelected ? '#000' : '#FFF'}
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none font-mono"
                      >
                        {info.count}
                      </text>
                    )}

                    {/* Village label */}
                    <text
                      x={x}
                      y={y - radius - 6}
                      textAnchor="middle"
                      fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                      fontSize="9.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none select-none font-sans transition-all duration-300 bg-slate-900 group-hover:text-slate-100"
                    >
                      {prm.name.replace('PRM ', '')}
                    </text>
                  </g>
                );
              })}

              {/* Individual Assets Pins (Titik Aset Mode) */}
              {viewMode === 'aset' && assets.map((asset) => {
                const { x, y } = getXY(asset.latitude, asset.longitude);
                const isSelected = selectedPinAsset?.id === asset.id;

                // Color based on peruntukan
                let pinColor = '#EF4444'; // default red
                if (asset.peruntukan.includes('Masjid') || asset.peruntukan.includes('Musholla')) pinColor = '#10B981'; // green
                else if (asset.peruntukan.includes('Sekolah') || asset.peruntukan.includes('TK')) pinColor = '#3B82F6'; // blue
                else if (asset.peruntukan.includes('Kantor')) pinColor = '#F59E0B'; // orange
                else if (asset.peruntukan.includes('Panti') || asset.peruntukan.includes('Amal')) pinColor = '#EC4899'; // pink
                else if (asset.peruntukan.includes('Lahan') || asset.peruntukan.includes('Pertanian')) pinColor = '#84CC16'; // lime

                return (
                  <g
                    key={asset.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedPinAsset(isSelected ? null : asset);
                    }}
                  >
                    {/* Ring animation for selected asset pin */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill="none"
                        stroke={pinColor}
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Pin Outer Shape */}
                    <path
                      d={`M ${x} ${y} C ${x - 5} ${y - 5} ${x - 7} ${y - 12} ${x} ${y - 17} C ${x + 7} ${y - 12} ${x + 5} ${y - 5} ${x} ${y}`}
                      fill={pinColor}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      className="transition-transform duration-300 transform origin-bottom group-hover:scale-125"
                    />

                    {/* Pin Inner Dot */}
                    <circle
                      cx={x}
                      cy={y - 10}
                      r="2"
                      fill="#FFFFFF"
                    />

                    {/* Small text label on hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <rect
                        x={x + 10}
                        y={y - 25}
                        width="140"
                        height="20"
                        rx="4"
                        fill="#0F172A"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x={x + 16}
                        y={y - 12}
                        fill="#F8FAFC"
                        fontSize="8.5"
                        fontWeight="semibold"
                      >
                        {asset.namaAset.length > 24 ? asset.namaAset.substring(0, 22) + '...' : asset.namaAset}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Info Box for map modes */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 max-w-[200px] pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-mu-green" />
              Petunjuk Peta
            </span>
            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
              {viewMode === 'ranting' 
                ? "Klik lingkaran Ranting (PRM) untuk menyaring daftar aset di bawah." 
                : "Klik ikon pin lokasi aset untuk melihat rincian cepat aset tanah."}
            </p>
          </div>
        </div>

        {/* Info Panel / Right Sidebar */}
        <div className="lg:col-span-4 p-5 bg-slate-50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-semibold text-slate-700 text-sm tracking-wide uppercase">
                {viewMode === 'ranting' ? 'INFORMASI RANTING' : 'INFORMASI DETAIL PIN'}
              </h4>
              {(selectedRanting || selectedPinAsset) && (
                <button
                  onClick={() => {
                    onSelectRanting(null);
                    setSelectedPinAsset(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  Reset Filter
                </button>
              )}
            </div>

            {/* Ranting Mode Content */}
            {viewMode === 'ranting' && (
              <div>
                {selectedRanting ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 transition-all">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></div>
                      <h5 className="font-display font-bold text-slate-800 text-base">{selectedRanting}</h5>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-600">
                      <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-slate-500">Jumlah Lokasi Aset</span>
                        <span className="font-bold text-slate-800">
                          {assetsByRanting[selectedRanting]?.count || 0} Bidang Tanah
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-slate-500">Total Luas</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {(assetsByRanting[selectedRanting]?.totalLuas || 0).toLocaleString('id-ID')} m²
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-500 block mb-1">Daftar Aset di Ranting ini:</span>
                        {assetsByRanting[selectedRanting]?.items.length === 0 ? (
                          <span className="italic text-slate-400">Belum ada aset tanah yang terdata.</span>
                        ) : (
                          <ul className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {assetsByRanting[selectedRanting]?.items.map((item) => (
                              <li key={item.id} className="p-1.5 bg-white rounded border border-emerald-100 hover:bg-emerald-100/50 transition truncate font-medium text-slate-700">
                                • {item.namaAset} ({item.luas} m²)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ) : hoveredPRM ? (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 transition-all">
                    <h5 className="font-display font-bold text-slate-800 text-base mb-2">{hoveredPRM.name}</h5>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Aset Tanah</span>
                        <span className="font-bold text-slate-800">
                          {assetsByRanting[hoveredPRM.name]?.count || 0} Bidang
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Luas</span>
                        <span className="font-bold text-slate-800">
                          {(assetsByRanting[hoveredPRM.name]?.totalLuas || 0).toLocaleString('id-ID')} m²
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 italic">
                        Koordinat: {hoveredPRM.latitude.toFixed(4)}, {hoveredPRM.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-bounce" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Sorot ranting di peta atau pilih dari dropdown di bawah untuk melihat rincian aset per ranting.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Individual Assets Mode Content */}
            {viewMode === 'aset' && (
              <div>
                {selectedPinAsset ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] rounded-full font-bold">
                        {selectedPinAsset.kodeAset}
                      </span>
                      <h5 className="font-display font-bold text-slate-800 text-base mt-1.5 leading-snug">
                        {selectedPinAsset.namaAset}
                      </h5>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 block">Ranting (Desa)</span>
                        <span className="font-semibold text-slate-800">{selectedPinAsset.ranting}</span>
                      </div>
                      <div className="pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 block">Luas Tanah</span>
                        <span className="font-bold text-slate-800 text-sm">{selectedPinAsset.luas.toLocaleString('id-ID')} m²</span>
                      </div>
                      <div className="pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 block">Peruntukan</span>
                        <span className="font-semibold text-slate-800">{selectedPinAsset.peruntukan}</span>
                      </div>
                      <div className="pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 block">Pengelola</span>
                        <span className="font-semibold text-slate-800">{selectedPinAsset.pengelola}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Alamat</span>
                        <p className="text-slate-700 leading-normal line-clamp-2">{selectedPinAsset.alamat}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-pulse" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Klik salah satu pin lokasi di peta untuk melihat rincian lengkap aset tersebut secara langsung.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Summary Numbers */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1.5">
              Rangkuman Aset Kajen
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Aset Terdata</span>
                <span className="text-lg font-bold text-slate-800">{assets.length}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Total Luas</span>
                <span className="text-base font-bold text-mu-green">
                  {assets.reduce((sum, item) => sum + item.luas, 0).toLocaleString('id-ID')} m²
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
