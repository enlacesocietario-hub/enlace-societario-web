# How to Run and Build Locally

This guide explains how to set up, build, and deploy the **Enlace Societario** website on your local Windows machine.

## Prerequisites

1.  **Node.js**: Download and install from [nodejs.org](https://nodejs.org/en) (LTS version).
2.  **Google Sheet**: A Google Sheet with your blog content.
    - Headers must be: `Title`, `Slug`, `Content`, `Category`, `Author`, `Date`, `Status`.
    - `Status` must be `Published` for posts to appear.
    - **Important**: The Sheet must be shared as "Anyone with the link can view".

## Installation

1.  Open PowerShell or Command Prompt.
2.  Navigate to the project folder:
    ```powershell
    cd "path/to/enlace societario"
    ```
3.  Install dependencies:
    ```powershell
    npm install
    ```

## Configuration

1.  Open the `.env` file (rename `.env.example` to `.env` if needed)
2.  Set `GOOGLE_SHEET_ID_BLOG` to your Google Sheet ID (the long string in the URL).
    - Example URL: `docs.google.com/spreadsheets/d/1aB2c3.../edit` -> ID is `1aB2c3...`

## Building the Site

To generate the static HTML files:

```powershell
npm run build
```

The output will be in the `/dist` folder.

## Previewing Locally

There is no built-in server in the script to keep it simple, but you can use `npx serve`:

```powershell
npx serve dist
```

Start the preview and open `http://localhost:3000`.

## Deployment

Simply copy the contents of the `/dist` folder to your web hosting public directory (e.g., public_html) via FTP or drag-and-drop.
