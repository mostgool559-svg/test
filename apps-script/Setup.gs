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
    // Get or create the Google Form
    let form = getOrCreateForm();
    
    // Add the required form questions (only if not already present)
    addFormQuestionsIfMissing(form);
    
    // Get or create the spreadsheet to link responses to
    let spreadsheet = getOrCreateSpreadsheet();
    
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
 * Gets existing form from PropertiesService or creates a new one
 * @returns {Form} The Google Form
 */
function getOrCreateForm() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('FORM_ID');
  
  if (formId) {
    try {
      // Try to open the existing form
      const form = FormApp.openById(formId);
      return form;
    } catch (error) {
      // If form doesn't exist, clear the property and create new
      properties.deleteProperty('FORM_ID');
      Logger.log('Existing form not found, creating new form');
    }
  }
  
  // Create new form
  const form = FormApp.create(CONFIG.FORM_TITLE);
  properties.setProperty('FORM_ID', form.getId());
  return form;
}

/**
 * Gets existing spreadsheet from PropertiesService or creates a new one
 * @returns {Spreadsheet} The Google Spreadsheet
 */
function getOrCreateSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  
  if (spreadsheetId) {
    try {
      // Try to open the existing spreadsheet
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      return spreadsheet;
    } catch (error) {
      // If spreadsheet doesn't exist, clear the property and create new
      properties.deleteProperty('SPREADSHEET_ID');
      Logger.log('Existing spreadsheet not found, creating new spreadsheet');
    }
  }
  
  // Create new spreadsheet
  const spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  properties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  return spreadsheet;
}

/**
 * Adds form questions only if they are not already present
 * @param {Form} form - The Google Form to add questions to
 */
function addFormQuestionsIfMissing(form) {
  const items = form.getItems();
  const itemTitles = items.map(item => item.getTitle());
  
  // Check if all required questions are already present
  const requiredQuestions = ['Name', 'Email', 'Request', 'Notes'];
  const missingQuestions = requiredQuestions.filter(title => !itemTitles.includes(title));
  
  if (missingQuestions.length > 0) {
    // Add only the missing questions
    missingQuestions.forEach(title => {
      if (title === 'Name' || title === 'Email') {
        form.addTextItem()
            .setTitle(title)
            .setRequired(title === 'Name' || title === 'Email');
      } else if (title === 'Request') {
        form.addParagraphTextItem()
            .setTitle(title)
            .setRequired(true);
      } else if (title === 'Notes') {
        form.addParagraphTextItem()
            .setTitle(title)
            .setRequired(false);
      }
    });
  } else {
    Logger.log('All form questions already exist');
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
