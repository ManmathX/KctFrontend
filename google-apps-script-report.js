/**
 * Google Apps Script — Report Sheet
 * Deploy this as a Web App to receive report data from the KCET Rank Predictor.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Report Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1k5aStkazigri40PmsErk6WUIopbCrCBLqUEYW-uwUYI/edit
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file's contents
 * 4. Click the floppy-disk icon (Save)
 * 5. Click "Deploy" → "New deployment"
 * 6. Click the gear icon next to "Select type" → choose "Web app"
 * 7. Set:
 *      - Description: "KCET Report Collector"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 8. Click "Deploy" and authorize when prompted
 * 9. Copy the Web App URL and paste it into App.jsx (REPORT_SHEET_WEBHOOK constant)
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'College Code', 'College Name', 'Course', 'Seat Type', 'Report Reason']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.collegeCode || '',
      data.collegeName || '',
      data.course || '',
      data.seat || '',
      data.reason || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Report saved.' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles GET requests with query parameters from the frontend
function doGet(e) {
  try {
    const params = e.parameter || {};

    // Health check if no report params
    if (!params.collegeCode && !params.reason) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', message: 'KCET Report Collector is running.' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'College Code', 'College Name', 'Course', 'Seat Type', 'Report Reason']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      params.collegeCode || '',
      params.collegeName || '',
      params.course || '',
      params.seat || '',
      params.reason || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Report saved.' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
