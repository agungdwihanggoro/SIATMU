import { useState } from 'react';
import { Database, Copy, Check, FileCode, Server, Download, FolderGit, Cpu, HelpCircle } from 'lucide-react';

export default function SQLViewer() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'sql' | 'mvc'>('sql');
  const [activeMvcSubTab, setActiveMvcSubTab] = useState<'db' | 'router' | 'model' | 'controller'>('db');

  const sqlDDL = `-- ==========================================
-- SKEMA DATABASE RELASIONAL (SQL DDL)
-- Sistem Informasi Aset Tanah Muhammadiyah Kajen
-- Platform: MySQL / MariaDB (XAMPP)
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

  const phpDatabase = `<?php
// config/database.php
class Database {
    private $host = "localhost";
    private $db_name = "siatmu_kajen";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                $this->username, 
                $this->password
            );
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}`;

  const phpRouter = `<?php
// index.php (Front Controller & Router)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'models/User.php';
require_once 'models/Asset.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/AssetController.php';

$db = (new Database())->getConnection();
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/siatmu_kajen'; // Sesuaikan folder XAMPP htdocs Anda

// Bersihkan URI dari base path
$route = str_replace($base_path, '', $request_uri);
$route = explode('?', $route)[0]; // hilangkan query parameters

// Sederhanakan Routing API
if (preg_match('/^\\/api\\/assets\\/([a-zA-Z0-9-]+)$/', $route, $matches)) {
    $assetId = $matches[1];
    $controller = new AssetController($db);
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $controller->delete($assetId);
    } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $controller->update($assetId);
    }
} else if ($route === '/api/assets') {
    $controller = new AssetController($db);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $controller->getAll();
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->create();
    }
} else if ($route === '/api/auth/login') {
    $controller = new AuthController($db);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->login();
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint tidak ditemukan."]);
}`;

  const phpModel = `<?php
// models/Asset.php
class Asset {
    private $conn;
    private $table_name = "assets";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id, kode_aset, nama_aset, alamat, luas, pewakif, status, no_sertifikat, 
                   tanggal_sertifikat, peruntukan, pengelola, ranting, latitude, longitude, 
                   dokumen_nama, dokumen_base64, created_by) 
                  VALUES 
                  (:id, :kode_aset, :nama_aset, :alamat, :luas, :pewakif, :status, :no_sertifikat, 
                   :tanggal_sertifikat, :peruntukan, :pengelola, :ranting, :latitude, :longitude, 
                   :dokumen_nama, :dokumen_base64, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($data);
    }
}`;

  const phpController = `<?php
// controllers/AssetController.php
class AssetController {
    private $db;
    private $asset;

    public function __construct($db) {
        $this->db = $db;
        $this->asset = new Asset($db);
    }

