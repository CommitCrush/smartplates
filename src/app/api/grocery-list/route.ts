// src/app/api/grocery-list/route.ts
import { NextResponse } from 'next/server';
import { generateGroceryList } from '@/services/recipeService';
import { 
  generateGroceryListFromMealPlan, 
  saveGroceryList,
  updateGroceryItemStatus 
} from '@/services/groceryListService';
import { connectToDatabase } from '@/lib/db';
import { jsPDF } from 'jspdf';
import { ObjectId } from 'mongodb';
import { GroceryListOptions } from '@/types/mealplan';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mealPlanId = url.searchParams.get('mealPlanId');
    const exportFormat = url.searchParams.get('export'); // 'pdf', 'text', or 'json'
    const includeEstimates = url.searchParams.get('includeEstimates') === 'true';
    const categorizeItems = url.searchParams.get('categorizeItems') === 'true';
    const excludeStaples = url.searchParams.get('excludeStaples') === 'true';

    if (!mealPlanId) {
      return NextResponse.json({ error: 'mealPlanId is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const mealPlan = await db.collection('mealPlans').findOne({ _id: new ObjectId(mealPlanId) });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Options for grocery list generation
    const options: GroceryListOptions = {
      includeEstimates,
      categorizeItems: categorizeItems || true, // Default to true
      mergeSimilarItems: true,
      excludeStaples
    };

    // Generate enhanced grocery list
    const groceryList = await generateGroceryListFromMealPlan(mealPlan, options);

    // Handle export formats
    if (exportFormat === 'pdf') {
      return generatePDFExport(groceryList, options);
    }
    
    if (exportFormat === 'text') {
      return generateTextExport(groceryList, options);
    }

    // Default JSON response
    return NextResponse.json({
      groceryList,
      // Legacy compatibility
      items: groceryList.items.map(item => ({
        name: item.displayName,
        quantity: item.quantity,
        unit: item.unit
      }))
    });

  } catch (error) {
    console.error('Error generating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to generate grocery list' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mealPlanId, save, options } = body;

    if (!mealPlanId) {
      return NextResponse.json({ error: 'mealPlanId is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const mealPlan = await db.collection('mealPlans').findOne({ _id: new ObjectId(mealPlanId) });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    const groceryList = await generateGroceryListFromMealPlan(mealPlan, options || {});

    // Save to database if requested
    if (save) {
      const savedList = await saveGroceryList(groceryList);
      return NextResponse.json({ groceryList: savedList });
    }

    return NextResponse.json({ groceryList });

  } catch (error) {
    console.error('Error creating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to create grocery list' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const groceryListId = url.searchParams.get('id');
    const body = await req.json();
    const { itemName, isPurchased } = body;

    if (!groceryListId) {
      return NextResponse.json({ error: 'Grocery list ID is required' }, { status: 400 });
    }

    if (!itemName || isPurchased === undefined) {
      return NextResponse.json({ 
        error: 'itemName and isPurchased are required' 
      }, { status: 400 });
    }

    const updatedList = await updateGroceryItemStatus(groceryListId, itemName, isPurchased);

    if (!updatedList) {
      return NextResponse.json({ error: 'Grocery list not found' }, { status: 404 });
    }

    return NextResponse.json({ groceryList: updatedList });

  } catch (error) {
    console.error('Error updating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to update grocery list' }, 
      { status: 500 }
    );
  }
}

// Helper function to generate PDF export
function generatePDFExport(groceryList: any, options: GroceryListOptions) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(groceryList.name, 10, 20);
  
  // Metadata
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 30);
  doc.text(`Total Items: ${groceryList.itemsCount}`, 10, 35);
  
  if (options.includeEstimates && groceryList.totalEstimatedCost) {
    doc.text(`Estimated Cost: $${groceryList.totalEstimatedCost.toFixed(2)}`, 10, 40);
  }

  let yPosition = 50;
  
  if (options.categorizeItems && Object.keys(groceryList.categories).length > 0) {
    // Group by categories
    Object.entries(groceryList.categories).forEach(([category, items]) => {
      // Category header
      doc.setFontSize(14);
      doc.text(category, 10, yPosition);
      yPosition += 8;
      
      // Category items
      doc.setFontSize(10);
      (items as any[]).forEach((item) => {
        const checkBox = item.isPurchased ? '☑' : '☐';
        const costText = options.includeEstimates && item.estimatedCost 
          ? ` ($${item.estimatedCost.toFixed(2)})` 
          : '';
        
        doc.text(
          `${checkBox} ${item.displayName} - ${item.quantity} ${item.unit}${costText}`, 
          15, 
          yPosition
        );
        yPosition += 6;
        
        // Start new page if needed
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      yPosition += 5; // Space between categories
    });
  } else {
    // Simple list
    doc.setFontSize(10);
    groceryList.items.forEach((item: any) => {
      const checkBox = item.isPurchased ? '☑' : '☐';
      const costText = options.includeEstimates && item.estimatedCost 
        ? ` ($${item.estimatedCost.toFixed(2)})` 
        : '';
      
      doc.text(
        `${checkBox} ${item.displayName} - ${item.quantity} ${item.unit}${costText}`, 
        10, 
        yPosition
      );
      yPosition += 6;
      
      // Start new page if needed
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }

  const pdfBytes = doc.output('arraybuffer');
  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${groceryList.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
    },
  });
}

// Helper function to generate text export
function generateTextExport(groceryList: any, options: GroceryListOptions) {
  let text = `${groceryList.name}\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n`;
  text += `Total Items: ${groceryList.itemsCount}\n`;
  
  if (options.includeEstimates && groceryList.totalEstimatedCost) {
    text += `Estimated Cost: $${groceryList.totalEstimatedCost.toFixed(2)}\n`;
  }
  
  text += '\n';
  
  if (options.categorizeItems && Object.keys(groceryList.categories).length > 0) {
    Object.entries(groceryList.categories).forEach(([category, items]) => {
      text += `${category}:\n`;
      (items as any[]).forEach((item) => {
        const checkBox = item.isPurchased ? '[x]' : '[ ]';
        const costText = options.includeEstimates && item.estimatedCost 
          ? ` ($${item.estimatedCost.toFixed(2)})` 
          : '';
        
        text += `  ${checkBox} ${item.displayName} - ${item.quantity} ${item.unit}${costText}\n`;
      });
      text += '\n';
    });
  } else {
    groceryList.items.forEach((item: any) => {
      const checkBox = item.isPurchased ? '[x]' : '[ ]';
      const costText = options.includeEstimates && item.estimatedCost 
        ? ` ($${item.estimatedCost.toFixed(2)})` 
        : '';
      
      text += `${checkBox} ${item.displayName} - ${item.quantity} ${item.unit}${costText}\n`;
    });
  }

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${groceryList.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`,
    },
  });
}
