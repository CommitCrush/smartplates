#!/bin/bash

# Public pages
echo 'export default function LoginPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Login</h1><p>Login form will be implemented here.</p></div>; }' > src/app/\(public\)/login/page.tsx

echo 'export default function RegisterPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Register</h1><p>Registration form will be implemented here.</p></div>; }' > src/app/\(public\)/register/page.tsx

echo 'export default function AboutPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">About</h1><p>About page content will be implemented here.</p></div>; }' > src/app/\(public\)/about/page.tsx

echo 'export default function ContactPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Contact</h1><p>Contact form will be implemented here.</p></div>; }' > src/app/\(public\)/contact/page.tsx

echo 'export default function RecipePage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Recipes</h1><p>Recipe list will be implemented here.</p></div>; }' > src/app/\(public\)/recipe/page.tsx

echo 'export default function CookwarePage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Cookware</h1><p>Cookware recommendations will be implemented here.</p></div>; }' > src/app/\(public\)/cookware/page.tsx

# User pages
echo 'export default function UserPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">User Dashboard</h1><p>User dashboard will be implemented here.</p></div>; }' > src/app/\(user\)/user/page.tsx

echo 'export default function UserCookwarePage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">My Cookware</h1><p>User cookware will be implemented here.</p></div>; }' > src/app/\(user\)/user/dashboard/cookware/page.tsx

echo 'export default function AIFeaturePage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">AI Features</h1><p>AI features will be implemented here.</p></div>; }' > src/app/\(user\)/user/dashboard/ai_feature/page.tsx

echo 'export default function SavedMealPlanPage() { return <div className="p-6"><h1 className="text-2xl font-bold mb-6">My Saved Meal Plans</h1><p>Saved meal plans will be implemented here.</p></div>; }' > src/app/\(user\)/user/dashboard/my_saved_meal_plan/page.tsx

echo 'interface RecipeDetailPageProps { params: Promise<{ id: string }>; } export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) { const { id } = await params; return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Recipe Details</h1><p>Recipe ID: {id}</p></div>; }' > src/app/\(user\)/user/dashboard/my_added_recipes/[id]/page.tsx

echo 'interface MealPlanDetailPageProps { params: Promise<{ id: string }>; } export default async function MealPlanDetailPage({ params }: MealPlanDetailPageProps) { const { id } = await params; return <div className="p-6"><h1 className="text-2xl font-bold mb-6">Meal Plan Details</h1><p>Meal Plan ID: {id}</p></div>; }' > src/app/\(user\)/user/dashboard/my_meal_plan/[id]/page.tsx

echo 'interface UserProfilePageProps { params: Promise<{ id: string }>; } export default async function UserProfilePage({ params }: UserProfilePageProps) { const { id } = await params; return <div className="p-6"><h1 className="text-2xl font-bold mb-6">User Profile</h1><p>User ID: {id}</p></div>; }' > src/app/\(user\)/user/profile/[id]/page.tsx

