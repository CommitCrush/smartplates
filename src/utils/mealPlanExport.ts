/**
 * Meal Plan Export Utilities
 * 
 * Handles screenshot, PDF export, and download functionality for meal plans
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpeg';
  filename?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  quality?: number; // 0.1 to 1.0 for image formats
}

/**
 * Captures a screenshot of the meal planning calendar
 */
export async function captureCalendarScreenshot(
  elementId: string = 'calendar-container',
  options: ExportOptions = { format: 'png' }
): Promise<string> {
  // Try multiple possible element IDs for calendar containers
  const possibleIds = [
    elementId,
    'calendar-container', 
    'weekly-calendar', 
    'monthly-calendar',
    'meal-plan-calendar',
    'calendar-view'
  ];
  
  let element: HTMLElement | null = null;
  
  for (const id of possibleIds) {
    element = document.getElementById(id);
    if (element) {
      console.log(`Found calendar element with ID: ${id}`);
      break;
    }
  }
  
  // If no ID found, try to find calendar by class name
  if (!element) {
    const calendarElements = document.querySelectorAll('.calendar-container, .weekly-calendar, .monthly-calendar');
    element = calendarElements[0] as HTMLElement;
    if (element) {
      console.log('Found calendar element by class name');
    }
  }
  
  if (!element) {
    throw new Error(`Calendar element not found. Tried IDs: ${possibleIds.join(', ')}`);
  }

  try {
    // Wait a moment for any animations or loading to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: options.quality || 2, // Higher quality
      useCORS: true,
      allowTaint: true, // Allow cross-origin images
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc: Document) => {
        // Ensure all styles are applied in the cloned document
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.maxWidth = 'none';
          clonedElement.style.maxHeight = 'none';
        }
      }
    });

    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(format, options.quality || 0.9);

    return dataUrl;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Downloads a meal plan as PDF
 */
export async function exportMealPlanToPDF(
  mealPlanData: any,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> {
  try {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weekly Meal Plan', margin, margin + 10);

    // Add date range
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const dateText = mealPlanData.title || 'Meal Plan';
    pdf.text(dateText, margin, margin + 25);

    let yPosition = margin + 40;
    const lineHeight = 8;
    const dayWidth = (pageWidth - 2 * margin) / 7;

    // Add day headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    days.forEach((day, index) => {
      const xPosition = margin + (index * dayWidth);
      pdf.text(day.substring(0, 3), xPosition, yPosition);
    });

    yPosition += lineHeight * 2;

    // Add meals for each day
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    mealTypes.forEach(mealType => {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(mealType.charAt(0).toUpperCase() + mealType.slice(1), margin, yPosition);
      yPosition += lineHeight;

      // Add meals for each day
      days.forEach((_, dayIndex) => {
        const xPosition = margin + (dayIndex * dayWidth);
        const dayMeals = mealPlanData.days?.[dayIndex]?.[mealType] || [];
        
        pdf.setFont('helvetica', 'normal');
        dayMeals.forEach((meal: any, mealIndex: number) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const mealText = meal.recipeName || meal.name || 'Meal';
          const truncatedText = mealText.length > 15 ? mealText.substring(0, 12) + '...' : mealText;
          pdf.text(truncatedText, xPosition, yPosition + (mealIndex * lineHeight));
        });
      });

      yPosition += lineHeight * 3;
    });

    // Add grocery list if available
    if (mealPlanData.groceryList && mealPlanData.groceryList.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Grocery List', margin, yPosition);
      yPosition += lineHeight * 2;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      mealPlanData.groceryList.forEach((item: any) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        const itemText = `• ${item.name} ${item.amount ? `(${item.amount} ${item.unit || ''})` : ''}`;
        pdf.text(itemText, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    }

    // Generate filename
    const filename = options.filename || `meal-plan-${new Date().toISOString().split('T')[0]}.pdf`;

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export meal plan to PDF');
  }
}

/**
 * Downloads an image file
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports meal plan calendar as image
 */
export async function exportCalendarAsImage(
  elementId: string,
  options: ExportOptions = { format: 'png' }
): Promise<void> {
  try {
    const dataUrl = await captureCalendarScreenshot(elementId, options);
    const filename = options.filename || `meal-plan-calendar-${new Date().toISOString().split('T')[0]}.${options.format}`;
    downloadImage(dataUrl, filename);
  } catch (error) {
    console.error('Calendar export failed:', error);
    throw error;
  }
}

/**
 * Exports grocery list as text file
 */
export function exportGroceryListAsText(groceryList: any[], filename?: string): void {
  try {
    let content = 'Grocery List\n';
    content += '='.repeat(20) + '\n\n';

    groceryList.forEach(item => {
      content += `☐ ${item.name}`;
      if (item.amount) {
        content += ` (${item.amount} ${item.unit || ''})`;
      }
      if (item.category) {
        content += ` - ${item.category}`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = filename || `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Grocery list export failed:', error);
    throw new Error('Failed to export grocery list');
  }
}

/**
 * Prints the meal plan calendar
 */
export function printMealPlan(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  const elementHtml = element.outerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Meal Plan</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: white;
          }
          .meal-card {
            border: 1px solid #ddd;
            padding: 8px;
            margin: 4px;
            border-radius: 4px;
            background: #f9f9f9;
          }
          .day-column {
            width: 14%;
            vertical-align: top;
            padding: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${elementHtml}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}