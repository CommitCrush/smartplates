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
  elementSelector: string = 'calendar-container',
  options: ExportOptions = { format: 'png' }
): Promise<string> {
  console.log('📷 Starting screenshot capture for:', elementSelector);
  
  let element: HTMLElement | null = null;
  
  // Strategy 1: Find the complete weekly calendar with all visual content
  const weeklyCalendarSelectors = [
    '#weekly-calendar', // WeeklyCalendar component itself
    '.weekly-calendar',
    '#weekly-calendar-container .weekly-calendar', // Look inside container
    '[class*="weekly-calendar"]'
  ];
  
  for (const selector of weeklyCalendarSelectors) {
    element = document.querySelector(selector) as HTMLElement;
    if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
      console.log(`✅ Found weekly calendar element: ${selector}`);
      break;
    }
  }
  
  // Strategy 2: If weekly calendar not found, try container
  if (!element) {
    const containerSelectors = [
      '#weekly-calendar-container',
      '#monthly-calendar-container', 
      '#today-view-container',
      '.weekly-calendar-container',
      '.monthly-calendar-container',
      '.today-view-container'
    ];
    
    for (const selector of containerSelectors) {
      element = document.querySelector(selector) as HTMLElement;
      if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
        console.log(`✅ Found calendar container: ${selector}`);
        break;
      }
    }
  }
  
  // Strategy 3: Find the main calendar grid
  if (!element) {
    const gridSelectors = [
      '.grid.grid-cols-1.lg\\:grid-cols-7',
      '[class*="grid-cols-7"]',
      '.calendar-grid',
      '#calendar-container'
    ];
    
    for (const selector of gridSelectors) {
      element = document.querySelector(selector) as HTMLElement;
      if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
        console.log(`✅ Found calendar grid: ${selector}`);
        break;
      }
    }
  }
  
  if (!element) {
    console.error('❌ No calendar element found');
    throw new Error('Calendar element not found for screenshot');
  }

  console.log('🎯 Selected element details:', {
    id: element.id,
    className: element.className,
    tagName: element.tagName,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight
  });

  // Try to capture the full visual calendar
  try {
    return await captureFullVisualCalendar(element, options);
  } catch (error) {
    console.log('🔄 Full visual capture failed, trying simple fallback...', error);
    try {
      return await captureWithSimpleMethod(element, options);
    } catch (fallbackError) {
      console.error('❌ Both methods failed:', { error, fallbackError });
      throw new Error(`Screenshot failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
}

/**
 * Capture the full visual calendar with all recipe cards and styling
 */
async function captureFullVisualCalendar(element: HTMLElement, options: ExportOptions): Promise<string> {
  console.log('🎨 Capturing full visual calendar...');
  
  // First, completely disable all existing stylesheets temporarily
  const allStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
  const originalDisplay = allStylesheets.map(sheet => {
    const display = (sheet as HTMLElement).style.display;
    (sheet as HTMLElement).style.display = 'none';
    return display;
  });
  
  // Create a comprehensive replacement stylesheet that avoids lab() functions
  const tempStyle = document.createElement('style');
  tempStyle.setAttribute('data-temp-screenshot', 'true');
  tempStyle.textContent = `
    /* Complete CSS reset and replacement for screenshot */
    *, *::before, *::after {
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: none !important;
      background: transparent !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      text-decoration: none !important;
      list-style: none !important;
      outline: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      transition: none !important;
      animation: none !important;
      transform: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      clip-path: none !important;
      mask: none !important;
    }
    
    /* Basic layout structure */
    body, html {
      background: #ffffff !important;
      width: 100% !important;
      height: auto !important;
    }
    
    /* Container and layout elements */
    div, section, article, main, aside, header, footer, nav {
      display: block !important;
      background: #ffffff !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 4px !important;
      padding: 8px !important;
      margin: 4px !important;
    }
    
    /* Grid layouts */
    .grid, [class*="grid"] {
      display: grid !important;
    }
    
    .grid-cols-7, [class*="grid-cols-7"] {
      grid-template-columns: repeat(7, 1fr) !important;
      gap: 8px !important;
    }
    
    .grid-cols-1, [class*="grid-cols-1"] {
      grid-template-columns: 1fr !important;
    }
    
    /* Cards and containers */
    .card, [class*="card"], .meal-card, [class*="meal"] {
      background: #ffffff !important;
      border: 2px solid #d1d5db !important;
      border-radius: 8px !important;
      padding: 12px !important;
      margin: 4px !important;
      display: block !important;
      position: relative !important;
    }
    
    /* Images */
    img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 4px !important;
      border: 1px solid #e5e7eb !important;
      display: block !important;
    }
    
    /* Text elements */
    h1, h2, h3, h4, h5, h6 {
      color: #111827 !important;
      font-weight: bold !important;
      margin: 4px 0 !important;
      line-height: 1.2 !important;
    }
    
    p, span, div, label {
      color: #374151 !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      margin: 2px 0 !important;
    }
    
    /* Buttons */
    button, .button, [class*="button"] {
      background: #f3f4f6 !important;
      border: 1px solid #d1d5db !important;
      border-radius: 4px !important;
      padding: 6px 12px !important;
      color: #374151 !important;
      font-size: 12px !important;
      cursor: pointer !important;
    }
    
    /* Specific meal plan styling */
    .weekly-calendar, #weekly-calendar {
      background: #ffffff !important;
      padding: 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 8px !important;
    }
    
    /* Day columns */
    .day-column, [class*="day"] {
      background: #f9fafb !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      padding: 8px !important;
      margin: 2px !important;
    }
    
    /* Recipe cards specific styling */
    .recipe-card, [class*="recipe"] {
      background: #ffffff !important;
      border: 2px solid #d1d5db !important;
      border-radius: 8px !important;
      padding: 8px !important;
      margin: 4px !important;
      min-height: 80px !important;
    }
    
    /* Meal type headers */
    .meal-type, [class*="breakfast"], [class*="lunch"], [class*="dinner"], [class*="snacks"] {
      background: #f3f4f6 !important;
      color: #111827 !important;
      font-weight: bold !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      margin: 2px 0 !important;
      font-size: 12px !important;
    }
    
    /* Hide problematic elements */
    script, style:not([data-temp-screenshot]), noscript, 
    .tooltip, [data-tooltip], .popover, .modal,
    .loading, .spinner, [class*="loading"], [class*="spinner"] {
      display: none !important;
    }
    
    /* Override any remaining color functions */
    [style*="lab("], [style*="lch("], [style*="oklab("], [style*="oklch("] {
      color: #000000 !important;
      background-color: #ffffff !important;
    }
  `;
  
  document.head.appendChild(tempStyle);
  
  try {
    // Wait for content to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ensure all images are loaded
    const allImages = element.querySelectorAll('img');
    console.log(`🖼️ Found ${allImages.length} images, ensuring they're loaded...`);
    
    await Promise.all(Array.from(allImages).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(() => resolve(), 3000);
        }
      });
    }));
    
    console.log('✅ All images loaded, proceeding with capture');
    
    // Apply additional inline styles to ensure visibility
    const elementsToStyle = element.querySelectorAll('*');
    const originalStyles: Array<{element: HTMLElement, style: string}> = [];
    
    elementsToStyle.forEach(el => {
      const htmlEl = el as HTMLElement;
      originalStyles.push({element: htmlEl, style: htmlEl.getAttribute('style') || ''});
      
      // Remove any style attributes that might contain lab() functions
      if (htmlEl.style.cssText.includes('lab(') || 
          htmlEl.style.cssText.includes('lch(') || 
          htmlEl.style.cssText.includes('oklab(') || 
          htmlEl.style.cssText.includes('oklch(')) {
        htmlEl.removeAttribute('style');
      }
    });
    
    // Create canvas with html2canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      removeContainer: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 10000,
      foreignObjectRendering: false,
      ignoreElements: (el) => {
        return (
          el.tagName === 'SCRIPT' || 
          el.tagName === 'STYLE' ||
          el.tagName === 'NOSCRIPT' ||
          el.classList?.contains('ignore-screenshot')
        );
      },
      onclone: (clonedDoc: Document) => {
        console.log('🔧 Processing cloned document...');
        
        // Remove ALL original stylesheets from cloned document
        const clonedSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not([data-temp-screenshot])');
        clonedSheets.forEach(sheet => sheet.remove());
        
        // Ensure our temp style is the only one
        const tempStyleInClone = clonedDoc.querySelector('style[data-temp-screenshot]');
        if (!tempStyleInClone) {
          const newTempStyle = clonedDoc.createElement('style');
          newTempStyle.textContent = tempStyle.textContent;
          clonedDoc.head.appendChild(newTempStyle);
        }
        
        console.log('✅ Cloned document cleaned and styled');
      }
    });
    
    // Restore original styles
    originalStyles.forEach(({element, style}) => {
      if (style) {
        element.setAttribute('style', style);
      }
    });
    
    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(format, options.quality || 0.9);
    
    console.log('✅ Full visual calendar captured successfully:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      dataSize: Math.round(dataUrl.length / 1024) + 'KB'
    });
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Full visual capture failed:', error);
    throw error;
  } finally {
    // Always restore original stylesheets
    allStylesheets.forEach((sheet, index) => {
      (sheet as HTMLElement).style.display = originalDisplay[index];
    });
    
    // Remove temp style
    const tempStyleElement = document.querySelector('style[data-temp-screenshot]');
    if (tempStyleElement) {
      tempStyleElement.remove();
    }
  }
}

