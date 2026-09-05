/**
 * Client-side document parser for PDF and DOCX files.
 * Runs 100% locally in browser memory - zero server uploads.
 */

export async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist for client-side execution
    const pdfjsLib = await import('pdfjs-dist');

    // Configure local worker to avoid external CDN requests
    if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageLines: string[] = [];
      let currentLine = '';

      for (const item of textContent.items as Array<{ str?: string; hasEOL?: boolean }>) {
        if (!item.str) continue;
        currentLine += item.str;
        if (item.hasEOL) {
          pageLines.push(currentLine.trimEnd());
          currentLine = '';
        } else if (!item.str.endsWith(' ')) {
          currentLine += ' ';
        }
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trimEnd());
      }

      const pageCombined = pageLines.join('\n').trim();
      if (pageCombined) {
        pageTexts.push(`--- Page ${pageNum} ---\n${pageCombined}`);
      }
    }

    const fullText = pageTexts.join('\n\n').trim();

    if (!fullText) {
      throw new Error(
        'No extractable text found in this PDF. If this document consists of scanned images, an OCR layer is required.'
      );
    }

    return fullText;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('PasswordException')) {
        throw new Error('This PDF is password protected. Please unlock it before uploading.');
      }
      throw err;
    }
    throw new Error('Failed to parse PDF document.');
  }
}

export async function parseDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();

    if (!text) {
      throw new Error('The DOCX file appears to be empty or contains no readable text.');
    }

    return text;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to read DOCX document. Please ensure it is a valid Word file.');
  }
}
