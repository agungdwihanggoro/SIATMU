import { useState } from 'react';
import { Database, Copy, Check, FileCode, Server, Download, FolderGit, Cpu } from 'lucide-react';

export default function SQLViewer() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'sql' | 'ci4'>('sql');
  const [activeCiSubTab, setActiveCiSubTab] = useState<'db' | 'model' | 'controller' | 'routes'>('db');

  const sqlDDL = `-- ==========================================
-- SKEMA DATABASE RELASIONAL (SQL DDL)
-- Sistem Informasi Aset Tanah Muhammadiyah Kajen
-- Platform: MySQL / MariaDB / PostgreSQL
-- ==========================================

-- 1. Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin', 'petugas') NOT NULL DEFAULT 'petugas',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Aset Tanah (Assets)
CREATE TABLE IF NOT EXISTS \`assets\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`kode_aset\` VARCHAR(30) NOT NULL UNIQUE,
  \`nama_aset\` VARCHAR(255) NOT NULL,
  \`alamat\` TEXT,
  \`luas\` INT NOT NULL,
  \`pewakif\` VARCHAR(150),
  \`status\` VARCHAR(100) NOT NULL,
  \`no_sertifikat\` VARCHAR(100),
  \`tanggal_sertifikat\` DATE,
  \`peruntukan\` VARCHAR(100) NOT NULL,
  \`pengelola\` VARCHAR(100) NOT NULL,
  \`ranting\` VARCHAR(100) NOT NULL,
  \`latitude\` DECIMAL(10, 8) DEFAULT -6.99470000,
  \`longitude\` DECIMAL(11, 8) DEFAULT 109.57860000,
  \`dokumen_nama\` VARCHAR(255) DEFAULT NULL,
  \`dokumen_base64\` LONGTEXT DEFAULT NULL, -- Berkas sertifikat digital (PDF/Gambar)
  \`created_by\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`username\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Log Aktivitas (Activity Logs)
CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL,
  \`activity\` VARCHAR(100) NOT NULL,
  \`detail\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const sqlDML = `-- ==========================================
-- SEED DATA AWAL (SQL DML)
-- Data Awal Aset Tanah Muhammadiyah Kajen
-- ==========================================

