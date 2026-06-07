import DATA from './data.json';

// Extract unique colleges from the data
export function extractUniqueColleges() {
  const collegesMap = new Map();
  
  DATA.rows.forEach(row => {
    const collegeCode = row[0];
    const collegeName = row[1];
    const city = row[3];
    const address = row[7] || '';
    
    if (!collegesMap.has(collegeCode)) {
      collegesMap.set(collegeCode, {
        college_code: collegeCode,
        college_name: collegeName,
        address: address,
        location: address ? `${address}, ${city}` : city,
        city: city,
        description: null,
        photo_url: null,
        website: null,
        established_year: null,
        affiliation: null
      });
    }
  });
  
  return Array.from(collegesMap.values());
}

// Get college by code from existing data
export function getCollegeFromData(collegeCode) {
  const row = DATA.rows.find(r => r[0] === collegeCode);
  if (!row) return null;
  
  return {
    college_code: row[0],
    college_name: row[1],
    address: row[7] || '',
    location: row[7] ? `${row[7]}, ${row[3]}` : row[3],
    city: row[3]
  };
}

// Cache for college cutoffs
let collegeCutoffsCache = null;

// Get all courses and cutoffs for a specific college
export function getCollegeCutoffs(collegeCode) {
  if (!collegeCutoffsCache) {
    collegeCutoffsCache = new Map();
    DATA.rows.forEach(row => {
      const code = row[0];
      if (!collegeCutoffsCache.has(code)) {
        collegeCutoffsCache.set(code, []);
      }
      collegeCutoffsCache.get(code).push({
        branchName: row[2],
        branchGroup: row[4],
        branchCode: row[6],
        cutoffs: row[5] // The array of cutoffs
      });
    });
  }
  
  return collegeCutoffsCache.get(collegeCode) || [];
}
