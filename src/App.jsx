import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder, unit = 'item' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    let newSelected;
    if (value === 'all') {
      newSelected = ['all'];
    } else {
      if (selected.includes(value)) {
        newSelected = selected.filter(v => v !== value);
        if (newSelected.length === 0) newSelected = ['all'];
      } else {
        newSelected = selected.filter(v => v !== 'all').concat(value);
      }
    }
    onChange(newSelected);
  };

  const displayValue = selected.includes('all')
    ? placeholder
    : options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ');

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div className="multi-select-trigger">
        <div className="multi-select-trigger-text" onClick={() => setIsOpen(!isOpen)}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayValue}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {!selected.includes('all') && (
          <button 
            className="multi-select-reset" 
            onClick={(e) => { e.stopPropagation(); onChange(['all']); }}
            title={`Clear ${unit}s`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && (
        <div className="multi-select-menu">
          {options.map((opt) => (
            <label key={opt.value} className="multi-select-option">
              <input 
                type="checkbox" 
                checked={selected.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DATA from './data.json';
import logoImg from './assets/logo.png';
import manmathImg from './assets/manmath.jpg';
import aishwaryaImg from './assets/aishwarya.png';
import amratyaImg from './assets/amratya.jpg';
import CollegeDetail from './CollegeDetail';
import './index.css';

const STORE_KEY = 'kcet_2025_predictor_shortlist_react';
const PROFILE_KEY = 'kcet_2025_predictor_google_profile';
const ALL_PROFILES_KEY = 'kcet_2025_predictor_all_profiles';
const GOOGLE_CLIENT_ID = '744665379186-89t2htuu9d77m6ltlvfabq1v6rardjmq.apps.googleusercontent.com';
const GOOGLE_NONCE_KEY = 'kcet_2025_google_nonce';
const DISPLAY_STEP = 80;

// Replace this URL with your deployed Google Apps Script web app URL.
// See google-apps-script.js for setup instructions.
const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyFgoAq0tv9cWFk4loj3gh1ciPs4tTX93Jp6UTU4UzCa0RH-fvvO4wjslN1scoLSqMSYQ/exec';

// Report sheet — for users to flag incorrect college data.
// Deploy google-apps-script-report.js to the report sheet and paste the URL here.
const REPORT_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzDBKVriD-NoBYv4zuFX38St4EfDIXUZyeKy-LZklMS6OFbrEtDhf9HttlafzSL5-Si/exec';

// Feedback sheet — for general app feedback and exit ratings.
// Deploy a separate google apps script for this and paste URL here.
const FEEDBACK_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzOJd-ysFBCT8CM1rsBdd3eRDGXazBece0B-RVB4zs57Nxy5EI5dKQ6-JAMxP5LSylpFw/exec'; // PASTE YOUR FEEDBACK SHEET WEB APP URL HERE

function createGoogleNonce() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Sends profile data (name, phone, pcmMarks, class12%, email) to the Google Sheet
 * via the deployed Apps Script web app.
 */
async function sendProfileToSheet({ name, phone, pcmMarks, class12, email, location }) {
  if (!GOOGLE_SHEET_WEBHOOK || GOOGLE_SHEET_WEBHOOK === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn('[Sheet] Google Sheet webhook URL is not configured. Skipping sheet save.');
    return;
  }
  try {
    const params = new URLSearchParams({
      name: name || '',
      phone: phone || '',
      pcmMarks: pcmMarks !== undefined && pcmMarks !== null ? String(pcmMarks) : '',
      class12: class12 !== undefined && class12 !== null ? String(class12) : '',
      email: email || '',
      location: location || '',
    });
    // Use GET with query params — Apps Script redirects on POST which breaks no-cors fetch
    await fetch(`${GOOGLE_SHEET_WEBHOOK}?${params.toString()}`, { mode: 'no-cors' });
    console.log('[Sheet] Profile data sent to Google Sheet.');
  } catch (err) {
    console.error('[Sheet] Failed to send profile data:', err);
  }
}

/**
 * Sends a report about incorrect college data to the Report Google Sheet.
 */
async function sendReportToSheet({ collegeCode, collegeName, course, seat, reason }) {
  if (!REPORT_SHEET_WEBHOOK || REPORT_SHEET_WEBHOOK === 'YOUR_REPORT_SHEET_WEB_APP_URL') {
    console.warn('[Report] Report sheet webhook URL is not configured.');
    return false;
  }
  try {
    const params = new URLSearchParams({
      collegeCode: collegeCode || '',
      collegeName: collegeName || '',
      course: course || '',
      seat: seat || '',
      reason: reason || '',
    });
    await fetch(`${REPORT_SHEET_WEBHOOK}?${params.toString()}`, { mode: 'no-cors' });
    console.log('[Report] Report sent to Google Sheet.');
    return true;
  } catch (err) {
    console.error('[Report] Failed to send report:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KCET 2023 Real Data (Aggregate% → Rank)
// Used as the base model. Sorted ascending by aggregate for PCHIP.
// Includes synthetic anchors at extremes for full-range coverage.
// ═══════════════════════════════════════════════════════════════════════════
const DATA_2023 = [
  [40.0, 261000],
  [45.0, 220000],
  [50.0, 175000],
  [53.0, 140000],
  [56.0556, 103153],
  [57.0556, 94040],
  [58.2778, 93040],
  [61.2778, 61134],
  [62.3889, 58077],
  [64.3333, 40702],
  [65.0556, 38667],
  [66.4444, 29961],
  [68.0556, 23258],
  [68.9444, 20224],
  [69.1111, 19679],
  [69.8333, 17514],
  [70.8333, 15030],
  [71.7222, 13143],
  [73.2778, 11186],
  [73.3889, 10084],
  [74.7222, 8013],
  [75.4444, 7007],
  [76.2778, 6037],
  [76.8333, 5446],
  [77.4444, 4872],
  [80.1667, 2830],
  [80.2222, 2792],
  [80.9444, 2411],
  [81.2778, 2264],
  [82.0556, 1873],
  [83.0, 1489],
  [83.7222, 1249],
  [83.8889, 1204],
  [84.3333, 1089],
  [84.7222, 980],
  [85.9444, 745],
  [88.8333, 322],
  [90.0, 220],
  [92.0, 130],
  [94.0, 70],
  [96.0, 30],
  [98.0, 8],
  [100.0, 1]
];

// 2026 projection scale factor: 3.30L students ÷ 2.61L students = 1.264
const SCALE_FACTOR_2026 = 1.264;
const TOTAL_STUDENTS_2026 = 330000;

// ═══════════════════════════════════════════════════════════════════════════
// PCHIP (Piecewise Cubic Hermite Interpolating Polynomial)
// Monotone-preserving interpolation in log-rank space
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute PCHIP (monotone Hermite) slopes at each data point.
 * Ensures monotonicity: if the data is monotone between two points,
 * the interpolant is also monotone.
 */
function pchipSlopes(xs, ys) {
  const n = xs.length;
  const slopes = new Array(n).fill(0);
  const deltas = [];
  const hs = [];

  for (let i = 0; i < n - 1; i++) {
    hs.push(xs[i + 1] - xs[i]);
    deltas.push((ys[i + 1] - ys[i]) / hs[i]);
  }

  // Interior slopes: weighted harmonic mean of adjacent secants
  for (let i = 1; i < n - 1; i++) {
    const d0 = deltas[i - 1];
    const d1 = deltas[i];
    if (d0 * d1 <= 0) {
      // Sign change or zero — set slope to 0 for monotonicity
      slopes[i] = 0;
    } else {
      const w1 = 2 * hs[i] + hs[i - 1];
      const w2 = hs[i] + 2 * hs[i - 1];
      slopes[i] = (w1 + w2) / (w1 / d0 + w2 / d1);
    }
  }

  // Endpoint slopes: one-sided
  slopes[0] = deltas[0];
  slopes[n - 1] = deltas[n - 2];

  // Clamp endpoint slopes for monotonicity
  if (deltas.length >= 1) {
    if (slopes[0] * deltas[0] < 0) slopes[0] = 0;
    if (slopes[n - 1] * deltas[n - 2] < 0) slopes[n - 1] = 0;
  }

  return slopes;
}

/**
 * Evaluate PCHIP interpolant at a single point xi.
 * xs must be sorted ascending. Returns ys[0] or ys[n-1] for out-of-range.
 */
function pchipEval(xs, ys, slopes, xi) {
  const n = xs.length;
  if (xi <= xs[0]) return ys[0];
  if (xi >= xs[n - 1]) return ys[n - 1];

  // Binary search for the interval
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= xi) lo = mid;
    else hi = mid;
  }

  const h = xs[hi] - xs[lo];
  const t = (xi - xs[lo]) / h;
  const t2 = t * t;
  const t3 = t2 * t;

  // Hermite basis functions
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return h00 * ys[lo] + h10 * h * slopes[lo] + h01 * ys[hi] + h11 * h * slopes[hi];
}

// Pre-compute the PCHIP model from 2023 data (done once at module load)
const _pchipXs = DATA_2023.map(([agg]) => agg);           // aggregates ascending
const _pchipLogYs = DATA_2023.map(([, rank]) => Math.log(rank)); // log(rank)
const _pchipSlopes = pchipSlopes(_pchipXs, _pchipLogYs);

const KCET_MAX = 180;
const PCM_MAX = 300;

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: digits });
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Estimates KCET Rank from aggregate percentage using PCHIP interpolation
 * in log-rank space on real 2023 data, then scales to 2026.
 *
 * Returns an object with:
 *   rank       – predicted 2026 rank (integer)
 *   lowerBound – 88% of rank (best case in ±12% band)
 *   upperBound – 112% of rank (worst case in ±12% band)
 *   percentile – percentile out of 330,000 students
 */
function estimateRankFromAggregate(aggregatePct) {
  // Interpolate in log-rank space for the 2023 base model
  const logRank2023 = pchipEval(_pchipXs, _pchipLogYs, _pchipSlopes, aggregatePct);
  const rank2023 = Math.exp(logRank2023);

  // Scale to 2026 student pool
  const rank2026 = Math.max(1, Math.round(rank2023 * SCALE_FACTOR_2026));

  // ±12% confidence band
  const lowerBound = Math.max(1, Math.round(rank2026 * 0.88));
  const upperBound = Math.round(rank2026 * 1.12);

  // Percentile
  const percentile = Math.min(99.99, Math.max(0.01,
    ((TOTAL_STUDENTS_2026 - rank2026) / TOTAL_STUDENTS_2026) * 100
  ));

  return { rank: rank2026, lowerBound, upperBound, percentile };
}

/**
 * Computes KCET aggregate% from raw KCET score and PCM marks.
 * Equal weightage (50-50): KCET component + PCM component
 * KCET component = (KCET / 180) × 50
 * PCM component  = (PCM / 300) × 50
 */
function computeAggregate(kcetScore, pcmMarks) {
  const kcetPct = (kcetScore / KCET_MAX) * 50;
  const pcmPct = (pcmMarks / PCM_MAX) * 50;
  return { kcetPct, pcmPct, aggregatePct: kcetPct + pcmPct };
}

function getRankRange(rank, mode) {
  if (mode === 'rank') return [rank, rank];
  const lower = Math.max(1, Math.round(rank * 0.88));
  const upper = Math.round(rank * 1.12);
  return [lower, upper];
}

function classify(rank, cutoff) {
  if (!cutoff || !rank) return null;
  const diff = cutoff - rank;

  // Logistic (sigmoid) confidence: naturally models admission probability.
  // ratio < 1 → rank is below cutoff (favorable), ratio > 1 → above cutoff (risky).
  const ratio = rank / cutoff;
  const steepness = 12; // controls how quickly confidence changes around the cutoff
  const pct = Math.round(100 / (1 + Math.exp(steepness * (ratio - 1))));

  // Clamp to [1, 99] — never show absolute 0% or 100%
  const clampedPct = Math.max(1, Math.min(99, pct));

  const borderlineRank = Math.floor(rank * 0.6);
  const likelyRankLimit = Math.floor(rank * 0.85);

  if (cutoff < borderlineRank) return null;

  let type;
  let label;

  if (cutoff >= borderlineRank && cutoff < likelyRankLimit) {
    type = 'borderline';
    label = 'Borderline';
  } else if (cutoff >= likelyRankLimit && cutoff < rank) {
    type = 'likely';
    label = 'Likely';
  } else if (cutoff >= rank) {
    type = 'safe';
    label = 'Safe';
  } else {
    return null;
  }

  return { type, label, pct: clampedPct, diff };
}


function getInitials(name) {
  return String(name || 'User')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function decodeGoogleIdToken(idToken) {
  const parts = String(idToken || '').split('.');
  if (parts.length < 2) {
    throw new Error('Invalid Google credential received.');
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}


function normalizeProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'object') return null;

  const class12 = Number(rawProfile.class12);
  if (!rawProfile.name || !rawProfile.phone || !rawProfile.location || !Number.isFinite(class12)) {
    return null;
  }

  return {
    googleId: rawProfile.googleId || '',
    name: String(rawProfile.name),
    email: String(rawProfile.email || ''),
    picture: String(rawProfile.picture || ''),
    phone: String(rawProfile.phone),
    location: String(rawProfile.location),
    class12,
    pcmMarks: rawProfile.pcmMarks !== undefined && rawProfile.pcmMarks !== null ? Number(rawProfile.pcmMarks) : null,
    updatedAt: rawProfile.updatedAt || '',
  };
}

function loadProfileFromStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    return normalizeProfile(raw);
  } catch {
    return null;
  }
}

function profileToForm(profile) {
  return {
    name: profile?.name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    class12: profile?.class12 === undefined || profile?.class12 === null ? '' : String(profile.class12),
    pcmMarks: profile?.pcmMarks === undefined || profile?.pcmMarks === null ? '' : String(profile.pcmMarks),
  };
}

function AuthScreen({
  googleProfile,
  profileForm,
  onProfileChange,
  onSubmit,
  onGoogleSignIn,
  onResetAccount,
  onSignOut,
  onClose,
  authError,
  authMessage,
}) {
  const displayName = profileForm.name || googleProfile?.name || 'Your name';
  const displayEmail = googleProfile?.email || 'Google account will appear here after sign-in';
  const displayAvatar = googleProfile?.picture ? (
    <img src={googleProfile.picture} alt={googleProfile.name || 'Google profile'} />
  ) : (
    <span>{getInitials(displayName)}</span>
  );

  if (!googleProfile) {
    return (
      <div className="auth-shell">
        <div className="auth-panel panel" style={{ maxWidth: 420, margin: '0 auto', padding: '40px 32px', position: 'relative' }}>
          {onClose && (
            <button className="icon-btn" aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, minHeight: 36, width: 36, border: 'none', background: 'transparent' }} onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, marginBottom: 12 }}>Sign in to continue</h1>
            <p className="subtitle" style={{ margin: '0 auto', fontSize: 14 }}>
              Secure your session and save your KCET college shortlist locally.
            </p>
          </div>

          <button className="primary-btn" type="button" onClick={onGoogleSignIn} style={{ width: '100%', minHeight: 52, fontSize: 16 }}>
            <svg style={{ marginRight: 8, flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {(authMessage || authError) && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              {authMessage && <p className="auth-note">{authMessage}</p>}
              {authError && <p className="auth-error">{authError}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel panel" style={{ maxWidth: 480, margin: '0 auto', padding: '32px', position: 'relative' }}>
        {onClose && (
          <button className="icon-btn" aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, minHeight: 36, width: 36, border: 'none', background: 'transparent' }} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <div className="panel-heading auth-heading" style={{ borderBottom: 'none', paddingBottom: 16, paddingRight: 24 }}>
          <div>
            <h1 style={{ fontSize: 24 }}>Complete your profile</h1>
            <p className="subtitle" style={{ fontSize: 14 }}>
              Almost done! We just need a few details before calculating your KCET predictions.
            </p>
          </div>
        </div>

        <div>
          <div className="profile-preview" style={{ marginBottom: 24, padding: '10px 14px' }}>
            <div className="auth-avatar" style={{ width: 44, height: 44, borderRadius: 12 }}>{displayAvatar}</div>
            <div className="profile-preview__body">
              <strong style={{ fontSize: 14 }}>{displayName}</strong>
              <span style={{ fontSize: 12 }}>{displayEmail}</span>
            </div>
            <button className="ghost-btn" type="button" onClick={onResetAccount} style={{ marginLeft: 'auto', padding: '0 8px', fontSize: 13, minHeight: 32 }}>
              Change
            </button>
          </div>

          <form className="profile-form" onSubmit={onSubmit} style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="profileName">Name</label>
              <input
                id="profileName"
                type="text"
                placeholder="Your full name"
                value={profileForm.name}
                onChange={(event) => onProfileChange('name', event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="profilePhone">Phone Number</label>
              <input
                id="profilePhone"
                type="tel"
                placeholder="10-digit phone number"
                value={profileForm.phone}
                onChange={(event) => onProfileChange('phone', event.target.value)}
                autoComplete="tel"
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="profileLocation">Location</label>
                <input
                  id="profileLocation"
                  type="text"
                  placeholder="City / town"
                  value={profileForm.location}
                  onChange={(event) => onProfileChange('location', event.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="profileClass12">Class 12th %</label>
                <input
                  id="profileClass12"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Example: 92.4"
                  value={profileForm.class12}
                  onChange={(event) => onProfileChange('class12', event.target.value)}
                  inputMode="decimal"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="profilePcmMarks">2nd PUC PCM (out of 300) <span style={{color: 'var(--muted)', fontWeight: 'normal'}}>(Optional)</span></label>
              <input
                id="profilePcmMarks"
                type="number"
                min="0"
                max="300"
                step="1"
                placeholder="Example: 285"
                value={profileForm.pcmMarks}
                onChange={(event) => onProfileChange('pcmMarks', event.target.value)}
                inputMode="numeric"
              />
            </div>

            <button className="primary-btn" type="submit" style={{ marginTop: 8, width: '100%', minHeight: 52 }}>
              Save & See Results
            </button>
            {onSignOut && (
              <button className="ghost-btn" type="button" onClick={onSignOut} style={{ width: '100%', marginTop: 8, color: 'var(--red)' }}>
                Sign out
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const ResultItem = ({ item, seat, saved, toggleSaved, formatNumber, onViewCollege }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'
  const [code, college, course, cityName, , , branchCode, address] = item.row;
  const { chance, cutoff, key } = item;
  const isSaved = saved.has(key);
  const marginText =
    chance.type === 'none'
      ? 'Round 3 Data'
      : (chance.diff >= 0
        ? `${formatNumber(chance.diff, 2)} rank buffer`
        : `${formatNumber(Math.abs(chance.diff), 2)} ranks above cutoff`);

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportStatus('sending');
    const ok = await sendReportToSheet({
      collegeCode: code,
      collegeName: college,
      course,
      seat,
      reason: reportReason.trim(),
    });
    setReportStatus(ok ? 'sent' : 'error');
    if (ok) {
      setTimeout(() => {
        setShowReport(false);
        setReportReason('');
        setReportStatus('');
      }, 2000);
    }
  };

  return (
    <article className={`result-card ${chance.type}`}>
      <div className="result-main">
        <div className="result-topline">
          <span className="code">{code}{branchCode && branchCode !== "??" ? ` | ${branchCode}` : ""}</span>
          <span className={`status ${chance.type}`}>{chance.label}</span>
        </div>
        <h2 className={`college-name college-name-link ${isExpanded ? 'expanded' : ''}`} onClick={() => onViewCollege && onViewCollege(code)} title="View college details">{college}</h2>
        <button 
          className="see-more-btn" 
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'See less' : 'See more'}
        </button>
        <p className="course-name">{course}</p>
        <div className="meta-line">
          <span>📍 {address ? `${address}, ${cityName}` : cityName}</span>
          <span>{seat}</span>
          <span>{marginText}</span>
        </div>
      </div>
      <div className="result-metrics">
        <div className="cutoff-block">
          <div className="cutoff-number">{formatNumber(cutoff, 2)}</div>
          <div className="side-label" style={{ textTransform: 'uppercase', fontSize: '10px' }}>2025 CUTOFF RANK</div>
        </div>
        {chance.type !== 'none' && (
          <div className="confidence-block" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', color: 'var(--muted)' }}>
              <span className="side-label" style={{ margin: 0 }}>YOUR CHANCE</span>
              <strong style={{ color: '#fbbf24' }}>{chance.pct}%</strong>
            </div>
            <div className="bar" aria-label={`${chance.pct}% confidence`} style={{ marginTop: 0 }}>
              <span style={{ width: `${chance.pct}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="row-actions">
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          type="button"
          onClick={() => toggleSaved(key)}
        >
          {isSaved ? 'Added' : '+ Add'}
        </button>
        <button
          className="report-btn"
          type="button"
          title="Report incorrect data"
          onClick={() => { setShowReport(!showReport); setReportStatus(''); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          Report
        </button>
      </div>
        {showReport && (
          <div className="report-panel">
            {reportStatus === 'sent' ? (
              <div className="report-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Report submitted. Thank you!</span>
              </div>
            ) : (
              <>
                <textarea
                  className="report-input"
                  placeholder="What's incorrect? e.g. wrong cutoff, wrong college name, course doesn't exist..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={2}
                  maxLength={500}
                  disabled={reportStatus === 'sending'}
                />
                <div className="report-actions">
                  <button
                    className="report-submit-btn"
                    type="button"
                    onClick={handleReport}
                    disabled={!reportReason.trim() || reportStatus === 'sending'}
                  >
                    {reportStatus === 'sending' ? 'Sending...' : 'Submit Report'}
                  </button>
                  <button
                    className="report-cancel-btn"
                    type="button"
                    onClick={() => { setShowReport(false); setReportReason(''); setReportStatus(''); }}
                  >
                    Cancel
                  </button>
                </div>
                {reportStatus === 'error' && (
                  <p className="report-error">Failed to send report. Please try again.</p>
                )}
              </>
            )}
          </div>
        )}
    </article>
  );
};

function PredictorApp({ profile, onEditProfile, onSignOut, onRequestAuth, onAboutUs, onContactUs, onViewCollege }) {
  const [mode, setMode] = useState('rank');
  const [kcetScoreInput, setKcetScoreInput] = useState('');
  const [pcmMarksInput, setPcmMarksInput] = useState('');
  const [rankInput, setRankInput] = useState('');
  const [seat, setSeat] = useState('GM');
  const [predictionId, setPredictionId] = useState(0);
  const [branchGroup, setBranchGroup] = useState(['all']);
  const [branchCodeFilter, setBranchCodeFilter] = useState(['all']);
  const [hasInteractedBranch, setHasInteractedBranch] = useState(false);
  const [hasInteractedCourse, setHasInteractedCourse] = useState(false);
  const [city, setCity] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState(new Set());

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-avatar-wrap')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [chanceFilter, setChanceFilter] = useState('all');
  const [sortSelect, setSortSelect] = useState('recommended');
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_STEP);

  const [estimatedRank, setEstimatedRank] = useState(null);
  const [rankPrediction, setRankPrediction] = useState(null); // { rank, lowerBound, upperBound, percentile }
  const [aggregateBreakdown, setAggregateBreakdown] = useState(null);
  const [pendingRank, setPendingRank] = useState(null);
  const [, setRankRange] = useState(null);

  useEffect(() => {
    if (profile && pendingRank) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstimatedRank(pendingRank);
      setPendingRank(null);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [profile, pendingRank]);

  const [saved, setSaved] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  const saveToLocalStorage = useCallback((newSaved) => {
    localStorage.setItem(STORE_KEY, JSON.stringify([...newSaved]));
    setSaved(newSaved);
  }, []);

  const toggleSaved = (key) => {
    const newSaved = new Set(saved);
    if (newSaved.has(key)) newSaved.delete(key);
    else newSaved.add(key);
    saveToLocalStorage(newSaved);
  };

  const clearSaved = () => {
    saveToLocalStorage(new Set());
  };

  const exportSavedPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["College Code", "College", "Course", "City", "Branch Group", "Seat Type", "Cutoff Rank"];
    const tableRows = [];

    DATA.rows.forEach((row) => {
      DATA.seatCodes.forEach((seatCode, index) => {
        const key = `${row[0]}||${row[2]}||${seatCode}`;
        if (saved.has(key)) {
          tableRows.push([
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            seatCode,
            row[5][index] || ''
          ]);
        }
      });
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }, // Indigo accent
      margin: { top: 20 },
    });

    doc.text("KCET 2025 Saved College Shortlist", 14, 15);
    doc.save('kcet-2025-shortlist.pdf');
  };

  const runPrediction = (e) => {
    if (e) e.preventDefault();
    setValidationErrors(new Set());
    try {
      let rank;
      let prediction = null;
      if (mode === 'rank') {
        if (!rankInput) {
          // If nothing is put in input and show colleges is clicked then we show all colleges sorted on rank
          setEstimatedRank('all');
          setRankPrediction(null);
          setAggregateBreakdown(null);
          setRankRange(null);
          setDisplayLimit(DISPLAY_STEP);
          setPredictionId(prev => prev + 1);
          setHasInteractedBranch(false);
          setHasInteractedCourse(false);
          
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
          return;
        }
        rank = Number(rankInput);
        if (!Number.isFinite(rank) || rank < 1) {
          setValidationErrors(new Set(['rankInput']));
          throw new Error('Enter a valid KCET Rank.');
        }
        rank = Math.round(rank);
        // For direct rank entry, compute percentile and bands manually
        prediction = {
          rank,
          lowerBound: Math.max(1, Math.round(rank * 0.88)),
          upperBound: Math.round(rank * 1.12),
          percentile: Math.min(99.99, Math.max(0.01,
            ((TOTAL_STUDENTS_2026 - rank) / TOTAL_STUDENTS_2026) * 100
          )),
        };
        setAggregateBreakdown(null);
      } else if (mode === 'aggregate') {
        const errors = new Set();
        if (!pcmMarksInput) errors.add('pcmMarksInput');
        if (!kcetScoreInput) errors.add('kcetScoreInput');
        
        if (errors.size > 0) {
          setValidationErrors(errors);
          setEstimatedRank(null);
          return; // No college should be shown and fields should have red border
        }

        const kcetScore = Number(kcetScoreInput);
        const pcmMarks = Number(pcmMarksInput);
        if (!Number.isFinite(kcetScore) || kcetScore < 0 || kcetScore > KCET_MAX) {
          setValidationErrors(new Set(['kcetScoreInput']));
          throw new Error(`Enter a valid KCET score between 0 and ${KCET_MAX}.`);
        }
        if (!Number.isFinite(pcmMarks) || pcmMarks < 0 || pcmMarks > PCM_MAX) {
          setValidationErrors(new Set(['pcmMarksInput']));
          throw new Error(`Enter valid PCM marks between 0 and ${PCM_MAX}.`);
        }
        const { kcetPct, pcmPct, aggregatePct } = computeAggregate(kcetScore, pcmMarks);
        prediction = estimateRankFromAggregate(aggregatePct);
        rank = prediction.rank;
        setAggregateBreakdown({ kcetScore, pcmMarks, kcetPct, pcmPct, aggregatePct });
      } else {
        throw new Error('Invalid prediction mode.');
      }
      setRankPrediction(prediction);
      setRankRange(getRankRange(rank, mode));
      setDisplayLimit(DISPLAY_STEP);
      setPredictionId(prev => prev + 1);
      setHasInteractedBranch(false);
      setHasInteractedCourse(false);
      
      if (!profile) {
        setPendingRank(rank);
        onRequestAuth();
      } else {
        setEstimatedRank(rank);
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const getCutoff = useCallback((row, targetSeat) => {
    const index = DATA.seatCodes.indexOf(targetSeat);
    return index >= 0 ? row[5][index] : null;
  }, []);

  const buildResults = useCallback(
    (ignoreChanceFilter = false) => {
      if (!estimatedRank) return [];
      const isShowAll = estimatedRank === 'all';
      const search = normalize([searchInput, quickSearch].filter(Boolean).join(' '));

      return DATA.rows
        .map((row) => {
          const cutoff = getCutoff(row, seat);
          let chance;
          if (isShowAll) {
            // For "Show All" mode, we provide a placeholder chance object
            chance = { type: 'none', label: '-', pct: 0, diff: 0 };
          } else {
            chance = classify(estimatedRank, cutoff);
          }
          if (!chance && !isShowAll) return null;
          return {
            row,
            cutoff,
            chance,
            key: `${row[0]}||${row[2]}||${seat}`,
            text: normalize(`${row[0]} ${row[1]} ${row[2]} ${row[3]} ${row[4]} ${row[6] || ''}`),
          };
        })
        .filter((item) => {
          if (!item) return false;
          if (!branchGroup.includes('all') && !branchGroup.includes(item.row[4])) return false;
          if (!branchCodeFilter.includes('all') && !branchCodeFilter.includes(item.row[6])) return false;
          if (city !== 'all' && item.row[3] !== city) return false;
          if (search && !item.text.includes(search)) return false;
          if (!isShowAll && !ignoreChanceFilter && chanceFilter !== 'all' && item.chance.type !== chanceFilter) return false;
          return true;
        });
    },
    [estimatedRank, seat, branchGroup, branchCodeFilter, city, searchInput, quickSearch, chanceFilter, getCutoff]
  );

  const rawResults = useMemo(() => buildResults(false), [buildResults]);
  const countPool = useMemo(() => buildResults(true), [buildResults]);

  const sortedResults = useMemo(() => {
    const sorted = [...rawResults];
    const sortFn = (a, b) => {
      const hasA = a.cutoff !== null && a.cutoff !== undefined && a.cutoff > 0;
      const hasB = b.cutoff !== null && b.cutoff !== undefined && b.cutoff > 0;
      
      // If one has cutoff and other doesn't, show the one with cutoff first
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      
      // If both have cutoff, sort by cutoff rank ascending
      if (hasA && hasB) {
        if (sortSelect === 'recommended' || sortSelect === 'cutoff') {
          return a.cutoff - b.cutoff || b.chance.pct - a.chance.pct;
        }
        if (sortSelect === 'margin') {
          return b.chance.diff - a.chance.diff;
        }
        if (sortSelect === 'college') {
          return a.row[1].localeCompare(b.row[1]) || a.row[2].localeCompare(b.row[2]);
        }
        // Default (chance)
        return b.chance.pct - a.chance.pct || b.chance.diff - a.chance.diff || a.cutoff - b.cutoff;
      }
      
      // If both don't have cutoff, sort by college name
      return a.row[1].localeCompare(b.row[1]) || a.row[2].localeCompare(b.row[2]);
    };

    sorted.sort(sortFn);
    return sorted;
  }, [rawResults, sortSelect]);

  const renderedResults = sortedResults.slice(0, displayLimit);

  const clearInteractiveFilters = () => {
    setQuickSearch('');
    setSearchInput('');
    setBranchGroup(['all']);
    setBranchCodeFilter(['all']);
    setHasInteractedBranch(false);
    setHasInteractedCourse(false);
    setCity('all');
    setChanceFilter('all');
    setSortSelect('cutoff');
    setDisplayLimit(DISPLAY_STEP);
  };

  const counts = useMemo(() => {
    const c = { safe: 0, likely: 0, borderline: 0 };
    countPool.forEach((item) => {
      c[item.chance.type] += 1;
    });
    return c;
  }, [countPool]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <img src={logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
            </div>
            <div>
              <div className="brand-title">KCET Predictor</div>
              <div className="brand-sub">KCET Rank and College Predictor</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className={`saved-pill ${saved.size > 0 ? 'has-saved' : ''}`}
              type="button"
              onClick={() => setShowSavedPanel(true)}
              title="View saved colleges"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
              {saved.size > 0 ? `${formatNumber(saved.size)} Saved` : 'Saved'}
            </button>

            {profile ? (
              <div className="profile-avatar-wrap">
                <button
                  className="profile-avatar-btn"
                  type="button"
                  aria-label="Profile menu"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  <div className="profile-avatar-img">
                    {profile.picture ? <img src={profile.picture} alt="" /> : <span>{getInitials(profile.name)}</span>}
                  </div>
                  <span className="profile-menu-trigger" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                  </span>
                </button>
                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <button type="button" onClick={() => { setProfileMenuOpen(false); onEditProfile(); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Profile
                    </button>
                    <button type="button" onClick={() => { setProfileMenuOpen(false); onSignOut(); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                    <div className="profile-dropdown-divider" />
                    <button type="button" onClick={() => { setProfileMenuOpen(false); onAboutUs(); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      About Us
                    </button>
                    <button type="button" onClick={() => { setProfileMenuOpen(false); onContactUs(); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Contact Us
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="secondary-btn" type="button" onClick={onRequestAuth}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <aside className="left-panel" aria-label="Prediction inputs">
            <div className="panel-heading hero-heading">
              <div>
                <span className="hero-badge">
                  {mode === 'aggregate' ? '🎯 Based on KCET Trends' : '🎯 OFFICIAL 2025 DATA'}
                </span>
                <h1 className="hero-title">
                  {mode === 'aggregate' ? (
                    <>Predict Your <span className="hero-accent">KCET Rank</span></>
                  ) : (
                    <>FIND YOUR PERFECT <span className="hero-accent">COLLEGE MATCH.</span></>
                  )}
                </h1>
                <p className="subtitle">
                  {mode === 'aggregate' 
                    ? "Enter your 2nd PUC PCM marks and KCET marks to estimate your KCET Rank & College Options."
                    : "Enter your KCET Rank and we’ll show you safe, likely, and borderline colleges for you."
                  }
                </p>
              </div>
            </div>

            <form className="form-section" onSubmit={runPrediction}>
              {mode === 'aggregate' && (
                <>
                  <div className="field-row">
                  <div className="field">
                    <label htmlFor="pcmMarksInput">2nd PUC PCM <span style={{color:'var(--muted)', fontWeight: 'normal'}}>/ {PCM_MAX}</span></label>
                    <input
                      id="pcmMarksInput"
                      type="number"
                      min="0"
                      max={PCM_MAX}
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 289"
                      autoComplete="off"
                      className={validationErrors.has('pcmMarksInput') ? 'field-error' : ''}
                      value={pcmMarksInput}
                      onChange={(e) => {
                        setPcmMarksInput(e.target.value);
                        setEstimatedRank(null);
                        if (e.target.value) {
                          setValidationErrors(prev => {
                            const next = new Set(prev);
                            next.delete('pcmMarksInput');
                            return next;
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="kcetScoreInput">KCET Score <span style={{color:'var(--muted)', fontWeight: 'normal'}}>/ {KCET_MAX}</span></label>
                    <input
                      id="kcetScoreInput"
                      type="number"
                      min="0"
                      max={KCET_MAX}
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 140"
                      autoComplete="off"
                      className={validationErrors.has('kcetScoreInput') ? 'field-error' : ''}
                      value={kcetScoreInput}
                      onChange={(e) => {
                        setKcetScoreInput(e.target.value);
                        setEstimatedRank(null);
                        if (e.target.value) {
                          setValidationErrors(prev => {
                            const next = new Set(prev);
                            next.delete('kcetScoreInput');
                            return next;
                          });
                        }
                      }}
                    />
                  </div>
                  </div>
                  {kcetScoreInput && pcmMarksInput && (
                    <div className="aggregate-preview">
                      <div className="aggregate-preview__row">
                        <span>2nd PUC PCM Component (50%)</span>
                        <strong>{(Number(pcmMarksInput) / PCM_MAX * 50).toFixed(2)}%</strong>
                      </div>
                      <div className="aggregate-preview__row">
                        <span>KCET Component (50%)</span>
                        <strong>{(Number(kcetScoreInput) / KCET_MAX * 50).toFixed(2)}%</strong>
                      </div>
                      <div className="aggregate-preview__row aggregate-preview__total">
                        <span>Aggregate %</span>
                        <strong>{((Number(kcetScoreInput) / KCET_MAX * 50) + (Number(pcmMarksInput) / PCM_MAX * 50)).toFixed(2)}%</strong>
                      </div>
                    </div>
                  )}
                </>
              )}

              {mode === 'rank' && (
                <div className="field">
                  <label htmlFor="rankInput">KCET Rank</label>
                  <input
                    id="rankInput"
                    type="number"
                    min="1"
                    max="400000"
                    step="1"
                    inputMode="numeric"
                    placeholder="Example: 28000"
                    autoComplete="off"
                    className={validationErrors.has('rankInput') ? 'field-error' : ''}
                    value={rankInput}
                    onChange={(e) => {
                      setRankInput(e.target.value);
                      setEstimatedRank(null);
                      if (e.target.value) {
                        setValidationErrors(prev => {
                          const next = new Set(prev);
                          next.delete('rankInput');
                          return next;
                        });
                      }
                    }}
                  />
                </div>
              )}



              <div className="field-row">
                <div className="field">
                  <label htmlFor="seatSelect">Category</label>
                  <select id="seatSelect" value={seat} onChange={(e) => setSeat(e.target.value)}>
                    {DATA.seats.map(([code, desc]) => (
                      <option key={code} value={code}>
                        {code} — {desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="citySelect">Location</label>
                  <select id="citySelect" value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="all">All Locations</option>
                    {DATA.cities.map((cityCode) => (
                      <option key={cityCode} value={cityCode}>
                        {cityCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="searchInput">Search College or Course</label>
                <input
                  id="searchInput"
                  type="search"
                  placeholder="RV, CSE, electronics, E005"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <button className="primary-btn" type="submit">
                {mode === 'aggregate' ? 'Predict Rank' : 'Show colleges'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </aside>

          <main className="right-panel" id="results" aria-live="polite">
            <div className="panel-heading">
              <div>
                <h1>{estimatedRank ? `${formatNumber(sortedResults.length)} matching programs found` : 'Your predictor is ready.'}</h1>
              </div>
            </div>

              {estimatedRank && mode === 'aggregate' && (
                <>
                  <div className="rank-highlight">
                    <div className="rank-highlight__main">
                      <span className="rank-highlight__label">Your Estimated Rank</span>
                      <div className="rank-highlight__value">{estimatedRank > 100000 ? '1,00,000+' : formatNumber(estimatedRank)}</div>
                      {rankPrediction && (
                        <span className="rank-highlight__range rank-highlight__range--glow">
                          Range: {rankPrediction.lowerBound > 100000 ? '1,00,000+' : formatNumber(rankPrediction.lowerBound)} – {rankPrediction.upperBound > 100000 ? '3,30,000' : formatNumber(rankPrediction.upperBound)}
                        </span>
                      )}
                    </div>
                    <div className="rank-highlight__stats">
                      {aggregateBreakdown && (
                        <div className="rank-highlight__stat">
                          <div className="rank-highlight__stat-value">{aggregateBreakdown.aggregatePct.toFixed(2)}%</div>
                          <span className="rank-highlight__stat-label">Your KCET Total (%)</span>
                        </div>
                      )}
                      {rankPrediction && (
                        <div className="rank-highlight__stat">
                          <div className="rank-highlight__stat-value">~3,30,000</div>
                          <span className="rank-highlight__stat-label">Approx. Total Students (2025–26)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '11.5px', 
                    color: 'var(--muted)', 
                    lineHeight: '1.6', 
                    marginTop: '12px', 
                    marginBottom: '20px',
                    padding: '0 4px',
                    opacity: 0.85
                  }}>
                    <strong>Disclaimer:</strong> This tool provides an estimate, not a guarantee, based on previous years' rank vs marks data. Actual 2026 ranks will depend on the overall performance of all 3.30 lakh students, the exact KEA normalization methodology, and this year's paper difficulty level. Use this as a reference for college shortlisting, not for final decisions.
                  </p>
                </>
              )}

            <div className="toolbar" key={predictionId}>
              <MultiSelectDropdown
                options={[
                  ...DATA.branchGroups.map(group => ({ value: group, label: group }))
                ]}
                selected={branchGroup}
                onChange={(newSelected) => {
                  setBranchGroup(newSelected);
                  setBranchCodeFilter(['all']);
                  setHasInteractedBranch(true);
                  setHasInteractedCourse(false);
                }}
                placeholder={hasInteractedBranch ? "All Branches" : "Select Branch"}
                unit="branch"
              />
              <MultiSelectDropdown
                options={[
                  ...DATA.branchCodes
                    ?.filter(([, , group]) => branchGroup.includes('all') || branchGroup.includes(group))
                    .map(([code, name]) => ({ value: code, label: `${code} - ${name}` }))
                ]}
                selected={branchCodeFilter}
                onChange={(newSelected) => {
                  setBranchCodeFilter(newSelected);
                  setHasInteractedCourse(true);
                }}
                placeholder={hasInteractedCourse ? "All Courses" : "Select Course"}
                unit="course"
              />
              <button className="ghost-btn" type="button" onClick={clearInteractiveFilters} style={{ minHeight: '42px', padding: '0 12px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            </div>

            {estimatedRank && (
              <>
                <div className="chips">
                  <button className={`chip ${chanceFilter === 'all' ? 'active' : ''}`} onClick={() => setChanceFilter('all')}>
                    All {formatNumber(countPool.length)}
                  </button>
                  <button className={`chip chip-borderline ${chanceFilter === 'borderline' ? 'active' : ''}`} onClick={() => setChanceFilter('borderline')}>
                    Borderline {formatNumber(counts.borderline)}
                  </button>
                  <button className={`chip chip-likely ${chanceFilter === 'likely' ? 'active' : ''}`} onClick={() => setChanceFilter('likely')}>
                    Likely {formatNumber(counts.likely)}
                  </button>
                  <button className={`chip chip-safe ${chanceFilter === 'safe' ? 'active' : ''}`} onClick={() => setChanceFilter('safe')}>
                    Safe {formatNumber(counts.safe)}
                  </button>
                </div>

                <div className="results-meta">
                  <span>{formatNumber(sortedResults.length)} options available based on KCET 2025 Round 3 cutoffs.</span>
                  <span>
                    Showing {formatNumber(renderedResults.length)} of {formatNumber(sortedResults.length)}
                  </span>
                </div>

                  <div className="list">
                    {renderedResults.length === 0 ? (
                      <div className="empty">
                        <div>
                          <strong>No programs match these filters.</strong>
                          <span>Try all locations, all branch groups, another seat type, or exact rank mode.</span>
                        </div>
                      </div>
                    ) : (
                      renderedResults.map((item) => (
                        <ResultItem 
                          key={item.key} 
                          item={item} 
                          seat={seat} 
                          saved={saved} 
                          toggleSaved={toggleSaved} 
                          formatNumber={formatNumber}
                          onViewCollege={onViewCollege}
                        />
                      ))
                    )}
                  </div>

                {renderedResults.length < sortedResults.length && (
                  <div className="load-more">
                    <button className="ghost-btn" onClick={() => setDisplayLimit((previous) => previous + DISPLAY_STEP)}>
                      Show more results
                    </button>
                  </div>
                )}
              </>
            )}

            {!estimatedRank && (
              <div className="list">
                <div className="empty">
                  <div>
                    <strong>Start with your KCET score.</strong>
                    <span>Results will appear here with cutoff rank, branch, college code, location, and confidence band.</span>
                  </div>
                </div>
              </div>
            )}
          </main>
      </main>



      {/* Saved Colleges Panel */}
      {showSavedPanel && (
        <div className="auth-overlay" style={{ zIndex: 90 }}>
          <div className="auth-shell">
            <div className="saved-panel panel">
              <div className="saved-panel__header">
                <div>
                  <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Saved Colleges</h2>
                  <p className="subtitle" style={{ margin: 0 }}>{formatNumber(saved.size)} colleges in your shortlist</p>
                </div>
                <button className="icon-btn" aria-label="Close" style={{ minHeight: 36, width: 36, border: 'none', background: 'transparent' }} onClick={() => setShowSavedPanel(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {saved.size === 0 ? (
                <div className="empty" style={{ marginTop: 32 }}>
                  <div>
                    <strong>No saved colleges yet.</strong>
                    <span>Use the "+ Add" button on any college card to save it here.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="saved-panel__list">
                    {DATA.rows.flatMap((row) =>
                      DATA.seatCodes.map((seatCode, seatIdx) => {
                        const key = `${row[0]}||${row[2]}||${seatCode}`;
                        if (!saved.has(key)) return null;
                        const cutoff = row[5][seatIdx];
                        return (
                          <div className="saved-item" key={key}>
                            <div className="saved-item__info">
                              <div className="saved-item__top">
                                <span className="code">{row[0]}</span>
                                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{seatCode}</span>
                              </div>
                              <strong className="saved-item__college">{row[1]}</strong>
                              <span className="saved-item__course">{row[2]}</span>
                              <div className="saved-item__meta">
                                <span>{row[3]}</span>
                                {cutoff && <span>Cutoff: {formatNumber(cutoff)}</span>}
                              </div>
                            </div>
                            <button
                              className="save-btn saved"
                              type="button"
                              onClick={() => toggleSaved(key)}
                              style={{ flex: '0 0 auto', minWidth: 70 }}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })
                    ).filter(Boolean)}
                  </div>
                  <div className="saved-panel__actions">
                    <button className="secondary-btn" onClick={exportSavedPdf} style={{ flex: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export PDF
                    </button>
                    <button className="ghost-btn" onClick={() => { clearSaved(); }} style={{ flex: 1, color: 'var(--red)' }}>
                      Clear All
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(() => loadProfileFromStorage());
  const [googleProfile, setGoogleProfile] = useState(() => {
    const savedProfile = loadProfileFromStorage();
    return savedProfile
      ? {
          googleId: savedProfile.googleId || '',
          name: savedProfile.name || '',
          email: savedProfile.email || '',
          picture: savedProfile.picture || '',
        }
      : null;
  });
  const [profileForm, setProfileForm] = useState(() => profileToForm(loadProfileFromStorage()));
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('Sign in with Google to start your profile setup.');
  const [showAuth, setShowAuth] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(null);

  useEffect(() => {
    if (profile) {
      sessionStorage.removeItem(GOOGLE_NONCE_KEY);
    }
  }, [profile]);

  const handleGoogleCredential = useCallback((credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;
      if (!credential) {
        throw new Error('Google sign-in did not return a credential.');
      }

      const payload = decodeGoogleIdToken(credential);
      const expectedNonce = sessionStorage.getItem(GOOGLE_NONCE_KEY);
      if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
        throw new Error('Google sign-in validation failed. Please try again.');
      }

      const nextGoogleProfile = {
        googleId: payload.sub || '',
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture || '',
      };

      const allProfiles = JSON.parse(localStorage.getItem(ALL_PROFILES_KEY) || '{}');
      const existingProfile = allProfiles[nextGoogleProfile.googleId];

      if (existingProfile) {
        const normalized = normalizeProfile(existingProfile);
        if (normalized) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
          setProfile(normalized);
          setGoogleProfile({
            googleId: normalized.googleId,
            name: normalized.name,
            email: normalized.email,
            picture: normalized.picture,
          });
          setAuthError('');
          setAuthMessage('Welcome back!');
          setShowAuth(false);
          return;
        }
      }

      setGoogleProfile(nextGoogleProfile);
      setProfileForm((current) => ({
        ...current,
        name: nextGoogleProfile.name || current.name,
      }));
      setAuthError('');
      setAuthMessage('Google account connected. Complete the remaining profile details.');
      setShowAuth(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to read Google sign-in response.');
      setAuthMessage('');
    } finally {
      sessionStorage.removeItem(GOOGLE_NONCE_KEY);
    }
  }, []);

  const handleGoogleSignIn = useCallback(() => {
    const googleIdentity = window.google?.accounts?.id;
    if (!googleIdentity) {
      setAuthError('Google sign-in is not available right now. Reload the page and try again.');
      setAuthMessage('');
      return;
    }

    const nonce = createGoogleNonce();
    sessionStorage.setItem(GOOGLE_NONCE_KEY, nonce);

    setAuthError('');
    setAuthMessage('Opening Google sign-in...');
    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      nonce,
      use_fedcm_for_prompt: false,
    });
    googleIdentity.prompt();
  }, [handleGoogleCredential]);

  const handleProfileChange = useCallback((field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const handleResetAccount = useCallback(() => {
    sessionStorage.removeItem(GOOGLE_NONCE_KEY);
    setProfile(null);
    setGoogleProfile(null);
    setProfileForm({
      name: '',
      phone: '',
      location: '',
      class12: '',
      pcmMarks: '',
    });
    setAuthError('');
    setAuthMessage('Sign in with Google to start your profile setup.');
  }, []);

  const handleProfileSubmit = useCallback(
    (event) => {
      event.preventDefault();

      try {
        if (!googleProfile) {
          throw new Error('Sign in with Google before saving your profile.');
        }

        const name = String(profileForm.name || googleProfile.name || '').trim();
        const phone = String(profileForm.phone || '').trim();
        const location = String(profileForm.location || '').trim();
        const class12 = Number(profileForm.class12);
        const pcmMarksInput = profileForm.pcmMarks;
        const pcmMarks = pcmMarksInput === '' || pcmMarksInput === null || pcmMarksInput === undefined ? null : Number(pcmMarksInput);

        if (!name) throw new Error('Enter your name.');
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
          throw new Error('Enter a valid phone number.');
        }
        if (!location) throw new Error('Enter your location.');
        if (!Number.isFinite(class12) || class12 < 0 || class12 > 100) {
          throw new Error('Enter a valid Class 12th percentage between 0 and 100.');
        }
        if (pcmMarks !== null && (!Number.isFinite(pcmMarks) || pcmMarks < 0 || pcmMarks > 300)) {
          throw new Error('Enter valid PCM marks between 0 and 300.');
        }

        const nextProfile = {
          googleId: googleProfile.googleId || '',
          name,
          email: googleProfile.email || '',
          picture: googleProfile.picture || '',
          phone,
          location,
          class12: Number(class12.toFixed(2)),
          pcmMarks: pcmMarks !== null ? Math.round(pcmMarks) : null,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
        
        const allProfiles = JSON.parse(localStorage.getItem(ALL_PROFILES_KEY) || '{}');
        allProfiles[nextProfile.googleId] = nextProfile;
        localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(allProfiles));

        // Save name, phone, pcmMarks, class12%, email, and location to Google Sheet
        sendProfileToSheet({
          name: nextProfile.name,
          phone: nextProfile.phone,
          pcmMarks: nextProfile.pcmMarks,
          class12: nextProfile.class12,
          email: nextProfile.email,
          location: nextProfile.location,
        });

        setProfile(nextProfile);
        setGoogleProfile({
          googleId: nextProfile.googleId,
          name: nextProfile.name,
          email: nextProfile.email,
          picture: nextProfile.picture,
        });
        setAuthError('');
        setAuthMessage('Profile saved locally.');
        setShowAuth(false);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to save profile.');
      }
    },
    [googleProfile, profileForm]
  );

  const handleEditProfile = useCallback(() => {
    if (!profile) return;
    setGoogleProfile({
      googleId: profile.googleId || '',
      name: profile.name || '',
      email: profile.email || '',
      picture: profile.picture || '',
    });
    setProfileForm(profileToForm(profile));
    setAuthError('');
    setAuthMessage('Update your details and save again.');
    setShowAuth(true);
  }, [profile]);

  const handleSignOutClick = useCallback(() => {
    setShowSignOutConfirm(true);
  }, []);

  const executeSignOut = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(GOOGLE_NONCE_KEY);
    setProfile(null);
    setGoogleProfile(null);
    setProfileForm({
      name: '',
      phone: '',
      location: '',
      class12: '',
      pcmMarks: '',
    });
    setAuthError('');
    setAuthMessage('Sign in with Google to start your profile setup.');
    setShowAuth(false);
    setShowSignOutConfirm(false);
  }, []);

  const authProps = {
    googleProfile,
    profileForm,
    onProfileChange: handleProfileChange,
    onSubmit: handleProfileSubmit,
    onGoogleSignIn: handleGoogleSignIn,
    onResetAccount: handleResetAccount,
    onSignOut: handleSignOutClick,
    authError,
    authMessage,
  };

  // --- Exit-intent rating popup ---
  const RATING_KEY = 'kcet_2025_exit_rating_done';
  const [showRating, setShowRating] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingStatus, setRatingStatus] = useState(''); // '' | 'sending' | 'sent'

  useEffect(() => {
    if (localStorage.getItem(RATING_KEY)) return;

    // Mouse exit intent (desktop)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && !localStorage.getItem(RATING_KEY)) {
        setShowRating(true);
      }
    };

    // Push a dummy history entry so back button triggers popstate
    window.history.pushState({ kcetRating: true }, '');

    // Back button interception
    const handlePopState = () => {
      if (!localStorage.getItem(RATING_KEY)) {
        setShowRating(true);
        // Push again so back doesn't leave immediately
        window.history.pushState({ kcetRating: true }, '');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const submitRating = async () => {
    if (ratingStars < 1) return;
    setRatingStatus('sending');
    try {
      if (FEEDBACK_SHEET_WEBHOOK && FEEDBACK_SHEET_WEBHOOK.includes('http')) {
        const params = new URLSearchParams({
          userName: profile?.name || 'Anonymous',
          rating: ratingStars.toString(),
          feedback: ratingFeedback.trim() || `Rated ${ratingStars}/5`,
        });
        await fetch(`${FEEDBACK_SHEET_WEBHOOK}?${params.toString()}`, { mode: 'no-cors' });
      } else {
        // Fallback to sending it to the report sheet if feedback sheet isn't configured yet
        const params = new URLSearchParams({
          collegeCode: 'RATING',
          collegeName: 'Exit Rating',
          course: `${ratingStars} stars`,
          seat: profile?.name || 'Anonymous',
          reason: ratingFeedback.trim() || `Rated ${ratingStars}/5`,
        });
        await fetch(`${REPORT_SHEET_WEBHOOK}?${params.toString()}`, { mode: 'no-cors' });
      }
    } catch { /* silent */ }
    localStorage.setItem(RATING_KEY, 'true');
    setRatingStatus('sent');
    setTimeout(() => setShowRating(false), 2000);
  };

  const dismissRating = () => {
    localStorage.setItem(RATING_KEY, 'true');
    setShowRating(false);
  };

  return (
    <>
      <PredictorApp
        profile={profile}
        onEditProfile={handleEditProfile}
        onSignOut={handleSignOutClick}
        onRequestAuth={() => setShowAuth(true)}
        onAboutUs={() => setShowAboutUs(true)}
        onContactUs={() => setShowContactUs(true)}
        onViewCollege={(code) => setSelectedCollegeCode(code)}
      />

      {/* College Detail Modal */}
      {selectedCollegeCode && (
        <CollegeDetail
          collegeCode={selectedCollegeCode}
          onClose={() => setSelectedCollegeCode(null)}
        />
      )}
      {showAboutUs && (
        <div className="auth-overlay about-overlay">
          <div className="about-page">
            <button className="about-close-btn" aria-label="Close" onClick={() => setShowAboutUs(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Hero Section */}
            <section className="about-hero">
              <div className="about-hero__glow" aria-hidden="true" />
              <div className="brand-mark" style={{ width: 64, height: 64, fontSize: 26, borderRadius: 18, marginBottom: 20, overflow: 'hidden', background: 'transparent' }} aria-hidden="true">
                <img src={logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="about-hero__title">About Us</h1>
              <p className="about-hero__sub">
                Empowering KCET students to make smarter, stress-free college admission decisions.
              </p>
            </section>

            {/* Mission */}
            <section className="about-section about-anim" style={{ animationDelay: '0.1s' }}>
              <div className="about-section__icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                At <strong>KCET Predictor</strong>, our mission is simple: help KCET students make smarter college admission decisions with clarity and confidence.
              </p>
              <p>
                After KCET, many students face confusion about ranks, cutoffs, college choices, and counselling decisions. Important career choices are often made with incomplete information. That is exactly why we built this platform.
              </p>
            </section>

            {/* Founder Story */}
            <section className="about-section about-anim" style={{ animationDelay: '0.2s' }}>
              <div className="about-section__icon">🌟</div>
              <h2>Our Story</h2>
              <p>
                Founded in <strong>April 2026</strong> by <strong>B Aishwarya</strong>, an educator with 5 years of teaching experience and an M.Sc from NIT Rourkela, KCET Predictor was built to solve real challenges faced by students during the college admission journey.
              </p>
              <p>
                While teaching KCET aspirants, guiding counselling decisions, and reviewing engineering colleges, Aishwarya received consistent positive feedback from students and parents. That experience became the turning point behind building a dedicated platform focused on KCET students.
              </p>
            </section>

            {/* What We Do */}
            <section className="about-section about-anim" style={{ animationDelay: '0.3s' }}>
              <div className="about-section__icon">🛠️</div>
              <h2>What We Do</h2>
              <p style={{ marginBottom: 16 }}>We provide practical tools and reliable guidance for students seeking admission through KCET.</p>
              <div className="about-features">
                <div className="about-feature-card">
                  <div className="about-feature-card__icon">📊</div>
                  <div>
                    <strong>Rank Predictor</strong>
                    <span>Estimate your expected KCET rank using your marks.</span>
                  </div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-card__icon">🏫</div>
                  <div>
                    <strong>College Predictor</strong>
                    <span>Discover colleges based on your KCET rank and admission chances.</span>
                  </div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-card__icon">🧭</div>
                  <div>
                    <strong>Counselling Guidance</strong>
                    <span>Make better decisions during option entry, mock allotment, seat allotment, and admissions.</span>
                  </div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-card__icon">📚</div>
                  <div>
                    <strong>Student-Focused Resources</strong>
                    <span>Clear, simple, and useful information without unnecessary confusion.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Who We Help */}
            <section className="about-section about-anim" style={{ animationDelay: '0.4s' }}>
              <div className="about-section__icon">🤝</div>
              <h2>Who We Help</h2>
              <div className="about-tags">
                <span className="about-tag">KCET aspirants</span>
                <span className="about-tag">Engineering admission seekers</span>
                <span className="about-tag">Parents seeking counselling guidance</span>
                <span className="about-tag">Students comparing colleges &amp; branches</span>
              </div>
            </section>

            {/* Why Trust Us */}
            <section className="about-section about-anim" style={{ animationDelay: '0.5s' }}>
              <div className="about-section__icon">💡</div>
              <h2>Why Students Trust Us</h2>
              <p>
                Our platform is built on real student interactions, counselling experience, and years of working closely with KCET aspirants. We focus on giving students information that is practical, relevant, and easy to understand.
              </p>
              <div className="about-trust-highlight">
                <em>"We know that every rank matters, every option matters, and every counselling decision can shape your future."</em>
              </div>
            </section>

            {/* Team */}
            <section className="about-section about-anim" style={{ animationDelay: '0.6s' }}>
              <div className="about-section__icon">👥</div>
              <h2>Our Team</h2>
              <p style={{ marginBottom: 16 }}>KCET Predictor is powered by a passionate team committed to student success.</p>
              <div className="about-team-grid">
                {[
                  { name: 'B Aishwarya', role: 'Founder & Educator', initials: 'BA', color: 'linear-gradient(135deg, #f59e0b, #ec4899)', image: aishwaryaImg, imgStyles: { objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.15)', transformOrigin: 'top center' } },
                  { name: 'Manmath Mohanty', role: 'Co-Builder', initials: 'MM', color: 'linear-gradient(135deg, #6366f1, #a855f7)', image: manmathImg, imgStyles: { objectFit: 'cover', objectPosition: 'center 35%', transform: 'scale(1.8)', transformOrigin: 'center 35%' } },
                  { name: 'Ansh Sharma', role: 'Developer', initials: 'AS', color: 'linear-gradient(135deg, #10b981, #14b8a6)' },
                  { name: 'Amratya Madhav Mishra', role: 'Contributor', initials: 'AM', color: 'linear-gradient(135deg, #3b82f6, #6366f1)', image: amratyaImg, imgStyles: { objectFit: 'cover', objectPosition: 'center', transform: 'scale(1.15)', transformOrigin: 'top center' } },
                ].map((member) => (
                  <div className="about-team-member" key={member.initials}>
                    <div className="about-team-avatar" style={{ background: member.color, overflow: 'hidden' }}>
                      {member.image ? (
                        <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', ...member.imgStyles }} />
                      ) : (
                        member.initials
                      )}
                    </div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Vision */}
            <section className="about-section about-vision about-anim" style={{ animationDelay: '0.7s' }}>
              <div className="about-section__icon">🚀</div>
              <h2>Our Vision</h2>
              <p>
                To become one of the most trusted KCET guidance platforms by making college selection and counselling simpler, smarter, and stress-free.
              </p>
            </section>

            {/* CTA */}
            <section className="about-cta about-anim" style={{ animationDelay: '0.8s' }}>
              <h2>Start Your Journey</h2>
              <p>Use our tools, explore your options, and take the next step toward the right college with confidence.</p>
              <button className="primary-btn" onClick={() => setShowAboutUs(false)} style={{ maxWidth: 320, margin: '0 auto' }}>
                👉 Use Predictor Now
              </button>
            </section>

            <footer className="about-footer">
              <p>Made with ❤️ by Team KCET Predictor</p>
              <p>Using real 2025 cutoff data across <strong>{formatNumber(DATA.meta.collegeCount)} colleges</strong> and <strong>{formatNumber(DATA.meta.programRows)} programs</strong></p>
            </footer>
          </div>
        </div>
      )}
      {showContactUs && (
        <div className="auth-overlay about-overlay">
          <div className="about-page">
            <button className="about-close-btn" aria-label="Close" onClick={() => setShowContactUs(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Hero Section */}
            <section className="about-hero">
              <div className="about-hero__glow" aria-hidden="true" />
              <div className="brand-mark" style={{ width: 64, height: 64, fontSize: 26, borderRadius: 18, marginBottom: 20, overflow: 'hidden', background: 'transparent' }} aria-hidden="true">
                <img src={logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="about-hero__title">Contact Us</h1>
              <p className="about-hero__sub">
                We're here to help KCET students with the right guidance, tools, and support. Feel free to reach out.
              </p>
            </section>

            {/* Get in Touch */}
            <section className="about-section about-anim" style={{ animationDelay: '0.1s' }}>
              <div className="about-section__icon">📬</div>
              <h2>Get in Touch</h2>
              <div className="contact-cards">
                <a href="mailto:aishwarya@toppermode.com" className="contact-card">
                  <div className="contact-card__icon" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <span>aishwarya@toppermode.com</span>
                  </div>
                </a>
                <a href="tel:+919178545794" className="contact-card">
                  <div className="contact-card__icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  </div>
                  <div>
                    <strong>Phone</strong>
                    <span>+91 91785 45794</span>
                  </div>
                </a>
                <div className="contact-card">
                  <div className="contact-card__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <strong>Office Address</strong>
                    <span>Electronic City Phase 2, Bengaluru, Karnataka 560100</span>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Can Help */}
            <section className="about-section about-anim" style={{ animationDelay: '0.2s' }}>
              <div className="about-section__icon">🤝</div>
              <h2>How We Can Help</h2>
              <p style={{ marginBottom: 16 }}>You can contact us for:</p>
              <div className="about-tags">
                <span className="about-tag">Rank Predictor support</span>
                <span className="about-tag">College Predictor guidance</span>
                <span className="about-tag">KCET counselling help</span>
                <span className="about-tag">Cutoff &amp; college info queries</span>
                <span className="about-tag">Technical issues</span>
                <span className="about-tag">Feedback &amp; suggestions</span>
                <span className="about-tag">Collaboration &amp; partnerships</span>
              </div>
            </section>

            {/* Book a Call */}
            <section className="about-section about-vision about-anim" style={{ animationDelay: '0.3s' }}>
              <div className="about-section__icon">📞</div>
              <h2>Book a Call</h2>
              <p>Need personal guidance? You can schedule a one-on-one call with us for personalized KCET counselling.</p>
              <a href="https://topmate.io/aishwaryadidi" target="_blank" rel="noopener noreferrer" className="primary-btn" style={{ maxWidth: 300, marginTop: 16, textDecoration: 'none' }}>
                📅 Book Here on Topmate
              </a>
            </section>

            {/* Response Time */}
            <section className="about-section about-anim" style={{ animationDelay: '0.4s' }}>
              <div className="about-section__icon">⏱️</div>
              <h2>Response Time</h2>
              <div className="about-trust-highlight">
                <em>We aim to respond to all queries within <strong>24–48 hours</strong> during working days.</em>
              </div>
            </section>

            {/* Follow Us */}
            <section className="about-section about-anim" style={{ animationDelay: '0.5s' }}>
              <div className="about-section__icon">🌐</div>
              <h2>Follow Us</h2>
              <div className="contact-cards">
                <a href="https://www.youtube.com/@crackkcet26" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-card__icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </div>
                  <div>
                    <strong>YouTube</strong>
                    <span>@crackkcet26</span>
                  </div>
                </a>
                <a href="https://www.instagram.com/aishwaryadidi_" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-card__icon" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </div>
                  <div>
                    <strong>Instagram</strong>
                    <span>@aishwaryadidi_</span>
                  </div>
                </a>
              </div>
            </section>

            {/* CTA */}
            <section className="about-cta about-anim" style={{ animationDelay: '0.6s' }}>
              <h2>Send Us a Message</h2>
              <p>Have a question? Reach out today and let us help you make smarter KCET admission decisions.</p>
              <a href="mailto:aishwarya@toppermode.com" className="primary-btn" style={{ maxWidth: 320, margin: '0 auto', textDecoration: 'none' }}>
                ✉️ Email Us Now
              </a>
            </section>

            <footer className="about-footer">
              <p>Made with ❤️ by Team KCET Predictor</p>
            </footer>
          </div>
        </div>
      )}
      {showAuth && (
        <div className="auth-overlay">
          <AuthScreen {...authProps} onClose={() => setShowAuth(false)} />
        </div>
      )}
      {showSignOutConfirm && (
        <div className="auth-overlay">
          <div className="auth-shell">
            <div className="auth-panel panel" style={{ maxWidth: 360, margin: '0 auto', padding: '32px', textAlign: 'center', position: 'relative' }}>
              <h2 style={{ fontSize: 22, margin: '0 0 12px' }}>Sign Out</h2>
              <p className="subtitle" style={{ marginBottom: 24 }}>Are you sure you want to log out of your session?</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="secondary-btn" onClick={() => setShowSignOutConfirm(false)} style={{ flex: 1, minHeight: 44, margin: 0 }}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={executeSignOut} style={{ flex: 1, margin: 0, minHeight: 44, background: 'var(--red)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)' }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit-Intent Rating Popup */}
      {showRating && (
        <div className="auth-overlay" style={{ zIndex: 200 }}>
          <div className="auth-shell">
            <div className="rating-popup panel">
              <button className="rating-close" onClick={dismissRating} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {ratingStatus === 'sent' ? (
                <div className="rating-thanks">
                  <div className="rating-thanks__icon">🎉</div>
                  <h2>Thank you!</h2>
                  <p className="subtitle">Your feedback helps us improve.</p>
                </div>
              ) : (
                <>
                  <div className="rating-header">
                    <div className="rating-emoji">⭐</div>
                    <h2>Wait! How was your experience?</h2>
                    <p className="subtitle">Rate the KCET Predictor before you go</p>
                  </div>

                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star ${star <= (ratingHover || ratingStars) ? 'active' : ''}`}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRatingStars(star)}
                        aria-label={`${star} star`}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= (ratingHover || ratingStars) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  {ratingStars > 0 && (
                    <p className="rating-label">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingStars]}
                    </p>
                  )}

                  <textarea
                    className="rating-feedback"
                    placeholder="Any suggestions? (optional)"
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    rows={2}
                    maxLength={500}
                    disabled={ratingStatus === 'sending'}
                  />

                  <button
                    className="primary-btn rating-submit"
                    onClick={submitRating}
                    disabled={ratingStars < 1 || ratingStatus === 'sending'}
                  >
                    {ratingStatus === 'sending' ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  <button className="ghost-btn" onClick={dismissRating} style={{ width: '100%', marginTop: 4, fontSize: 13 }}>
                    No thanks
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
