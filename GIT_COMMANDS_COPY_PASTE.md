# 📋 Git Commands - Copy & Paste Ready

Salin command di bawah sesuai kebutuhan. Ganti `C:\git-portable\cmd\git.exe` dengan lokasi git portable Anda.

---

## 🔍 Step 1: Setup Awal (Run Sekali)

```powershell
# STEP 1: Set variable untuk git path (GANTI dengan lokasi git portable Anda!)
$gitPath = "C:\git-portable\cmd\git.exe"

# STEP 2: Configure git
& $gitPath config --global user.name "Interbat Developer"
& $gitPath config --global user.email "dev@interbat.com"

# STEP 3: Verify
& $gitPath config --global user.name
& $gitPath config --global user.email
```

---

## 📤 Push ke GitHub (Upload Code)

**Jalankan command ini setelah Anda membuat perubahan di project:**

```powershell
# Setup path
$gitPath = "C:\git-portable\cmd\git.exe"

# Masuk folder project
cd 'C:\Users\Interbat\Work-Order-Eng'

# 1. Lihat status perubahan
& $gitPath status

# 2. Tambahkan semua file yang berubah
& $gitPath add .

# 3. Commit dengan message
& $gitPath commit -m "feat: Add login and admin settings features"

# 4. Push ke GitHub
& $gitPath push origin main
```

**Saat diminta credential:**
- Username: `cecep-darjo`
- Password: `<paste github token Anda>`

**Output yang diharapkan:**
```
To https://github.com/cecep-darjo/Work-Order-Eng
   xxxxxx..yyyyyy  main -> main
```

✅ Push berhasil! Cek di https://github.com/cecep-darjo/Work-Order-Eng

---

## 📥 Pull dari GitHub (Download Changes)

**Jalankan jika ada perubahan di GitHub yang ingin Anda download:**

```powershell
# Setup path
$gitPath = "C:\git-portable\cmd\git.exe"

# Masuk folder project
cd 'C:\Users\Interbat\Work-Order-Eng'

# Pull dan merge sekaligus
& $gitPath pull origin main
```

**Output yang diharapkan:**
```
Already up to date.
```

atau jika ada perubahan:

```
Updating xxxxxx..yyyyyy
Fast-forward
 src/file.tsx | 50 ++++++++++++
```

---

## 🔄 Workflow Lengkap: Pull + Change + Push

**Urutan yang benar sebelum push:**

```powershell
$gitPath = "C:\git-portable\cmd\git.exe"

# 1. Masuk folder
cd 'C:\Users\Interbat\Work-Order-Eng'

# 2. Pull latest changes dari GitHub
& $gitPath pull origin main

# ... Sekarang Anda bisa ubah file di VS Code ...

# 3. Lihat perubahan
& $gitPath status

# 4. Tambah file
& $gitPath add .

# 5. Commit
& $gitPath commit -m "feat: Describe your changes"

# 6. Push
& $gitPath push origin main
```

---

## 📊 Lihat History & Status

### Lihat commit terakhir:
```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
cd 'C:\Users\Interbat\Work-Order-Eng'

# Lihat 5 commit terakhir
& $gitPath log --oneline -5
```

Output:
```
a1b2c3d feat: Add login feature
d4e5f6g fix: Update validation
h7i8j9k chore: Update dependencies
...
```

### Lihat status repository:
```powershell
& $gitPath status
```

Output:
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### Lihat semua branch:
```powershell
& $gitPath branch -a
```

---

## ⚡ Common Commit Messages

Gunakan format ini untuk commit message yang konsisten:

```powershell
# Fitur baru
& $gitPath commit -m "feat: Add login feature"

# Bug fix
& $gitPath commit -m "fix: Resolve validation error"

# Documentation
& $gitPath commit -m "docs: Update README"

# Code cleanup
& $gitPath commit -m "refactor: Improve code structure"

# Dependencies
& $gitPath commit -m "chore: Update npm packages"

# Performance
& $gitPath commit -m "perf: Optimize database queries"

# Merge/Conflict resolve
& $gitPath commit -m "chore: Resolve merge conflict"
```

---

## 🚨 Troubleshooting Commands

### Git tidak ditemukan?
```powershell
# Cari git.exe di sistem
Get-ChildItem -Path C:\, D:\ -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue
```

### Undo last commit (keep files):
```powershell
$gitPath = "C:\git-portable\cmd\git.exe"
cd 'C:\Users\Interbat\Work-Order-Eng'

& $gitPath reset --soft HEAD~1
```

### Undo last commit (discard files):
```powershell
& $gitPath reset --hard HEAD~1
```

### Discard all local changes:
```powershell
& $gitPath restore .
```

### Force push (use with caution!):
```powershell
& $gitPath push origin main --force
```

---

## 📌 Important Reminders

1. **Selalu pull sebelum push** untuk menghindari konflik
2. **Commit message yang jelas** agar mudah dipahami
3. **Jangan push tanpa verifikasi** bahwa file yang mau di-push itu benar
4. **Token GitHub aman-kan** jangan share dengan orang lain
5. **Pull regular** untuk sync dengan repository terbaru

---

## 🎯 First Push Checklist

- [ ] Cari lokasi git portable
- [ ] Setup git config (name & email)
- [ ] Generate GitHub token
- [ ] Jalankan: `git add .`
- [ ] Jalankan: `git commit -m "..."`
- [ ] Jalankan: `git push origin main`
- [ ] Verify di GitHub

---

**Happy coding! 🚀**
