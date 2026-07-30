export function printElement(element, title = '') {
  if (!element) return;
  const win = window.open('', '_blank');
  if (!win) return;
  const headHtml = document.head.innerHTML;
  const bodyHtml = element.outerHTML;
  win.document.open();
  win.document.write(`<!doctype html><html><head>${headHtml}<title>${title}</title></head><body>${bodyHtml}</body></html>`);
  win.document.close();
  // give browser a moment to render styles
  setTimeout(() => {
    win.focus();
    win.print();
    // optionally close after print
    // win.close();
  }, 500);
}

export function downloadCSV(filename, rows = [], headers = []) {
  const esc = (v) => (`"${String(v || '').replace(/"/g, '""')}"`);
  const csvRows = [];
  if (headers && headers.length) csvRows.push(headers.map(esc).join(','));
  for (const row of rows) {
    const values = headers.map((h) => esc(row[h]));
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
