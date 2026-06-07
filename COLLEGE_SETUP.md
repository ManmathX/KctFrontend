# College Detail & Admin Setup Guide

## Overview
This guide explains how to set up the college detail page and admin panel for managing college data in your Turso database.

## Prerequisites
- Turso account and database created
- Auth token from Turso

## Setup Steps

### 1. Get Your Turso Auth Token
```bash
# Install Turso CLI if not already installed
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Get your auth token
turso db tokens create manmath-mohanty-manmathx
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` and add your Turso auth token:
```
VITE_TURSO_AUTH_TOKEN=your_actual_token_here
```

### 3. Database Schema
The database table will be automatically created when you first open the admin panel. The schema includes:
- `college_code` (TEXT, PRIMARY KEY)
- `college_name` (TEXT, NOT NULL)
- `location` (TEXT)
- `city` (TEXT)
- `description` (TEXT)
- `photo_url` (TEXT)
- `website` (TEXT)
- `established_year` (INTEGER)
- `affiliation` (TEXT)

### 4. Run the Application
```bash
npm run dev
```

### 5. Access Admin Panel
Open `http://localhost:5173/admin.html` in your browser.

When prompted, enter your Turso auth token.

## Features

### College Detail Page
- Displays when users click on a college name in the results
- Shows college photo, description, location, established year, affiliation
- Includes link to college website

### Admin Panel
- Add new colleges with all details
- Edit existing college information
- Delete colleges
- Upload college photos (via URL)
- Manage all college metadata

## Adding College Photos

### Option 1: Use Image Hosting Services
- Upload images to services like:
  - Cloudinary
  - ImgBB
  - AWS S3
  - Imgur
- Copy the direct image URL
- Paste in the "Photo URL" field in admin panel

### Option 2: Use College Official Websites
- Find the college's official photo
- Right-click → Copy Image Address
- Paste in the "Photo URL" field

## Usage in Main App

When users click on a college name in the predictor results, a modal will open showing:
- College photo (if available)
- Full college name
- Location and city
- Description
- Established year
- Affiliation
- College code
- Link to official website

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Admin panel auth** - Currently uses prompt-based auth. For production, implement proper authentication
3. **Photo URLs** - Ensure URLs are from trusted sources and use HTTPS

## Troubleshooting

### "Database error" in admin panel
- Check your auth token is correct
- Verify database URL is correct
- Ensure you have internet connection

### College details not showing
- Verify college_code in database matches the code in data.json
- Check browser console for errors
- Ensure .env file is properly configured

### Photos not loading
- Verify the photo URL is accessible
- Check if the URL uses HTTPS
- Ensure the URL points directly to an image file

## Next Steps

1. Populate the database with college information using the admin panel
2. Add high-quality photos for each college
3. Test the college detail view in the main app
4. Consider adding more fields like:
   - Campus facilities
   - Placement statistics
   - Faculty information
   - Student reviews

## Support

For issues or questions, contact the development team.
