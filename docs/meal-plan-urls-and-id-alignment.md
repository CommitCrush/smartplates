# Meal Plan URL and Recipe ID Alignment

Date: 2025-10-06

This document explains the new username-based meal-plan routes and how MealSlot recipe IDs are normalized to align with MongoDB Recipe records.

## Friendly URLs with Username

New routes:
- `/user/[username]/meal-plan/current` – resolves/creates the current week's meal plan and redirects to the plan ID.
- `/user/[username]/meal-plan/[id]` – reuses the existing MealPlanningPage.

Changes:
- Navbar, Profile dropdown, and Saved Meal Plans now link to username-based routes.
- We slugify the username to ensure safe URLs (see `slugify` in `src/lib/utils.ts`).
- The legacy `/user/meal-plan/current` still works and redirects with username.

## Recipe ID Normalization

When adding a recipe to a Meal Plan (Quick Add):
- The app calls `POST /api/recipes/resolve-id` with the source ID (spoonacular ID or other).
- The endpoint looks up an existing MongoDB Recipe by `_id`, `spoonacularId`, or `id` and returns a canonical `mongoId` when available.
- MealSlot stores `recipeId` as the canonical Mongo or a prefixed fallback (e.g., `spoonacular-123`).

Benefits:
- Clicking a planned meal can fetch its full details via `GET /api/recipes/[id]` regardless of source.
- Aligns Meal Plans with stored Recipe records for consistency.

## Files Touched (High-Level)
- New: `src/app/(user)/user/[username]/meal-plan/[id]/page.tsx`
- New: `src/app/(user)/user/[username]/meal-plan/current/page.tsx`
- Updated: `src/app/(user)/user/meal-plan/current/page.tsx` (redirect includes username)
- Updated: `src/components/layout/Navbar.tsx` (links use username slug)
- Updated: `src/components/layout/UserProfileDropdown.tsx` (links use username slug; Saved plans link)
- Updated: `src/app/(user)/user/my_saved_meal_plan/page.tsx` (links include username slug)
- New: `src/app/api/recipes/resolve-id/route.ts` (ID normalization endpoint)
- Updated: `src/app/(user)/user/meal-plan/[id]/page.tsx` and legacy `my_meal_plan` equivalent to resolve recipe IDs and map ingredients consistently.

## Notes
- No schema changes required.
- Existing non-username routes remain as fallbacks.
- Next steps: add E2E tests for redirects and ensure all internal links point to the new namespace.
