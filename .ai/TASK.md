# TASK T-001 — Google Workspace Intake Foundation

## Goal

Create the minimal Google Apps Script setup for the project intake foundation: one Google Form linked to one Google Spreadsheet with the required intake fields and operational columns/sheets.

This task stops at the Google Workspace boundary. Do not implement n8n, webhook delivery, OpenAI, Telegram, or processing logic.

## Read

* `.ai/STATE.md`

No other repository files are required unless the existing project structure makes the target path impossible to determine.

## Relevant Decisions

* none

## Required Changes

1. Create `apps-script/Setup.gs`.
2. Implement a single public setup entry point named `setupProject()`.
3. `setupProject()` must create/configure a Google Form with these questions in this order:

   * `Name` — required, short text
   * `Email` — required, short text
   * `Request` — required, paragraph text
   * `Notes` — optional, paragraph text
4. Link the form responses to the project spreadsheet.
5. Ensure the response sheet contains, to the right of the Google Form response columns, these operational columns in this order:

   * `Record ID`
   * `Category`
   * `Priority`
   * `Summary`
   * `Next Action`
   * `Status`
   * `Processed At`
   * `Error`
6. Ensure these additional sheets exist:

   * `Error Log`
   * `Dashboard`
7. The setup must be safe to run again: rerunning it must not create a new Form, a new Spreadsheet, duplicate operational columns, or duplicate `Error Log` / `Dashboard` sheets.
8. Keep configuration values that may reasonably change (form title, sheet names, expected headers) grouped near the top of the file instead of scattering string literals through the implementation.

## Constraints

* Use Google Apps Script / JavaScript only.
* Do not add npm/package-manager dependencies.
* Do not implement webhook calls, n8n integration, OpenAI, Telegram, AI validation, human-review automation, dashboard formulas/charts, or error-routing logic in this task.
* Do not add secrets, tokens, API keys, placeholder credentials, or secret-looking values.
* Do not modify `BOOT.md`, `.ai/TASK.md`, `.ai/DECISIONS.md`, or `.clinerules`.
* Do not invoke paid/external APIs.
* Google Workspace integration verification may be performed only manually by the human operator.

## Acceptance Criteria

* `apps-script/Setup.gs` exists and contains `setupProject()`.
* The code defines the four required Form questions with the exact labels, required/optional state, and text/paragraph types specified above.
* The response spreadsheet is linked as the Form response destination.
* Running `setupProject()` a second time reuses the same Form and Spreadsheet instead of creating new ones.
* The eight operational columns are created in the required order without duplication on a repeated setup run.
* `Error Log` and `Dashboard` sheets are created if missing and are not duplicated on a repeated setup run.
* No n8n, webhook, OpenAI, Telegram, or downstream workflow logic is present.
* No credentials/secrets are present in source code.

## Tests

### Agent verification

Perform the narrowest practical local/static verification of `apps-script/Setup.gs`:

* syntax is valid JavaScript / Apps Script-compatible syntax;
* required labels and operational headers are present;
* no forbidden integrations or credentials are introduced.

Do not claim idempotency is verified by static inspection alone.

### Human integration check

Report these exact manual verification steps at finish:

1. Run `setupProject()` once.
2. Record the created Form ID and Spreadsheet ID.
3. Confirm the Form has `Name`, `Email`, `Request`, `Notes` with the required states/types.
4. Submit one test response and confirm it appears in the response sheet.
5. Confirm the eight operational columns exist to the right of the Form response columns.
6. Confirm `Error Log` and `Dashboard` exist.
7. Run `setupProject()` a second time.
8. Confirm the Form ID and Spreadsheet ID are unchanged.
9. Confirm no duplicate operational columns or sheets were created.

## Finish

When acceptance criteria are satisfied:

1. Overwrite `.ai/STATE.md` according to `.clinerules`.
2. Set `TASK_ID: T-001`.
3. Set `STATUS: DONE` only after the required verification actually passes; otherwise use `BLOCKED`.
4. Record changed files and actual tests performed.
5. Do not claim the human integration check passed unless the human actually performed it.
6. Set `Next` to the single immediate follow-up.
7. Suggest commit: `[T-001] Add Google Workspace intake foundation`.
8. STOP.
