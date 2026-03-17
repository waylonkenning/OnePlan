/**
 * Opens the browser print dialog for the current view.
 *
 * Uses window.print() instead of rasterised image capture so the output
 * is vector-quality with fully selectable, searchable text. The caller is
 * responsible for ensuring the Visualiser view is active before calling.
 *
 * @media print CSS in index.css handles the layout: hides app chrome,
 * expands overflow containers, and sets the page to A2 landscape.
 */
export const exportToPDF = (filename: string = 'roadmap') => {
  const label = filename.replace(/\.pdf$/i, '');
  const originalTitle = document.title;
  document.title = label;

  const restore = () => {
    document.title = originalTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  window.print();
};
