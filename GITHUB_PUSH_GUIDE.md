# How to Push to GitHub - Step by Step

## ✅ Your API Keys Are Now Secure!

I've set up your project so that:
- ✅ API keys are in `.env.local` (NOT committed to git)
- ✅ `config.ts` reads from environment variables
- ✅ `.env.example` shows teammates what keys they need
- ✅ Your Firebase will be shared with your team

---

## 🚀 Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it: `agriconnect` (or any name you want)
4. **DO NOT** initialize with README (we already have code)
5. Click "Create repository"

### Step 2: Initialize Git (if not already done)

```bash
cd AGRICONNECT-FINAL-main
git init
```

### Step 3: Add All Files

```bash
git add .
```

This will add all files EXCEPT:
- `.env.local` (your real API keys - gitignored!)
- `node_modules/` (dependencies)

### Step 4: Commit

```bash
git commit -m "Initial commit - AgriConnect app with Firebase"
```

### Step 5: Add Remote & Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/agriconnect.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

---

## 👥 Share with Your Team

### Step 1: Add Collaborators on GitHub

1. Go to your repository on GitHub
2. Click "Settings" → "Collaborators"
3. Add your friends' GitHub usernames

### Step 2: Share API Keys Securely

**DO NOT** share API keys on GitHub!

**Option A: Share via Secure Message**
Send them the contents of your `.env.local` file via:
- WhatsApp
- Email
- Discord DM
- Any private channel

**Option B: Add Them to Firebase**
1. Go to Firebase Console
2. Project Settings → Users and permissions
3. Add their email addresses
4. They can see the Firebase config themselves

### Step 3: They Clone & Setup

They run:
```bash
git clone https://github.com/YOUR_USERNAME/agriconnect.git
cd agriconnect
npm install
# Create .env.local with the keys you shared
npm run dev
```

---

## 🔒 Security Checklist

Before pushing, verify:
- [ ] `.env.local` is in `.gitignore`
- [ ] `config.ts` uses `import.meta.env.VITE_*`
- [ ] `.env.example` has NO real values (just placeholders)
- [ ] No API keys in any committed files

---

## ✅ You're Done!

Your code is now on GitHub with:
- ✅ Secure API keys (not in git)
- ✅ Team can collaborate
- ✅ Everyone uses YOUR Firebase
- ✅ UI/colors/functionality preserved

**Your teammates will see the same data you do in Firebase!**
