
/**
 * Recipe Actions Component
 *
 * Displays action icons for a recipe, such as download, print, and shopping list.
 */

'use client';

import React from 'react';
import { FaDownload, FaPrint, FaShoppingCart } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RecipeActionsProps {
  recipe: {
    title: string;
  };
  contentRef: React.RefObject<HTMLDivElement>;
}

export function RecipeActions({ recipe, contentRef }: RecipeActionsProps) {
  const handleDownloadPdf = () => {
    if (contentRef.current) {
      html2canvas(contentRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${recipe.title}.pdf`);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleDownloadPdf}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Download PDF"
        aria-label="Download PDF"
      >
        <FaDownload size={24} />
      </button>
      <button
        onClick={handlePrint}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Print Recipe"
        aria-label="Print Recipe"
      >
        <FaPrint size={24} />
      </button>
      <button
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Shopping List (coming soon)"
        aria-label="Shopping List"
        disabled
      >
        <FaShoppingCart size={24} />
      </button>
    </div>
  );
}
