// src/app/api/grocery-list/route.ts
import { NextResponse } from 'next/server';
import { generateGroceryList } from '@/services/recipeService';
import { getDb } from '@/lib/db';
import { jsPDF } from 'jspdf';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mealPlanId = url.searchParams.get('mealPlanId');
  const exportPdf = url.searchParams.get('export');

  if (!mealPlanId) {
    return NextResponse.json({ error: 'mealPlanId is required' }, { status: 400 });
  }

  // Removed redundant import statement


  const db = await getDb();
  const mealPlan = await db.collection('mealPlans').findOne({ _id: new ObjectId(mealPlanId) });

  if (!mealPlan) {
    return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
  }

  const list = await generateGroceryList(mealPlan);

  if (exportPdf === 'true') {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Grocery List', 10, 10);

    list.forEach((item, i) => {
      doc.text(`${item.name} - ${item.quantity} ${item.unit}`, 10, 20 + i * 8);
    });

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=grocery-list.pdf',
      },
    });
  }

  return NextResponse.json({ items: list });
}
