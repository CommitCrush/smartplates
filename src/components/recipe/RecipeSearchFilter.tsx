"use client";

import Image from 'next/image';
import type { Recipe } from '@/types/recipe';

// ...existing code...
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

		useEffect(() => {
			async function fetchDetails() {
				if (results.length === 0) return;
			const promises = results.map(async (recipe: Recipe) => {
					if (!details[recipe.id]) {
						const res = await fetch(`/api/recipes/spoonacular-details?id=${recipe.id}`);
						const data = await res.json();
						return { id: recipe.id, title: data.title, description: data.summary };
					}
					return { id: recipe.id, title: details[recipe.id]?.title, description: details[recipe.id]?.description };
				});
				const allDetails = await Promise.all(promises);
			const newDetails: Record<string, Partial<Recipe>> = {};
				allDetails.forEach(d => {
					if (d) newDetails[d.id] = d;
				});
				setDetails(newDetails);
			}
			fetchDetails();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [results]);

			function handleSearch(e: React.FormEvent) {
				e.preventDefault();
				// Diät-Wert ggf. umwandeln (z.B. 'gluten free' → 'gluten-free')
				const normalizedDiet = diet.replace(' ', '-');
				searchRecipes({
					q: query,
					category,
					diet: normalizedDiet,
					tags,
					quick
				});
			}

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
							onChange={e => setCategory(e.target.value)}
							className="border rounded px-3 py-2 dark:bg-neutral-800"
						>
							<option value="">Kategorie wählen</option>
							{categories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
									<select
										value={diet}
										onChange={e => setDiet(e.target.value)}
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
											const detail = details[recipe.id] || {};
											return (
												<div
													key={recipe.id || recipe._id}
													className="bg-white shadow-md rounded-2xl overflow-hidden transition hover:scale-[1.02] dark:bg-neutral-900"
												>
																	<Image
																		src={recipe.image || '/placeholder.jpg'}
																		alt={detail.title || recipe.title || 'No title'}
																		width={400}
																		height={192}
																		className="w-full h-48 object-cover"
																		priority={false}
																		placeholder="blur"
																		blurDataURL="/placeholder.jpg"
																	/>
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
