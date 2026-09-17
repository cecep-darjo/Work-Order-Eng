# ✅ Git Setup Checklist

## 📋 Persiapan

- [ ] Cari lokasi git portable (catat path lengkapnya)
- [ ] Punya GitHub account (https://github.com/cecep-darjo)
- [ ] Punya email yang terdaftar di GitHub
- [ ] Paham struktur project di `C:\Users\Interbat\Work-Order-Eng`

---

## 🔧 Step 1: Setup (Sekali Saja)

```powershell
# 1. Buka PowerShell
# 2. Copy command ini dan paste:

$gitPath = "C:\git-portable\cmd\git.exe"
& $gitPath config --global user.name "Interbat Developer"
& $gitPath config --global user.email "your-email@github.com"

# 3. Verifikasi (harus muncul nama dan email)
& $gitPath config --global user.name
& $gitPath config --global user.email

# ✅ Jika muncul output, setup berhasil!
```

**Checklist:**
- [ ] Command dijalankan tanpa error
- [ ] Output menunjukkan nama dan email yang benar

---

## 🌐 Step 2: Generate GitHub Token

1. [ ] Buka https://github.com/settings/tokens
2. [ ] Login ke GitHub
3. [ ] Klik "Generate new token" → "Generate new token (classic)"
4. [ ] Isi:
   - Token name: `Work Order Project`
   - Expiration: `90 days`
5. [ ] Check scopes:
   - [ ] `repo`
   - [ ] `workflow`
6. [ ] Klik "Generate token"
7. [ ] **COPY TOKEN** (simpan ke tempat aman!)

**Format token:**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Checklist:**
- [ ] Token sudah di-generate
- [ ] Token sudah di-copy dan disimpan

---

## 📤 Step 3: Push Pertama Kali

```powershell
# 1. Setup
$gitPath = "C:\git-portable\cmd\git.exe"

# 2. Masuk folder project
cd 'C:\Users\Interbat\Work-Order-Eng'

# 3. Cek status
& $gitPath status

# 4. Tambah file
& $gitPath add .

# 5. Commit
& $gitPath commit -m "feat: Add login and admin settings features

- Add login page with validation
- Add admin settings page
- Add user management
- Add responsive UI"

# 6. Push
& $gitPath push origin main
```

**Saat muncul login:**
- Username: `cecep-darjo`
- Password: Paste token Anda

**Output yang diharapkan:**
```
To https://github.com/cecep-darjo/Work-Order-Eng
   xxxxxx..yyyyyy  main -> main
```

**Checklist:**
- [ ] `git status` berhasil dijalankan
- [ ] `git add .` berhasil
- [ ] `git commit -m "..."` berhasil
- [ ] `git push origin main` berhasil
- [ ] Tidak ada error message

---

## ✅ Verifikasi Push Berhasil

1. [ ] Buka https://github.com/cecep-darjo/Work-Order-Eng
2. [ ] Lihat file-file sudah ter-upload:
   - [ ] `src/pages/Login.tsx`
   - [ ] `src/pages/SettingsPage.tsx`
   - [ ] `.env`
   - [ ] File lainnya
3. [ ] Lihat commit message di bagian atas
4. [ ] Klik commit, lihat detail perubahan

---

## 📥 Step 4: Pull dari GitHub (Opsional)

Untuk download perubahan dari GitHub:

```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
cd 'C:\Users\Interbat\Work-Order-Eng'

& $gitPath pull origin main
```

**Checklist:**
- [ ] Pull berhasil dijalankan
- [ ] Tidak ada error

---

## 🔄 Workflow Sehari-hari

Setelah setup, ini yang Anda lakukan setiap hari:

```powershell
# Setup (sekali)
$git = "C:\git-portable\cmd\git.exe"

# Setiap kali kerja:
cd 'C:\Users\Interbat\Work-Order-Eng'

# 1. Pull dulu (buat sure punya versi terbaru)
& $git pull origin main

# 2. Edit file di VS Code...

# 3. Push perubahan Anda
& $git add .
& $git commit -m "feat: Describe your work"
& $git push origin main

# 4. Verify di GitHub
```

**Checklist:**
- [ ] Sudah memahami workflow ini
- [ ] Siap untuk push pertama kali

---

## 🆘 Troubleshooting Quick Fix

### Git tidak ditemukan?
```powershell
# Cari git.exe
Get-ChildItem -Path C:\, D:\ -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue
```
- [ ] Lokasi git.exe ditemukan

### Error: "Authentication failed"?
- [ ] Token sudah di-generate
- [ ] Token belum expire
- [ ] Token di-copy dengan benar

### Error: "not a git repository"?
- [ ] Sudah di folder: `C:\Users\Interbat\Work-Order-Eng`
- [ ] Folder memiliki folder `.git`

### Error: "Your branch is ahead"?
- [ ] Jalankan `git push origin main`
- [ ] Ini normal setelah commit

---

## 📚 File Panduan Lengkap

Jika Anda butuh penjelasan lebih:

1. **QUICK_START_GIT.md** ← Mulai dari sini (ringkas)
2. **TUTORIAL_GIT_STEP_BY_STEP.md** ← Penjelasan detail
3. **GIT_COMMANDS_COPY_PASTE.md** ← Command siap pakai
4. **GIT_PORTABLE_GUIDE.md** ← Panduan git portable

---

## 🎯 Target Completion

- [ ] Setup git config
- [ ] Generate GitHub token
- [ ] Push project pertama kali
- [ ] Verify di GitHub
- [ ] Pahami workflow sehari-hari
- [ ] Siap untuk pull/push berikutnya

---

## 📞 Butuh Bantuan?

Jika ada error, catat:
- Error message yang muncul
- Command apa yang dijalankan
- Output di PowerShell

Kemudian hubungi saya dengan informasi tersebut! 👍

---

**Good luck! Semoga semua berjalan lancar! 🚀**

---

## 📊 Summary

| Tahap | Aksi | Status |
|------|------|--------|
| 1 | Setup git config | - [ ] |
| 2 | Generate GitHub token | - [ ] |
| 3 | Push pertama kali | - [ ] |
| 4 | Verify di GitHub | - [ ] |
| 5 | Memahami workflow | - [ ] |

Setelah semua selesai, Anda siap untuk bekerja dengan Git! 🎉
