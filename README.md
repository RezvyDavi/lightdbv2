# 💡 LightDBv2

📁 **LightDBv2** adalah database ringan berbasis JSONL (JSON Lines) untuk Node.js, cocok untuk aplikasi kecil, prototipe, dan skenario embedded storage yang tidak memerlukan database kompleks.

---

## ✨ Fitur Utama

- 🔁 *Append-only JSONL Store* — semua perubahan disimpan sebagai baris baru.
- ⚡ *In-memory index* — akses data cepat tanpa membaca seluruh file.
- 📦 *API sederhana* — hanya butuh `set()`, `get()`, `delete()`, `exists()`, `list()` dan `compact()`.
- 🧹 *Auto compaction on exit* — file dibersihkan otomatis saat aplikasi keluar.
- 🛠 Cocok untuk bot, CLI tools, dan aplikasi ringan lainnya.

---

## 🚀 Instalasi

```bash
npm install lightdb --save
```

## 🛠 Inisialisasi  

```bash
const LightDB = require('lightdb');  
(async () => {  
  const db = new LightDB('storage.jsonl', { debug: true });  
  await db.init();  
})();
```

---

# 📚 Fungsi & Contoh  

## ✅ exists(key) – cek key apakah ada
```bash
const ada = db.exists('user1'); // return boolean
```

---

## 📦 set(key, value) – simpan / update data  
```bash
await db.set('user1', { name: 'Rezvy', age: 22 });
```

---

## 🔍 get(key) – ambil data  
```bash
const data = await db.get('user1'); // { key:'user1', name:'Rezvy', age:22 }  
```

---

## 🗑 delete(key) – tandai sebagai terhapus 
```bash 
await db.delete('user2');  
```

---

## 📋 list() – ambil semua data aktif 
```bash 
const semua = await db.list(); // [{...}, {...}]  
```

---

## 🧹 compact() – bersihkan file
```bash  
await db.compact();  
```

---

## 🧪 Contoh Lengkap  
```bash
const LightDB = require('lightdb');  
(async () => {  
  const db = new LightDB('storage.jsonl', { debug: true });  
  await db.init();  

  await db.set('user1', { name: 'Rezvy', age: 22 });  
  await db.set('user2', { name: 'Bot', age: 1 });  

  console.log('user1 ada?', db.exists('user1')); // true  
  console.log('user3 ada?', db.exists('user3')); // false  

  console.log('Data user1:', await db.get('user1'));  

  await db.set('user1', { name: 'Rezvy', age: 23 });  
  console.log('Semua data aktif:', await db.list());  

  await db.delete('user2');  
  console.log('user2 ada setelah delete?', db.exists('user2')); // false  

  await db.compact();  
  console.log('Setelah compact:', await db.list());  

  await db.set('user3', { name: 'Baru', age: 99 });  
  console.log('Setelah tambah user3:', await db.list());  
})();
```

---
