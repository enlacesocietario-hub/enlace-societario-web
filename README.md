# Enlace Societario - Rebuild

Institutional website for Enlace Societario, rebuilt with performance and conversion in mind.

## Technology Stack
- **Core**: HTML, Vanilla CSS, JavaScript.
- **CMS**: Google Sheets (Headless).
- **Build System**: Node.js scripts for fetching content and generating static pages.

## Setup

1.  Clone the repository.
2.  Run `npm install`.
3.  Copy `.env.example` to `.env` and fill in your Google Service Account credentials.

## Development

- `npm run dev`: Start local server (TODO).
- `npm run build`: Fetch content and generate static site.

## Directory Structure

- `/public`: Static assets.
- `/src`: Source code.
  - `/scripts`: Build and runtime scripts.
  - `/styles`: CSS.
- `/content`: Generated content (Do not edit manually).
