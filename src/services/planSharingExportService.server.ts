/**
 * Plan Sharing & Export Service
 * 
 * Professional system for sharing meal plans via links, PDF export,
 * and print functionality with clean layouts
 */

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import type { IMealPlan } from '@/types/meal-planning';
import type { SavedMealPlan } from './savedMealPlansService.server';

export interface SharedPlan {
  _id?: string;
  planId: string; // Reference to SavedMealPlan or temporary plan
  userId: string;
  
  // Sharing configuration
  shareId: string; // Unique public identifier
  shareType: 'view-only' | 'copy-enabled' | 'collaborative';
  
  // Access controls
  isPasswordProtected: boolean;
  password?: string; // Hashed password if protected
  expiresAt?: Date; // Expiration date for temporary shares
  maxViews?: number; // Maximum number of views
  currentViews: number;
  
  // Permissions
  allowCopy: boolean;
  allowExport: boolean;
  allowComments: boolean;
  
  // Customization
  customTitle?: string;
  customDescription?: string;
  hiddenSections?: string[]; // sections to hide (grocery-list, notes, etc.)
  
  // Tracking
  viewHistory: ShareView[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
}

export interface ShareView {
  id: string;
  viewerIp?: string;
  userAgent?: string;
  viewedAt: Date;
  duration?: number; // viewing duration in seconds
}

export interface ExportOptions {
  format: 'pdf' | 'html' | 'json' | 'text';
  includeSections: {
    overview: boolean;
    dailyMeals: boolean;
    groceryList: boolean;
    cookingSchedule: boolean;
    notes: boolean;
    recipes: boolean;
  };
  layout: 'compact' | 'detailed' | 'print-friendly';
  theme: 'light' | 'dark' | 'colorful';
  paperSize?: 'A4' | 'Letter' | 'Legal';
  includeImages: boolean;
  includeNutrition: boolean;
}

export interface GeneratedExport {
  id: string;
  userId: string;
  planId: string;
  format: ExportOptions['format'];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  generatedAt: Date;
  expiresAt: Date;
}

export class PlanSharingExportService {
  private static SHARED_PLANS_COLLECTION = 'sharedMealPlans';
  private static EXPORTS_COLLECTION = 'planExports';
  private static MAX_SHARE_DURATION = 90; // days
  private static MAX_EXPORT_STORAGE = 7; // days

  /**
   * Create a shareable link for a meal plan
   */
  static async createShareLink(
    userId: string,
    planId: string,
    options: {
      shareType?: SharedPlan['shareType'];
      password?: string;
      expiresIn?: number; // days
      maxViews?: number;
      allowCopy?: boolean;
      allowExport?: boolean;
      allowComments?: boolean;
      customTitle?: string;
      customDescription?: string;
      hiddenSections?: string[];
    } = {}
  ): Promise<{ shareId: string; shareUrl: string }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SharedPlan>(this.SHARED_PLANS_COLLECTION);

      // Generate unique share ID
      const shareId = this.generateShareId();
      
      // Calculate expiration date
      const expiresAt = options.expiresIn 
        ? new Date(Date.now() + (options.expiresIn * 24 * 60 * 60 * 1000))
        : new Date(Date.now() + (this.MAX_SHARE_DURATION * 24 * 60 * 60 * 1000));

