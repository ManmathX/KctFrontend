# Quick Reference - College Detail System

## \ud83d\ude80 Quick Start (5 minutes)

```bash
# 1. Get Turso token
turso db tokens create manmath-mohanty-manmathx

# 2. Create .env file
echo "VITE_TURSO_AUTH_TOKEN=your_token_here" > .env

# 3. Start app
npm run dev

# 4. Open admin panel
# http://localhost:5173/admin.html
```

## \ud83d\udcdd Common Tasks

### Add a College

1. Open admin panel
2. Click "+ Add College"
3. Fill in details:
   - **College Code**: E001, E002, etc. (from your data)
   - **College Name**: Full official name
   - **Location**: Address
   - **City**: Bengaluru, Mysuru, etc.
   - **Description**: 2-3 sentences about the college
   - **Photo URL**: Direct image link (HTTPS)
   - **Website**: Official college website
   - **Established Year**: e.g., 1963
   - **Affiliation**: e.g., "Autonomous, VTU"
4. Click "Save"

### Get Photo URL

**Quick Method (ImgBB):**
1. Go to https://imgbb.com/
2. Upload photo
3. Copy "Direct link"
4. Paste in admin panel

### Edit College Info

1. Find college in admin panel
2. Click "Edit"
3. Update fields
4. Click "Save"

### Test in Main App

1. Go to main predictor
2. Search for colleges
3. Click on college name
4. Detail modal opens!

## \ud83d\udcca Files Created

```
/Rank-predict/
\u251c\u2500\u2500 src/
\u2502   \u251c\u2500\u2500 db.js                    # Database functions
\u2502   \u251c\u2500\u2500 CollegeDetail.jsx        # Detail modal component
\u2502   \u251c\u2500\u2500 collegeExtractor.js      # Data extraction utility
\u2502   \u2514\u2500\u2500 App.jsx                  # Updated with detail integration
\u251c\u2500\u2500 admin.html                   # Admin panel
\u251c\u2500\u2500 extract-colleges.html        # College list extractor
\u251c\u2500\u2500 .env.example                 # Environment template
\u251c\u2500\u2500 SETUP_GUIDE.md               # Full setup guide
\u2514\u2500\u2500 QUICK_REFERENCE.md           # This file
```

## \u26a1 Keyboard Shortcuts

- **ESC**: Close college detail modal
- **Click outside**: Close modal

## \ud83d\udd17 Important URLs

- Main App: `http://localhost:5173/`
- Admin Panel: `http://localhost:5173/admin.html`
- College Extractor: `http://localhost:5173/extract-colleges.html`

## \ud83d\udca1 Pro Tips

1. **Start Small**: Add top 10 colleges first
2. **Use Good Photos**: Campus photos work best
3. **Keep Descriptions Short**: 2-3 sentences max
4. **Verify Links**: Test website URLs before saving
5. **Backup Data**: Export JSON regularly from admin panel

## \u26a0\ufe0f Common Issues

| Issue | Solution |
|-------|----------|
| "Database error" | Check auth token in admin panel |
| Photos not loading | Use HTTPS URLs only |
| College not found | Verify college_code matches data.json |
| Modal not opening | Check browser console for errors |

## \ud83d\udcde Need Help?

1. Check SETUP_GUIDE.md for detailed instructions
2. Check browser console (F12) for errors
3. Verify .env file exists and has correct token
4. Restart dev server: `npm run dev`

---

**Quick Win:** Add RV College (E005) first - it's popular and easy to find photos for!
