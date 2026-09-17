# Git Portable - Panduan Push & Pull ke GitHub

## 🔍 Step 1: Setup Git Portable

### A. Tentukan lokasi Git Portable Anda
Biasanya git portable terletak di:
- `C:\git-portable\cmd\git.exe`
- `C:\tools\git\cmd\git.exe`
- `D:\git-portable\cmd\git.exe`
- atau folder lainnya

### B. Cari lokasi git.exe:
Buka File Explorer dan cari file `git.exe` di komputer Anda.

Catat path lengkapnya, contoh: `C:\git-portable\cmd\git.exe`

---

## 🔐 Step 2: Setup GitHub Credentials

### A. Buka PowerShell dan setup git config:

```powershell
# Tentukan path git portable Anda (sesuaikan dengan lokasi Anda)
$gitPath = "C:\git-portable\cmd\git.exe"

# Setup global config
& $gitPath config --global user.name "Your Name"
& $gitPath config --global user.email "your.email@github.com"

# Verify setup
& $gitPath config --global user.name
& $gitPath config --global user.email
```

### B. Setup GitHub Personal Access Token (PAT):

1. Buka: https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. Beri nama: `Work Order Project`
4. Pilih scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow`
   - ✅ `user:email`
5. Klik **"Generate token"**
6. **Copy token** (hanya muncul sekali!)
7. Simpan token di tempat aman

---

## 📤 Step 3: PUSH ke GitHub (Upload Changes)

### A. Buat alias untuk git portable (Opsional tapi Recommended):

```powershell
# Add ini ke PowerShell profile agar bisa pakai "git" langsung
# Buka PowerShell sebagai Admin

$profilePath = $PROFILE
if (!(Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force
}

# Add function ke profile
Add-Content -Path $profilePath -Value @"

# Git Portable Alias
function git {
    & "C:\git-portable\cmd\git.exe" @args
}
"@

# Reload PowerShell
. $profilePath
```

Setelah ini, Anda bisa pakai `git` langsung tanpa perlu path lengkap.

---

### B. Push Workflow Lengkap:

```powershell
# Masuk ke project folder
cd 'C:\Users\Interbat\Work-Order-Eng'

# 1. Check status (lihat file yang berubah)
git status

# 2. Tambahkan semua file
git add .

# 3. Commit dengan message yang deskriptif
git commit -m "feat: Add login and admin settings features

- Add login page with username/password validation
- Add admin-only settings page for user management
- Add logout functionality in topbar
- Add responsive UI with Tailwind CSS"

# 4. Push ke repository
git push origin main
```

Saat diminta **Username & Password**:
- **Username**: `cecep-darjo` (GitHub username Anda)
- **Password**: Paste token yang Anda generate tadi

---

## 📥 Step 4: PULL dari GitHub (Download Changes)

### Pull changes dari remote repository:

```powershell
# Masuk ke project folder
cd 'C:\Users\Interbat\Work-Order-Eng'

# 1. Fetch latest changes (lihat tanpa merge)
git fetch origin

# 2. Pull dan merge sekaligus
git pull origin main
```

---

## 🔄 Step 5: Common Git Workflows

### A. Sync lokal dengan remote:
```powershell
# Pull latest first
git pull origin main

# Buat perubahan lokal...

# Kemudian push
git add .
git commit -m "fix: describe your changes"
git push origin main
```

### B. Melihat history commits:
```powershell
# Lihat log commits
git log --oneline -10

# Lihat commit tertentu
git show <commit-hash>
```

### C. Membuat & switch branch:
```powershell
# Buat branch baru
git checkout -b feature/login-page

# Lihat branch aktif
git branch

# Switch ke branch lain
git checkout main

# Push branch ke remote
git push origin feature/login-page

# Delete branch lokal
git branch -d feature/login-page

# Delete branch remote
git push origin --delete feature/login-page
```

---

## 🛠️ Step 6: Setup `.git\config` Manual (Jika perlu)

Jika ingin setup credentials di local repository saja:

```powershell
cd 'C:\Users\Interbat\Work-Order-Eng'
git config user.name "Your Name"
git config user.email "your.email@github.com"

# Verify
git config user.name
git config user.email
```

---

## ⚡ Quick Reference - Copy & Paste Commands

### Assuming git portable di: `C:\git-portable\cmd\git.exe`

```powershell
# Setup (run once)
$git = "C:\git-portable\cmd\git.exe"
& $git config --global user.name "Your Name"
& $git config --global user.email "your@email.com"

# Push workflow
cd 'C:\Users\Interbat\Work-Order-Eng'
& $git add .
& $git commit -m "feat: your message here"
& $git push origin main

# Pull workflow
cd 'C:\Users\Interbat\Work-Order-Eng'
& $git pull origin main
```

---

## 🔍 Troubleshooting

### Error: "fatal: not a git repository"
**Solusi**: Pastikan Anda sudah di folder yang benar:
```powershell
cd 'C:\Users\Interbat\Work-Order-Eng'
```

### Error: "fatal: 'origin' does not appear to be a 'git' repository"
**Solusi**: Inisialisasi repository:
```powershell
git remote -v  # Check current remotes
git remote add origin https://github.com/cecep-darjo/Work-Order-Eng.git
git branch -M main  # Rename branch ke main
```

### Error: "fatal: Authentication failed"
**Solusi**: 
- Pastikan PAT token sudah di-generate (bukan password!)
- Cek token belum expired
- Re-enter credentials saat diminta

### Lihat commits di GitHub:
```powershell
# Lihat apa yang akan di-push
git log --oneline origin/main..HEAD

# Lihat history remote
git log origin/main --oneline -10
```

---

## 📊 Git Status Meanings

```
Modified (M)  - File telah diubah
Added (A)     - File baru ditambahkan
Deleted (D)   - File dihapus
Renamed (R)   - File di-rename
Untracked (?) - File baru belum di-track
```

---

## ✅ Checklist Sebelum Push

- [ ] Sudah di folder yang benar (`C:\Users\Interbat\Work-Order-Eng`)
- [ ] Sudah pull latest changes terlebih dahulu
- [ ] File-file tidak ada konflik
- [ ] Commit message deskriptif
- [ ] PAT token sudah di-generate di GitHub
- [ ] Internet connection stabil

---

## 📝 Contoh Full Push Session

```powershell
# 1. Setup (run sekali)
$git = "C:\git-portable\cmd\git.exe"
& $git config --global user.name "Interbat Developer"
& $git config --global user.email "dev@interbat.com"

# 2. Masuk folder project
cd 'C:\Users\Interbat\Work-Order-Eng'

# 3. Check status
& $git status

# 4. Pull latest
& $git pull origin main

# 5. Add changes
& $git add .

# 6. Commit
& $git commit -m "feat: Add login feature with validation and admin settings"

# 7. Push
& $git push origin main

# 8. Verify
& $git log --oneline -5
```

---

## 🎯 Next Steps

1. **Cari lokasi git portable** Anda
2. **Setup git config** dengan nama & email
3. **Generate GitHub PAT token**
4. **Push project** pertama kali ke GitHub
5. **Verify** di https://github.com/cecep-darjo/Work-Order-Eng

Silakan ikuti panduan ini! Jika ada error, kasih tahu nama error-nya dan saya bantu debug. 👍
