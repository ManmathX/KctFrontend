/**
 * Google Apps Script — deploy this as a Web App to receive form data
 * from the KCET Rank Predictor and save it to the Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1qlnFOmtz_HtLqB52rH8uTNB4zHyhE04lMHPl5mFQPUo/edit
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file's contents
 * 4. Click the floppy-disk icon (Save)
 * 5. Click "Deploy" → "New deployment"
 * 6. Click the gear icon next to "Select type" → choose "Web app"
 * 7. Set:
 *      - Description: "KCET Profile Collector"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 8. Click "Deploy" and authorize when prompted
 * 9. Copy the Web App URL and paste it into App.jsx (GOOGLE_SHEET_WEBHOOK constant)
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone Number', 'PCM 12 (out of 300)', 'Class 12 %', 'Email', 'Location']);
      // Bold the header row
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    // Append the new row
    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.name || '',
      data.phone || '',
      data.pcmMarks !== undefined && data.pcmMarks !== null ? data.pcmMarks : '',
      data.class12 !== undefined && data.class12 !== null ? data.class12 : '',
      data.email || '',
      data.location || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Profile saved to sheet.' })
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

    // If no data params, just return a health check
    if (!params.name && !params.phone && !params.email) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', message: 'KCET Profile Collector is running.' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone Number', 'PCM 12 (out of 300)', 'Class 12 %', 'Email', 'Location']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      params.name || '',
      params.phone || '',
      params.pcmMarks || '',
      params.class12 || '',
      params.email || '',
      params.location || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Profile saved to sheet.' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
