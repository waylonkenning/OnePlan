import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'roadmap.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // To capture the full roadmap, we need to ensure we're getting the scrollable content
    // We'll target the scrollable area specifically if it exists, or the whole element
    const scrollableArea = element.querySelector('.overflow-auto') as HTMLElement || element;
    
    const dataUrl = await toPng(scrollableArea, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      // We use the scrollWidth of the element to capture the full horizontal roadmap
      width: scrollableArea.scrollWidth,
      height: scrollableArea.scrollHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: scrollableArea.scrollWidth + 'px',
        height: scrollableArea.scrollHeight + 'px',
        overflow: 'visible',
      },
      filter: (node) => {
        const tagName = (node as HTMLElement).tagName;
        return tagName !== 'LINK' && tagName !== 'STYLE';
      }
    });

    // Calculate PDF dimensions
    // Using A2 landscape for even more space for the wide roadmap
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a2' 
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Load image to get dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const imgWidth = pdfWidth;
    const imgHeight = (img.height * pdfWidth) / img.width;

    let finalWidth = imgWidth;
    let finalHeight = imgHeight;

    if (finalHeight > pdfHeight) {
        // Scale to fit height instead
        finalHeight = pdfHeight;
        finalWidth = (img.width * pdfHeight) / img.height;
    }

    // Center horizontally
    const x = (pdfWidth - finalWidth) / 2;
    const y = 0;

    pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
    pdf.save(filename);

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};