    public function getAll() {
        $assets = $this->asset->readAll();
        http_response_code(200);
        echo json_encode($assets);
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['nama_aset']) || empty($data['luas'])) {
            http_response_code(400);
            echo json_encode(["message" => "Data tidak lengkap."]);
            return;
        }

        $id = 'ast-' . bin2hex(random_bytes(4));
        $assetData = [
            ':id' => $id,
            ':kode_aset' => 'AST-PCM-' . str_pad(rand(10,999), 3, '0', STR_PAD_LEFT),
            ':nama_aset' => $data['nama_aset'],
            ':alamat' => $data['alamat'] ?? '',
            ':luas' => (int)$data['luas'],
            ':pewakif' => $data['pewakif'] ?? '',
            ':status' => $data['status'] ?? 'Wakaf',
            ':no_sertifikat' => $data['no_sertifikat'] ?? '',
            ':tanggal_sertifikat' => $data['tanggal_sertifikat'] ?? null,
            ':peruntukan' => $data['peruntukan'] ?? 'Lainnya',
            ':pengelola' => $data['pengelola'] ?? 'PCM Kajen',
            ':ranting' => $data['ranting'] ?? 'Kajen Kota',
            ':latitude' => $data['latitude'] ?? -6.9947,
            ':longitude' => $data['longitude'] ?? 109.5786,
            ':dokumen_nama' => $data['dokumen_nama'] ?? null,
            ':dokumen_base64' => $data['dokumen_base64'] ?? null,
            ':created_by' => $data['created_by'] ?? 'admin'
        ];

        if ($this->asset->create($assetData)) {
            http_response_code(201);
            echo json_encode(["message" => "Aset berhasil ditambahkan.", "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal menambahkan aset."]);
        }
    }
}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCodeContent = () => {
    if (activeMvcSubTab === 'db') return phpDatabase;
    if (activeMvcSubTab === 'router') return phpRouter;
    if (activeMvcSubTab === 'model') return phpModel;
    return phpController;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
      {/* Tab Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-emerald-700" />
            Integrasi & Ekspor PHP MVC Murni (XAMPP)
          </h3>
          <p className="text-xs text-slate-500">
            Arsitektur backend MVC berbasis PHP murni yang sangat mudah diterapkan di Windows XAMPP. Tanpa perlu setup framework berat.
          </p>
        </div>

        {/* Export Download Button */}
        <a
          href="/api/export/native-php"
          download
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/10 hover:shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4 animate-bounce" />
          Unduh File ZIP Backend PHP MVC (.ZIP)
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
          onClick={() => setActiveMainTab('mvc')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeMainTab === 'mvc' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          <Server className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          2. Kode PHP MVC (Sederhana & Terstruktur)
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

      {/* PHP MVC Tab Panels */}
      {activeMainTab === 'mvc' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMvcSubTab('db')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMvcSubTab === 'db' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              config/database.php
            </button>
            <button
              onClick={() => setActiveMvcSubTab('router')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMvcSubTab === 'router' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              index.php (Router)
            </button>
            <button
              onClick={() => setActiveMvcSubTab('model')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMvcSubTab === 'model' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              models/Asset.php
            </button>
            <button
              onClick={() => setActiveMvcSubTab('controller')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMvcSubTab === 'controller' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              controllers/AssetController.php
            </button>
          </div>

          <div className="space-y-2 flex flex-col">
            <div className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-t-xl border border-slate-200 border-b-0">
              <span className="text-xs font-mono font-bold text-slate-700">
                {activeMvcSubTab === 'db' && 'config/database.php'}
                {activeMvcSubTab === 'router' && 'index.php'}
                {activeMvcSubTab === 'model' && 'models/Asset.php'}
                {activeMvcSubTab === 'controller' && 'controllers/AssetController.php'}
              </span>
              <button
                onClick={() => copyToClipboard(activeCodeContent(), activeMvcSubTab)}
                className="px-2.5 py-1 text-[10px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied === activeMvcSubTab ? (
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

      {/* Interactive, Super-Detailed Guide Section */}
      <div className="p-6 bg-emerald-50/70 border border-emerald-100/80 rounded-2xl text-slate-700 space-y-4">
        <strong className="flex items-center gap-2 text-emerald-900 text-sm font-display font-extrabold">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          Panduan Langkah Demi Langkah Deploy ke XAMPP Windows
        </strong>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          {/* Bagian Backend */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
              <span className="bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
              Langkah Setup Backend & Database di XAMPP
            </h4>
            <ol className="list-decimal pl-4.5 space-y-2 text-slate-600">
              <li>
                <strong>Nyalakan XAMPP:</strong> Buka XAMPP Control Panel di Windows Anda, lalu klik tombol <strong>Start</strong> pada modul <strong>Apache</strong> dan <strong>MySQL</strong>.
              </li>
              <li>
                <strong>Buat Folder Baru:</strong> Pergi ke folder instalasi XAMPP Anda (biasanya di <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">C:\xampp\htdocs</code>) dan buat folder baru bernama <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold font-mono">siatmu_kajen</code>.
              </li>
              <li>
                <strong>Ekstrak ZIP Backend:</strong> Klik tombol <strong>"Unduh File ZIP Backend PHP MVC"</strong> di kanan atas halaman ini. Ekstrak seluruh isi file ZIP tersebut langsung ke dalam folder <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">C:\xampp\htdocs\siatmu_kajen</code>.
              </li>
              <li>
                <strong>Buat Database di phpMyAdmin:</strong> Buka browser Anda dan akses <a href="http://localhost/phpmyadmin" target="_blank" className="text-emerald-700 underline hover:text-emerald-900 font-bold">localhost/phpmyadmin</a>. Buat database baru dengan nama <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold font-mono">siatmu_kajen</code>.
              </li>
              <li>
                <strong>Impor File SQL:</strong> Klik menu <strong>Import</strong> di phpMyAdmin, pilih file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">database.sql</code> yang ada di dalam folder ekstraksi tadi, lalu klik tombol <strong>Import/Go</strong> di bagian bawah.
              </li>
            </ol>
          </div>

          {/* Bagian Frontend */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
              <span className="bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
              Langkah Kompilasi & Gabung Frontend React
            </h4>
            <ol className="list-decimal pl-4.5 space-y-2 text-slate-600">
              <li>
                <strong>Buka Project React Lokal:</strong> Pastikan Anda telah mengunduh/clone folder kode React ini ke komputer lokal Anda. Buka terminal (CMD / Git Bash) di folder tersebut.
              </li>
              <li>
                <strong>Sesuaikan Endpoint API:</strong> Sebelum kompilasi, pastikan kode React memanggil API ke localhost XAMPP Anda. Cari file pemanggilan API Anda (biasanya diatur ke <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">http://localhost/siatmu_kajen</code>).
              </li>
              <li>
                <strong>Jalankan Proses Build / Kompilasi:</strong> Di dalam terminal Anda, jalankan perintah:
                <pre className="bg-slate-900 text-slate-200 p-2 rounded-lg mt-1 font-mono text-[10px] select-all">npm run build</pre>
                Perintah ini akan secara otomatis membuat folder baru bernama <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-rose-600 font-bold">dist</code> yang berisi file-file HTML, CSS, dan JS yang sudah terkompresi.
              </li>
              <li>
                <strong>Salin Hasil Build ke htdocs:</strong> Salin (copy) seluruh file & folder di dalam folder <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dist</code> tersebut, kemudian paste langsung ke dalam folder <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">C:\xampp\htdocs\siatmu_kajen</code>.
              </li>
              <li>
                <strong>Aplikasi Siap Digunakan!</strong> Sekarang buka browser Anda dan ketik alamat <a href="http://localhost/siatmu_kajen" target="_blank" className="text-emerald-700 underline hover:text-emerald-900 font-bold">http://localhost/siatmu_kajen</a>. Aplikasi pendataan aset tanah siap dijalankan secara offline sepenuhnya!
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-emerald-800 text-white p-3 rounded-xl text-[11px] flex items-center justify-between gap-3 font-medium">
          <span>💡 <strong>Informasi Tambahan:</strong> File ZIP yang diunduh sudah menyertakan sistem login admin/petugas, enkripsi password PHP yang aman (<code className="font-mono">password_hash</code>), pembagian hak akses, input data lengkap dengan koordinat peta, dan generator laporan Excel/PDF!</span>
        </div>
      </div>
    </div>
  );
}