/**
 * Simple fallback method if full visual capture fails
 */
async function captureWithSimpleMethod(element: HTMLElement, options: ExportOptions): Promise<string> {
  console.log('🟡 Using simple fallback method...');
  
  // Create a minimal safe stylesheet
  const safeStyle = document.createElement('style');
  safeStyle.setAttribute('data-safe-screenshot', 'true');
  safeStyle.textContent = `
    * {
      color: #000000 !important;
      background-color: #ffffff !important;
      border-color: #cccccc !important;
      font-family: Arial, sans-serif !important;
    }
    img { max-width: 100% !important; height: auto !important; }
    div { border: 1px solid #e5e7eb !important; padding: 4px !important; margin: 2px !important; }
  `;
  document.head.appendChild(safeStyle);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove any inline styles that might contain lab() functions
    const allElements = element.querySelectorAll('*');
    const removedStyles: Array<{el: HTMLElement, style: string}> = [];
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const styleAttr = htmlEl.getAttribute('style');
      if (styleAttr && (styleAttr.includes('lab(') || styleAttr.includes('lch('))) {
        removedStyles.push({el: htmlEl, style: styleAttr});
        htmlEl.removeAttribute('style');
      }
    });
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      ignoreElements: (el) => {
        return el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK';
      },
      onclone: (clonedDoc: Document) => {
        // Remove all original stylesheets
        const sheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not([data-safe-screenshot])');
        sheets.forEach(sheet => sheet.remove());
      }
    });
    
    // Restore removed styles
    removedStyles.forEach(({el, style}) => {
      el.setAttribute('style', style);
    });
    
    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(format, options.quality || 0.9);
    
  } finally {
    // Always clean up
    const tempStyle = document.querySelector('style[data-safe-screenshot]');
    if (tempStyle) {
      tempStyle.remove();
    }
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
  try {
    console.log('💾 Initiating download:', filename);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    
    // Add link to DOM temporarily
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    console.log('✅ Download initiated successfully:', filename);
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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