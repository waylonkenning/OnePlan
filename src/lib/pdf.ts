import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Exports the timeline element as a PDF file download.
 *
 * Captures at 2× pixel ratio using lossless PNG (no JPEG compression
 * artefacts) then embeds it in an A2-landscape PDF. The file is saved
 * directly to the user's Downloads folder via jsPDF.save().
 */
export const exportToPDF = async (elementId: string, filename: string = 'roadmap.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const scrollableArea = (element.querySelector('.overflow-auto') as HTMLElement) || element;

  const dataUrl = await toPng(scrollableArea, {
    pixelRatio: 2,
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

  // PNG with no compression — lossless, no artefacts
  pdf.addImage(dataUrl, 'PNG', x, 0, finalWidth, finalHeight, undefined, 'NONE');
  pdf.save(filename);
};
