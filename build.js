const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { fetchCSV, getPostImageUrl } = require('./src/scripts/googleSheets');

// Configuration
const CONFIG = {
    sheetId: process.env.GOOGLE_SHEET_ID_BLOG,
    gidPosts: process.env.GID_POSTS,
    gidCategories: process.env.GID_CATEGORIES,
    gidAuthors: process.env.GID_AUTHORS,
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
    const filePath = path.join(CONFIG.templateDir, name);
    if (!fs.existsSync(filePath)) {
        console.warn(`Template not found: ${filePath}`);
        return '';
    }
    return fs.readFileSync(filePath, 'utf8');
}

// Helper: Render Layout
function renderLayout(content, meta = {}) {
    let layout = readTemplate('layout.html');
    layout = layout.replace('{{content}}', content);
    layout = layout.replace('{{meta_title}}', meta.title || 'Enlace Societario');
    layout = layout.replace('{{meta_description}}', meta.description || 'Estudio contable especializado en trámites societarios en Argentina.');
    layout = layout.replace('{{canonical_url}}', meta.canonical || 'https://enlacesocietario.com');
    layout = layout.replace('{{schema_json}}', meta.schema || '');
    layout = layout.replace(/{{current_year}}/g, new Date().getFullYear());
    return layout;
}

// 1. Fetch and process Data
async function fetchBlogData() {
    console.log('Fetching blog data from Google Sheets...');

    try {
        const [postsRaw, categoriesRaw, authorsRaw] = await Promise.all([
            fetchCSV(CONFIG.sheetId, CONFIG.gidPosts),
            fetchCSV(CONFIG.sheetId, CONFIG.gidCategories),
            fetchCSV(CONFIG.sheetId, CONFIG.gidAuthors)
        ]);

        console.log(`Fetched ${postsRaw.length} posts, ${categoriesRaw.length} categories, ${authorsRaw.length} authors.`);

        // Create lookup maps
        const categoriesMap = {};
        categoriesRaw.forEach(cat => {
            categoriesMap[cat.category_slug] = cat.category_name;
        });

        const authorsMap = {};
        authorsRaw.forEach(author => {
            authorsMap[author.author_id] = author;
        });

        // Process posts
        const posts = postsRaw
            .filter(post => post.Status && post.Status.toLowerCase().trim() === 'published')
            .map(post => {
                const categoryName = categoriesMap[post.Category] || post.Category;
                const author = authorsMap[post.Author] || { name: post.Author };

                // SEO Metadata
                const metaTitle = post['Meta Title'] || post.Title;
                let metaDescription = post['Meta Description'];
                if (!metaDescription && post.Content) {
                    // Simple strip tags and truncate
                    metaDescription = post.Content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';
                }

                return {
                    ...post,
                    categoryName,
                    authorName: author.name,
                    authorBio: author.bio || '',
                    authorLinkedin: author.author_linkedin_url || author.linkedin_url || '',
                    imageUrl: getPostImageUrl(post),
                    metaTitle,
                    metaDescription
                };
            })
            // Sort by Date descending
            .sort((a, b) => {
                const dateA = new Date(a.Date);
                const dateB = new Date(b.Date);
                return dateB - dateA;
            });

        return posts;
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return [];
    }
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

    // Static Pages
    const pages = ['index.html', 'nosotros.html', 'servicios.html', 'contacto.html'];
    pages.forEach(page => {
        const template = readTemplate(page);
        if (!template) return;

        const html = renderLayout(template, {
            title: page === 'index.html' ? '' : page.replace('.html', '').charAt(0).toUpperCase() + page.replace('.html', '').slice(1),
            canonical: `https://enlacesocietario.com/${page === 'index.html' ? '' : page.replace('.html', '')}`
        });

        const outputPath = page === 'index.html'
            ? path.join(CONFIG.outputDir, 'index.html')
            : path.join(CONFIG.outputDir, page.replace('.html', ''), 'index.html');

        ensureDir(path.dirname(outputPath));
        fs.writeFileSync(outputPath, html);
        console.log(`Generated: ${outputPath}`);
    });

    // Blog Pages
    const posts = await fetchBlogData();
    let blogListHtml = '';

    posts.forEach(post => {
        // Individual Post Page
        let postTemplate = readTemplate('post.html');
        if (!postTemplate) return;

        // Date formatting
        const dateObj = new Date(post.Date);
        const dateReadable = dateObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        const dateIso = dateObj.toISOString().split('T')[0];

        postTemplate = postTemplate
            .replace(/{{title}}/g, post.Title)
            .replace(/{{category}}/g, post.categoryName)
            .replace(/{{author}}/g, post.authorName)
            .replace(/{{date_readable}}/g, dateReadable)
            .replace(/{{date_iso}}/g, dateIso)
            .replace(/{{post_body}}/g, post.Content)
            .replace(/{{image_url}}/g, post.imageUrl);

        // Add Author Link if exists
        const authorLinkHtml = post.authorLinkedin
            ? `<a href="${post.authorLinkedin}" target="_blank" class="author-link">${post.authorName}</a>`
            : post.authorName;
        postTemplate = postTemplate.replace(/{{author_with_link}}/g, authorLinkHtml);

        const postHtml = renderLayout(postTemplate, {
            title: post.metaTitle,
            description: post.metaDescription,
            canonical: `https://enlacesocietario.com/blog/${post.Slug}`,
            schema: `<script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "${post.Title}",
              "image": "https://enlacesocietario.com${post.imageUrl}",
              "author": {
                "@type": "Person",
                "name": "${post.authorName}"
              },
              "datePublished": "${dateIso}"
            }
            </script>`
        });

        const postPath = path.join(CONFIG.outputDir, 'blog', post.Slug);
        ensureDir(postPath);
        fs.writeFileSync(path.join(postPath, 'index.html'), postHtml);
        console.log(`Generated Post: ${post.Slug}`);

        // Add to list grid
        const excerpt = post.Content.replace(/<[^>]*>/g, '').substring(0, 120).trim() + '...';

        blogListHtml += `
        <article class="card blog-card" style="height: 100%; display: flex; flex-direction: column;">
            <div class="card-image" style="height: 200px; overflow: hidden; border-radius: 8px 8px 0 0;">
                <img src="${post.imageUrl}" alt="${post.Title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="card-content" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
                <div style="margin-bottom: 0.5rem;">
                    <span class="category-tag" style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">${post.categoryName}</span>
                </div>
                <h3 style="margin-bottom: 1rem; font-size: 1.25rem;"><a href="/blog/${post.Slug}" style="text-decoration: none; color: inherit;">${post.Title}</a></h3>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem;">${excerpt}</p>
                <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: #888;">
                    <span>Por ${post.authorName}</span>
                    <time>${dateReadable}</time>
                </div>
            </div>
        </article>`;
    });

    // Render Blog Listing
    let blogListTemplate = readTemplate('blog-list.html');
    if (blogListTemplate) {
        blogListTemplate = blogListTemplate.replace('{{blog_items}}', blogListHtml);
        const blogIndexHtml = renderLayout(blogListTemplate, {
            title: 'Blog de Actualidad Societaria',
            description: 'Todo lo que necesitas saber para crear y gestionar una sociedad en Argentina. Información clara y actualizada.',
            canonical: 'https://enlacesocietario.com/blog'
        });

        ensureDir(path.join(CONFIG.outputDir, 'blog'));
        fs.writeFileSync(path.join(CONFIG.outputDir, 'blog', 'index.html'), blogIndexHtml);
        console.log('Generated: Blog Index');
    }

    console.log('Build completed successfully.');
}

build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
