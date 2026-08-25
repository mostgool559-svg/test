/**
 * Google Workspace Intake Foundation Setup
 * Creates a Google Form linked to a Spreadsheet with operational columns and sheets
 */

/**
 * Configuration constants - modify these as needed
 */
const CONFIG = {
  // Form configuration
  FORM_TITLE: 'Project Intake Form',
  
  // Spreadsheet configuration
  SPREADSHEET_NAME: 'Project Intake Responses',
  
  // Response sheet configuration
  RESPONSE_SHEET_NAME: 'Form Responses 1',
  
  // Operational columns configuration
  OPERATIONAL_COLUMNS: [
    'Record ID',
    'Category',
    'Priority',
    'Summary',
    'Next Action',
    'Status',
    'Processed At',
    'Error'
  ],
  
  // Additional sheets configuration
  ADDITIONAL_SHEETS: [
    'Error Log',
    'Dashboard'
  ]
};

/**
 * Main setup entry point
 * Creates/configures the Google Form and linked Spreadsheet
 */
function setupProject() {
  try {
    // Create or get the Google Form
    let form = FormApp.create(CONFIG.FORM_TITLE);
    
    // Add the required form questions
    addFormQuestions(form);
    
    // Create or get the spreadsheet to link responses to
    let spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    
    // Link the form to the spreadsheet
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
    
    // Configure the response spreadsheet
    configureResponseSpreadsheet(spreadsheet);
    
    Logger.log('Project setup completed successfully');
    Logger.log('Form ID: ' + form.getId());
    Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
    
  } catch (error) {
    Logger.log('Error during setup: ' + error.toString());
    throw error;
  }
}

/**
 * Adds the required questions to the Google Form
 * @param {Form} form - The Google Form to add questions to
 */
function addFormQuestions(form) {
  // Name - required, short text
  form.addTextItem()
      .setTitle('Name')
      .setRequired(true);
  
  // Email - required, short text
  form.addTextItem()
      .setTitle('Email')
      .setRequired(true);
  
  // Request - required, paragraph text
  form.addParagraphTextItem()
      .setTitle('Request')
      .setRequired(true);
  
  // Notes - optional, paragraph text
  form.addParagraphTextItem()
      .setTitle('Notes')
      .setRequired(false);
}

/**
 * Configures the response spreadsheet with operational columns and additional sheets
 * @param {Spreadsheet} spreadsheet - The spreadsheet to configure
 */
function configureResponseSpreadsheet(spreadsheet) {
  // Get the response sheet safely
  let responseSheet = getResponseSheet(spreadsheet);
  
  // Add operational columns to the right of existing form response columns
  addOperationalColumns(responseSheet);
  
  // Create additional sheets if they don't exist
  createAdditionalSheets(spreadsheet);
}

/**
 * Adds operational columns to the response sheet
 * Ensures no duplicates by checking if columns already exist
 * @param {Sheet} responseSheet - The response sheet to modify
 */
function addOperationalColumns(responseSheet) {
  // Get the header row
  let headerRow = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
  
  // Find the last column that contains form response data (first empty column)
  let lastColumn = responseSheet.getLastColumn();
  
  // Check which operational columns are already present in the header row
  let existingOperationalColumns = [];
  for (let i = 0; i < headerRow.length; i++) {
    if (CONFIG.OPERATIONAL_COLUMNS.includes(headerRow[i])) {
      existingOperationalColumns.push(headerRow[i]);
    }
  }
  
  // Only add columns that don't already exist
  let columnsToAdd = CONFIG.OPERATIONAL_COLUMNS.filter(col => !existingOperationalColumns.includes(col));
  
  if (columnsToAdd.length > 0) {
    // Add the missing operational columns
    responseSheet.insertColumnsAfter(lastColumn, columnsToAdd.length);
    
    // Set the headers for the new columns
    let headerRange = responseSheet.getRange(1, lastColumn + 1, 1, columnsToAdd.length);
    headerRange.setValues([columnsToAdd]);
    
    Logger.log('Added operational columns: ' + columnsToAdd.join(', '));
  } else {
    Logger.log('All operational columns already exist');
  }
}

/**
 * Creates additional sheets if they don't exist
 * @param {Spreadsheet} spreadsheet - The spreadsheet to modify
 */
function createAdditionalSheets(spreadsheet) {
  CONFIG.ADDITIONAL_SHEETS.forEach(sheetName => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      spreadsheet.insertSheet(sheetName);
      Logger.log('Created sheet: ' + sheetName);
    } else {
      Logger.log('Sheet already exists: ' + sheetName);
    }
  });
}

/**
 * Helper function to get the response sheet safely
 * @param {Spreadsheet} spreadsheet - The spreadsheet to search in
 * @returns {Sheet} The response sheet
 */
function getResponseSheet(spreadsheet) {
  let responseSheet = spreadsheet.getSheetByName(CONFIG.RESPONSE_SHEET_NAME);
  if (responseSheet) {
    return responseSheet;
  }
  
  // Try to find a sheet that contains 'Form Responses' in the name
  let sheets = spreadsheet.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().includes('Form Responses')) {
      return sheets[i];
    }
  }
  
  // Return the first sheet as fallback
  return sheets[0];
}
