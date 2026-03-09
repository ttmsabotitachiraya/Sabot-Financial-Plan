// ============================================================
// Hospital Budget App — Google Apps Script Backend
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Open Google Sheets → Extensions → Apps Script
// 2. Paste this entire file into Code.gs
// 3. Save and Deploy as Web App:
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL into your .env file as VITE_GAS_URL
// ============================================================

// ---------- CONFIG ----------

const SHEET_NAME = "BudgetEntries";
const ADMIN_PASSWORD = "admin1234"; // *** Change this in production ***

// Column order must match HEADERS exactly
const HEADERS = [
  "id",
  "timestamp",
  "title",
  "location",
  "budget_requested",
  "budget_received",
  "priority",
  "description",
  "status",
  "admin_remark",
];

// ---------- CORS HEADERS ----------

function setCorsHeaders(output) {
  output.setHeader("Access-Control-Allow-Origin", "*");
  output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  output.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return output;
}

// ---------- ENTRY POINT ----------

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    let result;

    switch (action) {
      case "READ_ALL":
        result = readAll();
        break;
      case "CREATE":
        result = createEntry(payload.data);
        break;
      case "UPDATE_STATUS":
        if (payload.adminPassword !== ADMIN_PASSWORD) {
          return buildResponse({ success: false, error: "Unauthorized" });
        }
        result = updateStatus(payload.id, payload.status, payload.admin_remark || "");
        break;
      case "EDIT_ENTRY":
        if (payload.adminPassword !== ADMIN_PASSWORD) {
          return buildResponse({ success: false, error: "Unauthorized" });
        }
        result = editEntry(payload.id, payload.data);
        break;
      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return buildResponse(result);
  } catch (err) {
    return buildResponse({ success: false, error: err.toString() });
  }
}

// Handle preflight OPTIONS request
function doGet(e) {
  return buildResponse({ success: true, message: "Hospital Budget API is running." });
}

// ---------- BUILD RESPONSE ----------

function buildResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ---------- SHEET HELPERS ----------

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Auto-create sheet and headers if not exists
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#2563EB");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Ensure headers exist — if first row doesn't match HEADERS, insert header row
    // Use sheet.getLastColumn() to read at least as many columns as current sheet has
    const colsToCheck = Math.max(sheet.getLastColumn(), HEADERS.length);
    const firstRowValues = sheet.getRange(1, 1, 1, colsToCheck).getValues()[0] || [];
    let headersMissing = false;
    for (let i = 0; i < HEADERS.length; i++) {
      if (firstRowValues[i] !== HEADERS[i]) {
        headersMissing = true;
        break;
      }
    }
    if (headersMissing) {
      // Insert a row at the top to preserve existing data, then write headers
      // insertRowBefore(1) inserts before the current first row
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground("#2563EB");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * ensureHeaders()
 * Utility to be run once (from the Apps Script editor) to ensure the header row exists.
 * - If the sheet is missing, creates it and writes HEADERS.
 * - If the first row does not match HEADERS, inserts a header row above existing data.
 * Returns an object describing the result so you can run it manually and inspect the response.
 */
function ensureHeaders() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + headers if missing entirely
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground("#2563EB");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
      return { success: true, message: "Sheet created and headers inserted" };
    }

    // Read at least HEADERS.length columns (or current last column) to compare
    const colsToCheck = Math.max(sheet.getLastColumn(), HEADERS.length);
    const firstRowValues = sheet.getRange(1, 1, 1, colsToCheck).getValues()[0] || [];
    let headersMissing = false;
    for (let i = 0; i < HEADERS.length; i++) {
      if (String(firstRowValues[i] || "") !== String(HEADERS[i])) {
        headersMissing = true;
        break;
      }
    }

    if (headersMissing) {
      // Insert header row above existing data to preserve current rows
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      const headerRange2 = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange2.setBackground("#2563EB");
      headerRange2.setFontColor("#FFFFFF");
      headerRange2.setFontWeight("bold");
      sheet.setFrozenRows(1);
      return { success: true, message: "Headers inserted" };
    }

    return { success: true, message: "Headers already present" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function rowToObject(row) {
  const obj = {};
  HEADERS.forEach((key, idx) => {
    let val = row[idx];
    // Convert budget to number
    if (key === "budget_requested" || key === "budget_received") {
      val = Number(val) || 0;
    }
    // Convert timestamp Date object to dd/mm/yyyy hh:mm format for consistent display
    if (key === "timestamp" && val instanceof Date) {
      val = formatDate(val);
    }
    obj[key] = val !== undefined && val !== null ? val : "";
  });
  return obj;
}

function formatDate(d) {
  // Expect a Date object `d`. Return in dd/mm/yyyy hh:mm (24-hour) format.
  const pad = function (n) {
    return n < 10 ? "0" + n : String(n);
  };
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return day + "/" + month + "/" + year + " " + hours + ":" + minutes;
}

function generateId() {
  return Utilities.getUuid().split("-")[0].toUpperCase();
}

// ---------- READ ALL ----------

function readAll() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, data: [] };
  }

  // Skip header row (index 0)
  const entries = data.slice(1).map((row) => rowToObject(row));

  return { success: true, data: entries };
}

