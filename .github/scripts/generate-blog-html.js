/**
 * generate-blog-html.js
 *
 * Reads blogs.json and rewrites the post list section of blog.html
 * with statically rendered <a> tags so Google can crawl all article links
 * without running JavaScript.
 *
 * Triggered automatically by the publish-blogs workflow after publish-blogs.js runs.
 * Can also be run manually: node .github/scripts/generate-blog-html.js
 *
 * The script looks for these two markers in blog.html and replaces everything between them:
 *   <!-- POSTS:START -->
 *   <!-- POSTS:END -->
 */

const fs   = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../../blogs.json');
const HTML_PATH = path.join(__dirname, '../../blog.html');

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const html = fs.readFileSync(HTML_PATH, 'utf8');

const published = data.posts.filter(post => post.published !== false);

if (published.length === 0) {
  console.log('No published posts found. blog.html unchanged.');
  process.exit(0);
}

function buildPostHTML(post) {
  const thumb = post.image
    ? `<img src="${post.image}" alt="${post.title}" loading="lazy">`
    : '';
  return `
    <a href="/blog/${post.slug}.html" class="post-item">
      <div class="post-thumb">${thumb}</div>
      <div class="post-info">
        <span class="post-tag">${post.tag}</span>
        <div class="post-title">${post.title}</div>
        <p class="post-excerpt">${post.excerpt}</p>
        <span class="post-date">${post.date}</span>
      </div>
      <span class="post-arrow">&#8594;</span>
    </a>`;
}

const postsHTML = published.map(buildPostHTML).join('\n');

const START_MARKER = '<!-- POSTS:START -->';
const END_MARKER   = '<!-- POSTS:END -->';

if (!html.includes(START_MARKER) || !html.includes(END_MARKER)) {
  console.error('ERROR: Could not find POSTS:START / POSTS:END markers in blog.html.');
  console.error('Add these comments around the post list div in blog.html and re-run.');
  process.exit(1);
}

const before = html.split(START_MARKER)[0];
const after  = html.split(END_MARKER)[1];
const updated = before + START_MARKER + '\n' + postsHTML + '\n  ' + END_MARKER + after;

fs.writeFileSync(HTML_PATH, updated, 'utf8');
console.log(`blog.html updated with ${published.length} post(s).`);
published.forEach(p => console.log(`  - ${p.title}`));
