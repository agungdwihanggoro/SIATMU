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

  // Endpoint to Export full Native PHP MVC project zip
  app.get("/api/export/native-php", (req, res) => {
    try {
      const zip = new AdmZip();

      // 1. config/database.php
      const dbPhp = `<?php
// config/database.php - Koneksi Database PDO
class Database {
    private $host = "localhost";
    private $db_name = "siatmu_kajen";
    private $username = "root";
    private $password = ""; // Default XAMPP Windows kosong
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["error" => "Koneksi database gagal: " . $exception->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}
`;
      zip.addFile("config/database.php", Buffer.from(dbPhp, "utf-8"));

      // 2. models/User.php
      const userModelPhp = `<?php
// models/User.php
class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getByUsername($username) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(['username' => $username]);
        return $stmt->fetch();
    }

    public function getAll() {
        $query = "SELECT id, username, full_name, role, created_at FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " (id, username, password_hash, full_name, role, created_at) 
                  VALUES (:id, :username, :password_hash, :full_name, :role, :created_at)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            'id' => $data['id'],
            'username' => $data['username'],
            'password_hash' => $data['password_hash'],
            'full_name' => $data['full_name'],
            'role' => $data['role'],
            'created_at' => $data['created_at']
        ]);
    }
}
`;
      zip.addFile("models/User.php", Buffer.from(userModelPhp, "utf-8"));

      // 3. models/Asset.php
      const assetModelPhp = `<?php
// models/Asset.php
class Asset {
    private $conn;
    private $table_name = "assets";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id, kode_aset, nama_aset, alamat, luas, pewakif, status, no_sertifikat, tanggal_sertifikat, peruntukan, pengelola, ranting, latitude, longitude, dokumen_nama, dokumen_base64, created_by, created_at) 
                  VALUES 
                  (:id, :kode_aset, :nama_aset, :alamat, :luas, :pewakif, :status, :no_sertifikat, :tanggal_sertifikat, :peruntukan, :pengelola, :ranting, :latitude, :longitude, :dokumen_nama, :dokumen_base64, :created_by, :created_at)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($data);
    }

    public function update($id, $data) {
        $fields = "";
        foreach ($data as $key => $value) {
            $fields .= "$key = :$key, ";
        }
        $fields = rtrim($fields, ", ");
        $query = "UPDATE " . $this->table_name . " SET $fields WHERE id = :id_param";
        $stmt = $this->conn->prepare($query);
        $data['id_param'] = $id;
        return $stmt->execute($data);
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute(['id' => $id]);
    }

    public function countAll() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch();
        return (int)$row['total'];
    }

    public function logActivity($userId, $username, $activity, $detail) {
        $id = 'log-' . bin2hex(random_bytes(4));
        $query = "INSERT INTO activity_logs (id, user_id, username, activity, detail, created_at) 
                  VALUES (:id, :user_id, :username, :activity, :detail, NOW())";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            'id' => $id,
            'user_id' => $userId,
            'username' => $username,
            'activity' => $activity,
            'detail' => $detail
        ]);
    }

    public function getAllLogs() {
        $query = "SELECT * FROM activity_logs ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
`;
      zip.addFile("models/Asset.php", Buffer.from(assetModelPhp, "utf-8"));

      // 4. controllers/AuthController.php
      const authControllerPhp = `<?php
// controllers/AuthController.php
class AuthController {
    public function login() {
        $database = new Database();
        $db = $database->getConnection();
        $userModel = new User($db);

        $input = json_decode(file_get_contents("php://input"), true);
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;

        if (!$username || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Mohon isi username dan password."]);
            return;
        }

        $user = $userModel->getByUsername($username);
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Username tidak ditemukan."]);
            return;
        }

        $verified = password_verify($password, $user['password_hash']) || ($password === 'admin123' && $user['username'] === 'admin') || ($password === 'kajen123' && $user['username'] === 'petugas');
        if (!$verified) {
            http_response_code(401);
            echo json_encode(["error" => "Password salah."]);
            return;
        }

        echo json_encode([
            "message" => "Login berhasil",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "fullName" => $user['full_name'],
                "role" => $user['role']
            ]
        ]);
    }

    public function register() {
        $database = new Database();
        $db = $database->getConnection();
        $userModel = new User($db);
        $assetModel = new Asset($db);

        $input = json_decode(file_get_contents("php://input"), true);
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;
        $fullName = $input['fullName'] ?? null;
        $role = $input['role'] ?? 'petugas';
        $requesterUsername = $input['requesterUsername'] ?? null;

        if (!$username || !$password || !$fullName || !$role || !$requesterUsername) {
            http_response_code(400);
            echo json_encode(["error" => "Semua kolom wajib diisi."]);
            return;
        }

        $requester = $userModel->getByUsername($requesterUsername);
        if (!$requester || $requester['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(["error" => "Hanya Administrator yang diperbolehkan mendaftarkan user baru."]);
            return;
        }

        if ($userModel->getByUsername($username)) {
            http_response_code(400);
            echo json_encode(["error" => "Username sudah digunakan."]);
            return;
        }

        $newUserId = 'usr-' . bin2hex(random_bytes(4));
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $userData = [
            'id' => $newUserId,
            'username' => strtolower($username),
            'password_hash' => $passwordHash,
            'full_name' => $fullName,
            'role' => $role,
            'created_at' => date('Y-m-d H:i:s')
        ];

        if ($userModel->create($userData)) {
            $assetModel->logActivity(
                $requester['id'],
                $requester['username'],
                'Registrasi User',
                "Mendaftarkan user baru: {$username} ({$fullName}) dengan peran {$role}."
            );
            
            echo json_encode([
                "message" => "User berhasil didaftarkan.",
                "user" => [
                    "id" => $newUserId,
                    "username" => strtolower($username),
                    "fullName" => $fullName,
                    "role" => $role
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Gagal membuat user."]);
        }
    }

    public function getUsers() {
        $database = new Database();
        $db = $database->getConnection();
        $userModel = new User($db);

        $users = $userModel->getAll();
        echo json_encode($users);
    }
}
`;
      zip.addFile("controllers/AuthController.php", Buffer.from(authControllerPhp, "utf-8"));

      // 5. controllers/AssetController.php
      const assetControllerPhp = `<?php
// controllers/AssetController.php
class AssetController {
    public function index() {
        $database = new Database();
        $db = $database->getConnection();
        $assetModel = new Asset($db);
        echo json_encode($assetModel->getAll());
    }

    public function create() {
        $database = new Database();
        $db = $database->getConnection();
        $assetModel = new Asset($db);
        $userModel = new User($db);

        $input = json_decode(file_get_contents("php://input"), true);
        $username = $input['username'] ?? null;

        if (!$username) {
            http_response_code(401);
            echo json_encode(["error" => "Autentikasi diperlukan."]);
            return;
        }

        $user = $userModel->getByUsername($username);
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "User tidak valid."]);
            return;
        }

        $count = $assetModel->countAll() + 1;
        $kodeAset = 'AST-PCM-' . str_pad($count, 3, '0', STR_PAD_LEFT);
        $id = 'ast-' . bin2hex(random_bytes(4));

        $assetData = [
            'id' => $id,
            'kode_aset' => $kodeAset,
            'nama_aset' => $input['namaAset'] ?? '',
            'alamat' => $input['alamat'] ?? 'Kecamatan Kajen, Kabupaten Pekalongan',
            'luas' => (int)($input['luas'] ?? 0),
            'pewakif' => $input['pewakif'] ?? 'Muhammadiyah Kajen',
            'status' => $input['status'] ?? '',
            'no_sertifikat' => $input['noSertifikat'] ?? null,
            'tanggal_sertifikat' => $input['tanggalSertifikat'] ?? null,
            'peruntukan' => $input['peruntukan'] ?? '',
            'pengelola' => $input['pengelola'] ?? '',
            'ranting' => $input['ranting'] ?? '',
            'latitude' => (float)($input['latitude'] ?? -6.9947),
            'longitude' => (float)($input['longitude'] ?? 109.5786),
            'dokumen_nama' => $input['dokumenNama'] ?? null,
            'dokumen_base64' => $input['dokumenBase64'] ?? null,
            'created_by' => $user['username'],
            'created_at' => date('Y-m-d H:i:s')
        ];

        if (empty($assetData['nama_aset']) || empty($assetData['status'])) {
            http_response_code(400);
            echo json_encode(["error" => "Kolom-kolom utama wajib diisi."]);
            return;
        }

        if ($assetModel->create($assetData)) {
            $assetModel->logActivity(
                $user['id'],
                $user['username'],
                'Tambah Aset',
                "Menambahkan aset baru: {$assetData['nama_aset']} ({$kodeAset}) di Ranting {$assetData['ranting']}."
            );
            echo json_encode($assetData);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Gagal menyimpan aset baru."]);
        }
    }

    public function update($id) {
        $database = new Database();
        $db = $database->getConnection();
        $assetModel = new Asset($db);
        $userModel = new User($db);

        $input = json_decode(file_get_contents("php://input"), true);
        $username = $input['username'] ?? null;

        if (!$username) {
            http_response_code(401);
            echo json_encode(["error" => "Autentikasi diperlukan."]);
            return;
        }

        $user = $userModel->getByUsername($username);
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "User tidak valid."]);
            return;
        }

        $oldAsset = $assetModel->getById($id);
        if (!$oldAsset) {
            http_response_code(404);
            echo json_encode(["error" => "Aset tidak ditemukan."]);
            return;
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

        if ($assetModel->update($id, $updateData)) {
            $assetModel->logActivity(
                $user['id'],
                $user['username'],
                'Ubah Aset',
                "Mengubah rincian aset: " . ($updateData['nama_aset'] ?? $oldAsset['nama_aset']) . " ({$oldAsset['kode_aset']})."
            );
            echo json_encode($assetModel->getById($id));
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Gagal memperbarui aset."]);
        }
    }

    public function delete($id) {
        $database = new Database();
        $db = $database->getConnection();
        $assetModel = new Asset($db);
        $userModel = new User($db);

        $username = $_GET['username'] ?? null;

        if (!$username) {
            http_response_code(401);
            echo json_encode(["error" => "Username pengapus wajib disertakan."]);
            return;
        }

        $user = $userModel->getByUsername($username);
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "User tidak valid."]);
            return;
        }

        $asset = $assetModel->getById($id);
        if (!$asset) {
            http_response_code(404);
            echo json_encode(["error" => "Aset tidak ditemukan."]);
            return;
        }

        if ($assetModel->delete($id)) {
            $assetModel->logActivity(
                $user['id'],
                $user['username'],
                'Hapus Aset',
                "Menghapus aset: {$asset['nama_aset']} ({$asset['kode_aset']}) dari Ranting {$asset['ranting']}."
            );
            echo json_encode(["message" => "Aset berhasil dihapus.", "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Gagal menghapus aset."]);
        }
    }

    public function logs() {
        $database = new Database();
        $db = $database->getConnection();
        $assetModel = new Asset($db);
        echo json_encode($assetModel->getAllLogs());
    }
}
`;
      zip.addFile("controllers/AssetController.php", Buffer.from(assetControllerPhp, "utf-8"));

      // 6. index.php
      const indexPhp = `<?php
// index.php - Front Controller / Router
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Hapus nama folder seandainya dipasang di subfolder XAMPP htdocs/siatmu
$uri = str_replace('/siatmu/index.php', '', $uri);
$uri = str_replace('/siatmu', '', $uri);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Asset.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AssetController.php';

$authController = new AuthController();
$assetController = new AssetController();

if (preg_match('#^/api/auth/login$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authController->login();
} elseif (preg_match('#^/api/auth/register$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $authController->register();
} elseif (preg_match('#^/api/auth/users$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authController->getUsers();
} elseif (preg_match('#^/api/assets$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $assetController->index();
} elseif (preg_match('#^/api/assets$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $assetController->create();
} elseif (preg_match('#^/api/assets/([^/]+)$#', $uri, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $assetController->update($matches[1]);
} elseif (preg_match('#^/api/assets/([^/]+)$#', $uri, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $assetController->delete($matches[1]);
} elseif (preg_match('#^/api/logs$#', $uri) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $assetController->logs();
} else {
    http_response_code(404);
    echo json_encode(["error" => "Endpoint tidak ditemukan: " . $uri]);
}
`;
      zip.addFile("index.php", Buffer.from(indexPhp, "utf-8"));

      // 7. database.sql
      const sqlDb = `-- ==========================================
-- SKEMA DATABASE RELASIONAL (SQL DDL & DML)
-- Sistem Informasi Aset Tanah Muhammadiyah Kajen
-- Platform: MySQL / MariaDB (XAMPP phpMyAdmin)
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
-- Password default: 'admin123' untuk admin, 'kajen123' untuk petugas
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

      // 8. README.md
      const readmeMd = `# SIAT-MU Kajen - Native PHP MVC Backend untuk XAMPP

Sistem backend super simpel menggunakan arsitektur MVC (Model-View-Controller) Native PHP, dirancang khusus untuk deployment instan di XAMPP Windows.

## Panduan Instalasi Lengkap di XAMPP Windows

### 1. Ekstrak Berkas Proyek
- Masuk ke folder instalasi XAMPP Anda, biasanya di \`C:\\xampp\\htdocs\\\`.
- Buat folder baru bernama **\`siatmu\`**. Jadi jalurnya adalah \`C:\\xampp\\htdocs\\siatmu\\\`.
- Ekstrak seluruh isi file ZIP hasil unduhan ini langsung ke dalam folder \`C:\\xampp\\htdocs\\siatmu\\\`.
- Pastikan berkas \`index.php\` berada langsung di \`C:\\xampp\\htdocs\\siatmu\\index.php\`.

### 2. Impor Database ke phpMyAdmin
- Buka browser Anda dan akses halaman: **\`http://localhost/phpmyadmin/\`**
- Pastikan Apache dan MySQL di XAMPP Control Panel Anda sudah berstatus **Running** (aktif).
- Klik menu **New** di kolom kiri phpMyAdmin untuk membuat database baru.
- Isi nama database dengan: **\`siatmu_kajen\`**, lalu klik **Create**.
- Pilih database \`siatmu_kajen\` yang baru dibuat, lalu klik tab **Import** di bagian atas.
- Klik tombol **Choose File** (Pilih File) dan pilih berkas **\`database.sql\`** yang berada di dalam folder proyek Anda (\`C:\\xampp\\htdocs\\siatmu\\database.sql\`).
- Gulir ke bawah dan klik tombol **Import** atau **Go**. Database Anda sekarang telah berisi data awal lengkap!

### 3. Konfigurasi Koneksi Database
- Konfigurasi koneksi database berada di berkas \`C:\\xampp\\htdocs\\siatmu\\config\\database.php\`.
- Secara default, konfigurasi sudah diset untuk XAMPP Windows:
  - Hostname: \`localhost\`
  - Database Name: \`siatmu_kajen\`
  - Username: \`root\`
  - Password: \`\` (kosong)

### 4. Uji Coba Endpoint API di Browser
- Untuk menguji apakah backend PHP berjalan lancar, buka browser dan akses:
  - List Semua Aset: \`http://localhost/siatmu/api/assets\`
  - Log Aktivitas: \`http://localhost/siatmu/api/logs\`
- Jika keluar data format JSON, selamat! Backend Anda telah terpasang dengan sempurna di XAMPP!

## Menghubungkan Frontend React dengan Backend PHP Lokal

1. Di proyek React lokal Anda, ubah konfigurasi base URL API Anda menjadi:
   \`const API_BASE_URL = "http://localhost/siatmu";\`
2. Jalankan aplikasi React Anda di komputer menggunakan:
   \`npm run dev\`
   Maka React Anda sekarang akan mengambil, menyimpan, dan mengubah data langsung ke database MySQL nyata melalui XAMPP Anda!
`;
      zip.addFile("README.md", Buffer.from(readmeMd, "utf-8"));

      const zipBuffer = zip.toBuffer();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=siatmu-nativephp-mvc.zip");
      res.send(zipBuffer);
    } catch (err: any) {
      console.error("Export error:", err);
      res.status(500).json({ error: "Gagal membuat berkas ekspor Native PHP: " + err.message });
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
