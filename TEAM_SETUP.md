# AgriConnect - Setup Guide for Team Members

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd AGRICONNECT-FINAL-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

**Copy the example file:**
```bash
copy .env.example .env.local
```

**Ask the project owner for the actual API keys and update `.env.local` with:**
- Firebase configuration values
- OpenWeatherMap API key

> **Note**: The `.env.local` file is gitignored and will NOT be committed. This keeps our API keys secure!

### 4. Run the Application

**Start Frontend:**
```bash
npm run dev
```

**Start Backend (optional):**
```bash
cd server
npm start
```

### 5. Access the App
Open http://localhost:3000 in your browser

---

## 🔥 Firebase Setup

**All team members will use the SAME Firebase project** (agriconnect-18c94)

This means:
- ✅ All data is shared across the team
- ✅ Everyone sees the same users, jobs, equipment
- ✅ No need to create separate Firebase projects

**To get access:**
1. Ask the project owner to add you as a collaborator in Firebase Console
2. Use the `.env.local` file provided by the owner

---

## 📁 Project Structure

```
AGRICONNECT-FINAL-main/
├── components/          # React components
├── services/           # Firebase & API services
├── config.ts           # Configuration (uses env variables)
├── .env.local          # YOUR API keys (DO NOT COMMIT)
├── .env.example        # Template for API keys
└── server/             # Backend API (optional)
```

---

## 🎨 UI/UX Guidelines

**Colors:**
- Primary: Green (#22c55e shades)
- Background: White
- Text: Gray shades

**Font:**
- "Inter" from Google Fonts

**Keep the existing design consistent!**

---

## 🔒 Security Rules

**NEVER commit:**
- `.env.local` (contains real API keys)
- Any file with sensitive data

**ALWAYS commit:**
- `.env.example` (template only)
- Code changes
- Documentation

---

## 🐛 Troubleshooting

**Issue: "Firebase not configured"**
- Check if `.env.local` exists
- Verify all Firebase values are correct

**Issue: "Weather widget not loading"**
- Check `VITE_WEATHER_API_KEY` in `.env.local`

**Issue: "Port 3000 already in use"**
- Vite will automatically use port 3001
- Or kill the process using port 3000

---

## 📞 Need Help?

Contact the project owner for:
- API keys (`.env.local` values)
- Firebase console access
- Any setup issues

---

## ✅ You're Ready!

Once setup is complete, you can:
- Create new features
- Fix bugs
- Improve UI/UX
- All changes will sync to the shared Firebase!
