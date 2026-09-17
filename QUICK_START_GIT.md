# 🚀 Quick Start - Git Portable

## 📝 TL;DR (Terlalu Panjang Tidak Dibaca)

1. **Setup** (sekali):
```powershell
$git = "C:\git-portable\cmd\git.exe"
& $git config --global user.name "Your Name"
& $git config --global user.email "your@email.com"
```

2. **Push**:
```powershell
cd 'C:\Users\Interbat\Work-Order-Eng'
& $git add .
& $git commit -m "feat: your message"
& $git push origin main
```

3. **Pull**:
```powershell
cd 'C:\Users\Interbat\Work-Order-Eng'
& $git pull origin main
```

---

## 📌 Poin Penting

| Perintah | Fungsi | Kapan Digunakan |
|----------|--------|-----------------|
| `git status` | Lihat perubahan | Sebelum add |
| `git add .` | Siapkan file | Sebelum commit |
| `git commit -m "..."` | Catat perubahan | Sebelum push |
| `git push origin main` | Upload ke GitHub | Setelah commit |
| `git pull origin main` | Download dari GitHub | Sebelum mulai bekerja |
| `git log --oneline` | Lihat history | Cek commit terakhir |

---

## 🎯 Tiga Langkah Utama

### 1️⃣ ADD - Persiapkan file
```powershell
& $git add .
```
Artinya: "Saya siap upload semua file yang berubah"

### 2️⃣ COMMIT - Catat perubahan
```powershell
& $git commit -m "feat: Add login feature"
```
Artinya: "Ini perubahan yang saya lakukan dengan pesan ini"

### 3️⃣ PUSH - Upload ke GitHub
```powershell
& $git push origin main
```
Artinya: "Upload semua commit saya ke GitHub"

---

## 📂 File Panduan Di Project Anda

- `TUTORIAL_GIT_STEP_BY_STEP.md` - Panduan lengkap step by step
- `GIT_COMMANDS_COPY_PASTE.md` - Command siap copy-paste
- `GIT_PORTABLE_GUIDE.md` - Panduan git portable khusus
- `GITHUB_PUSH_GUIDE.md` - Panduan push ke GitHub

---

## ❓ Yang Perlu Anda Siapkan

1. **Lokasi Git Portable**
   - Contoh: `C:\git-portable\cmd\git.exe`

2. **GitHub Token**
   - Buat di: https://github.com/settings/tokens
   - Scope: `repo` + `workflow`

3. **GitHub Username**
   - Contoh: `cecep-darjo`

4. **Email GitHub**
   - Yang Anda gunakan saat register GitHub

---

## ⚡ Alias (Opsional tapi Praktis)

Biar bisa pakai `git` tanpa perlu path panjang:

```powershell
# Edit PowerShell profile
code $PROFILE

# Tambahkan ini:
function git {
    & "C:\git-portable\cmd\git.exe" @args
}

# Reload:
. $PROFILE

# Sekarang bisa: git status, git push, dll
```

---

## 🎓 Belajar Lebih Lanjut

- **Official Git Book**: https://git-scm.com/book
- **GitHub Docs**: https://docs.github.com
- **Interactive Git Tutorial**: https://learngitbranching.js.org

---

## 💬 Perlu Bantuan?

Buka file yang sesuai:
- ❓ **Bagaimana setup?** → `TUTORIAL_GIT_STEP_BY_STEP.md`
- 📋 **Mau copy-paste command?** → `GIT_COMMANDS_COPY_PASTE.md`
- 🛠️ **Masalah git portable?** → `GIT_PORTABLE_GUIDE.md`
- 📤 **Mau push?** → `GITHUB_PUSH_GUIDE.md`

---

**Selamat belajar! Semoga sukses! 🎉**