-- Seed Tabel Pengguna (Admin & Petugas)
-- Password Default: 'admin123' untuk admin, 'kajen123' untuk petugas
INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`full_name\`, \`role\`) VALUES 
('usr-admin', 'admin', '$2y$10$SXt.3NfK69970/17f8UlyuUvFWhu86vG5h741G40q8l3l6l193108', 'Administrator SIAT-MU', 'admin'),
('usr-petugas', 'petugas', '$2y$10$E9x8R1uY75369/08r2UlyuPvGWhu54vK9h641G30q5l2l5l182045', 'H. M. Syakir (Petugas Wakaf Kajen)', 'petugas');

-- Seed Tabel Aset Tanah
INSERT INTO \`assets\` (\`id\`, \`kode_aset\`, \`nama_aset\`, \`alamat\`, \`luas\`, \`pewakif\`, \`status\`, \`no_sertifikat\`, \`tanggal_sertifikat\`, \`peruntukan\`, \`pengelola\`, \`ranting\`, \`latitude\`, \`longitude\`, \`created_by\`) VALUES
('ast-1', 'AST-PCM-001', 'Pusat Dakwah Muhammadiyah (Gedung Dakwah PCM Kajen)', 'Jl. Pahlawan No. 10, Kajen Kota', 1200, 'Keluarga H. Abdul Hamid', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0004', '2012-05-14', 'Kantor Organisasi (PCM/PRM/Ortom)', 'PCM Kajen', 'PRM Kajen Kota', -6.994700, 109.578600, 'admin'),
('ast-2', 'AST-PCM-002', 'Gedung Utama SD Muhammadiyah Gejlig', 'Jl. Raya Gejlig, Desa Gejlig, Kec. Kajen', 1850, 'Hj. Siti Aisyah', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0012', '2015-08-22', 'Gedung Sekolah / Madrasah / TK ABA', 'Majelis Dikdasmen PCM Kajen', 'PRM Gejlig', -6.980500, 109.585200, 'admin'),
('ast-3', 'AST-PCM-003', 'Masjid Al-Muttaqin Rowolaku & Madrasah Diniyah', 'Dusun Rowolaku RT 03/RW 01, Desa Rowolaku', 650, 'K.H. Ahmad Dahlan (Wakaf Keluarga)', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0035', '2018-11-05', 'Masjid / Musholla', 'Takmir Masjid / Musholla', 'PRM Rowolaku', -7.012500, 109.593000, 'petugas');`;

  const ciDatabase = `<?php

namespace Config;

use CodeIgniter\\Database\\Config;

class Database extends Config
{
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;
    public string $defaultGroup = 'default';

    public array $default = [
        'DSN'          => '',
        'hostname'     => 'localhost',
        'username'     => 'root',
        'password'     => '',
        'database'     => 'siatmu_kajen',
        'DBDriver'     => 'MySQLi',
        'DBPrefix'     => '',
        'pConnect'     => false,
        'DBDebug'      => true,
        'charset'      => 'utf8mb4',
        'DBCollat'     => 'utf8mb4_general_ci',
        'swapPre'      => '',
        'encrypt'      => false,
        'compress'     => false,
        'strictOn'     => false,
        'failover'     => [],
        'port'         => 3306,
        'numberNative' => false,
    ];
}`;

  const ciModel = `<?php

namespace App\\Models;

use CodeIgniter\\Model;

class AssetModel extends Model
{
    protected $table            = 'assets';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'id', 'kode_aset', 'nama_aset', 'alamat', 'luas', 'pewakif', 
        'status', 'no_sertifikat', 'tanggal_sertifikat', 'peruntukan', 
        'pengelola', 'ranting', 'latitude', 'longitude', 'dokumen_nama', 
        'dokumen_base64', 'created_by', 'created_at'
    ];
}`;

  const ciController = `<?php

namespace App\\Controllers;

use App\\Models\\AssetModel;
use App\\Models\\UserModel;
use CodeIgniter\\RESTful\\ResourceController;

class Assets extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $model = new AssetModel();
        return $this->respond($model->orderBy('created_at', 'DESC')->findAll());
    }

    public function create()
    {
        $input = $this->request->getJSON(true);
        $model = new AssetModel();
        
        $id = 'ast-' . bin2hex(random_bytes(4));
        $assetData = [
            'id'            => $id,
            'kode_aset'     => 'AST-PCM-' . str_pad($model->countAllResults() + 1, 3, '0', STR_PAD_LEFT),
            'nama_aset'     => $input['namaAset'] ?? '',
            'luas'          => (int)($input['luas'] ?? 0),
            'status'        => $input['status'] ?? '',
            'created_by'    => $input['username'] ?? 'admin',
            'created_at'    => date('Y-m-d H:i:s'),
        ];

        $model->insert($assetData);
        return $this->respondCreated($assetData);
    }
}`;

  const ciRoutes = `<?php

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->group('api', function($routes) {
    $routes->get('assets', 'Assets::index');
    $routes->post('assets', 'Assets::create');
    $routes->put('assets/(:any)', 'Assets::update/$1');
    $routes->delete('assets/(:any)', 'Assets::delete/$1');
});`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCodeContent = () => {
    if (activeCiSubTab === 'db') return ciDatabase;
    if (activeCiSubTab === 'model') return ciModel;
    if (activeCiSubTab === 'controller') return ciController;
    return ciRoutes;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
      {/* Tab Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-emerald-700" />
            Integrasi & Ekspor CodeIgniter 4 (PHP)
          </h3>
          <p className="text-xs text-slate-500">
            Skema basis data relasional SQL dan kode generator backend lengkap siap pakai untuk framework CodeIgniter 4.
          </p>
        </div>

        {/* Export Download Button */}
        <a
          href="/api/export/codeigniter"
          download
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/10 hover:shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4 animate-bounce" />
          Unduh CodeIgniter 4 Backend (.ZIP)
        </a>
      </div>

      {/* Main Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-100 pb-0.5">
        <button
          onClick={() => setActiveMainTab('sql')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeMainTab === 'sql' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          <FileCode className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          1. Skema Database SQL
        </button>
        <button
          onClick={() => setActiveMainTab('ci4')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeMainTab === 'ci4' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          <Server className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          2. Kode Backend CodeIgniter 4 (PHP)
        </button>
      </div>

      {/* SQL Tab Panels */}
      {activeMainTab === 'sql' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DDL Schema */}
            <div className="space-y-2 flex flex-col h-[380px]">
              <div className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-t-xl border border-slate-200 border-b-0">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-700" />
                  Skema DDL (Tabel MySQL)
                </span>
                <button
                  onClick={() => copyToClipboard(sqlDDL, 'ddl')}
                  className="px-2.5 py-1 text-[10px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied === 'ddl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="flex-1 bg-slate-950 text-slate-300 p-4 rounded-b-xl overflow-auto font-mono text-[11px] leading-relaxed border border-slate-900 shadow-inner">
                {sqlDDL}
              </pre>
            </div>

            {/* DML Seeds */}
            <div className="space-y-2 flex flex-col h-[380px]">
              <div className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-t-xl border border-slate-200 border-b-0">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FolderGit className="w-4 h-4 text-emerald-700" />
                  Data Awal (SQL Seeds)
                </span>
                <button
                  onClick={() => copyToClipboard(sqlDML, 'dml')}
                  className="px-2.5 py-1 text-[10px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copied === 'dml' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="flex-1 bg-slate-950 text-slate-300 p-4 rounded-b-xl overflow-auto font-mono text-[11px] leading-relaxed border border-slate-900 shadow-inner">
                {sqlDML}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* CodeIgniter Tab Panels */}
      {activeMainTab === 'ci4' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveCiSubTab('db')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeCiSubTab === 'db' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Config/Database.php
            </button>
            <button
              onClick={() => setActiveCiSubTab('model')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeCiSubTab === 'model' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Models/AssetModel.php
            </button>
            <button
              onClick={() => setActiveCiSubTab('controller')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeCiSubTab === 'controller' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Controllers/Assets.php
            </button>
            <button
              onClick={() => setActiveCiSubTab('routes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeCiSubTab === 'routes' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Config/Routes.php
            </button>
          </div>

          <div className="space-y-2 flex flex-col">
            <div className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-t-xl border border-slate-200 border-b-0">
              <span className="text-xs font-mono font-bold text-slate-700">
                {activeCiSubTab === 'db' && 'app/Config/Database.php'}
                {activeCiSubTab === 'model' && 'app/Models/AssetModel.php'}
                {activeCiSubTab === 'controller' && 'app/Controllers/Assets.php'}
                {activeCiSubTab === 'routes' && 'app/Config/Routes.php'}
              </span>
              <button
                onClick={() => copyToClipboard(activeCodeContent(), activeCiSubTab)}
                className="px-2.5 py-1 text-[10px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied === activeCiSubTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Kode PHP
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-300 p-4 rounded-b-xl overflow-auto font-mono text-[11px] leading-relaxed border border-slate-900 max-h-[400px] shadow-inner">
              {activeCodeContent()}
            </pre>
          </div>
        </div>
      )}

      {/* Guide Card */}
      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-950 text-xs leading-relaxed space-y-2">
        <strong className="flex items-center gap-1.5 text-emerald-900 text-sm">
          <Download className="w-4 h-4 text-emerald-700 animate-bounce" />
          Cara Menggunakan File Ekspor CodeIgniter 4
        </strong>
        <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-xs">
          <li>Klik tombol <b>"Unduh CodeIgniter 4 Backend (.ZIP)"</b> di kanan atas halaman ini.</li>
          <li>Ekstrak isi berkas ZIP ke dalam direktori dasar proyek CodeIgniter 4 Anda.</li>
          <li>Impor file <code>database.sql</code> yang disertakan di dalam file zip ke dalam phpMyAdmin Anda (dengan nama database: <code>siatmu_kajen</code>).</li>
          <li>Konfigurasi koneksi database Anda di <code>app/Config/Database.php</code>.</li>
          <li>Jalankan server CodeIgniter Anda dengan perintah <code>php spark serve</code>.</li>
        </ol>
      </div>
    </div>
  );
}
