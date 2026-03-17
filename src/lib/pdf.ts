import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Exports the timeline element as a PDF file download.
 *
 * Captures at 1.5× pixel ratio using high-quality JPEG (0.92) — sharp
 * enough to be indistinguishable from lossless at normal zoom, while
 * keeping the file to a reasonable size (typically 3–6 MB).
 *
 * The original quality-0.8 setting caused visible blocking/ringing on
 * text edges; 0.92 eliminates those artefacts in practice.
 */
export const exportToPDF = async (elementId: string, filename: string = 'roadmap.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const scrollableArea = (element.querySelector('.overflow-auto') as HTMLElement) || element;

  const dataUrl = await toJpeg(scrollableArea, {
    quality: 0.92,
    pixelRatio: 1.5,
    backgroundColor: '#ffffff',
    width: scrollableArea.scrollWidth,
    height: scrollableArea.scrollHeight,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
      width: scrollableArea.scrollWidth + 'px',
      height: scrollableArea.scrollHeight + 'px',
      overflow: 'visible',
    },
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a2',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => { img.onload = resolve; });

  let finalWidth = pdfWidth;
  let finalHeight = (img.height * pdfWidth) / img.width;

  if (finalHeight > pdfHeight) {
    finalHeight = pdfHeight;
    finalWidth = (img.width * pdfHeight) / img.height;
  }

  const x = (pdfWidth - finalWidth) / 2;

  pdf.addImage(dataUrl, 'JPEG', x, 0, finalWidth, finalHeight, undefined, 'FAST');
  pdf.save(filename);
};
