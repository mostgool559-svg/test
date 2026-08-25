# BOOT — PROJECT CONSTITUTION

Protocol: UAPK-CURATOR-v2.1

> OWNER: HUMAN / CURATOR
> Stable project context for project recovery and onboarding.
> Coding agents do not read this automatically unless TASK explicitly requires it.

## Project
- Name: AI Lead Intake & Review Automation
- Repository: TBD
- Client/Owner: Internal portfolio project

## Goal
Build one complete business-automation portfolio project that demonstrates a realistic multi-step workflow across Google Workspace, Google Apps Script, n8n, an LLM API, and Telegram.

A user submits a request through Google Form. The response is stored in Google Sheets, Google Apps Script forwards the event to an n8n webhook, n8n validates the input, calls OpenAI for structured classification, validates the AI response, writes results back to Google Sheets, and notifies a human reviewer in Telegram. The reviewer makes the final decision in Google Sheets, while failures are recorded separately.

The project is intended to demonstrate practical skills commonly required in automation work: Google Forms, Google Sheets, Apps Script, webhooks, REST APIs, structured LLM output, n8n branching, human-in-the-loop review, notifications, and error handling.

## Acceptance Criteria
- [ ] A user can submit a request through a Google Form containing at least `Name`, `Email`, `Request`, and optional `Notes`.
- [ ] The form response is stored in the project Google Sheet.
- [ ] Google Apps Script reacts to the new submission and sends the required record data to an n8n webhook.
- [ ] n8n validates required input before calling OpenAI.
- [ ] Invalid input is not sent to OpenAI and is recorded as an error.
- [ ] A valid request is sent from n8n to the OpenAI API.
- [ ] A successful AI response is a JSON object containing `category`, `priority`, `summary`, and `next_action`, and every value is a non-empty string. Any response that does not satisfy this schema is treated as a processing error.
- [ ] Valid structured AI results are written back to the corresponding record in Google Sheets.
- [ ] Successfully processed records receive status `Needs Review`.
- [ ] A Telegram notification is sent when a record reaches `Needs Review`, containing enough information to identify the record without exposing secrets.
- [ ] A human reviewer can set the record status in Google Sheets to `Approved` or `Rejected`.
- [ ] If Apps Script cannot deliver the webhook to n8n, including a network failure or non-success HTTP response, Apps Script records the failure in the `Error Log` sheet and the record is not marked as successfully processed.
- [ ] After n8n has received the webhook, validation, OpenAI, AI-response parsing/validation, Google Sheets update, and Telegram notification failures are routed by n8n to the `Error Log` sheet when it is reachable. If the `Error Log` sheet itself cannot be written, the n8n execution must remain failed and observable in n8n execution history.
- [ ] The `Dashboard` sheet shows processed-record counts grouped by `Status`.
- [ ] OpenAI, Telegram, and webhook credentials/secrets are not hardcoded into source code or stored in normal spreadsheet cells.
- [ ] The complete workflow can be demonstrated end-to-end using a real Google account, n8n instance, OpenAI API, and Telegram bot with test data.

## Stack
- Language/Runtime:
  - Google Apps Script / JavaScript
  - n8n workflow runtime
- Framework / Automation:
  - Google Apps Script
  - n8n
- Package manager: None required for MVP
- Tests:
  - targeted local/unit-style checks where practical;
  - manual integration verification for Google Form, Apps Script, n8n, OpenAI, Google Sheets, and Telegram;
  - controlled failure-path verification.
- Storage: Google Sheets
- External services:
  - Google Forms
  - Google Sheets
  - Google Apps Script
  - n8n
  - OpenAI API
  - Telegram Bot API
- Deployment:
  - Google Apps Script attached to the project Google Sheet/Form workflow;
  - n8n instance with imported project workflow(s).

## Architecture

```text
Google Form
    ↓
Google Sheet (Responses)
    ↓
Google Apps Script (on form submit)
    ├── webhook delivery/network/non-2xx failure ──→ Error Log (Apps Script)
    ↓ success
HTTP POST / Webhook
    ↓
n8n
    ↓
Validate input
    ├── invalid ───────────────→ Error Log
    ↓ valid
OpenAI API
    ↓
Structured JSON
    ↓
Validate AI response
    ├── invalid/error ─────────→ Error Log
    ↓ valid
Google Sheets update
    ↓
Status: Needs Review
    ↓
Telegram notification
    ↓
Human Review in Google Sheet
    ↓
Approved / Rejected

Processed data
    ↓
Dashboard sheet

n8n validation / OpenAI / parsing / Sheets / Telegram failures
    ↓
Error handling path
    ├── Error Log reachable ──→ Error Log sheet
    └── Error Log unreachable → failed n8n execution remains observable
```

Expected form/input fields:

```text
Name
Email
Request
Notes
```

Expected AI output fields:

```text
Category
Priority
Summary
Next Action
```

