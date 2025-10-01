/**
 * Screenshot Service for Meal Plans
 * 
 * Captures screenshots of the meal planning interface
 * Uses html2canvas for client-side screenshot generation
 */

// Interface for screenshot options
interface ScreenshotOptions {
  filename?: string;
  format?: 'png' | 'jpeg';
  quality?: number;
  includeBackground?: boolean;
  scale?: number;
}

/**
 * Capture screenshot of meal planning calendar
 */
export async function captureWeeklyCalendarScreenshot(
  elementSelector: string = '.weekly-calendar-container',
  options: ScreenshotOptions = {}
): Promise<{ success: boolean; error?: string; filename?: string }> {
  const {
    filename = `meal-plan-${new Date().toISOString().split('T')[0]}.png`,
    format = 'png',
    quality = 0.95,
    includeBackground = true,
    scale = 2
  } = options;

  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;
    
    if (!html2canvas) {
      throw new Error('html2canvas library failed to load');
    }
    
    // Find the element to capture
    const element = document.querySelector(elementSelector) as HTMLElement;
    
    if (!element) {
      return {
        success: false,
        error: `Element with selector "${elementSelector}" not found`
      };
    }

    // Add temporary styling for better screenshot
    const originalStyle = element.style.cssText;
    element.style.background = includeBackground ? '#ffffff' : 'transparent';
    element.style.padding = '20px';
    element.style.borderRadius = '8px';
    
    // Fix CSS lab() color issues by temporarily replacing with supported colors
    const tempStyleSheet = document.createElement('style');
    tempStyleSheet.textContent = `
      * {
        color: rgb(0, 0, 0) !important;
        background-color: rgb(255, 255, 255) !important;
        border-color: rgb(229, 231, 235) !important;
      }
      .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
      .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
      .text-gray-500 { color: rgb(107, 114, 128) !important; }
      .text-gray-600 { color: rgb(75, 85, 99) !important; }
      .text-gray-900 { color: rgb(17, 24, 39) !important; }
      .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
      .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
    `;
    document.head.appendChild(tempStyleSheet);
    
    // Capture the screenshot
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: includeBackground ? '#ffffff' : null,
      removeContainer: true,
      imageTimeout: 5000,
      logging: false,
      ignoreElements: (element) => {
        // Ignore certain elements that might cause issues
        return element.classList.contains('ignore-screenshot');
      },
      onclone: (clonedDoc) => {
        // Remove any interactive elements in the clone
        const buttons = clonedDoc.querySelectorAll('button');
        buttons.forEach(btn => {
          if (btn.textContent?.includes('Add') || btn.textContent?.includes('+')) {
            btn.style.display = 'none';
          }
        });
      }
    });

    // Restore original styling and remove temp stylesheet
    element.style.cssText = originalStyle;
    if (tempStyleSheet && tempStyleSheet.parentNode) {
      tempStyleSheet.parentNode.removeChild(tempStyleSheet);
    }

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, `image/${format}`, quality);
    });

    // Download the image
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename
    };

  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return {
      success: false,
      error: `Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Capture screenshot of monthly calendar
 */
export async function captureMonthlyCalendarScreenshot(
  options: ScreenshotOptions = {}
): Promise<{ success: boolean; error?: string; filename?: string }> {
  return captureWeeklyCalendarScreenshot('.monthly-calendar-container', {
    ...options,
    filename: options.filename || `monthly-meal-plan-${new Date().toISOString().split('T')[0]}.png`
  });
}

/**
 * Capture screenshot of today view
 */
export async function captureTodayViewScreenshot(
  options: ScreenshotOptions = {}
): Promise<{ success: boolean; error?: string; filename?: string }> {
  return captureWeeklyCalendarScreenshot('.today-view-container', {
    ...options,
    filename: options.filename || `today-meal-plan-${new Date().toISOString().split('T')[0]}.png`
  });
}

/**
 * Capture screenshot of full meal planning page
 */
export async function captureFullPageScreenshot(
  options: ScreenshotOptions = {}
): Promise<{ success: boolean; error?: string; filename?: string }> {
  return captureWeeklyCalendarScreenshot('.meal-planning-page', {
    ...options,
    filename: options.filename || `full-meal-plan-${new Date().toISOString().split('T')[0]}.png`,
    scale: 1.5 // Lower scale for full page to manage size
  });
}