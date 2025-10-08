"use client";

import Image from 'next/image';
import type { Recipe } from '@/types/recipe';
import { useState, useEffect } from 'react';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { cn } from '@/lib/utils';

const categories = [
	'main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade', 'fingerfood', 'snack', 'drink'
];
const diets = [
	'', 'vegetarian', 'vegan', 'gluten free', 'ketogenic', 'pescetarian', 'paleo', 'primal', 'whole30'
];

export default function RecipeSearchFilter({ className }: { className?: string }) {
		const [query, setQuery] = useState('');
		const [category, setCategory] = useState('');
		const [diet, setDiet] = useState('');
		const [tags, setTags] = useState<string[]>([]);
		const [quick, setQuick] = useState(false);
		const { results, loading, error, searchRecipes } = useRecipeSearch();
			const [details, setDetails] = useState<Record<string, Partial<Recipe>>>({});

	// Helper: Handle Spoonacular images with direct loading
	function getImageConfig(url?: string) {
		if (!url || typeof url !== 'string') {
			return { src: '/placeholder-recipe.svg', useNextImage: true };
		}
		
		// For Spoonacular URLs: use direct loading to avoid 429 errors
		if (url.includes('spoonacular.com') || url.includes('img.spoonacular.com')) {
			return { src: url, useNextImage: false };
		}
		
		return { src: url, useNextImage: true };
	}

		useEffect(() => {
			async function fetchDetails() {
				if (results.length === 0) return;
			const promises = results.map(async (recipe: Recipe) => {
					const recipeId = recipe.id || recipe._id;
					if (!recipeId || !details[recipeId.toString()]) {
						const res = await fetch(`/api/recipes/spoonacular-details?id=${recipeId}`);
						const data = await res.json();
						return { id: recipeId?.toString(), title: data.title, description: data.summary };
					}
					return { id: recipeId?.toString(), title: details[recipeId.toString()]?.title, description: details[recipeId.toString()]?.description };
				});
				const allDetails = await Promise.all(promises);
			const newDetails: Record<string, Partial<Recipe>> = {};
				allDetails.forEach(d => {
					if (d && d.id) newDetails[d.id] = d;
				});
				setDetails(newDetails);
			}
			fetchDetails();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [results]);

				function handleSearch(e: React.FormEvent) {
					e.preventDefault();
					console.log('handleSearch called');
					// Filterwerte als Arrays und Strings wie vom Backend erwartet
					const params: {
						search?: string;
						category?: string;
						dietaryRestrictions?: string[];
						tags?: string[];
						maxTime?: number;
					} = {};
					if (query.trim()) params.search = query.trim();
					if (category) params.category = category;
					if (diet) params.dietaryRestrictions = diet ? [diet] : [];
					if (tags.length > 0) params.tags = tags.filter(Boolean);
					if (quick) params.maxTime = 20;
					console.log('Frontend Filter Params:', params);
					searchRecipes(params);
				}

	console.log("Frontend Filter Params:", { query, category, diet, tags });

	return (
		<section className={cn('bg-white dark:bg-neutral-900 rounded-lg p-6 shadow', className)}>
					<form className="flex flex-col gap-4" onSubmit={handleSearch}>
						<input
							type="text"
							placeholder="Suche nach Rezepten..."
							value={query}
							onChange={e => setQuery(e.target.value)}
							className="border rounded px-3 py-2 dark:bg-neutral-800"
						/>
						<select
							value={category}
							onChange={e => {
								setCategory(e.target.value);
								console.log('Kategorie geändert:', e.target.value);
							}}
							className="border rounded px-3 py-2 dark:bg-neutral-800"
						>
							<option value="">Kategorie wählen</option>
							{categories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
									<select
										value={diet}
										onChange={e => {
											setDiet(e.target.value);
											console.log('Diät geändert:', e.target.value);
										}}
										className="border rounded px-3 py-2 dark:bg-neutral-800"
									>
										<option value="">Diät wählen</option>
										{diets.map(d => (
											<option key={d} value={d}>{d || 'Keine Diät'}</option>
										))}
									</select>
									{/* Tags als Mehrfachauswahl */}
									<input
										type="text"
										placeholder="Tags (Komma getrennt)"
										value={tags.join(',')}
										onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
										className="border rounded px-3 py-2 dark:bg-neutral-800"
									/>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={quick}
								onChange={e => setQuick(e.target.checked)}
							/>
							Schnell & Einfach
						</label>
						<button
							type="submit"
							className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
						>
							Suchen
						</button>
					</form>
			<div className="mt-6">
				{loading && <div className="animate-pulse">Lade Rezepte...</div>}
				{error && <div className="text-red-500">{error}</div>}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
										{results.map((recipe: Recipe) => {
											const recipeId = recipe.id || recipe._id;
											const detail = recipeId ? details[recipeId.toString()] || {} : {};
											const imageConfig = getImageConfig(recipe.image);
											return (
												<div
													key={recipeId?.toString() || Math.random().toString()}
													className="bg-white shadow-md rounded-2xl overflow-hidden transition hover:scale-[1.02] dark:bg-neutral-900"
												>
													{imageConfig.useNextImage ? (
														<Image
															src={imageConfig.src}
															alt={detail.title || recipe.title || 'No title'}
															width={400}
															height={192}
															className="w-full h-48 object-cover"
															priority={false}
															placeholder="blur"
															blurDataURL="/placeholder-recipe.svg"
														/>
													) : (
														<img
															src={imageConfig.src}
															alt={detail.title || recipe.title || 'No title'}
															className="w-full h-48 object-cover"
															loading="lazy"
														/>
													)}
													<div className="p-4">
														<div className="flex items-center justify-between mb-2">
															<h2 className="text-lg font-bold text-gray-900 dark:text-white">{detail.title || recipe.title || 'Untitled'}</h2>
														</div>
														<p className="text-gray-600 text-sm line-clamp-3 dark:text-gray-300">
															{detail.description || 'No description available.'}
														</p>
														<div className="mt-4">
															<button
																className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
																onClick={() => window.open(`https://spoonacular.com/recipes/${detail.title?.replace(/\s+/g, '-') || recipe.title?.replace(/\s+/g, '-')}-${recipe.id}`, '_blank')}
															>
																View Recipe
															</button>
														</div>
													</div>
												</div>
											);
										})}
						</div>
			</div>
		</section>
	);
}
