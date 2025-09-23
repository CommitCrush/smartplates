// src/utils/validators.ts

// Ingredient parsing helper
export type ParsedIngredient = {
    name: string;
    quantity: number;
    unit: string;
  };
  
  export function parseIngredient(raw: string): ParsedIngredient {
    // naive parsing: "200 g flour"
    const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s*(.+)$/;
    const match = raw.match(regex);
  
    if (!match) {
      return { name: raw.trim().toLowerCase(), quantity: 1, unit: '' };
    }
  
    return {
      quantity: parseFloat(match[1]),
      unit: match[2] || '',
      name: match[3].trim().toLowerCase(),
    };
  }
  