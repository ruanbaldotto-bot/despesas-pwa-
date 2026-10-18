export async function readPDF(file) {
  if (file.size != null && file.size > 20 * 1024 * 1024) {
    throw new Error('Arquivo excede 20 MB.');
  }
  const pdfjs = await import('./vendor/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.mjs', import.meta.url).href;
  let cmapUrl = new URL('./vendor/cmaps/', import.meta.url).href;
  let fontUrl = new URL('./vendor/standard_fonts/', import.meta.url).href;
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { fileURLToPath } = await import('node:url');
    cmapUrl = fileURLToPath(new URL(cmapUrl)).replaceAll('\\','/');
    fontUrl = fileURLToPath(new URL(fontUrl)).replaceAll('\\','/');
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    cMapUrl: cmapUrl,
    cMapPacked: true,
    standardFontDataUrl: fontUrl,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 100) throw new Error('PDF excede 100 páginas.');
    const lines = [];
    let characters = 0;
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      let previous = null;
      let line = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        characters += item.str.length;
        if (characters > 2_000_000) throw new Error('Texto do PDF excede o limite de leitura.');
        const y = Math.round(item.transform[5]);
        if (previous !== null && Math.abs(y - previous) > 3) {
          lines.push(line);
          line = '';
        }
        line += item.str + ' ';
        previous = y;
        if (item.hasEOL) {
          lines.push(line);
          line = '';
          previous = null;
        }
      }
      if (line) lines.push(line);
      page.cleanup();
    }
    const text = lines.join('\n');
    if (!text.trim()) throw new Error('PDF sem texto extraível. Use CSV; não há OCR.');
    return text;
  } finally {
    // Also release the worker after password, invalid-document and text-limit failures.
    await task.destroy();
  }
}
