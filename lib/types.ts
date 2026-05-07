export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface FoodItem {
  id: string; name: string; estimated_grams: number; grams: number;
  calories_per_100g: number; protein_per_100g: number;
  fat_per_100g: number; carbs_per_100g: number; note: string;
}
export interface MealTotals { calories: number; protein: number; fat: number; carbs: number; }
export interface MealEntry {
  id: string; date: string; mealType: MealType; savedAt: string;
  imageUri: string | null; confidence: ConfidenceLevel;
  isAIEstimate: boolean; items: FoodItem[]; totals: MealTotals;
}
export interface WeightEntry { id: string; date: string; savedAt: string; weight: number; unit: 'kg'|'lbs'; note: string; }
export interface UserSettings {
  dailyCalorieGoal: number; dailyProteinGoal: number;
  dailyFatGoal: number; dailyCarbsGoal: number; weightUnit: 'kg'|'lbs';
}
export interface AnalysisResult {
  confidence: ConfidenceLevel;
  items: Array<{ name: string; estimated_grams: number; calories_per_100g: number;
    protein_per_100g: number; fat_per_100g: number; carbs_per_100g: number; note: string; }>;
}