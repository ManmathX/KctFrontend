# College Detail Page & Admin Panel - Complete Setup Guide

## \ud83c\udfaf Overview

This system adds:
1. **College Detail Pages** - Clickable college names that show detailed information
2. **Admin Panel** - Web interface to manage college data (photos, descriptions, etc.)
3. **Turso Database Integration** - Cloud database to store college information

## \ud83d\udee0\ufe0f Setup Steps

### Step 1: Get Turso Auth Token

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create auth token for your database
turso db tokens create manmath-mohanty-manmathx
```

Copy the token that's generated.

### Step 2: Configure Environment

Create `.env` file in project root:

```bash
VITE_TURSO_AUTH_TOKEN=your_token_here
```

**Important:** Never commit this file to Git (it's already in .gitignore)

### Step 3: Run the Application

```bash
npm run dev
```

### Step 4: Access Admin Panel

Open: `http://localhost:5173/admin.html`

When prompted, enter your Turso auth token.

The database table will be created automatically on first use.

## \ud83d\udcca How It Works

### For Users (Main App)

1. User searches for colleges in the predictor
2. Clicks on any college name in the results
3. A modal opens showing:
   - College photo (if available)
   - Full name and location
   - Description
   - Established year
   - Affiliation
   - Website link
   - College code

### For Admins (Admin Panel)

1. View all colleges in the database
2. Add new colleges with:
   - College code (from data.json)
   - College name
   - Location & city
   - Description
   - Photo URL
   - Website
   - Established year
   - Affiliation
3. Edit existing college information
4. Delete colleges

## \ud83d\udcbe Database Schema

```sql
CREATE TABLE colleges (
  college_code TEXT PRIMARY KEY,
  college_name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  description TEXT,
  photo_url TEXT,
  website TEXT,
  established_year INTEGER,
  affiliation TEXT
)
```

## \ud83d\uddbc\ufe0f Adding College Photos

### Option 1: Free Image Hosting

**ImgBB** (Recommended - Free, no account needed)
1. Go to https://imgbb.com/
2. Upload college photo
3. Copy "Direct link"
4. Paste in admin panel

**Cloudinary** (Free tier available)
1. Sign up at https://cloudinary.com/
2. Upload image
3. Copy image URL
4. Paste in admin panel

### Option 2: College Official Websites

1. Visit college's official website
2. Find their main photo/logo
3. Right-click → "Copy Image Address"
4. Paste in admin panel

### Photo Guidelines

- Use high-quality images (at least 1200x800px)
- Prefer landscape orientation
- Use HTTPS URLs only
- Recommended: Campus photos, main building, or official college photos

## \ud83d\udce6 Bulk Import Colleges

### Extract College List

1. Open `http://localhost:5173/extract-colleges.html`
2. Click "Extract Colleges"
3. You'll see all ${DATA.meta.collegeCount} unique colleges
4. Download as JSON or CSV

### Import to Database

Currently, you need to add colleges one by one through the admin panel. 

**Future Enhancement:** Add bulk import feature to admin panel.

## \ud83d\udd17 Integration with Existing Data

The system automatically links with your existing `data.json`:

- College codes in database match codes in data.json (E001, E002, etc.)
- When user clicks a college, system checks database first
- If not in database, shows basic info from data.json
- Users see a notice: "Basic information shown. Full details will be available soon."

## \ud83d\udcdd Example College Entry

```json
{
  "college_code": "E005",
  "college_name": "R. V. College of Engineering, Bangalore",
  "location": "R.V. VIDYANIKETAN POST, MYSORE ROAD",
  "city": "Bengaluru",
  "description": "RV College of Engineering (RVCE) is one of the oldest and most prestigious engineering colleges in Bangalore. Established in 1963, it is known for its excellent academic programs, experienced faculty, and strong industry connections. The college offers undergraduate and postgraduate programs in various engineering disciplines.",
  "photo_url": "https://example.com/rvce-campus.jpg",
  "website": "https://www.rvce.edu.in/",
  "established_year": 1963,
  "affiliation": "Autonomous, VTU"
}
```

## \ud83d\udd12 Security Notes

1. **Auth Token**: Keep your Turso auth token secret
2. **Admin Panel**: Currently uses prompt-based auth
   - For production: Add proper authentication
   - Consider: Password protection, admin login system
3. **Photo URLs**: Only use HTTPS URLs from trusted sources

## \ud83d\udc1b Troubleshooting

### "Database error" in admin panel
- Check auth token is correct
- Verify internet connection
- Check Turso database is accessible

### College details not showing
- Verify college_code matches data.json
- Check browser console for errors
- Ensure .env file is configured

### Photos not loading
- Verify URL is accessible (open in browser)
- Ensure URL uses HTTPS
- Check URL points directly to image file
- Try a different image hosting service

### "Module not found" errors
- Run `npm install`
- Restart dev server

## \ud83d\ude80 Next Steps

1. **Populate Database**
   - Start with top 20-30 popular colleges
   - Add photos and descriptions
   - Fill in website links

2. **Enhance Admin Panel**
   - Add bulk import feature
   - Add image upload (instead of URL)
   - Add authentication system
   - Add search/filter in admin

3. **Improve User Experience**
   - Add loading animations
   - Add image lazy loading
   - Add college comparison feature
   - Add "Report incorrect info" button

## \ud83d\udcca Statistics

- Total Colleges in data.json: **${DATA.meta.collegeCount}**
- Total Programs: **${DATA.meta.programRows}**
- Cities Covered: **${DATA.cities.length}**

## \ud83d\udcde Support

For issues or questions:
- Check browser console for errors
- Verify all setup steps completed
- Check Turso dashboard for database status

---

**Made with \u2764\ufe0f for KCET Students**