      const sharedPlan: Omit<SharedPlan, '_id'> = {
        planId,
        userId,
        shareId,
        shareType: options.shareType || 'view-only',
        isPasswordProtected: !!options.password,
        password: options.password ? await this.hashPassword(options.password) : undefined,
        expiresAt,
        maxViews: options.maxViews,
        currentViews: 0,
        allowCopy: options.allowCopy ?? true,
        allowExport: options.allowExport ?? true,
        allowComments: options.allowComments ?? false,
        customTitle: options.customTitle,
        customDescription: options.customDescription,
        hiddenSections: options.hiddenSections || [],
        viewHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await collection.insertOne(sharedPlan);

      const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/shared/meal-plan/${shareId}`;

      return { shareId, shareUrl };
    } catch (error) {
      console.error('Error creating share link:', error);
      throw new Error('Failed to create share link');
    }
  }

  /**
   * Get shared plan by share ID
   */
  static async getSharedPlan(
    shareId: string,
    viewerData?: {
      ip?: string;
      userAgent?: string;
    }
  ): Promise<{
    sharedPlan: SharedPlan;
    planData: SavedMealPlan | IMealPlan;
  } | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      
      const sharedPlansCol = db.collection<SharedPlan>(this.SHARED_PLANS_COLLECTION);
      const savedPlansCol = db.collection<SavedMealPlan>('savedMealPlans');

      // Get shared plan
      const sharedPlan = await sharedPlansCol.findOne({ shareId });
      if (!sharedPlan) return null;

      // Check if expired
      if (sharedPlan.expiresAt && sharedPlan.expiresAt < new Date()) {
        return null;
      }

      // Check view limit
      if (sharedPlan.maxViews && sharedPlan.currentViews >= sharedPlan.maxViews) {
        return null;
      }

      // Get plan data
      const planData = await savedPlansCol.findOne({
        _id: new ObjectId(sharedPlan.planId) as any
      });

      if (!planData) return null;

      // Record view
      if (viewerData) {
        await this.recordView(shareId, viewerData);
      }

      return {
        sharedPlan: {
          ...sharedPlan,
          _id: sharedPlan._id?.toString()
        },
        planData: {
          ...planData,
          _id: planData._id?.toString()
        }
      };
    } catch (error) {
      console.error('Error getting shared plan:', error);
      return null;
    }
  }

  /**
   * Verify password for protected share
   */
  static async verifySharePassword(
    shareId: string,
    password: string
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SharedPlan>(this.SHARED_PLANS_COLLECTION);

      const sharedPlan = await collection.findOne({ 
        shareId,
        isPasswordProtected: true 
      });

      if (!sharedPlan || !sharedPlan.password) {
        return false;
      }

      return await this.verifyPassword(password, sharedPlan.password);
    } catch (error) {
      console.error('Error verifying share password:', error);
      return false;
    }
  }

  /**
   * Export meal plan to various formats
   */
  static async exportPlan(
    userId: string,
    planId: string,
    options: ExportOptions
  ): Promise<GeneratedExport> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      
      const savedPlansCol = db.collection<SavedMealPlan>('savedMealPlans');
      const exportsCol = db.collection<GeneratedExport>(this.EXPORTS_COLLECTION);

      // Get plan data
      const planData = await savedPlansCol.findOne({
        _id: new ObjectId(planId) as any,
        userId
      });

      if (!planData) {
        throw new Error('Plan not found');
      }

      let exportResult: { fileUrl: string; fileName: string; fileSize: number };

      switch (options.format) {
        case 'pdf':
          exportResult = await this.generatePDF(planData, options);
          break;
        case 'html':
          exportResult = await this.generateHTML(planData, options);
          break;
        case 'json':
          exportResult = await this.generateJSON(planData, options);
          break;
        case 'text':
          exportResult = await this.generateText(planData, options);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Save export record
      const exportRecord: Omit<GeneratedExport, 'id'> = {
        userId,
        planId,
        format: options.format,
        fileUrl: exportResult.fileUrl,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        downloadCount: 0,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + (this.MAX_EXPORT_STORAGE * 24 * 60 * 60 * 1000))
      };

      const result = await exportsCol.insertOne({
        ...exportRecord,
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      return {
        ...exportRecord,
        id: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error exporting plan:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export plan');
    }
  }

  /**
   * Generate PDF export
   */
  private static async generatePDF(
    planData: SavedMealPlan,
    options: ExportOptions
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    // In a real implementation, you would use a PDF library like Puppeteer or jsPDF
    // For now, we'll create a placeholder
    
    const fileName = `meal-plan-${planData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;
    const fileUrl = `/exports/pdf/${fileName}`;
    
    // Simulate PDF generation
    const pdfContent = this.generatePDFContent(planData, options);
    const fileSize = pdfContent.length * 2; // Estimated PDF size
    
    // In production, save the actual PDF file to storage
    // await saveToStorage(fileName, pdfBuffer);
    
    return { fileUrl, fileName, fileSize };
  }

  /**
   * Generate HTML export
   */
  private static async generateHTML(
    planData: SavedMealPlan,
    options: ExportOptions
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const fileName = `meal-plan-${planData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.html`;
    const fileUrl = `/exports/html/${fileName}`;
    
    const htmlContent = this.generateHTMLContent(planData, options);
    const fileSize = new Blob([htmlContent]).size;
    
    // In production, save the HTML file to storage
    // await saveToStorage(fileName, htmlContent);
    
    return { fileUrl, fileName, fileSize };
  }

  /**
   * Generate JSON export
   */
  private static async generateJSON(
    planData: SavedMealPlan,
    options: ExportOptions
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const fileName = `meal-plan-${planData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`;
    const fileUrl = `/exports/json/${fileName}`;
    
    const jsonContent = JSON.stringify(planData, null, 2);
    const fileSize = new Blob([jsonContent]).size;
    
    return { fileUrl, fileName, fileSize };
  }

  /**
   * Generate Text export
   */
  private static async generateText(
    planData: SavedMealPlan,
    options: ExportOptions
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const fileName = `meal-plan-${planData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.txt`;
    const fileUrl = `/exports/text/${fileName}`;
    
    const textContent = this.generateTextContent(planData, options);
    const fileSize = new Blob([textContent]).size;
    
    return { fileUrl, fileName, fileSize };
  }

  /**
   * Generate PDF content
   */
  private static generatePDFContent(planData: SavedMealPlan, options: ExportOptions): string {
    let content = `MEAL PLAN: ${planData.name}\n\n`;
    
    if (planData.description && options.includeSections.overview) {
      content += `Description: ${planData.description}\n\n`;
    }

    if (options.includeSections.dailyMeals) {
      content += "DAILY MEALS\n";
      content += "============\n\n";
      
      planData.planData.days.forEach((day: any, index: number) => {
        content += `Day ${index + 1} - ${day.date.toLocaleDateString()}\n`;
        content += `Breakfast: ${day.breakfast.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        content += `Lunch: ${day.lunch.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        content += `Dinner: ${day.dinner.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        if (day.snacks.length > 0) {
          content += `Snacks: ${day.snacks.map((m: any) => m.recipeName).join(', ')}\n`;
        }
        content += "\n";
      });
    }

    return content;
  }

  /**
   * Generate HTML content
   */
  private static generateHTMLContent(planData: SavedMealPlan, options: ExportOptions): string {
    const theme = options.theme === 'dark' ? 'background: #1a1a1a; color: white;' : 'background: white; color: black;';
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${planData.name} - Meal Plan</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; ${theme} padding: 20px; }
        .header { border-bottom: 2px solid #22c55e; margin-bottom: 20px; }
        .day { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .meal-type { font-weight: bold; color: #22c55e; margin-bottom: 5px; }
        .meal-list { margin-left: 20px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${planData.name}</h1>
        ${planData.description ? `<p>${planData.description}</p>` : ''}
    </div>`;

    if (options.includeSections.dailyMeals) {
      planData.planData.days.forEach((day: any, index: number) => {
        html += `
    <div class="day">
        <h3>Day ${index + 1} - ${day.date.toLocaleDateString()}</h3>
        <div class="meal-type">Breakfast:</div>
        <div class="meal-list">${day.breakfast.map((m: any) => m.recipeName).join(', ') || 'Not planned'}</div>
        <div class="meal-type">Lunch:</div>
        <div class="meal-list">${day.lunch.map((m: any) => m.recipeName).join(', ') || 'Not planned'}</div>
        <div class="meal-type">Dinner:</div>
        <div class="meal-list">${day.dinner.map((m: any) => m.recipeName).join(', ') || 'Not planned'}</div>
        ${day.snacks.length > 0 ? `
        <div class="meal-type">Snacks:</div>
        <div class="meal-list">${day.snacks.map((m: any) => m.recipeName).join(', ')}</div>` : ''}
    </div>`;
      });
    }

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Generate text content
   */
  private static generateTextContent(planData: SavedMealPlan, options: ExportOptions): string {
    let content = `MEAL PLAN: ${planData.name}\n`;
    content += "=".repeat(planData.name.length + 12) + "\n\n";
    
    if (planData.description && options.includeSections.overview) {
      content += `${planData.description}\n\n`;
    }

    if (options.includeSections.dailyMeals) {
      content += "DAILY MEALS:\n\n";
      
      planData.planData.days.forEach((day: any, index: number) => {
        content += `Day ${index + 1} - ${day.date.toLocaleDateString()}\n`;
        content += "-".repeat(30) + "\n";
        content += `Breakfast: ${day.breakfast.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        content += `Lunch: ${day.lunch.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        content += `Dinner: ${day.dinner.map((m: any) => m.recipeName).join(', ') || 'Not planned'}\n`;
        if (day.snacks.length > 0) {
          content += `Snacks: ${day.snacks.map((m: any) => m.recipeName).join(', ')}\n`;
        }
        content += "\n";
      });
    }

    return content;
  }

  /**
   * Record a view for analytics
   */
  private static async recordView(
    shareId: string,
    viewerData: { ip?: string; userAgent?: string }
  ): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SharedPlan>(this.SHARED_PLANS_COLLECTION);

      const viewRecord: ShareView = {
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        viewerIp: viewerData.ip,
        userAgent: viewerData.userAgent,
        viewedAt: new Date()
      };

      await collection.updateOne(
        { shareId },
        {
          $inc: { currentViews: 1 },
          $push: { viewHistory: viewRecord },
          $set: { 
            lastAccessed: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }

  /**
   * Generate unique share ID
   */
  private static generateShareId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Hash password for protected shares
   */
  private static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or similar
    // For now, use simple base64 encoding (NOT SECURE)
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verify password
   */
  private static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // In production, use bcrypt.compare
    const hashed = Buffer.from(password).toString('base64');
    return hashed === hashedPassword;
  }

  /**
   * Get user's sharing statistics
   */
  static async getUserSharingStats(userId: string): Promise<{
    totalShares: number;
    totalViews: number;
    activeShares: number;
    topSharedPlans: Array<{ planName: string; views: number }>;
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SharedPlan>(this.SHARED_PLANS_COLLECTION);

      const now = new Date();

      const [stats] = await collection.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalShares: { $sum: 1 },
            totalViews: { $sum: '$currentViews' },
            activeShares: {
              $sum: {
                $cond: [
                  { $or: [
                    { $eq: ['$expiresAt', null] },
                    { $gt: ['$expiresAt', now] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray();

      // Get top shared plans (simplified)
      const topPlans = await collection
        .find({ userId })
        .sort({ currentViews: -1 })
        .limit(5)
        .toArray();

      return {
        totalShares: stats?.totalShares || 0,
        totalViews: stats?.totalViews || 0,
        activeShares: stats?.activeShares || 0,
        topSharedPlans: topPlans.map((plan: any) => ({
          planName: plan.customTitle || 'Unnamed Plan',
          views: plan.currentViews
        }))
      };
    } catch (error) {
      console.error('Error getting sharing stats:', error);
      return {
        totalShares: 0,
        totalViews: 0,
        activeShares: 0,
        topSharedPlans: []
      };
    }
  }
}