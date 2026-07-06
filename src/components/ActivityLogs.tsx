import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { History, Search, RefreshCw, Clock, User } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.activity.toLowerCase().includes(search.toLowerCase()) ||
    log.detail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-mu-green" />
            Log Aktivitas & Audit Jejak Sistem
          </h3>
          <p className="text-xs text-slate-500">
            Catatan kronologis tindakan penginputan dan pengubahan data oleh petugas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar inside audit logs */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>

          <button 
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition border border-slate-200 text-slate-600 disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 italic text-xs">
          Tidak ada catatan aktivitas pengubahan data yang terekam.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-100 hover:bg-emerald-50/10 transition"
            >
              {/* Icon / Avatar */}
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs uppercase">
                {log.username.substring(0, 2)}
              </div>

              {/* Log text */}
              <div className="flex-1 space-y-0.5 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    {log.activity}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{log.detail}</p>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <User className="w-3 h-3" />
                  Operator: <span className="font-mono text-emerald-800">{log.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
