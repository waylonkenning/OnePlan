import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'roadmap.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // To capture the full roadmap, we need to ensure we're getting the scrollable content
    const scrollableArea = (element.querySelector('.overflow-auto') as HTMLElement) || element;
    
    // Using JPEG instead of PNG for significantly smaller file size
    // Lowering quality slightly to 0.8 for a good balance between clarity and size
    const dataUrl = await toJpeg(scrollableArea, {
      quality: 0.8,
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

    let finalWidth = pdfWidth;
    let finalHeight = (img.height * pdfWidth) / img.width;

    if (finalHeight > pdfHeight) {
        // Scale to fit height instead
        finalHeight = pdfHeight;
        finalWidth = (img.width * pdfHeight) / img.height;
    }

    // Center horizontally
    const x = (pdfWidth - finalWidth) / 2;
    const y = 0;

    // Use JPEG format in jsPDF
    pdf.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
    pdf.save(filename);

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};
