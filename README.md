# Invoice Combination Finder

Full-stack application that calculates every unique combination of invoices which sum to a target amount. The backend is powered by Spring Boot and exposes an API consumed by a React + Tailwind CSS frontend.

## Tech stack

- Java 17, Spring Boot 3.4
- Maven wrapper for build + tests
- React (Vite) with TypeScript and Tailwind CSS

## Getting started

### Prerequisites

- Java 17+
- Node.js 18.18+ (Node 20+ recommended to remove Vite engine warnings)
- npm

### Backend

```bash
cd invoice-combination-finder/backend
./mvnw spring-boot:run
```

The service starts on `http://localhost:8080`.

Run the backend test suite:

```bash
./mvnw test
```

### Frontend

```bash
cd invoice-combination-finder/frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. If the backend runs on a different host/port, create a `.env` file in the `frontend` directory and set:

```
VITE_API_BASE_URL=http://localhost:8080
```

What you can do in the UI:

- Fine-tune the combination search with minimum/maximum invoice counts and required invoice ids.
- Upload `.xlsx` spreadsheets or enter invoices manually.
- Save frequently used scenarios locally and reload them later.
- Export matching combinations as a CSV for further analysis.

Frontend checks:

```bash
npm run lint
npm run build
```

The UI supports both manual entry and Excel uploads:

- **Manual mode** – type invoice ids and amounts in the form and submit to see matching combinations.
- **Excel mode** – upload a `.xlsx` file (first sheet, columns for invoice id and amount) and provide a target. The frontend streams the file to the new upload endpoint and renders the returned combinations.

## API reference

### `POST /api/combinations`

Request body:

```json
{
  "target": 150,
  "minInvoices": 1,
  "maxInvoices": 3,
  "requiredInvoiceIds": ["INV-001"],
  "invoices": [
    { "id": "INV-001", "amount": 70 },
    { "id": "INV-002", "amount": 80 },
    { "id": "INV-003", "amount": 50 },
    { "id": "INV-004", "amount": 100 }
  ]
}
```

Response:

```json
{
  "combinations": [
    ["INV-003", "INV-004"],
    ["INV-001", "INV-002"]
  ],
  "combinationCount": 2,
  "invoiceAmounts": {
    "INV-001": 70,
    "INV-002": 80,
    "INV-003": 50,
    "INV-004": 100
  }
}
```

Each invoice id must be unique and paired with a positive amount. Validation or processing issues return `400` with a message and error details.

### `POST /api/combinations/upload`

Multipart form fields:

- `target` – numeric value greater than zero.
- `file` – `.xlsx` spreadsheet. The first worksheet is parsed and rows should provide invoice id in the first column and amount in the second (a header row is optional).
- Optional `minInvoices`, `maxInvoices`, and repeated `requiredIds` values apply the same filters as the JSON endpoint.

The response structure matches the manual endpoint. Errors (unsupported file type, unreadable sheet, malformed rows, validation issues) return `400` with a descriptive message.

### `POST /api/combinations/export`

Send the same JSON payload used for `POST /api/combinations`; the service responds with a CSV stream listing each combination, its invoices, and the summed amount. The frontend calls this when you click **Export CSV**.
