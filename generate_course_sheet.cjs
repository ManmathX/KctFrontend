/**
 * Generate an XLSX file with Course List and Category Filter entries
 * for sharing with the team.
 */
const XLSX = require('xlsx');
const data = require('./src/data.json');

const wb = XLSX.utils.book_new();

// ─── Sheet 1: Course List ───
// Extract unique courses with their branch code and branch group
const coursesMap = new Map();
data.rows.forEach(row => {
  const branchName = row[2];
  const branchCode = row[6];
  const branchGroup = row[4];
  const key = `${branchCode}||${branchName}`;
  if (!coursesMap.has(key)) {
    coursesMap.set(key, { branchCode, branchName, branchGroup });
  }
});

const courseRows = Array.from(coursesMap.values())
  .sort((a, b) => a.branchGroup.localeCompare(b.branchGroup) || a.branchName.localeCompare(b.branchName));

const courseData = [
  ['S.No', 'Branch Code', 'Branch Name', 'Branch Group'],
  ...courseRows.map((c, i) => [i + 1, c.branchCode, c.branchName, c.branchGroup])
];

const ws1 = XLSX.utils.aoa_to_sheet(courseData);
// Set column widths
ws1['!cols'] = [
  { wch: 6 },   // S.No
  { wch: 14 },  // Branch Code
  { wch: 60 },  // Branch Name
  { wch: 25 },  // Branch Group
];
XLSX.utils.book_append_sheet(wb, ws1, 'Course List');

// ─── Sheet 2: Category Filter ───
const categoryData = [
  ['S.No', 'Seat Code', 'Category Name', 'Category Group'],
];

// Group the categories
const categoryGroups = {
  '1G': 'Category 1', '1K': 'Category 1', '1R': 'Category 1',
  '2AG': 'Category 2A', '2AK': 'Category 2A', '2AR': 'Category 2A',
  '2BG': 'Category 2B', '2BK': 'Category 2B', '2BR': 'Category 2B',
  '3AG': 'Category 3A', '3AK': 'Category 3A', '3AR': 'Category 3A',
  '3BG': 'Category 3B', '3BK': 'Category 3B', '3BR': 'Category 3B',
  'GM': 'General Merit', 'GMK': 'General Merit', 'GMP': 'General Merit', 'GMR': 'General Merit',
  'NRI': 'Other', 'OPN': 'Other', 'OTH': 'Other',
  'SCG': 'SC/ST', 'SCK': 'SC/ST', 'SCR': 'SC/ST',
  'STG': 'SC/ST', 'STK': 'SC/ST', 'STR': 'SC/ST',
};

data.seats.forEach((seat, i) => {
  categoryData.push([
    i + 1,
    seat[0],
    seat[1],
    categoryGroups[seat[0]] || 'Other'
  ]);
});

const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
ws2['!cols'] = [
  { wch: 6 },   // S.No
  { wch: 12 },  // Seat Code
  { wch: 40 },  // Category Name
  { wch: 18 },  // Category Group
];
XLSX.utils.book_append_sheet(wb, ws2, 'Category Filter');

// ─── Sheet 3: Branch Groups ───
const branchGroupData = [
  ['S.No', 'Branch Group', 'Number of Courses'],
];

const groupCounts = {};
courseRows.forEach(c => {
  groupCounts[c.branchGroup] = (groupCounts[c.branchGroup] || 0) + 1;
});

Object.entries(groupCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([group, count], i) => {
    branchGroupData.push([i + 1, group, count]);
  });

const ws3 = XLSX.utils.aoa_to_sheet(branchGroupData);
ws3['!cols'] = [
  { wch: 6 },
  { wch: 25 },
  { wch: 20 },
];
XLSX.utils.book_append_sheet(wb, ws3, 'Branch Groups');

// ─── Write file ───
const outPath = 'KCET_Course_List_Categories.xlsx';
XLSX.writeFile(wb, outPath);
console.log(`✅ Created ${outPath}`);
console.log(`   Sheet 1: Course List — ${courseRows.length} courses`);
console.log(`   Sheet 2: Category Filter — ${data.seats.length} categories`);
console.log(`   Sheet 3: Branch Groups — ${Object.keys(groupCounts).length} groups`);
