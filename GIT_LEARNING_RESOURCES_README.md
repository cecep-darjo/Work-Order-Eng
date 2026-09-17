# 📚 Git Learning Resources - README

Saya telah membuat beberapa panduan untuk membantu Anda belajar Git dan GitHub. Pilih sesuai kebutuhan Anda.

---

## 🎯 Mulai Dari Mana?

### 🚀 **Ingin cepat mulai?**
Baca: **`QUICK_START_GIT.md`**
- Ringkas, langsung ke poin
- Hanya 3 langkah utama
- Command siap copy-paste

### 📖 **Ingin penjelasan detail?**
Baca: **`TUTORIAL_GIT_STEP_BY_STEP.md`**
- Penjelasan lengkap setiap step
- Ada screenshot/output examples
- Troubleshooting included

### 📋 **Ingin command siap pakai?**
Baca: **`GIT_COMMANDS_COPY_PASTE.md`**
- Command sudah terformat rapi
- Tinggal copy-paste
- Organized by category (push, pull, etc)

### ✅ **Ingin checklist?**
Baca: **`GIT_SETUP_CHECKLIST.md`**
- Langkah-langkah dengan checklist
- Gampang di-track progress
- Validation untuk setiap step

### 🛠️ **Punya git portable?**
Baca: **`GIT_PORTABLE_GUIDE.md`**
- Panduan khusus git portable
- Cara setup & config
- Troubleshooting git portable

### 📤 **Langsung mau push?**
Baca: **`GITHUB_PUSH_GUIDE.md`**
- Fokus ke push saja
- Personal access token setup
- Common errors & solutions

---

## 📖 Panduan per Kebutuhan

### Saya pemula di Git
1. Baca: `QUICK_START_GIT.md` (5 menit)
2. Baca: `GIT_SETUP_CHECKLIST.md` (sambil setup)
3. Ikuti step-by-step dan centang checklist
4. Jika ada error, lihat: `TUTORIAL_GIT_STEP_BY_STEP.md`

### Saya sudah pernah pakai Git
1. Baca: `GIT_COMMANDS_COPY_PASTE.md`
2. Copy command yang Anda butuh
3. Paste di PowerShell dan jalankan

### Saya punya git portable khusus
1. Baca: `GIT_PORTABLE_GUIDE.md`
2. Ikuti setup git portable section
3. Kemudian ikuti push workflow

### Ada error?
1. Catat error message
2. Search di: `TUTORIAL_GIT_STEP_BY_STEP.md` section **Troubleshooting**
3. Jika tidak ketemu, lihat: `GIT_PORTABLE_GUIDE.md` section **Troubleshooting**

---

## 🚀 Quick Commands (TL;DR)

```powershell
# Setup (sekali)
$git = "C:\git-portable\cmd\git.exe"
& $git config --global user.name "Your Name"
& $git config --global user.email "your@email.com"

# Push
cd 'C:\Users\Interbat\Work-Order-Eng'
& $git add .
& $git commit -m "feat: your message"
& $git push origin main

# Pull
& $git pull origin main
```

---

## 📁 File Panduan Tersedia

```
GIT Learning Resources:
├── QUICK_START_GIT.md                     (← Mulai dari sini!)
├── GIT_SETUP_CHECKLIST.md                 (Checklist format)
├── TUTORIAL_GIT_STEP_BY_STEP.md          (Penjelasan detail)
├── GIT_COMMANDS_COPY_PASTE.md            (Command ready-to-use)
├── GIT_PORTABLE_GUIDE.md                 (Panduan git portable)
├── GITHUB_PUSH_GUIDE.md                  (Fokus push)
└── GIT_LEARNING_RESOURCES_README.md      (File ini)
```

---

## 🎓 Learning Path

### Minggu 1: Setup & Push Pertama
- [ ] Hari 1: Baca `QUICK_START_GIT.md`
- [ ] Hari 2: Setup git config
- [ ] Hari 3: Generate GitHub token
- [ ] Hari 4-5: Push pertama kali
- [ ] Hari 6-7: Verify & troubleshoot

### Minggu 2: Daily Workflow
- [ ] Push kalinya kedua, ketiga, dst
- [ ] Pelajari `git pull` untuk sync
- [ ] Pahami `git status` & `git log`
- [ ] Practice commit messages

### Minggu 3: Advanced (Opsional)
- [ ] Branch management
- [ ] Merge & conflict resolution
- [ ] Rebase & cherry-pick
- [ ] Stash & reset

---

## 💡 Tips

1. **Mulai dengan pelan** - Pahami setiap command
2. **Practice** - Lakukan push/pull beberapa kali sampai terbiasa
3. **Bacaan** - Jangan langsung copy-paste, baca dulu untuk paham
4. **Error OK** - Error adalah bagian dari learning, jangan takut
5. **Documentation** - Kalau lupa, refer ke file panduan ini

---

## ❓ FAQ

**Q: Command mana yang paling penting?**
A: `git add .`, `git commit -m "..."`, `git push origin main`

**Q: Bagaimana kalau saya lupa command?**
A: Lihat `GIT_COMMANDS_COPY_PASTE.md`

**Q: Apa bedanya git pull vs git fetch?**
A: Pull = fetch + merge. Fetch hanya download tanpa merge.

**Q: Bisa push ke branch lain?**
A: Ya, ganti `main` dengan nama branch: `git push origin feature-name`

**Q: Kalau ada error "fatal: not a git repository"?**
A: Pastikan Anda di folder yang benar: `C:\Users\Interbat\Work-Order-Eng`

---

## 🔗 Resources Tambahan

- Git Official: https://git-scm.com
- GitHub Docs: https://docs.github.com
- Interactive Tutorial: https://learngitbranching.js.org
- Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

## ✅ Sebelum Push

Pastikan sudah:
- [ ] Sudah di folder yang benar
- [ ] Sudah `git add .`
- [ ] Sudah `git commit -m "..."`
- [ ] Git config sudah setup
- [ ] GitHub token sudah di-generate
- [ ] Internet connection OK

---

## 📞 Support

Jika ada pertanyaan atau error:
1. Cek file panduan yang relevan
2. Search di troubleshooting section
3. Catat error message lengkap
4. Hubungi saya dengan error message

---

## 🎉 Target

Setelah baca panduan ini dan ikuti step-by-step:
✅ Mampu push project ke GitHub
✅ Mampu pull perubahan dari GitHub
✅ Memahami git workflow
✅ Siap untuk development berkelanjutan

---

**Good luck dengan Git learning journey Anda! 🚀**

**Jangan malu bertanya jika ada yang tidak dimengerti!** 👍
