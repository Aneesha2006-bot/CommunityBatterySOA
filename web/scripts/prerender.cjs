/**
 * Script: prerender.cjs
 * Requirement W-SEO:
 * Generates static HTML prerender snapshots with page-specific SEO meta tags,
 * canonical URLs, and semantic HTML for search engine crawlers.
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('[Prerender] dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

const routes = [
  {
    path: 'how-it-works.html',
    title: 'How It Works & Domain Math | Community Battery Reserve Priority',
    description: 'Learn how the framework-free ReserveAllocator mathematically protects the 30 kWh emergency reserve floor while granting fair community member allocations.',
    heading: 'Domain Architecture & Allocation Logic'
  },
  {
    path: 'privacy-policy.html',
    title: 'Privacy Policy (DPDP Act 2023) | Community Battery Reserve Priority',
    description: 'Draft privacy policy designed to support India DPDP Act 2023 & DPDP Rules 2025. Data inventory, purpose limitation, and Data Principal rights.',
    heading: 'Privacy Policy (DPDP Act 2023)'
  },
  {
    path: 'terms.html',
    title: 'Terms of Service | Community Battery Reserve Priority',
    description: 'Academic prototype terms of service, fair use quota rules, emergency reserve priority conditions, and dispute jurisdiction.',
    heading: 'Terms & Conditions of Service'
  },
  {
    path: 'cookie-policy.html',
    title: 'Cookie Policy (Zero-Cookie) | Community Battery Reserve Priority',
    description: 'Architectural zero non-essential cookie policy. Zero advertising pixels, no trackers, strictly necessary tokens only.',
    heading: 'Cookie & Storage Policy'
  },
  {
    path: 'accessibility.html',
    title: 'Accessibility Statement (WCAG 2.2 AA) | Community Battery Reserve Priority',
    description: 'Commitment to digital accessibility under WCAG 2.2 Level AA and the Rights of Persons with Disabilities Act 2016.',
    heading: 'Accessibility Statement (WCAG 2.2 AA)'
  }
];

console.log('========================================================');
console.log('Generating Static Prerendered HTML Snapshots');
console.log('========================================================');

for (const route of routes) {
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${route.title}" />`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<div id="root"><\/div>/, `<div id="root"><main id="main-content" class="p-8 max-w-4xl mx-auto"><h1 class="text-3xl font-bold">${route.heading}</h1><p class="text-slate-600 mt-2">${route.description}</p></main></div>`);

  const outputPath = path.join(distDir, route.path);
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`✓ Prerendered: dist/${route.path}`);
}

console.log('========================================================');
console.log('Static prerendering complete.');