// ---------- CREATE ENTRY ----------

function createEntry(data) {
  if (!data) {
    return { success: false, error: "No data provided" };
  }

  // Validate required fields
  const required = ["title", "location", "budget_requested", "priority", "description"];
  for (const field of required) {
    if (!data[field] && data[field] !== 0) {
      return { success: false, error: "Missing required field: " + field };
    }
  }

  const sheet = getSheet();
  const id = generateId();
  const timestamp = formatDate(new Date());
  // Default new-status value (store new entries under the simplified status)
  const status = "รอเงิน";
  const admin_remark = "";

  const newRow = [
    id,
    timestamp,
    data.title,
    data.location,
    Number(data.budget_requested),
    Number(data.budget_received) || 0,
    data.priority,
    data.description,
    status,
    admin_remark,
  ];

  sheet.appendRow(newRow);

  const newEntry = {
    id,
    timestamp,
    title: data.title,
    location: data.location,
    budget_requested: Number(data.budget_requested),
    budget_received: Number(data.budget_received) || 0,
    priority: data.priority,
    description: data.description,
    status,
    admin_remark,
  };

  return { success: true, data: newEntry };
}

// ---------- UPDATE STATUS ----------

function updateStatus(id, status, admin_remark) {
  if (!id || !status) {
    return { success: false, error: "id and status are required" };
  }

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const idColIdx = HEADERS.indexOf("id"); // 0
  const statusColIdx = HEADERS.indexOf("status"); // 7
  const remarkColIdx = HEADERS.indexOf("admin_remark"); // 8

  const targetId = String(id || "").trim().toUpperCase();

  // Find the row (skip header row at index 0)
  for (let i = 1; i < data.length; i++) {
    const sheetIdRaw = data[i][idColIdx];
    const sheetId = String(sheetIdRaw || "").trim().toUpperCase();
    if (sheetId === targetId) {
      // Rows in Sheets are 1-indexed, and we have a header row
      const sheetRow = i + 1;

      // Normalize incoming status values to the new 4-status set before writing to sheet.
      // Accept legacy values but persist the unified new-status strings.
      let mappedStatus = status;
      if (typeof status === "string") {
        const s = status.trim();
        if (s === "เสนอใหม่" || s === "รอเข้าที่ประชุม") {
          mappedStatus = "รอเงิน";
        } else if (s === "อนุมัติ") {
          mappedStatus = "มีเงินแล้ว";
        } else if (s === "ดำเนินการแล้ว") {
          mappedStatus = "เสร็จแล้ว";
        } else if (s === "ปฏิเสธ") {
          mappedStatus = "ปฏิเสธ";
        } else {
          // If already in the new set or unknown, keep as-is
          mappedStatus = s;
        }
      }

      sheet.getRange(sheetRow, statusColIdx + 1).setValue(mappedStatus);
      if (admin_remark !== undefined) {
        sheet.getRange(sheetRow, remarkColIdx + 1).setValue(admin_remark);
      }

      // Return updated entry
      const updatedRow = sheet.getRange(sheetRow, 1, 1, HEADERS.length).getValues()[0];
      return { success: true, data: rowToObject(updatedRow) };
    }
  }

  return { success: false, error: "Entry not found: " + id };
}

// ---------- EDIT ENTRY ----------

function editEntry(id, updatableData) {
  if (!id || !updatableData) {
    return { success: false, error: "id and data are required" };
  }

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const idColIdx = HEADERS.indexOf("id");

  // Normalize search id for robust matching (trim + uppercase)
  const searchId = String(id).trim().toUpperCase();

  // Fields that are allowed to be edited by admin
  const editableFields = [
    "title",
    "location",
    "budget_requested",
    "budget_received",
    "priority",
    "description",
    "status",
    "admin_remark",
  ];

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][idColIdx] || "").trim().toUpperCase();
    if (rowId === searchId) {
      const sheetRow = i + 1;

      editableFields.forEach((field) => {
        if (updatableData[field] !== undefined) {
          const colIdx = HEADERS.indexOf(field);
          if (colIdx !== -1) {
            let value = updatableData[field];

            // Ensure budget is numeric
            if (field === "budget_requested" || field === "budget_received") {
              value = Number(value) || 0;
            }

            // If updating status, map legacy/status variations into the new status set
            if (field === "status" && typeof value === "string") {
              const s = value.trim();
              if (s === "เสนอใหม่" || s === "รอเข้าที่ประชุม") {
                value = "รอเงิน";
              } else if (s === "อนุมัติ") {
                value = "มีเงินแล้ว";
              } else if (s === "ดำเนินการแล้ว") {
                value = "เสร็จแล้ว";
              } else if (s === "ปฏิเสธ") {
                value = "ปฏิเสธ";
              } else {
                // keep provided value (supports already-new statuses)
                value = s;
              }
            }

            sheet.getRange(sheetRow, colIdx + 1).setValue(value);
          }
        }
      });

      // Return updated entry
      const updatedRow = sheet.getRange(sheetRow, 1, 1, HEADERS.length).getValues()[0];
      return { success: true, data: rowToObject(updatedRow) };
    }
  }

  return { success: false, error: "Entry not found: " + id };
}