Workflow/status fields may include:

```text
Record ID
Status
Processed At
Error
```

Expected MVP status values:

```text
New
Needs Review
Approved
Rejected
Error
```

Exact column layout and internal node names may be refined during implementation without changing the business-level workflow.

## Invariants

These rules must not be silently changed by a coding task.

1. The project is one end-to-end portfolio workflow, but it must be implemented through separate atomic coding tasks rather than one large task.
2. Google Forms is the primary intake interface for the completed MVP, and Google Sheets is the primary operational data store and human-review interface.
3. Google Apps Script is used as a real integration component between Google Workspace events and the external workflow; it must not be removed merely because n8n could perform more of the workflow itself.
4. n8n is the primary workflow orchestrator for validation, API calls, branching, downstream updates, notifications, and error routing.
5. AI output used as a successful processing result must be a JSON object containing `category`, `priority`, `summary`, and `next_action`, with every value being a non-empty string. Any response that fails this validation must be treated as an error.
6. A failed webhook, API call, or invalid AI response must not mark a record as successfully processed.
7. Human review remains a distinct step after AI processing; AI processing does not automatically approve or reject a request.
8. External API credentials and webhook secrets must never be hardcoded into source code or stored in normal spreadsheet cells.
9. Error ownership is split at the webhook boundary: Apps Script must log webhook delivery/network/non-success HTTP failures before n8n receives the request; n8n must route failures that occur after webhook receipt to the project `Error Log` when it is reachable. If the `Error Log` itself is unreachable, the n8n execution must remain failed and observable rather than silently succeeding.
10. The project must remain small enough to understand, demonstrate, and adapt for future client work. Production-scale infrastructure is not part of the MVP.
11. New integrations or features must not be added to a coding TASK merely because they are convenient to implement at the same time.

If a task conflicts with an invariant:
STOP and report to the curator.

## Security / Compliance
- No secrets, tokens, passwords, cookies, or private keys in repository AI files.
- OpenAI and Telegram credentials must be stored using the appropriate secret/credential storage of n8n or another curator-approved secret-safe mechanism.
- Any Apps Script-side secret or webhook authentication value must be stored with `PropertiesService` or another curator-approved secret-safe mechanism.
- Secrets must not be written to Google Sheets, normal logs, Telegram messages, or test fixtures.
- Test/demo data must not require real sensitive customer information.
- Telegram notifications must contain only the minimum information needed for review/identification.
- External API and integration failures must be handled without exposing credentials or secret configuration.
- Real external/integration verification must only be run when the relevant TASK explicitly permits it.

## Out of Scope
The following are not part of the first completed MVP:

- Sending production emails to clients.
- Automatic AI-generated email sending.
- Make workflows.
- Zapier workflows.
- Claude or multiple interchangeable LLM providers.
- Separate custom backend/API server.
- Database outside Google Sheets.
- Custom frontend application.
- Authentication system beyond the normal Google/n8n/Telegram environments used by the project.
- Multi-user role/permission system.
- Production-scale queueing, concurrency infrastructure, Redis, Docker orchestration, or distributed processing.
- CRM integrations.
- Advanced BI/analytics beyond the required status-count dashboard.
- Scraping.
- RAG, autonomous agents, or other large AI subsystems.

Make and Zapier are intentionally not duplicated inside this MVP. The n8n workflow demonstrates transferable workflow-automation concepts, but the project must not be represented as hands-on Make/Zapier experience unless separate implementations are actually built later.

## Definition of Done
A project-level change is accepted when:
- requested behavior is implemented;
- required targeted tests pass;
- required full tests pass;
- repository evidence and STATE agree.

For the MVP as a whole, completion additionally requires:
- a test request can be submitted through the real Google Form;
- the response appears in the project Google Sheet;
- Apps Script successfully forwards the submission to the real n8n webhook;
- n8n validates the request and calls OpenAI for valid input;
- valid structured AI results are written to the correct Sheet record;
- the record reaches `Needs Review`;
- a Telegram review notification is received;
- a human can set the final Sheet status to `Approved` or `Rejected`;
- at least one controlled Apps Script webhook-delivery failure is confirmed to appear in `Error Log`;
- at least one controlled n8n-side failure after webhook receipt is confirmed to appear in `Error Log`;
- the Dashboard displays processed-record counts grouped by `Status`;
- no API key, bot token, webhook secret, or other credential is present in source code, normal spreadsheet cells, or repository AI files;
- the n8n workflow can be exported as a reusable workflow artifact without embedded secrets.

## Source-of-Truth Model

Repository:
- Git HEAD = last committed baseline.
- Working tree = current uncommitted candidate state.

Behavior:
- Verified tests apply only to the exact code snapshot on which they ran.

Handoff:
- `.ai/STATE.md` is an operational summary and cannot override repository/test evidence.

Chat:
- non-canonical.
