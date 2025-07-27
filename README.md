# 💡 LightDB

📁 **LightDB** adalah database ringan berbasis JSONL (JSON Lines) untuk Node.js, cocok untuk aplikasi kecil, prototipe, dan skenario embedded storage yang tidak memerlukan database kompleks.

---

## ✨ Fitur Utama

- 🔁 *Append-only JSONL Store* — semua perubahan disimpan sebagai baris baru.
- ⚡ *In-memory index* — akses data cepat tanpa membaca seluruh file.
- 📦 *API sederhana* — hanya butuh `set()`, `get()`, `delete()`, dan `compact()`.
- 🧹 *Auto compaction on exit* — file dibersihkan otomatis saat aplikasi keluar.
- 🛠 Cocok untuk bot, CLI tools, dan aplikasi ringan lainnya.

---

## 🚀 Instalasi

```bash
npm install lightdb --save
