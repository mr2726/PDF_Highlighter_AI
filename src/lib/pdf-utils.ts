"use client";

import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Highlight = {
  pageIndex: number;
  rects: Rect[];
};

export async function extractTextFromPdf(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
  let fullText = '';
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
}

// This function finds the coordinates of key phrases in a PDF.
// It simplifies the problem by looking for individual significant words
// from the key points provided by the AI.
export async function findHighlights(file: File, keyPoints: string[]): Promise<Highlight[]> {
  // 1. Create a set of significant words to search for.
  const allWords = keyPoints.join(' ').toLowerCase().split(/\s+/);
  const significantWords = new Set(allWords.filter(w => w.length > 3 && !/^\d+$/.test(w)));

  const fileBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
  const allHighlights: Highlight[] = [];

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const pageRects: Rect[] = [];

    // 2. Iterate through text items on the page.
    textContent.items.forEach(item => {
      // Type guard to ensure item is a TextItem
      if (!('str' in item)) {
        return;
      }
      const textItem = item as TextItem;

      // Check if any word in the text item is significant
      const itemWords = textItem.str.toLowerCase().split(/\s+/);
      for (const word of itemWords) {
        if (significantWords.has(word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,""))) {
          // 3. If a significant word is found, calculate its bounding box.
          const tx = pdfjs.Util.transform(viewport.transform, textItem.transform);
          const fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
          
          const itemWidth = textItem.width;
          const itemHeight = textItem.height;

          // The transform gives the bottom-left corner. We need to adjust for CSS top-left.
          pageRects.push({
            left: tx[4],
            top: tx[5] - itemHeight,
            width: itemWidth,
            height: itemHeight,
          });
          break; // Move to the next text item once a highlight is found in this one.
        }
      }
    });

    if (pageRects.length > 0) {
      allHighlights.push({ pageIndex: i, rects: pageRects });
    }
  }

  return allHighlights;
}


// This function takes a PDF and highlight coordinates and returns a new PDF with highlights drawn on it.
export async function createHighlightedPdf(file: File, highlights: Highlight[]): Promise<Uint8Array> {
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();

  const highlightColor = rgb(0.99, 0.93, 0.45); // A nice yellow color

  for (const highlight of highlights) {
    if (highlight.pageIndex < pages.length) {
      const page = pages[highlight.pageIndex];
      const { height: pageHeight } = page.getSize();

      for (const rect of highlight.rects) {
        page.drawRectangle({
          x: rect.left,
          // pdf-lib's y-coordinate is from the bottom, so we need to convert.
          y: pageHeight - rect.top - rect.height,
          width: rect.width,
          height: rect.height,
          color: highlightColor,
          opacity: 0.3,
        });
      }
    }
  }

  return pdfDoc.save();
}
