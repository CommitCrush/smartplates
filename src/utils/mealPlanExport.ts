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
  console.log('🎨 Capturing PROFESSIONAL weekly meal plan PDF...');
  
  // Create dedicated PDF render container with fixed dimensions
  const pdfContainer = document.createElement('div');
  pdfContainer.id = 'pdf-weekly-calendar';
  pdfContainer.style.cssText = `
    position: fixed;
    top: -20000px;
    left: 0;
    width: 1600px;
    min-height: 1200px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    z-index: 99999;
    padding: 60px;
    box-sizing: border-box;
    overflow: hidden;
  `;
  
  // Clone and process the weekly calendar element
  const clonedCalendar = element.cloneNode(true) as HTMLElement;
  
  // Apply comprehensive professional PDF styles
  const professionalPDFStyles = document.createElement('style');
  professionalPDFStyles.id = 'pdf-professional-styles';
  professionalPDFStyles.textContent = `
    /* RESET AND BASE STYLES */
    #pdf-weekly-calendar * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #pdf-weekly-calendar {
      background: #ffffff !important;
      color: #1f2937 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
      width: 1600px !important;
      padding: 60px !important;
    }

    /* WEEKLY CALENDAR MAIN CONTAINER */
    #pdf-weekly-calendar .weekly-calendar,
    #pdf-weekly-calendar [id*="weekly"] {
      width: 100% !important;
      max-width: 1480px !important;
      margin: 0 auto !important;
      background: #ffffff !important;
      border: 3px solid #e5e7eb !important;
      border-radius: 16px !important;
      padding: 40px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }

    /* CALENDAR HEADER */
    #pdf-weekly-calendar h1,
    #pdf-weekly-calendar h2,
    #pdf-weekly-calendar .calendar-title {
      font-size: 32px !important;
      font-weight: 700 !important;
      color: #111827 !important;
      text-align: center !important;
      margin: 0 0 40px 0 !important;
      padding: 20px 0 !important;
      border-bottom: 4px solid #3b82f6 !important;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
      border-radius: 12px !important;
    }

    /* WEEK DATE RANGE */
    #pdf-weekly-calendar .week-range,
    #pdf-weekly-calendar .date-range {
      font-size: 18px !important;
      color: #6b7280 !important;
      text-align: center !important;
      margin: 0 0 30px 0 !important;
      font-weight: 500 !important;
    }

    /* 7-DAY GRID LAYOUT */
    #pdf-weekly-calendar .grid,
    #pdf-weekly-calendar [class*="grid"] {
      display: grid !important;
      grid-template-columns: repeat(7, 1fr) !important;
      gap: 20px !important;
      margin: 0 !important;
      width: 100% !important;
    }

    /* INDIVIDUAL DAY COLUMNS */
    #pdf-weekly-calendar .day-column,
    #pdf-weekly-calendar [class*="day"] {
      background: #ffffff !important;
      border: 2px solid #d1d5db !important;
      border-radius: 12px !important;
      padding: 20px 16px !important;
      min-height: 500px !important;
      width: 100% !important;
      position: relative !important;
      overflow: visible !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    }

    /* DAY HEADERS (Monday, Tuesday, etc.) */
    #pdf-weekly-calendar .day-column h3,
    #pdf-weekly-calendar [class*="day"] h3,
    #pdf-weekly-calendar .day-header {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #1f2937 !important;
      text-align: center !important;
      margin: 0 0 20px 0 !important;
      padding: 12px 8px !important;
      background: #f3f4f6 !important;
      border-radius: 8px !important;
      border: 1px solid #e5e7eb !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }

    /* DAY NUMBERS */
    #pdf-weekly-calendar .day-number {
      font-size: 24px !important;
      font-weight: 600 !important;
      color: #3b82f6 !important;
      text-align: center !important;
      margin: 0 0 16px 0 !important;
    }

    /* MEAL TYPE SECTIONS */
    #pdf-weekly-calendar .meal-section {
      margin: 16px 0 !important;
      padding: 0 !important;
    }

    /* MEAL TYPE HEADERS */
    #pdf-weekly-calendar .meal-type,
    #pdf-weekly-calendar h4,
    #pdf-weekly-calendar [class*="breakfast"],
    #pdf-weekly-calendar [class*="lunch"],
    #pdf-weekly-calendar [class*="dinner"],
    #pdf-weekly-calendar [class*="snacks"] {
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin: 12px 0 8px 0 !important;
      padding: 8px 12px !important;
      background: #f9fafb !important;
      border-radius: 6px !important;
      border: 1px solid #e5e7eb !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      text-align: center !important;
    }

    /* RECIPE CARDS */
    #pdf-weekly-calendar .recipe-card,
    #pdf-weekly-calendar [class*="recipe"],
    #pdf-weekly-calendar .meal-card {
      background: #ffffff !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 10px !important;
      padding: 12px !important;
      margin: 8px 0 !important;
      min-height: 80px !important;
      position: relative !important;
      display: block !important;
      page-break-inside: avoid !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    }

    /* RECIPE TITLES */
    #pdf-weekly-calendar .recipe-title,
    #pdf-weekly-calendar .recipe-card h5,
    #pdf-weekly-calendar .recipe-card h6,
    #pdf-weekly-calendar [class*="recipe"] h5,
    #pdf-weekly-calendar [class*="recipe"] h6 {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #111827 !important;
      margin: 0 0 8px 0 !important;
      line-height: 1.3 !important;
      word-wrap: break-word !important;
    }

    /* RECIPE IMAGES */
    #pdf-weekly-calendar img {
      width: 70px !important;
      height: 60px !important;
      border-radius: 8px !important;
      border: 2px solid #d1d5db !important;
      object-fit: cover !important;
      float: left !important;
      margin: 0 12px 8px 0 !important;
      background: #f3f4f6 !important;
      display: block !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }

    /* RECIPE META INFORMATION */
    #pdf-weekly-calendar .recipe-meta,
    #pdf-weekly-calendar .prep-time,
    #pdf-weekly-calendar .servings,
    #pdf-weekly-calendar [class*="time"],
    #pdf-weekly-calendar [class*="serving"] {
      font-size: 12px !important;
      color: #6b7280 !important;
      margin: 4px 0 !important;
      display: block !important;
      clear: both !important;
    }

    /* TEXT ELEMENTS */
    #pdf-weekly-calendar p,
    #pdf-weekly-calendar span,
    #pdf-weekly-calendar div {
      color: #374151 !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      margin: 2px 0 !important;
    }

    /* EMPTY SLOT STYLING */
    #pdf-weekly-calendar .empty-slot,
    #pdf-weekly-calendar [class*="add-"],
    #pdf-weekly-calendar [class*="empty"] {
      background: #f9fafb !important;
      border: 2px dashed #d1d5db !important;
      border-radius: 8px !important;
      padding: 16px !important;
      text-align: center !important;
      color: #9ca3af !important;
      font-size: 12px !important;
      min-height: 60px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* HIDE INTERACTIVE ELEMENTS */
    #pdf-weekly-calendar button,
    #pdf-weekly-calendar .button,
    #pdf-weekly-calendar [class*="button"],
    #pdf-weekly-calendar .btn,
    #pdf-weekly-calendar [class*="btn"],
    #pdf-weekly-calendar .edit-btn,
    #pdf-weekly-calendar .delete-btn,
    #pdf-weekly-calendar .copy-btn,
    #pdf-weekly-calendar [class*="hover:"],
    #pdf-weekly-calendar .tooltip,
    #pdf-weekly-calendar [data-tooltip],
    #pdf-weekly-calendar .popover,
    #pdf-weekly-calendar .modal,
    #pdf-weekly-calendar .loading,
    #pdf-weekly-calendar .spinner,
    #pdf-weekly-calendar [class*="loading"],
    #pdf-weekly-calendar [class*="spinner"],
    #pdf-weekly-calendar script,
    #pdf-weekly-calendar noscript {
      display: none !important;
      visibility: hidden !important;
    }

    /* PRINT OPTIMIZATION */
    @media print {
      #pdf-weekly-calendar {
        width: 1600px !important;
        height: auto !important;
        margin: 0 !important;
        padding: 60px !important;
        page-break-inside: avoid !important;
        background: white !important;
      }
      
      #pdf-weekly-calendar .day-column {
        page-break-inside: avoid !important;
        min-height: 450px !important;
      }
      
      #pdf-weekly-calendar .recipe-card {
        page-break-inside: avoid !important;
        margin-bottom: 8px !important;
      }

      #pdf-weekly-calendar img {
        width: 65px !important;
        height: 55px !important;
      }
    }
  `;
  
  // Add styles to document head
  document.head.appendChild(professionalPDFStyles);
  
  // Add cloned calendar to PDF container
  pdfContainer.appendChild(clonedCalendar);
  document.body.appendChild(pdfContainer);
  
  try {
    // Wait for layout stabilization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Enhanced image loading with error handling
    const allImages = pdfContainer.querySelectorAll('img');
    console.log(`🖼️ Processing ${allImages.length} images for professional PDF...`);
    
    await Promise.all(Array.from(allImages).map((img) => {
      return new Promise<void>((resolve) => {
        const htmlImg = img as HTMLImageElement;
        
        if (htmlImg.complete && htmlImg.naturalHeight !== 0) {
          resolve();
        } else {
          const handleLoad = () => {
            console.log('✅ Image loaded successfully');
            resolve();
          };
          
          const handleError = () => {
            console.log('❌ Image failed to load, creating placeholder');
            // Create professional placeholder
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
              width: 70px !important; 
              height: 60px !important; 
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important; 
              border-radius: 8px !important; 
              border: 2px solid #d1d5db !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              float: left !important;
              margin: 0 12px 8px 0 !important;
              font-size: 24px !important;
              color: #9ca3af !important;
            `;
            placeholder.textContent = '🍽️';
            htmlImg.parentNode?.replaceChild(placeholder, htmlImg);
            resolve();
          };
          
          htmlImg.addEventListener('load', handleLoad);
          htmlImg.addEventListener('error', handleError);
          
          // Extended timeout for better image loading
          setTimeout(() => {
            htmlImg.removeEventListener('load', handleLoad);
            htmlImg.removeEventListener('error', handleError);
            handleError();
          }, 20000);
        }
      });
    }));
    
    console.log('✅ All images processed for professional PDF');
    
    // Create ultra-high-quality canvas for professional output
    const canvas = await html2canvas(pdfContainer, {
      backgroundColor: '#ffffff',
      scale: 4, // Ultra-high scale for professional quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      removeContainer: false,
      width: 1600,
      height: Math.max(1200, pdfContainer.scrollHeight),
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 30000,
      foreignObjectRendering: true,
      ignoreElements: (el) => {
        const ignoredTags = ['SCRIPT', 'STYLE', 'NOSCRIPT'];
        const ignoredClasses = ['ignore-screenshot', 'btn', 'button', 'edit-btn', 'delete-btn', 'copy-btn'];
        
        return (
          ignoredTags.includes(el.tagName) ||
          ignoredClasses.some(cls => el.classList?.contains(cls)) ||
          el.style.display === 'none' ||
          el.style.visibility === 'hidden'
        );
      },
      onclone: (clonedDoc: Document) => {
        console.log('🔧 Processing cloned document for PROFESSIONAL PDF...');
        
        // Remove any problematic color functions
        const problematicElements = clonedDoc.querySelectorAll('[style*="lab("], [style*="lch("], [style*="oklab("], [style*="oklch("]');
        problematicElements.forEach((el: HTMLElement) => {
          el.removeAttribute('style');
        });
        
        // Ensure professional styles are applied
        const professionalStylesClone = clonedDoc.createElement('style');
        professionalStylesClone.textContent = professionalPDFStyles.textContent;
        clonedDoc.head.appendChild(professionalStylesClone);
        
        console.log('✅ Cloned document optimized for PROFESSIONAL PDF rendering');
      }
    });
    
    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(format, 0.98); // Ultra-high quality
    
    console.log('✅ PROFESSIONAL weekly meal plan PDF captured successfully:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      dataSize: Math.round(dataUrl.length / 1024) + 'KB',
      quality: 'PROFESSIONAL GRADE - 4x Scale',
      imageFormat: format
    });
    
    return dataUrl;
    
  } catch (error) {
    console.error('❌ Professional PDF capture failed:', error);
    throw error;
  } finally {
    // Clean up
    document.head.removeChild(professionalPDFStyles);
    document.body.removeChild(pdfContainer);
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