import { Platform } from 'react-native';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

// Escape HTML special chars
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderList(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul class="list">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function renderThemes(themes = []) {
  if (!Array.isArray(themes) || themes.length === 0) return '';
  return `
    <section class="section">
      <h2>Themes</h2>
      ${themes.map(t => `
        <div class="block">
          <span class="b">${escapeHtml(t?.name ?? '')}</span>: ${escapeHtml(t?.explanation ?? '')}
        </div>
      `).join('')}
    </section>
  `;
}

function renderProjectIdeas(ideas = []) {
  if (!Array.isArray(ideas) || ideas.length === 0) return '';
  return `
    <section class="section">
      <h2>Project Ideas</h2>
      ${ideas.map(p => `
        <div class="card">
          <div class="b">${escapeHtml(p?.name ?? '')}</div>
          <div><span class="b">Goal:</span> ${escapeHtml(p?.goal ?? '')}</div>
          <div><span class="b">Impact:</span> ${escapeHtml(p?.potentialImpact ?? '')}</div>
          ${Array.isArray(p?.nextSteps) && p.nextSteps.length
            ? `<div class="mt4"><span class="b">Next Steps</span>${renderList(p.nextSteps)}</div>`
            : ''
          }
        </div>
      `).join('')}
    </section>
  `;
}

function renderVisualTable(vt) {
  const cols = vt?.columns || [];
  const rows = vt?.rows || [];
  if (!Array.isArray(cols) || cols.length === 0) return '';
  return `
    <section class="section">
      <h2>Overview Table</h2>
      <table class="grid">
        <thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(r => `<tr>${cols.map((_, i) => `<td>${escapeHtml(r?.[i] ?? '')}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function renderResearchQuestions(rqs = []) {
  if (!Array.isArray(rqs) || rqs.length === 0) return '';
  return `
    <section class="section">
      <h2>Possible Research Questions</h2>
      ${renderList(rqs)}
    </section>
  `;
}

// Updated: reference item includes "Source Link: <a ...>"
function renderReferences(refs = []) {
  if (!Array.isArray(refs) || refs.length === 0) return '';
  return `
    <section class="section">
      <h2>References</h2>
      <ul class="refs">
        ${refs.map(r => {
          const type = r?.type ? `[${escapeHtml(r.type)}] ` : '';
          const source = escapeHtml(r?.source ?? '(untitled source)');
          const url = r?.url?.trim?.();
          const linkPart = url
            ? `<div class="src">Source Link: <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></div>`
            : '';
          return `<li>${type}${source}${linkPart}</li>`;
        }).join('')}
      </ul>
      <div class="hint">Note: Links require internet access to open.</div>
    </section>
  `;
}

function renderRisks(risks = []) {
  if (!Array.isArray(risks) || risks.length === 0) return '';
  return `
    <section class="section">
      <h2>Risks</h2>
      ${renderList(risks)}
    </section>
  `;
}

// Footer: last page with share link
function renderFooter(shareUrl) {
  if (!shareUrl) return '';
  const safeUrl = escapeHtml(shareUrl);
  return `
    <section class="footer-last-page">
      <div class="last-page-wrapper">
        <div class="footer-card">
          <div class="b">Share Link</div>
          <div><a href="${safeUrl}" target="_blank" rel="noreferrer">${safeUrl}</a></div>
        </div>
      </div>
    </section>
  `;
}

function resolveLogoUrl(metaLogoUrl) {
  let src = metaLogoUrl || '/src/assets/images/capstacklogo-black.png';
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // If it's a root-relative path, prefix origin so it loads in the blob tab
    if (src.startsWith('/')) {
      src = `${window.location.origin}${src}`;
    }
  }
  // For native, expo-print needs remote https or data URI; local packager paths may not load.
  // Prefer passing a https URL for meta.logoUrl if using native export.
  return src;
}

function buildHtml({ data, meta, autoPrint = false }) {
  const title = escapeHtml(data?.title ?? 'Untitled');
  const summary = escapeHtml(data?.summary ?? '');
  const themes = renderThemes(data?.themes);
  const ideas = renderProjectIdeas(data?.projectIdeas);
  const table = renderVisualTable(data?.visualTable);
  const rqs = renderResearchQuestions(data?.researchQuestions);
  const refs = renderReferences(data?.references);
  const risks = renderRisks(data?.risks);

  // Header elements
  const logoUrl = resolveLogoUrl(meta?.logoUrl);

  // Footer
  const footer = renderFooter(meta?.shareUrl);

  const autoPrintScript = autoPrint
    ? `<script>
         document.addEventListener('DOMContentLoaded', function () {
           setTimeout(function(){ try { window.print(); } catch(e) {} }, 80);
         });
       </script>`
    : '';

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; }
        @page { margin: 16mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; }
        header { text-align: center; margin: 16px 0 8px; }
        .logo { height: 36px; display: inline-block; margin-bottom: 8px; }
        h1 { font-size: 22px; margin: 4px 0 8px; }
        h2 { font-size: 18px; margin: 20px 0 8px; }
        .meta { color: #777; font-size: 12px; margin-bottom: 12px; }
        .b { font-weight: 600; }
        .mt4 { margin-top: 4px; }
        .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
        .block { margin-bottom: 6px; }
        .list { margin: 4px 0 8px 20px; }
        table.grid { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.grid th, table.grid td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
        table.grid th { background: #f5f5f5; }
        ul.refs { margin: 4px 0 8px 20px; }
        ul.refs li { margin-bottom: 6px; }
        .refs .src { font-size: 11px; color: #333; margin-top: 2px; }
        a { color: #1a73e8; text-decoration: underline; }
        .hint { color: #666; font-size: 10px; margin-top: 4px; }
        .section { page-break-inside: avoid; }
        .footer-last { page-break-before: always; }
        .footer-card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin: 12px 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
      ${autoPrintScript}
    </head>
    <body>
      <header class="section">
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="CapStack Logo" />` : ''}
        <h1>${title}</h1>
        
        ${summary ? `<div class="card">${summary}</div>` : ''}
      </header>
      <main>
        ${themes}
        ${ideas}
        ${table}
        ${rqs}
        ${refs}
        ${risks}
      </main>
      ${footer}
    </body>
  </html>
  `;
}

/**
 * Export ONLY the latest structured result.
 * - Native (iOS/Android): generate a PDF file (expo-print) and open share sheet.
 * - Web: open a Blob URL with ONLY the response HTML, auto-print in that new tab.
 */
export async function exportStructuredToPdf({ structured, fileName, meta } = {}) {
  if (!structured || typeof structured !== 'object') {
    throw new Error('No structured data to export.');
  }

  const safeNamePart =
    (fileName || structured.title || 'CapStack_AI').replace(/[^\w\-]+/g, '_').slice(0, 50);

  if (Platform.OS === 'web') {
    // Build a self-printing HTML document
    const html = buildHtml({
      data: structured,
      meta: {
        
        logoUrl: meta?.logoUrl,
        shareUrl: meta?.shareUrl
      },
      autoPrint: true
    });

    // Use a Blob URL rather than about:blank so the tab has a proper URL and content immediately
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');

    if (!win) {
      URL.revokeObjectURL(url);
      throw new Error('Popup blocked. Please allow popups for this site to export.');
    }

    // Revoke the object URL after the tab has had time to load
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return { uri: url, name: `${safeNamePart}.pdf` };
  }

  // Native: generate and share a real PDF
  const html = buildHtml({
    data: structured,
    meta: {
      // subtitle removed
      logoUrl: meta?.logoUrl,
      shareUrl: meta?.shareUrl
    }
  });

  const { uri } = await printToFileAsync({ html });
  await shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share PDF',
    UTI: 'com.adobe.pdf'
  });
  return { uri, name: `${safeNamePart}.pdf` };
}