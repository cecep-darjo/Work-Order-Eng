# 🚀 Tutorial Push & Pull GitHub - Step by Step

## 📌 Daftar Isi
1. [Setup Awal](#setup-awal)
2. [Push ke GitHub](#push-ke-github)
3. [Pull dari GitHub](#pull-dari-github)
4. [Troubleshooting](#troubleshooting)

---

## ⚙️ Setup Awal

### Step 1: Cari Lokasi Git Portable

**Cara 1: Menggunakan File Explorer**
1. Buka **File Explorer** (Win + E)
2. Cari di drive C, D, atau mana saja
3. Cari folder yang berisi:
   - Nama folder: `git`, `git-portable`, atau `PortableGit`
   - Di dalamnya ada folder `cmd` atau `bin`

**Cara 2: Menggunakan PowerShell**
```powershell
# Buka PowerShell dan jalankan command ini:
Get-ChildItem -Path C:\, D:\, E:\ -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue | Select-Object FullName
```

**Catat path lengkapnya**, contoh:
- `C:\git-portable\cmd\git.exe`
- `D:\tools\git\bin\git.exe`
- `C:\PortableGit\cmd\git.exe`

---

### Step 2: Setup Git Configuration

**Buka PowerShell dan jalankan:**

```powershell
# GANTI PATH INI dengan lokasi git portable Anda!
$gitPath = "C:\git-portable\cmd\git.exe"

# Jalankan command ini satu per satu:

# 1. Set nama Anda (gunakan nama real atau nama GitHub Anda)
& $gitPath config --global user.name "Interbat Developer"

# 2. Set email Anda (gunakan email yang terdaftar di GitHub)
& $gitPath config --global user.email "your-email@gmail.com"

# 3. Verifikasi setup berhasil
& $gitPath config --global user.name
& $gitPath config --global user.email
```

**Output yang diharapkan:**
```
Interbat Developer
your-email@gmail.com
```

---

### Step 3: Generate GitHub Personal Access Token (PAT)

**Di Browser:**

1. Login ke GitHub: https://github.com/login
2. Klik foto profil → **Settings** (di kanan atas)
3. Di sidebar kiri, scroll ke bawah → **Developer settings**
4. Klik **Personal access tokens** → **Tokens (classic)**
5. Klik tombol **Generate new token** → **Generate new token (classic)**

**Di form Generate Token:**
- **Token name**: `Work Order Project` (atau nama apapun)
- **Expiration**: `90 days` atau `No expiration` (terserah)
- **Select scopes**, check ini:
  - ✅ `repo` (untuk full control repository)
  - ✅ `workflow` (untuk GitHub Actions)
  - ✅ `user:email` (untuk email)

**Klik: Generate token**

**⚠️ PENTING:** Copy token yang muncul dan **SIMPAN di tempat aman**. Token hanya muncul sekali!

Contoh token format: `ghp_1234567890abcdefghijklmnopqrstuvwxyz`

---

## 📤 Push ke GitHub

### Step 1: Masuk Folder Project

```powershell
cd 'C:\Users\Interbat\Work-Order-Eng'
```

Pastikan output menunjukkan path yang benar.

---

### Step 2: Check Status Repository

```powershell
# GANTI dengan path git portable Anda
$gitPath = "C:\git-portable\cmd\git.exe"

# Lihat status
& $gitPath status
```

**Output yang diharapkan:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/App.tsx
        new file:   src/pages/Login.tsx
        ...
```

Artinya ada file-file yang berubah dan siap di-push.

---

### Step 3: Pull Latest Changes (Optional tapi Recommended)

```powershell
# Pastikan Anda punya versi terbaru dari GitHub
& $gitPath pull origin main
```

Ini penting jika ada orang lain yang push perubahan.

---

### Step 4: Add All Changes

```powershell
# Tambahkan semua file yang berubah
& $gitPath add .

# Verifikasi files sudah di-add
& $gitPath status
```

**Output yang diharapkan:**
```
On branch main
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   src/pages/Login.tsx
        new file:   src/pages/SettingsPage.tsx
        modified:   src/App.tsx
        ...
```

---

### Step 5: Commit Changes

```powershell
# Commit dengan message yang deskriptif
& $gitPath commit -m "feat: Add login and admin settings features

- Add login page with username/password validation (min 6 chars)
- Add admin-only settings page for user management
- Add logout functionality in topbar
- Add Pengaturan menu in sidebar (visible only for Admin role)
- Support add/edit/delete users with role management
- Responsive UI with Tailwind CSS"
```

**Output yang diharapkan:**
```
[main 1a2b3c4] feat: Add login and admin settings features
 5 files changed, 450 insertions(+)
 create mode 100644 src/pages/Login.tsx
 ...
```

---

### Step 6: Push ke GitHub

```powershell
# Push perubahan ke repository
& $gitPath push origin main
```

**Saat diminta credential:**
- **Username:** `cecep-darjo` (atau username GitHub Anda)
- **Password:** Paste token yang Anda generate tadi (bukan password biasa!)

**Output yang diharapkan:**
```
Enumerating objects: 10, done.
Counting objects: 100% (10/10), done.
Delta compression using up to 8 threads
Compressing objects: 100% (7/7), done.
Writing objects: 100% (7/7), 2.45 KiB | 2.45 MiB/s, done.
Total 7 (delta 3), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (3/3), done.
To https://github.com/cecep-darjo/Work-Order-Eng
   1a2b3c4..5d6e7f8  main -> main
```

**✅ Push Berhasil!**

---

### Step 7: Verifikasi di GitHub

1. Buka browser: https://github.com/cecep-darjo/Work-Order-Eng
2. Lihat file-file baru sudah ter-upload
3. Lihat commit message terbaru di bagian atas

---

## 📥 Pull dari GitHub

Gunakan ini jika ada perubahan di repository GitHub yang ingin Anda download.

### Pull Workflow:

```powershell
# Setup
$gitPath = "C:\git-portable\cmd\git.exe"

# Masuk folder
cd 'C:\Users\Interbat\Work-Order-Eng'

# Option 1: Fetch dulu (lihat tanpa merge)
& $gitPath fetch origin

# Lihat apa yang ada di remote
& $gitPath log --oneline origin/main -5

# Option 2: Pull langsung (fetch + merge)
& $gitPath pull origin main
```

**Output yang diharapkan:**
```
From https://github.com/cecep-darjo/Work-Order-Eng
 * branch            main       -> FETCH_HEAD
Already up to date.
```

Atau jika ada perubahan:
```
Updating 1a2b3c4..5d6e7f8
Fast-forward
 src/pages/NewFile.tsx | 100 +++++++++
 1 file changed, 100 insertions(+)
```

---

## 🔍 Useful Git Commands

### Lihat History Commits:
```powershell
# Lihat 5 commit terakhir
& $gitPath log --oneline -5

# Lihat detail commit tertentu
& $gitPath show <commit-hash>
```

### Lihat Branch:
```powershell
# Lihat semua branch
& $gitPath branch -a

# Lihat branch aktif saat ini
& $gitPath branch
```

### Lihat Perubahan File:
```powershell
# Lihat file apa saja yang berubah
& $gitPath diff --name-only

# Lihat detail perubahan
& $gitPath diff
```

### Undo/Revert:
```powershell
# Undo changes di file tertentu (belum di-add)
& $gitPath restore <filename>

# Undo changes di semua file (belum di-add)
& $gitPath restore .

# Undo commit terakhir (keep changes)
& $gitPath reset --soft HEAD~1

# Undo commit terakhir (discard changes)
& $gitPath reset --hard HEAD~1
```

---

## 🚨 Troubleshooting

### Error: "fatal: not a git repository"
```powershell
# Cek Anda sudah di folder yang benar
Get-Location
# Harus menunjukkan: C:\Users\Interbat\Work-Order-Eng

# Jika tidak, pindah folder
cd 'C:\Users\Interbat\Work-Order-Eng'
```

### Error: "fatal: Authentication failed"
```
Kemungkinan:
1. Token sudah expire → Generate token baru
2. Token salah → Copy ulang dari GitHub
3. Username salah → Cek di GitHub profile
4. Belum punya akses → Cek permission di repository settings

Solusi: Generate token baru di https://github.com/settings/tokens
```

### Error: "Your branch is ahead of 'origin/main' by X commits"
```powershell
# Ini normal setelah commit, tinggal push:
& $gitPath push origin main
```

### Error: "CONFLICT: merge conflict"
```powershell
# Jika ada konflik saat pull
# 1. Edit file yang conflict di VS Code
# 2. Hapus marker conflict (<<<, ===, >>>)
# 3. Save file
# 4. Commit ulang

& $gitPath add .
& $gitPath commit -m "chore: Resolve merge conflict"
& $gitPath push origin main
```

### Git Portable tidak ditemukan
```powershell
# Cari di drive C
Get-ChildItem -Path C:\ -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue

# Cari di drive D (jika ada)
Get-ChildItem -Path D:\ -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue
```

---

## 📋 Checklist Sebelum Push

- [ ] Sudah di folder: `C:\Users\Interbat\Work-Order-Eng`
- [ ] Git portable sudah ditemukan
- [ ] Git config sudah setup (name & email)
- [ ] GitHub token sudah di-generate
- [ ] Sudah jalankan `git add .`
- [ ] Sudah jalankan `git commit -m "..."`
- [ ] Internet connection stabil
- [ ] Repository URL benar: `https://github.com/cecep-darjo/Work-Order-Eng`

---

## 💾 Quick Copy-Paste Commands

**Setup (run sekali):**
```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
& $gitPath config --global user.name "Your Name"
& $gitPath config --global user.email "your@email.com"
```

**Push workflow:**
```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
cd 'C:\Users\Interbat\Work-Order-Eng'
& $gitPath add .
& $gitPath commit -m "feat: Your commit message"
& $gitPath push origin main
```

**Pull workflow:**
```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
cd 'C:\Users\Interbat\Work-Order-Eng'
& $gitPath pull origin main
```

---

## 🎯 Next Steps

1. ✅ Cari lokasi git portable
2. ✅ Setup git config
3. ✅ Generate GitHub token
4. ✅ Jalankan push untuk pertama kali
5. ✅ Verifikasi di GitHub
6. ✅ Pelajari pull & common commands

---

## 📞 Jika Ada Error

Catat:
- Error message yang muncul
- Command apa yang Anda jalankan
- Output di PowerShell

Kemudian hubungi saya dengan informasi tersebut, dan saya akan membantu debug! 👍

---

**Good luck! Semoga berhasil! 🚀**
