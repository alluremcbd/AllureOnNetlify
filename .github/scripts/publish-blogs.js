/**
 * publish-blogs.js
 *
 * Reads blogs.json and marks any post as published if its publishDate
 * is today or in the past. The workflow then commits the change,
 * which triggers a Netlify redeploy automatically.
 *
 * blogs.json post format:
 * {
 *   "slug": "my-post",
 *   "title": "...",
 *   "publishDate": "2025-06-01",   <-- YYYY-MM-DD, required for scheduling
 *   "published": false,             <-- set to false to hold back, true to show
 *   ...
 * }
 *
 * If a post has no publishDate, it is treated as already published and left alone.
 * If a post already has "published": true, it is left alone.
 */

const fs   = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../../blogs.json');

const raw  = fs.readFileSync(JSON_PATH, 'utf8');
const data = JSON.parse(raw);

const today = new Date();
today.setHours(0, 0, 0, 0);

let changed = false;

data.posts = data.posts.map(post => {
  // Already published — leave it alone
  if (post.published === true) return post;

  // No publishDate — treat as already live, leave it alone
  if (!post.publishDate) return post;

  const publishOn = new Date(post.publishDate);
  publishOn.setHours(0, 0, 0, 0);

  if (publishOn <= today) {
    console.log(`Publishing: "${post.title}" (scheduled for ${post.publishDate})`);
    post.published = true;
    changed = true;
  } else {
    console.log(`Holding:    "${post.title}" (scheduled for ${post.publishDate})`);
  }

  return post;
});

if (changed) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('\nblogs.json updated and ready to commit.');
} else {
  console.log('\nNo posts due today. blogs.json unchanged.');
}
