# KCET Predictor 2025

A high-performance rank predictor for the Karnataka Common Entrance Test (KCET). This tool helps students predict potential colleges based on their aggregate rank, with data from 2025 Round 3 cutoffs.

## Features

- **Rank-Based Prediction**: Filter colleges by category, branch, and aggregate rank.
- **College Search**: Direct access to details for over 220+ colleges.
- **Detailed Information**: View college photos, established year, affiliation, placement highlights, and campus facilities.
- **Courses & Cutoffs**: High-density grid view of all branches with their closing ranks.
- **Mobile Responsive**: Fully optimized for phones and tablets with horizontal scrolling navigation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set `VITE_API_URL` to point to your backend API.

## Development

Run the predictor locally:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Data Source

The initial data is derived from `data.json` (extracted from the official 2025 Round 3 Cutoffs). The app prioritizes live data from the backend API when available.
