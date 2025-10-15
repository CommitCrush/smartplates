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
        const htmlEl = el as HTMLElement;
        
        return (
          ignoredTags.includes(el.tagName) ||
          ignoredClasses.some(cls => el.classList?.contains(cls)) ||
          htmlEl.style.display === 'none' ||
          htmlEl.style.visibility === 'hidden'
        );
      },
      onclone: (clonedDoc: Document) => {
        console.log('🔧 Processing cloned document for PROFESSIONAL PDF...');
        
        // Remove any problematic color functions
        const problematicElements = clonedDoc.querySelectorAll('[style*="lab("], [style*="lch("], [style*="oklab("], [style*="oklch("]');
        problematicElements.forEach((el: Element) => {
          (el as HTMLElement).removeAttribute('style');
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
    const margin = 15;

    // Define color scheme - Soft Sage Green Theme with sharper coral
    const colors = {
      primary: [185, 195, 180],    // #b9c3b4 - Softer sage green
      secondary: [160, 180, 160],  // #a0b4a0 - Gentle green
      accent: [240, 130, 130],     // #f08282 - Sharper coral for week bar
      background: [250, 252, 250], // #fafcfa - Very light background
      text: {
        dark: [60, 75, 60],        // #3c4b3c - Sharper dark green text for recipes
        medium: [90, 105, 90],     // #5a695a - Medium green text
        light: [155, 170, 155]     // #9baa9b - Light green text
      },
      meal: {
        breakfast: [240, 210, 140], // #f0d28c - Soft warm amber
        lunch: [185, 195, 180],     // #b9c3b4 - Soft sage green
        dinner: [160, 175, 190],    // #a0afbe - Gentle blue
        snacks: [235, 190, 140]     // #ebbe8c - Soft orange
      }
    };

    // Helper function to set RGB color
    const setColor = (colorArray: number[]) => {
      pdf.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
    };

    const setFillColor = (colorArray: number[]) => {
      pdf.setFillColor(colorArray[0], colorArray[1], colorArray[2]);
    };

    // Add green header background
    setFillColor(colors.primary);
    pdf.rect(0, 0, pageWidth, 60, 'F');

    // Add SmartPlates logo area with chef hat icon (exact match to UI)
    const logoY = 25;
    const logoX = pageWidth / 2 - 30;
    
    // Create simple chef hat icon (matching ChefHat component style)
    setFillColor([255, 255, 255]);
    
    // Chef hat outline - simple and clean like the UI
    // Hat base (wider, flatter)
    pdf.roundedRect(logoX, logoY - 2, 10, 6, 1, 1, 'F');
    
    // Hat top (single rounded top)
    pdf.roundedRect(logoX + 1, logoY - 6, 8, 5, 2, 2, 'F');
    
    // Hat brim (thin line at bottom)
    pdf.rect(logoX - 1, logoY + 3, 12, 1, 'F');
    
    // Add SmartPlates text logo (exactly like in the attachments)
    setColor([255, 255, 255]);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SmartPlates', logoX + 15, logoY + 2);

    // Add main title
    setColor([255, 255, 255]);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    
    // Get the week date range
    const startDate = mealPlanData.weekStartDate ? new Date(mealPlanData.weekStartDate) : new Date();
    const weekTitle = `Week of ${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    
    const titleWidth = pdf.getTextWidth(weekTitle);
    pdf.text(weekTitle, (pageWidth - titleWidth) / 2, 40);

    // Add "Created with SmartPlates" subtitle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const subtitleText = 'Your Weekly Meal Plan';
    const subtitleWidth = pdf.getTextWidth(subtitleText);
    pdf.text(subtitleText, (pageWidth - subtitleWidth) / 2, 50);

    // Add coral week range bar
    setFillColor(colors.accent);
    pdf.rect(margin, 55, pageWidth - 2 * margin, 12, 'F');
    
    // Week range text on coral bar
    setColor([255, 255, 255]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const weekRange = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    const weekRangeWidth = pdf.getTextWidth(weekRange);
    pdf.text(weekRange, (pageWidth - weekRangeWidth) / 2, 63);

    let yPosition = 80;
    const dayHeight = 45;
    const dayWidth = pageWidth - 2 * margin;

    // Process each day
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    mealPlanData.days?.forEach((day: any, dayIndex: number) => {
      // Check if we need a new page
      if (yPosition + dayHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      const dayName = daysOfWeek[dayIndex] || `Day ${dayIndex + 1}`;
      const dayDate = day.date ? new Date(day.date) : new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000);
      const formattedDate = `${dayName}, ${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      // Day header background
      setFillColor(colors.primary);
      pdf.rect(margin, yPosition, dayWidth, 12, 'F');

      // Day title
      setColor([255, 255, 255]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formattedDate, margin + 5, yPosition + 8);

      yPosition += 15;

      // Meal types row
      const mealTypes = [
        { name: 'Breakfast', key: 'breakfast', color: colors.meal.breakfast },
        { name: 'Lunch', key: 'lunch', color: colors.meal.lunch },
        { name: 'Dinner', key: 'dinner', color: colors.meal.dinner },
        { name: 'Snacks', key: 'snacks', color: colors.meal.snacks }
      ];

      const mealWidth = dayWidth / 4;

      mealTypes.forEach((mealType, mealIndex) => {
        const xPosition = margin + (mealIndex * mealWidth);
        
        // Meal type header
        setFillColor(mealType.color);
        pdf.rect(xPosition, yPosition, mealWidth, 8, 'F');
        
        // Meal type title
        setColor([255, 255, 255]);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const mealTitleWidth = pdf.getTextWidth(mealType.name);
        pdf.text(mealType.name, xPosition + (mealWidth - mealTitleWidth) / 2, yPosition + 6);

        // Meal content area background
        setFillColor([255, 255, 255]);
        pdf.rect(xPosition, yPosition + 8, mealWidth, 30, 'F'); // Increased height for more content
        
        // Add border
        pdf.setDrawColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
        pdf.setLineWidth(0.1);
        pdf.rect(xPosition, yPosition + 8, mealWidth, 30, 'S');

        // Meal content
        const meals = day[mealType.key] || [];
        setColor(colors.text.dark);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');

        meals.forEach((meal: any, index: number) => {
          if (index < 4) { // Allow up to 4 meals per slot for better coverage
            const mealText = meal.recipeName || meal.name || 'Meal';
            // Show full title, but wrap if too long
            const maxLineLength = 20;
            const truncatedText = mealText.length > maxLineLength ? mealText.substring(0, maxLineLength - 3) + '...' : mealText;
            const textYPos = yPosition + 13 + (index * 6); // Slightly more space between items
            
            // Add bullet point
            setColor(colors.text.dark);
            pdf.text('•', xPosition + 2, textYPos);
            
            // Add meal name with sharper text
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text(truncatedText, xPosition + 5, textYPos);
            
            // Add servings and prep time if available
            if (meal.servings || meal.prepTime || meal.cookingTime) {
              const details = [];
              if (meal.servings) details.push(`${meal.servings} srv`);
              if (meal.prepTime) details.push(`${meal.prepTime}min prep`);
              if (meal.cookingTime) details.push(`${meal.cookingTime}min cook`);
              
              const detailText = details.join(' • ');
              if (detailText) {
                setColor(colors.text.dark);
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.text(detailText, xPosition + 5, textYPos + 3);
              }
            }
          }
        });

        if (meals.length > 4) {
          setColor(colors.text.medium);
          pdf.setFontSize(7);
          pdf.text(`+${meals.length - 4} more`, xPosition + 5, yPosition + 35);
        }
      });

      yPosition += 43; // Adjusted for increased meal content area height
    });

    // Add footer with SmartPlates branding
    const footerY = pageHeight - 15;
    setColor(colors.text.light);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const footerText = `Generated by SmartPlates • ${new Date().toLocaleDateString('en-US')}`;
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, footerY);

    // Generate filename
    const filename = options.filename || `smartplates-meal-plan-${new Date().toISOString().split('T')[0]}.pdf`;

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
 * Exports grocery list as professional PDF with SmartPlates branding
 */
export function exportGroceryListAsPDF(groceryList: any[], filename?: string): void {
  try {
    console.log('🛒 Creating professional grocery list PDF...');
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // Define the same color scheme as meal plan PDF - Soft Sage Green Theme
    const colors = {
      primary: [185, 195, 180],    // Soft sage green
      secondary: [160, 180, 160],  // Deeper sage
      accent: [240, 130, 130],     // Sharp coral accent
      background: [250, 252, 250], // Very light sage
      text: {
        dark: [60, 75, 60],        // Dark sage for headers
        medium: [90, 105, 90],     // Medium sage for body
        light: [155, 170, 155]     // Light sage for metadata
      },
      category: {
        vegetables: [130, 180, 140],   // Green for vegetables
        fruits: [255, 200, 100],       // Orange for fruits
        dairy: [200, 220, 255],        // Light blue for dairy
        meat: [255, 180, 180],         // Light red for meat
        grains: [240, 210, 140],       // Yellow for grains
        general: [220, 220, 220]       // Gray for general items
      }
    };

    // Helper functions for colors
    const setColor = (colorArray: number[]) => {
      pdf.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
    };

    const setFillColor = (colorArray: number[]) => {
      pdf.setFillColor(colorArray[0], colorArray[1], colorArray[2]);
    };

    // Add green header background (same as meal plan)
    setFillColor(colors.primary);
    pdf.rect(0, 0, pageWidth, 60, 'F');

    // Add SmartPlates logo area with chef hat icon (exact match to meal plan)
    const logoY = 25;
    const logoX = pageWidth / 2 - 30;
    
    // Create simple chef hat icon (same as meal plan)
    setFillColor([255, 255, 255]);
    
    // Chef hat outline - simple and clean
    pdf.roundedRect(logoX, logoY - 2, 10, 6, 1, 1, 'F');
    pdf.roundedRect(logoX + 1, logoY - 6, 8, 5, 2, 2, 'F');
    pdf.rect(logoX - 1, logoY + 3, 12, 1, 'F');
    
    // Add SmartPlates text logo
    setColor([255, 255, 255]);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SmartPlates', logoX + 15, logoY + 2);

    // Add main title
    setColor([255, 255, 255]);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    
    const titleText = 'Shopping List';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, 40);

    // Add subtitle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const subtitleText = 'Your Smart Grocery List';
    const subtitleWidth = pdf.getTextWidth(subtitleText);
    pdf.text(subtitleText, (pageWidth - subtitleWidth) / 2, 50);

    // Add coral date bar
    setFillColor(colors.accent);
    pdf.rect(margin, 55, pageWidth - 2 * margin, 12, 'F');
    
    // Date text on coral bar
    setColor([255, 255, 255]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const dateText = `Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, (pageWidth - dateWidth) / 2, 63);

    // Group items by category
    const groupedItems = groceryList.reduce((groups: Record<string, any[]>, item) => {
      const category = item.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});

    // Sort categories to put common ones first
    const categoryOrder = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'General'];
    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    let yPosition = 75; // Start much closer to the header
    const itemHeight = 6; // Reduce item height to fit more items
    const categoryHeaderHeight = 12; // Reduce category header height

    // Add total items count
    setColor(colors.text.medium);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const totalItems = groceryList.length;
    const totalText = `Total Items: ${totalItems}`;
    pdf.text(totalText, margin, yPosition);
    yPosition += 10; // Reduce space after total items

    // Process each category
    sortedCategories.forEach((categoryName, categoryIndex) => {
      const items = groupedItems[categoryName];
      
      // Check if we need a new page for the whole category - be less aggressive
      const estimatedHeight = categoryHeaderHeight + (items.length * itemHeight) + 5;
      if (categoryIndex > 0 && yPosition + estimatedHeight > pageHeight - 25) { // Only break for subsequent categories
        pdf.addPage();
        yPosition = margin + 10;
      }

      // Category header with colored background
      const categoryColor = colors.category[categoryName.toLowerCase() as keyof typeof colors.category] || colors.category.general;
      setFillColor(categoryColor);
      pdf.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, categoryHeaderHeight - 2, 3, 3, 'F');

      // Category title
      setColor([255, 255, 255]);
      pdf.setFontSize(12); // Slightly smaller category title
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${categoryName} (${items.length} items)`, margin + 5, yPosition + 5);
      
      yPosition += categoryHeaderHeight;

      // Items in this category
      items.forEach((item, itemIndex) => {
        // Check if we need a new page for individual items - less aggressive
        if (yPosition + itemHeight + 5 > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin + 10;
        }

        // Alternating row background for readability
        if (itemIndex % 2 === 0) {
          setFillColor([248, 250, 248]);
          pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, itemHeight, 'F');
        }

        // Checkbox - draw a proper checkbox instead of Unicode symbol
        setColor(colors.text.dark);
        pdf.setLineWidth(0.3);
        
        // Draw checkbox square
        const checkboxSize = 3;
        const checkboxX = margin + 3;
        const checkboxY = yPosition - 1;
        
        pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');
        
        // If item is checked, add a checkmark
        if (item.checked) {
          pdf.setLineWidth(0.5);
          // Draw checkmark
          pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.2);
          pdf.line(checkboxX + 1.2, checkboxY + 2.2, checkboxX + 2.5, checkboxY + 0.8);
        }

        // Item details
        const amount = item.quantity || item.amount || '';
        const unit = item.unit || '';
        const name = item.name || 'Unknown item';
        
        // Format item text
        let itemText = name;
        if (amount && unit) {
          itemText = `${amount} ${unit} ${name}`;
        } else if (amount) {
          itemText = `${amount} ${name}`;
        }

        // Main item text
        setColor(colors.text.dark);
        pdf.setFontSize(10); // Slightly smaller font to fit more
        pdf.setFont('helvetica', 'normal');
        pdf.text(itemText, margin + 12, yPosition + 2);

        // Item notes or additional info (if available)
        if (item.notes) {
          setColor(colors.text.light);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.text(item.notes, margin + 12, yPosition + 4.5);
        }

        yPosition += itemHeight;
      });

      yPosition += 3; // Minimal space between categories
    });

    // Add summary section - don't force a new page, use available space
    yPosition += 10; // More space before summary for better separation
    // Remove the page break logic - let it flow naturally on the same page

    // Summary box - make it bigger to contain all text properly
    setFillColor(colors.background);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 5, 5, 'F');
    
    // Summary border
    setColor(colors.primary);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 5, 5, 'S');

    // Summary title
    setColor(colors.text.dark);
    pdf.setFontSize(12); // Smaller title
    pdf.setFont('helvetica', 'bold');
    pdf.text('Shopping Summary', margin + 8, yPosition + 8);

    // Summary details
    setColor(colors.text.medium);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const summaryLines = [
      `Total Categories: ${sortedCategories.length}`,
      `Total Items: ${totalItems}`,
      `Generated: ${new Date().toLocaleString('en-US')}`
    ];

    summaryLines.forEach((line, index) => {
      pdf.text(line, margin + 8, yPosition + 18 + (index * 6)); // More spacing between lines
    });

    // Add footer with SmartPlates branding (same as meal plan) - place it outside the summary box
    const footerY = pageHeight - 10;
    setColor(colors.text.light);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const footerText = `Generated by SmartPlates • ${new Date().toLocaleDateString('en-US')}`;
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, footerY);

    // Generate filename with clear grocery list identifier
    const pdfFilename = filename || `SmartPlates-GroceryList-${new Date().toISOString().split('T')[0]}.pdf`;

    // Save the PDF
    pdf.save(pdfFilename);
    
    console.log('✅ Professional grocery list PDF created successfully!');
    
  } catch (error) {
    console.error('❌ Grocery list PDF export failed:', error);
    throw new Error('Failed to export grocery list to PDF');
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