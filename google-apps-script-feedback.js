/**
 * Google Apps Script — Feedback & Rating Sheet
 * Deploy this as a Web App to receive app ratings and feedback from the KCET Rank Predictor.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet for Feedback.
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file's contents
 * 4. Click the floppy-disk icon (Save)
 * 5. Click "Deploy" → "New deployment"
 * 6. Click the gear icon next to "Select type" → choose "Web app"
 * 7. Set:
 *      - Description: "KCET Feedback Collector"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 8. Click "Deploy" and authorize when prompted (Advanced -> Go to script)
 * 9. Copy the Web App URL and paste it into App.jsx (FEEDBACK_SHEET_WEBHOOK constant)
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'User Name', 'Rating (Stars)', 'Feedback']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.userName || 'Anonymous',
      data.rating || '',
      data.feedback || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Feedback saved.' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles GET requests with query parameters from the frontend (no-cors mode)
function doGet(e) {
  try {
    const params = e.parameter || {};

    // Health check if no feedback params
    if (!params.rating && !params.feedback) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', message: 'KCET Feedback Collector is running.' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'User Name', 'Rating (Stars)', 'Feedback']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      params.userName || 'Anonymous',
      params.rating || '',
      params.feedback || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Feedback saved.' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
