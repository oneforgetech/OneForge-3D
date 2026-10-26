/**
 * ONEFORGE website forms → this Google Sheet.
 *
 * Every entry from the "Say hello" form (/connect) and the partner page form (/partner) is added here
 * as a new row, each form on its own tab ("Say hello" and "Partner"). The tabs and their column
 * headings are created automatically when the first entry arrives.
 *
 * Setup (once, about 10 minutes):
 *   1. Create a new Google Sheet, e.g. "ONEFORGE form entries".
 *      File > Settings > Time zone: (GMT+01:00) Lagos, so the "Received" times are local.
 *   2. Extensions > Apps Script. Delete what's there, paste this whole file, and click Save.
 *   3. Deploy > New deployment > the gear icon > Web app.
 *        Execute as: Me
 *        Who has access: Anyone
 *      Click Deploy, then Authorize access. Google warns because this is your own script:
 *      choose Advanced > Go to … (unsafe) > Allow.
 *   4. Copy the Web app URL (it ends in /exec). Opening it in a browser should say the sheet is connected.
 *   5. In cPanel > Setup Node.js App > the website > Environment variables, add
 *        SHEETS_WEBHOOK_URL   =   that URL
 *      Save, then Restart the app.
 *
 * Keep the URL private: anyone who has it could add rows.
 * If you change this script later: Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 * That keeps the same URL, so the website needs no change.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // two entries arriving at once each get their own row
  try {
    var data = JSON.parse(e.postData.contents);
    var row = data.row && typeof data.row === 'object' ? data.row : {};
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var tab = String(data.tab || 'Entries').slice(0, 60);
    var sheet = book.getSheetByName(tab) || book.insertSheet(tab);

    // Match columns by their heading, so columns can be reordered in the sheet. New ones go on the end.
    var header = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String) : [];
    var before = header.length;
    ['Received'].concat(Object.keys(row)).forEach(function (label) {
      if (header.indexOf(label) === -1) header.push(label);
    });
    if (header.length !== before) {
      sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(
      header.map(function (label) {
        return label === 'Received' ? new Date() : asText(row[label]);
      })
    );
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the web app URL in a browser: a quick check that the deployment works. */
function doGet() {
  return ContentService.createTextOutput(
    'Connected. Website form entries will appear in "' + SpreadsheetApp.getActiveSpreadsheet().getName() + '".'
  );
}

/**
 * Store every answer as plain text. Otherwise Sheets would drop the leading 0 or + from phone numbers,
 * and anything starting with "=" would run as a formula.
 */
function asText(value) {
  if (value === undefined || value === null || value === '') return '';
  return "'" + String(value);
}

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
