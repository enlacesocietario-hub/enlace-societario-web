// Use global fetch (available in Node.js 18+)
const { parse } = require('csv-parse/sync');

/**
 * Fetches CSV data from a Google Sheet tab and parses it.
 * @param {string} sheetId 
 * @param {string} gid 
 * @returns {Promise<Array<Object>>}
 */
async function fetchCSV(sheetId, gid) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    console.log(`Fetching CSV from ${url}...`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const csvText = await response.text();

        return parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
    } catch (error) {
        console.error(`Error fetching/parsing CSV (GID: ${gid}):`, error);
        return [];
    }
}

/**
 * Helper to get post image URL with fallback.
 * @param {Object} post 
 * @returns {string}
 */
function getPostImageUrl(post) {
    if (post.Imagen && post.Imagen.trim() !== '') {
        return `/blog/${post.Imagen}`;
    }
    return '/blog/default-post.jpg';
}

module.exports = {
    fetchCSV,
    getPostImageUrl
};
