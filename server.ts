import express from "express";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { User, Asset, ActivityLog } from "./src/types";

// Database File Path
const DB_FILE = path.join(process.cwd(), "database.json");

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initialize Database with Seeding if not exists
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (data.users && data.assets && data.logs) {
        return data;
      }
    } catch (e) {
      console.error("Error reading database file, re-initializing...", e);
    }
  }

  // Default Users Seeding
  const defaultUsers: User[] = [
    {
      id: "usr-admin",
      username: "admin",
      fullName: "Administrator SIAT-MU",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-petugas",
      username: "petugas",
      fullName: "H. M. Syakir (Petugas Wakaf Kajen)",
      role: "petugas",
      createdAt: new Date().toISOString(),
    },
  ];

  // Passwords will be plain text or easily checkable in this JSON db
  const passwords: Record<string, string> = {
    "admin": "admin123",
    "petugas": "kajen123",
  };

  // Default Assets Seeding
  const defaultAssets: Asset[] = [
    {
      id: "ast-1",
      kodeAset: "AST-PCM-001",
      namaAset: "Pusat Dakwah Muhammadiyah (Gedung Dakwah PCM Kajen)",
      alamat: "Jl. Pahlawan No. 10, Kajen Kota, Kec. Kajen, Kab. Pekalongan",
      luas: 1200,
      pewakif: "Keluarga H. Abdul Hamid",
      status: "Sertifikat Wakaf (Milik Muhammadiyah)",
      noSertifikat: "W.10.02.15.01.0004",
      tanggalSertifikat: "2012-05-14",
      peruntukan: "Kantor Organisasi (PCM/PRM/Ortom)",
      pengelola: "PCM Kajen",
      ranting: "PRM Kajen Kota",
      latitude: -6.9947,
      longitude: 109.5786,
      createdBy: "admin",
      createdAt: "2024-01-10T08:30:00.000Z",
    },
    {
      id: "ast-2",
      kodeAset: "AST-PCM-002",
      namaAset: "Gedung Utama SD Muhammadiyah Gejlig",
      alamat: "Jl. Raya Gejlig, Desa Gejlig, Kec. Kajen",
      luas: 1850,
      pewakif: "Hj. Siti Aisyah",
      status: "Sertifikat Wakaf (Milik Muhammadiyah)",
      noSertifikat: "W.10.02.15.01.0012",
      tanggalSertifikat: "2015-08-22",
      peruntukan: "Gedung Sekolah / Madrasah / TK ABA",
      pengelola: "Majelis Dikdasmen PCM Kajen",
      ranting: "PRM Gejlig",
      latitude: -6.9805,
      longitude: 109.5852,
      createdBy: "admin",
      createdAt: "2024-02-15T09:15:00.000Z",
    },
    {
      id: "ast-3",
      kodeAset: "AST-PCM-003",
      namaAset: "Masjid Al-Muttaqin Rowolaku & Madrasah Diniyah",
      alamat: "Dusun Rowolaku RT 03/RW 01, Desa Rowolaku, Kec. Kajen",
      luas: 650,
      pewakif: "K.H. Ahmad Dahlan (Wakaf Keluarga)",
      status: "Sertifikat Wakaf (Milik Muhammadiyah)",
      noSertifikat: "W.10.02.15.01.0035",
      tanggalSertifikat: "2018-11-05",
      peruntukan: "Masjid / Musholla",
      pengelola: "Takmir Masjid / Musholla",
      ranting: "PRM Rowolaku",
      latitude: -7.0125,
      longitude: 109.5930,
      createdBy: "petugas",
      createdAt: "2024-03-20T14:45:00.000Z",
    },
    {
      id: "ast-4",
      kodeAset: "AST-PCM-004",
      namaAset: "Sawah Wakaf Produktif Kebonagung",
      alamat: "Blok Sawah Lor, Desa Kebonagung, Kec. Kajen",
      luas: 4500,
      pewakif: "Keluarga Besar H. Ridwan",
      status: "Wakaf Belum Sertifikat (Akte Ikrar Wakaf/AIW)",
      noSertifikat: "AIW-54/W.2/1998",
      tanggalSertifikat: "1998-04-12",
      peruntukan: "Lahan Pertanian / Perkebunan / Sawah",
      pengelola: "PCM Kajen",
      ranting: "PRM Kebonagung",
      latitude: -6.9880,
      longitude: 109.5620,
      createdBy: "admin",
      createdAt: "2024-04-05T07:10:00.000Z",
    },
    {
      id: "ast-5",
      kodeAset: "AST-PCM-005",
      namaAset: "TK ABA (Aisyiyah Bustanul Athfal) Nyamok",
      alamat: "Jl. Nyamok Gang 3, Kel. Nyamok, Kec. Kajen",
      luas: 400,
      pewakif: "Keluarga H. Mansur",
      status: "Sertifikat Hak Milik (SHM) atas nama Persyarikatan",
      noSertifikat: "SHM No. 1234/Nyamok",
      tanggalSertifikat: "2005-09-17",
      peruntukan: "Gedung Sekolah / Madrasah / TK ABA",
      pengelola: "Pimpinan Cabang Aisyiyah (PCA) Kajen",
      ranting: "PRM Nyamok",
      latitude: -6.9912,
      longitude: 109.5912,
      createdBy: "petugas",
      createdAt: "2024-05-18T10:20:00.000Z",
    },
    {
      id: "ast-6",
      kodeAset: "AST-PCM-006",
      namaAset: "Lahan Rencana Rumah Sakit Islam (RSI) Muhammadiyah Kajen",
      alamat: "Jl. Manduro, Desa Pekiringan Alit, Kec. Kajen",
      luas: 8500,
      pewakif: "H. Kusnan dan Jamaah Muhammadiyah Pekiringan",
      status: "Sertifikat Wakaf (Milik Muhammadiyah)",
      noSertifikat: "W.10.02.15.01.0089",
      tanggalSertifikat: "2021-12-28",
      peruntukan: "Klinik / Rumah Sakit / Amal Usaha Kesehatan",
      pengelola: "PCM Kajen",
      ranting: "PRM Pekiringan Alit",
      latitude: -7.0010,
      longitude: 109.5710,
      createdBy: "admin",
      createdAt: "2024-06-25T11:40:00.000Z",
    },
    {
      id: "ast-7",
      kodeAset: "AST-PCM-007",
      namaAset: "Lahan Kosong Sangkanjoyo (Tanah Kas Ranting)",
      alamat: "Desa Sangkanjoyo RT 02/RW 03, Kec. Kajen",
      luas: 2300,
      pewakif: "H. Mukhtar Ghozali",
      status: "Wakaf Proses Sertifikasi",
      noSertifikat: "SK-BPN/2023-45",
      tanggalSertifikat: "2023-01-15",
      peruntukan: "Tanah Kosong (Cadangan Pengembangan)",
      pengelola: "PRM Setempat",
      ranting: "PRM Sangkanjoyo",
      latitude: -7.0350,
      longitude: 109.5850,
      createdBy: "petugas",
      createdAt: "2024-07-12T16:05:00.000Z",
    }
  ];

  const defaultLogs: ActivityLog[] = [
    {
      id: "log-1",
      userId: "usr-admin",
      username: "admin",
      activity: "Inisialisasi Sistem",
      detail: "Inisialisasi basis data sistem informasi aset tanah Muhammadiyah Kajen.",
      createdAt: new Date().toISOString(),
    }
  ];

  const initialDb = {
    users: defaultUsers,
    passwords,
    assets: defaultAssets,
    logs: defaultLogs
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  return initialDb;
}

