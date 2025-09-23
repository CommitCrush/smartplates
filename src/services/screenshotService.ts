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

    // Restore original styling
    element.style.cssText = originalStyle;

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