const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const CONFIG = {
    sheetId: process.env.GOOGLE_SHEET_ID_BLOG,
    apiKey: process.env.GOOGLE_API_KEY, // Or Service Account logic
    outputDir: path.join(__dirname, 'dist'),
    templateDir: path.join(__dirname, 'src/templates'),
    contentDir: path.join(__dirname, 'src/content'),
    stylesDir: path.join(__dirname, 'src/styles'),
    publicDir: path.join(__dirname, 'public')
};

// Helper: Ensure directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Helper: Copy Directory Recursive
function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Helper: Read Template
function readTemplate(name) {
    return fs.readFileSync(path.join(CONFIG.templateDir, name), 'utf8');
}

// Helper: Render Layout
function renderLayout(content, meta = {}) {
    let layout = readTemplate('layout.html');
    layout = layout.replace('{{content}}', content);
    layout = layout.replace('{{meta_title}}', meta.title || 'Enlace Societario');
    layout = layout.replace('{{meta_description}}', meta.description || '');
    layout = layout.replace('{{canonical_url}}', meta.canonical || 'https://enlacesocietario.com');
    layout = layout.replace('{{schema_json}}', meta.schema || '');
    layout = layout.replace('{{current_year}}', new Date().getFullYear());
    return layout;
}

// 1. Fetch Data (Mock for V1, User needs to implement Sheets API fetch)
async function fetchBlogData() {
    console.log('Fetching blog data...');
    // TODO: Replace with actual Google Sheets API call
    // Return sample data structure
    return [
        {
            title: 'Cómo constituir una SAS en 2026',
            slug: 'como-constituir-sas-2026',
            content: '<p>Guía completa para constituir una SAS...</p>',
            category: 'Trámites',
            author: 'Dr. Santiago',
            date: '2026-02-13',
            status: 'Published'
        }
    ];
}

// 2. Build Pages
async function build() {
    console.log('Starting build...');

    // Clean/Ensure Output Dir
    if (fs.existsSync(CONFIG.outputDir)) {
        fs.rmSync(CONFIG.outputDir, { recursive: true, force: true });
    }
    ensureDir(CONFIG.outputDir);
    ensureDir(path.join(CONFIG.outputDir, 'blog'));

    // Copy Assets
    console.log('Copying assets...');
    if (fs.existsSync(CONFIG.stylesDir)) {
        copyDir(CONFIG.stylesDir, path.join(CONFIG.outputDir, 'styles'));
    }
    if (fs.existsSync(CONFIG.publicDir)) {
        copyDir(CONFIG.publicDir, CONFIG.outputDir);
    }

    const sitemapUrls = []; const pages = ['index.html', 'nosotros.html', 'servicios.html', 'contacto.html'];
    pages.forEach(page => {
        const template = readTemplate(page);
        const html = renderLayout(template, {
            title: page.replace('.html', '').toUpperCase(), // Simple capitalization
            canonical: `https://enlacesocietario.com/${page === 'index.html' ? '' : page.replace('.html', '')}`
        });

        const outputPath = page === 'index.html'
            ? path.join(CONFIG.outputDir, 'index.html')
            : path.join(CONFIG.outputDir, page.replace('.html', ''), 'index.html');

        if (page !== 'index.html') ensureDir(path.dirname(outputPath));

        fs.writeFileSync(outputPath, html);
        console.log(`Generated: ${outputPath}`);
    });

    // Blog Pages
    const posts = await fetchBlogData();
    let blogListHtml = '';

    posts.forEach(post => {
        if (post.status !== 'Published') return;

        // Render Post
        let postTemplate = readTemplate('post.html');
        postTemplate = postTemplate.replace('{{title}}', post.title)
            .replace('{{category}}', post.category)
            .replace('{{author}}', post.author)
            .replace('{{date_readable}}', post.date)
            .replace('{{date_iso}}', post.date)
            .replace('{{post_body}}', post.content);

        const postHtml = renderLayout(postTemplate, {
            title: post.title,
            canonical: `https://enlacesocietario.com/blog/${post.slug}`,
            schema: `<script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "${post.title}",
              "author": {
                "@type": "Person",
                "name": "${post.author}"
              },
              "datePublished": "${post.date}"
            }
            </script>`
        });

        const postPath = path.join(CONFIG.outputDir, 'blog', post.slug);
        ensureDir(postPath);
        fs.writeFileSync(path.join(postPath, 'index.html'), postHtml);
        console.log(`Generated Post: ${post.slug}`);

        // Add to list
        blogListHtml += `<article class="card" style="height: 100%; display: flex; flex-direction: column;">
            <div style="margin-bottom: 1rem;">
                <span class="uppercase text-accent" style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;">${post.category}</span>
            </div>
            <h3 style="margin-bottom: 1rem;"><a href="/blog/${post.slug}" style="text-decoration: none;">${post.title}</a></h3>
            <div style="margin-top: auto;">
                <a href="/blog/${post.slug}" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Leer más</a>
            </div>
        </article>`;
    });

    // Render Blog Listing
    let blogListTemplate = readTemplate('blog-list.html');
    blogListTemplate = blogListTemplate.replace('{{blog_items}}', blogListHtml);
    const blogIndexHtml = renderLayout(blogListTemplate, {
        title: 'Blog',
        canonical: 'https://enlacesocietario.com/blog'
    });

    // Ensure /blog directory exists (it likely does from loop)
    ensureDir(path.join(CONFIG.outputDir, 'blog'));
    // Write /blog/index.html
    fs.writeFileSync(path.join(CONFIG.outputDir, 'blog', 'index.html'), blogIndexHtml);
    console.log('Generated: Blog Index');

    // Generate Sitemap
    // TODO: Implement Sitemap generation logic
}

build().catch(console.error);