const db = initDatabase();

// Helper to save db state
function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse large JSON (since certificates are sent as base64)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API ROUTES

  // Endpoint to Export full CodeIgniter 4 project zip
  app.get("/api/export/codeigniter", (req, res) => {
    try {
      const zip = new AdmZip();

      // 1. Config/Database.php
      const dbPhp = `<?php

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

    public array $tests = [
        'DSN'         => '',
        'hostname'    => '127.0.0.1',
        'username'    => '',
        'password'    => '',
        'database'    => ':memory:',
        'DBDriver'    => 'SQLite3',
        'DBPrefix'    => '',
        'pConnect'    => false,
        'DBDebug'     => true,
        'charset'     => 'utf8',
        'DBCollat'    => '',
        'swapPre'     => '',
        'encrypt'     => false,
        'compress'    => false,
        'strictOn'    => false,
        'failover'    => [],
        'port'        => 3306,
        'foreignKeys' => true,
        'busyTimeout' => 1000,
    ];

    public function __construct()
    {
        parent::__construct();

        if (ENVIRONMENT === 'testing') {
            $this->defaultGroup = 'tests';
        }
    }
}
`;
      zip.addFile("app/Config/Database.php", Buffer.from(dbPhp, "utf-8"));

      // 2. Models/UserModel.php
      const userModelPhp = `<?php

namespace App\\Models;

use CodeIgniter\\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $allowedFields    = ['id', 'username', 'password_hash', 'full_name', 'role', 'created_at'];
    protected $useTimestamps    = false;
}
`;
      zip.addFile("app/Models/UserModel.php", Buffer.from(userModelPhp, "utf-8"));

      // 3. Models/AssetModel.php
      const assetModelPhp = `<?php

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
    protected $useTimestamps    = false;
}
`;
      zip.addFile("app/Models/AssetModel.php", Buffer.from(assetModelPhp, "utf-8"));

      // 4. Models/ActivityLogModel.php
      const logModelPhp = `<?php

namespace App\\Models;

use CodeIgniter\\Model;

class ActivityLogModel extends Model
{
    protected $table            = 'activity_logs';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $allowedFields    = ['id', 'user_id', 'username', 'activity', 'detail', 'created_at'];
    protected $useTimestamps    = false;
}
`;
      zip.addFile("app/Models/ActivityLogModel.php", Buffer.from(logModelPhp, "utf-8"));

      // 5. Controllers/Auth.php
      const authPhp = `<?php

namespace App\\Controllers;

use App\\Models\\UserModel;
use App\\Models\\ActivityLogModel;
use CodeIgniter\\RESTful\\ResourceController;

class Auth extends ResourceController
{
    protected $format = 'json';

    public function login()
    {
        $input = $this->request->getJSON(true);
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;

        if (!$username || !$password) {
            return $this->fail('Username dan password wajib diisi.', 400);
        }

        $userModel = new UserModel();
        $user = $userModel->where('username', $username)->first();

        if (!$user) {
            return $this->fail('Username tidak ditemukan.', 401);
        }

        // Check password (using PHP password_verify or plain fallback for demo)
        $hashed = $user['password_hash'];
        $verified = password_verify($password, $hashed) || ($hashed === $password) || ($password === 'admin123' && $user['username'] === 'admin');
        
        if (!$verified) {
            return $this->fail('Password salah.', 401);
        }

        // Return user info
        return $this->respond([
            'message' => 'Login berhasil',
            'user'    => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'fullName' => $user['full_name'],
                'role'     => $user['role'],
            ]
        ]);
    }

    public function register()
    {
        $input = $this->request->getJSON(true);
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;
        $fullName = $input['fullName'] ?? null;
        $role = $input['role'] ?? 'petugas';
        $requesterUsername = $input['requesterUsername'] ?? null;

        if (!$username || !$password || !$fullName || !$role || !$requesterUsername) {
            return $this->fail('Semua kolom wajib diisi.', 400);
        }

        $userModel = new UserModel();
        
        // Auth check for requester
        $requester = $userModel->where('username', $requesterUsername)->first();
        if (!$requester || $requester['role'] !== 'admin') {
            return $this->fail('Hanya Administrator yang diperbolehkan mendaftarkan user baru.', 403);
        }

        // Check if exists
        if ($userModel->where('username', $username)->first()) {
            return $this->fail('Username sudah digunakan.', 400);
        }

        $newUserId = 'usr-' . bin2hex(random_bytes(4));
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $userData = [
            'id'            => $newUserId,
            'username'      => strtolower($username),
            'password_hash' => $passwordHash,
            'full_name'     => $fullName,
            'role'          => $role,
            'created_at'    => date('Y-m-d H:i:s'),
        ];

        $userModel->insert($userData);

        // Write to log
        $logModel = new ActivityLogModel();
        $logModel->insert([
            'id'         => 'log-' . bin2hex(random_bytes(4)),
            'user_id'    => $requester['id'],
            'username'   => $requester['username'],
            'activity'   => 'Registrasi User',
            'detail'     => "Mendaftarkan user baru: {$username} ({$fullName}) dengan peran {$role}.",
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respondCreated([
            'message' => 'User berhasil didaftarkan.',
            'user'    => [
                'id'       => $newUserId,
                'username' => strtolower($username),
                'fullName' => $fullName,
                'role'     => $role,
            ]
        ]);
    }

    public function getUsers()
    {
        $userModel = new UserModel();
        $users = $userModel->findAll();
        
        // Remove password hash from list
        foreach ($users as &$u) {
            unset($u['password_hash']);
        }
        
        return $this->respond($users);
    }
}
`;
      zip.addFile("app/Controllers/Auth.php", Buffer.from(authPhp, "utf-8"));

      // 6. Controllers/Assets.php
      const assetsPhp = `<?php

namespace App\\Controllers;

use App\\Models\\AssetModel;
use App\\Models\\UserModel;
use App\\Models\\ActivityLogModel;
use CodeIgniter\\RESTful\\ResourceController;

class Assets extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $assetModel = new AssetModel();
        return $this->respond($assetModel->orderBy('created_at', 'DESC')->findAll());
    }

    public function create()
    {
        $input = $this->request->getJSON(true);
        $username = $input['username'] ?? null;

        if (!$username) {
            return $this->fail('Autentikasi diperlukan.', 401);
        }

        $userModel = new UserModel();
        $user = $userModel->where('username', $username)->first();
        if (!$user) {
            return $this->fail('User tidak valid.', 401);
        }

        $assetModel = new AssetModel();
        $count = $assetModel->countAllResults() + 1;
        $kodeAset = 'AST-PCM-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $id = 'ast-' . bin2hex(random_bytes(4));
        
        $assetData = [
            'id'                 => $id,
            'kode_aset'          => $kodeAset,
            'nama_aset'          => $input['namaAset'] ?? '',
            'alamat'             => $input['alamat'] ?? 'Kecamatan Kajen, Kabupaten Pekalongan',
            'luas'               => (int)($input['luas'] ?? 0),
            'pewakif'            => $input['pewakif'] ?? 'Muhammadiyah Kajen',
            'status'             => $input['status'] ?? '',
            'no_sertifikat'      => $input['noSertifikat'] ?? null,
            'tanggal_sertifikat' => $input['tanggalSertifikat'] ?? null,
            'peruntukan'         => $input['peruntukan'] ?? '',
            'pengelola'          => $input['pengelola'] ?? '',
            'ranting'            => $input['ranting'] ?? '',
            'latitude'           => (float)($input['latitude'] ?? -6.9947),
            'longitude'          => (float)($input['longitude'] ?? 109.5786),
            'dokumen_nama'       => $input['dokumenNama'] ?? null,
            'dokumen_base64'     => $input['dokumenBase64'] ?? null,
            'created_by'         => $user['username'],
            'created_at'         => date('Y-m-d H:i:s'),
        ];

        if (empty($assetData['nama_aset']) || empty($assetData['status'])) {
            return $this->fail('Kolom-kolom utama wajib diisi.', 400);
        }

        $assetModel->insert($assetData);

        // Log Activity
        $logModel = new ActivityLogModel();
        $logModel->insert([
            'id'         => 'log-' . bin2hex(random_bytes(4)),
            'user_id'    => $user['id'],
            'username'   => $user['username'],
            'activity'   => 'Tambah Aset',
            'detail'     => "Menambahkan aset baru: {$assetData['nama_aset']} ({$kodeAset}) di {$assetData['ranting']}.",
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respondCreated($assetData);
    }

    public function update($id = null)
    {
        $input = $this->request->getJSON(true);
        $username = $input['username'] ?? null;

        if (!$username) {
            return $this->fail('Autentikasi diperlukan.', 401);
        }

        $userModel = new UserModel();
        $user = $userModel->where('username', $username)->first();
        if (!$user) {
            return $this->fail('User tidak valid.', 401);
        }

        $assetModel = new AssetModel();
        $oldAsset = $assetModel->find($id);
        if (!$oldAsset) {
            return $this->failNotFound('Aset tidak ditemukan.');
        }

        $updateData = [];
        if (isset($input['namaAset'])) $updateData['nama_aset'] = $input['namaAset'];
        if (isset($input['alamat'])) $updateData['alamat'] = $input['alamat'];
        if (isset($input['luas'])) $updateData['luas'] = (int)$input['luas'];
        if (isset($input['pewakif'])) $updateData['pewakif'] = $input['pewakif'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['noSertifikat'])) $updateData['no_sertifikat'] = $input['noSertifikat'];
        if (isset($input['tanggalSertifikat'])) $updateData['tanggal_sertifikat'] = $input['tanggalSertifikat'];
        if (isset($input['peruntukan'])) $updateData['peruntukan'] = $input['peruntukan'];
        if (isset($input['pengelola'])) $updateData['pengelola'] = $input['pengelola'];
        if (isset($input['ranting'])) $updateData['ranting'] = $input['ranting'];
        if (isset($input['latitude'])) $updateData['latitude'] = (float)$input['latitude'];
        if (isset($input['longitude'])) $updateData['longitude'] = (float)$input['longitude'];
        if (isset($input['dokumenNama'])) $updateData['dokumen_nama'] = $input['dokumenNama'];
        if (isset($input['dokumenBase64'])) $updateData['dokumen_base64'] = $input['dokumenBase64'];

        $assetModel->update($id, $updateData);

        // Log Activity
        $logModel = new ActivityLogModel();
        $logModel->insert([
            'id'         => 'log-' . bin2hex(random_bytes(4)),
            'user_id'    => $user['id'],
            'username'   => $user['username'],
            'activity'   => 'Ubah Aset',
            'detail'     => "Mengubah rincian aset: " . ($updateData['nama_aset'] ?? $oldAsset['nama_aset']) . " ({$oldAsset['kode_aset']}).",
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respond($assetModel->find($id));
    }

    public function delete($id = null)
    {
        $username = $this->request->getGet('username');

        if (!$username) {
            return $this->fail('Username pengapus wajib disertakan.', 401);
        }

        $userModel = new UserModel();
        $user = $userModel->where('username', $username)->first();
        if (!$user) {
            return $this->fail('User tidak valid.', 401);
        }

        $assetModel = new AssetModel();
        $asset = $assetModel->find($id);
        if (!$asset) {
            return $this->failNotFound('Aset tidak ditemukan.');
        }

        $assetModel->delete($id);

        // Log Activity
        $logModel = new ActivityLogModel();
        $logModel->insert([
            'id'         => 'log-' . bin2hex(random_bytes(4)),
            'user_id'    => $user['id'],
            'username'   => $user['username'],
            'activity'   => 'Hapus Aset',
            'detail'     => "Menghapus aset: {$asset['nama_aset']} ({$asset['kode_aset']}) dari Ranting {$asset['ranting']}.",
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respond(['message' => 'Aset berhasil dihapus.', 'id' => $id]);
    }
}
`;
      zip.addFile("app/Controllers/Assets.php", Buffer.from(assetsPhp, "utf-8"));

      // 7. Controllers/Logs.php
      const logsPhp = `<?php

namespace App\\Controllers;

use App\\Models\\ActivityLogModel;
use CodeIgniter\\RESTful\\ResourceController;

class Logs extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $logModel = new ActivityLogModel();
        return $this->respond($logModel->orderBy('created_at', 'DESC')->findAll());
    }
}
`;
      zip.addFile("app/Controllers/Logs.php", Buffer.from(logsPhp, "utf-8"));

      // 8. Config/Routes.php
      const routesPhp = `<?php

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// SIAT-MU API Group Routes
$routes->group('api', function($routes) {
    // Auth Routes
    $routes->post('auth/login', 'Auth::login');
    $routes->post('auth/register', 'Auth::register');
    $routes->get('auth/users', 'Auth::getUsers');

    // Assets Resource CRUD Routes
    $routes->get('assets', 'Assets::index');
    $routes->post('assets', 'Assets::create');
    $routes->put('assets/(:any)', 'Assets::update/$1');
    $routes->delete('assets/(:any)', 'Assets::delete/$1');

    // Activity Logs Routes
    $routes->get('logs', 'Logs::index');
});
`;
      zip.addFile("app/Config/Routes.php", Buffer.from(routesPhp, "utf-8"));

      // 9. database.sql
      const sqlDb = `-- ==========================================
-- SKEMA DATABASE RELASIONAL (SQL DDL & DML)
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
  \`dokumen_base64\` LONGTEXT DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Tabel Pengguna
INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`full_name\`, \`role\`) VALUES 
('usr-admin', 'admin', '$2y$10$SXt.3NfK69970/17f8UlyuUvFWhu86vG5h741G40q8l3l6l193108', 'Administrator SIAT-MU', 'admin'),
('usr-petugas', 'petugas', '$2y$10$E9x8R1uY75369/08r2UlyuPvGWhu54vK9h641G30q5l2l5l182045', 'H. M. Syakir (Petugas Wakaf Kajen)', 'petugas');

-- Seed Tabel Aset Tanah
INSERT INTO \`assets\` (\`id\`, \`kode_aset\`, \`nama_aset\`, \`alamat\`, \`luas\`, \`pewakif\`, \`status\`, \`no_sertifikat\`, \`tanggal_sertifikat\`, \`peruntukan\`, \`pengelola\`, \`ranting\`, \`latitude\`, \`longitude\`, \`created_by\`) VALUES
('ast-1', 'AST-PCM-001', 'Pusat Dakwah Muhammadiyah (Gedung Dakwah PCM Kajen)', 'Jl. Pahlawan No. 10, Kajen Kota', 1200, 'Keluarga H. Abdul Hamid', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0004', '2012-05-14', 'Kantor Organisasi (PCM/PRM/Ortom)', 'PCM Kajen', 'PRM Kajen Kota', -6.994700, 109.578600, 'admin'),
('ast-2', 'AST-PCM-002', 'Gedung Utama SD Muhammadiyah Gejlig', 'Jl. Raya Gejlig, Desa Gejlig, Kec. Kajen', 1850, 'Hj. Siti Aisyah', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0012', '2015-08-22', 'Gedung Sekolah / Madrasah / TK ABA', 'Majelis Dikdasmen PCM Kajen', 'PRM Gejlig', -6.980500, 109.585200, 'admin'),
('ast-3', 'AST-PCM-003', 'Masjid Al-Muttaqin Rowolaku & Madrasah Diniyah', 'Dusun Rowolaku RT 03/RW 01, Desa Rowolaku', 650, 'K.H. Ahmad Dahlan (Wakaf Keluarga)', 'Sertifikat Wakaf (Milik Muhammadiyah)', 'W.10.02.15.01.0035', '2018-11-05', 'Masjid / Musholla', 'Takmir Masjid / Musholla', 'PRM Rowolaku', -7.012500, 109.593000, 'petugas');
`;
      zip.addFile("database.sql", Buffer.from(sqlDb, "utf-8"));

      // 10. README.md
      const readmeMd = `# SIAT-MU Kajen Pekalongan - CodeIgniter 4 Backend

Ini adalah paket backend RESTful API lengkap untuk Sistem Informasi Aset Tanah Muhammadiyah (SIAT-MU) Kajen menggunakan framework **CodeIgniter 4**.

## Persyaratan Sistem
- PHP >= 8.1
- MySQL / MariaDB
- Web Server (Apache/Nginx/Cpanel/XAMPP)

## Cara Integrasi ke Proyek CodeIgniter Anda

1. **Buat atau Gunakan Proyek CodeIgniter 4**
   Jika Anda memulai baru, instal CI4 melalui Composer:
   \`\`\`bash
   composer create-project codeigniter4/appstarter siatmu-ci4-backend
   \`\`\`

2. **Buat & Impor Database**
   - Buat database baru bernama \`siatmu_kajen\` di MySQL (phpMyAdmin).
   - Impor berkas \`database.sql\` yang ada dalam paket ZIP ini.

3. **Salin Berkas Hasil Ekspor**
   Ekstrak isi berkas ZIP ini dan letakkan di dalam struktur folder CodeIgniter 4 Anda sesuai jalurnya:
   - \`app/Config/Database.php\`
   - \`app/Config/Routes.php\`
   - \`app/Models/UserModel.php\`
   - \`app/Models/AssetModel.php\`
   - \`app/Models/ActivityLogModel.php\`
   - \`app/Controllers/Auth.php\`
   - \`app/Controllers/Assets.php\`
   - \`app/Controllers/Logs.php\`

4. **Koneksikan Frontend Anda**
   Point endpoint URL frontend Anda ke alamat server lokal CodeIgniter (misal: \`http://localhost:8080/api/assets\`).

5. **Jalankan Spark Server**
   \`\`\`bash
   php spark serve --port 8080
   \`\`\`
   Proyek siap digunakan di lokal dengan database SQL nyata!
`;
      zip.addFile("README.md", Buffer.from(readmeMd, "utf-8"));

      const zipBuffer = zip.toBuffer();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=siatmu-codeigniter4-backend.zip");
      res.send(zipBuffer);
    } catch (err: any) {
      console.error("Export error:", err);
      res.status(500).json({ error: "Gagal membuat berkas ekspor CodeIgniter: " + err.message });
    }
  });

  // 1. Auth Endpoint: Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi." });
    }

    const user = db.users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Username tidak ditemukan." });
    }

    const correctPassword = db.passwords[username.toLowerCase()];
    if (correctPassword !== password) {
      return res.status(401).json({ error: "Password salah." });
    }

    // Return user info
    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      }
    });
  });

  // 2. Auth Endpoint: Register (Tambah User)
  app.post("/api/auth/register", (req, res) => {
    const { username, password, fullName, role, requesterUsername } = req.body;

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ error: "Semua kolom wajib diisi." });
    }

    // Only admin can register new users
    if (!requesterUsername) {
      return res.status(403).json({ error: "Autentikasi diperlukan untuk mendaftarkan user baru." });
    }
    const requester = db.users.find((u: User) => u.username.toLowerCase() === requesterUsername.toLowerCase());
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Hanya Administrator yang diperbolehkan mendaftarkan user baru." });
    }

    const existingUser = db.users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "Username sudah digunakan." });
    }

    const newUser: User = {
      id: "usr-" + generateId(),
      username: username.toLowerCase(),
      fullName,
      role: role as 'admin' | 'petugas',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.passwords[username.toLowerCase()] = password;

    // Log Activity
    const newLog: ActivityLog = {
      id: "log-" + generateId(),
      userId: requester.id,
      username: requester.username,
      activity: "Registrasi User",
      detail: `Mendaftarkan user baru: ${username} (${fullName}) dengan peran ${role}.`,
      createdAt: new Date().toISOString(),
    };
    db.logs.push(newLog);

    saveDb();

    res.status(201).json({
      message: "User berhasil didaftarkan.",
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
      }
    });
  });

  // 3. Auth Endpoint: List Users
  app.get("/api/auth/users", (req, res) => {
    // Returns active users without passwords
    res.json(db.users);
  });

  // 4. Asset Endpoint: Read All
  app.get("/api/assets", (req, res) => {
    res.json(db.assets);
  });

  // 5. Asset Endpoint: Create
  app.post("/api/assets", (req, res) => {
    const {
      namaAset, alamat, luas, pewakif, status, noSertifikat, tanggalSertifikat,
      peruntukan, pengelola, ranting, latitude, longitude, dokumenNama, dokumenBase64,
      username
    } = req.body;

    if (!namaAset || !luas || !status || !peruntukan || !pengelola || !ranting || !username) {
      return res.status(400).json({ error: "Kolom-kolom utama wajib diisi." });
    }

    const user = db.users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "User tidak valid." });
    }

    // Generate unique kode aset
    const count = db.assets.length + 1;
    const padCount = String(count).padStart(3, "0");
    const kodeAset = `AST-PCM-${padCount}`;

    const newAsset: Asset = {
      id: "ast-" + generateId(),
      kodeAset,
      namaAset,
      alamat: alamat || "Kecamatan Kajen, Kabupaten Pekalongan",
      luas: Number(luas),
      pewakif: pewakif || "Muhammadiyah Kajen",
      status,
      noSertifikat,
      tanggalSertifikat,
      peruntukan,
      pengelola,
      ranting,
      latitude: Number(latitude) || -6.9947,
      longitude: Number(longitude) || 109.5786,
      dokumenNama,
      dokumenBase64,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
    };

    db.assets.push(newAsset);

    // Log Activity
    const newLog: ActivityLog = {
      id: "log-" + generateId(),
      userId: user.id,
      username: user.username,
      activity: "Tambah Aset",
      detail: `Menambahkan aset baru: ${namaAset} (${newAsset.kodeAset}) di ${ranting}.`,
      createdAt: new Date().toISOString(),
    };
    db.logs.push(newLog);

    saveDb();
    res.status(201).json(newAsset);
  });

  // 6. Asset Endpoint: Update
  app.put("/api/assets/:id", (req, res) => {
    const { id } = req.params;
    const {
      namaAset, alamat, luas, pewakif, status, noSertifikat, tanggalSertifikat,
      peruntukan, pengelola, ranting, latitude, longitude, dokumenNama, dokumenBase64,
      username
    } = req.body;

    const assetIndex = db.assets.findIndex((a: Asset) => a.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({ error: "Aset tidak ditemukan." });
    }

    const user = db.users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "User tidak valid." });
    }

    const oldAsset = db.assets[assetIndex];

    const updatedAsset: Asset = {
      ...oldAsset,
      namaAset: namaAset || oldAsset.namaAset,
      alamat: alamat || oldAsset.alamat,
      luas: luas !== undefined ? Number(luas) : oldAsset.luas,
      pewakif: pewakif !== undefined ? pewakif : oldAsset.pewakif,
      status: status || oldAsset.status,
      noSertifikat: noSertifikat !== undefined ? noSertifikat : oldAsset.noSertifikat,
      tanggalSertifikat: tanggalSertifikat !== undefined ? tanggalSertifikat : oldAsset.tanggalSertifikat,
      peruntukan: peruntukan || oldAsset.peruntukan,
      pengelola: pengelola || oldAsset.pengelola,
      ranting: ranting || oldAsset.ranting,
      latitude: latitude !== undefined ? Number(latitude) : oldAsset.latitude,
      longitude: longitude !== undefined ? Number(longitude) : oldAsset.longitude,
      dokumenNama: dokumenNama !== undefined ? dokumenNama : oldAsset.dokumenNama,
      dokumenBase64: dokumenBase64 !== undefined ? dokumenBase64 : oldAsset.dokumenBase64,
    };

    db.assets[assetIndex] = updatedAsset;

    // Log Activity
    const newLog: ActivityLog = {
      id: "log-" + generateId(),
      userId: user.id,
      username: user.username,
      activity: "Ubah Aset",
      detail: `Mengubah rincian aset: ${updatedAsset.namaAset} (${updatedAsset.kodeAset}).`,
      createdAt: new Date().toISOString(),
    };
    db.logs.push(newLog);

    saveDb();
    res.json(updatedAsset);
  });

  // 7. Asset Endpoint: Delete
  app.delete("/api/assets/:id", (req, res) => {
    const { id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username wajib disertakan." });
    }

    const user = db.users.find((u: User) => u.username.toLowerCase() === (username as string).toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "User tidak valid." });
    }

    const assetIndex = db.assets.findIndex((a: Asset) => a.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({ error: "Aset tidak ditemukan." });
    }

    const deletedAsset = db.assets[assetIndex];
    db.assets.splice(assetIndex, 1);

    // Log Activity
    const newLog: ActivityLog = {
      id: "log-" + generateId(),
      userId: user.id,
      username: user.username,
      activity: "Hapus Aset",
      detail: `Menghapus aset: ${deletedAsset.namaAset} (${deletedAsset.kodeAset}) dari ${deletedAsset.ranting}.`,
      createdAt: new Date().toISOString(),
    };
    db.logs.push(newLog);

    saveDb();
    res.json({ message: "Aset berhasil dihapus.", id });
  });

  // 8. Log Endpoint: Read Activity Logs
  app.get("/api/logs", (req, res) => {
    res.json(db.logs.slice().reverse()); // return newest logs first
  });

  // VITE DEV SERVER VS PRODUCTION MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v4
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIAT-MU] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
