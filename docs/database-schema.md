# MongoDB Database Schema Documentation

## Overview

This document describes the MongoDB database schema for the SmartPlates application. The database is designed to be scalable, maintainable, and optimized for the meal planning and recipe management use cases.

## Database Structure

### Collections

- **users** - User accounts and profiles
- **recipes** - Recipe data and metadata
- **categories** - Recipe categories and organization
- **mealPlans** - User meal planning data (future)
- **groceryLists** - Generated shopping lists (future)

---

## Collection Schemas

### 1. Users Collection

**Collection Name:** `users`

**Purpose:** Stores user account information, preferences, and relationship data.

**Schema:**

```typescript
{
  _id: ObjectId,                    // Unique user identifier
  email: string,                    // User's email (unique index)
  name: string,                     // Display name
  avatar?: string,                  // Profile picture URL
  role: "user" | "admin" | "viewer", // User role
  
  // Authentication
  googleId?: string,                // Google OAuth ID
  isEmailVerified: boolean,         // Email verification status
  
  // Preferences
  dietaryRestrictions?: string[],   // ["vegetarian", "gluten-free"]
  favoriteCategories?: string[],    // Preferred recipe categories
  
  // Relationships
  savedRecipes: ObjectId[],         // Array of saved recipe IDs
  createdRecipes: ObjectId[],       // Array of user's created recipes
  
  // Timestamps
  createdAt: Date,                  // Account creation date
  updatedAt: Date,                  // Last profile update
  lastLoginAt?: Date                // Last login timestamp
}
```

**Indexes:**
- `email` (unique)
- `googleId` (unique, sparse)
- `createdAt`

**Example Document:**
```json
{
  "_id": "64f7b1e2c8e4a1b2c3d4e5f6",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "googleId": "google_123456789",
  "isEmailVerified": true,
  "dietaryRestrictions": ["vegetarian"],
  "favoriteCategories": ["64f7b1e2c8e4a1b2c3d4e5f7"],
  "savedRecipes": ["64f7b1e2c8e4a1b2c3d4e5f8"],
  "createdRecipes": ["64f7b1e2c8e4a1b2c3d4e5f9"],
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-07T15:45:00.000Z",
  "lastLoginAt": "2023-09-07T15:45:00.000Z"
}
```

---

### 2. Recipes Collection

**Collection Name:** `recipes`

**Purpose:** Stores recipe data, instructions, and metadata.

**Schema:**

```typescript
{
  _id: ObjectId,                    // Unique recipe identifier
  title: string,                    // Recipe name
  description: string,              // Short description
  
  // Recipe content
  ingredients: [{
    name: string,                   // "flour"
    quantity: number,               // 2
    unit: string,                   // "cups"
    notes?: string                  // "sifted"
  }],
  instructions: [{
    stepNumber: number,             // 1, 2, 3...
    instruction: string,            // "Mix flour and water"
    duration?: number,              // Minutes for this step
    temperature?: number            // Cooking temperature
  }],
  
  // Metadata
  difficulty: "easy" | "medium" | "hard",
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "dessert",
  servings: number,                 // Number of servings
  prepTime: number,                 // Preparation time in minutes
  cookTime: number,                 // Cooking time in minutes
  totalTime: number,                // Total time (calculated)
  
  // Media
  image?: string,                   // Main image URL
  images?: string[],                // Additional images
  video?: string,                   // Video URL
  
  // Organization
  categoryId: ObjectId,             // Reference to categories collection
  tags: string[],                   // ["vegetarian", "quick", "healthy"]
  
  // Ownership and visibility
  authorId: ObjectId,               // Reference to users collection
  isPublic: boolean,                // Public visibility
  
  // Social features
  rating?: number,                  // Average rating (0-5)
  ratingCount?: number,             // Number of ratings
  
  // Additional info
  nutrition?: {
    calories?: number,
    protein?: number,               // grams
    carbs?: number,                 // grams
    fat?: number,                   // grams
    fiber?: number                  // grams
  },
  notes?: string,                   // Additional cooking notes
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `authorId`
- `categoryId`
- `isPublic`
- `createdAt`
- `tags`
- `title` (text index for search)
- `description` (text index for search)

**Example Document:**
```json
{
  "_id": "64f7b1e2c8e4a1b2c3d4e5f8",
  "title": "Classic Spaghetti Carbonara",
  "description": "Traditional Italian pasta dish with eggs, cheese, and pancetta",
  "ingredients": [
    {
      "name": "spaghetti",
      "quantity": 400,
      "unit": "g",
      "notes": "dried"
    },
    {
      "name": "pancetta",
      "quantity": 150,
      "unit": "g",
      "notes": "diced"
    }
  ],
  "instructions": [
    {
      "stepNumber": 1,
      "instruction": "Cook spaghetti in salted boiling water until al dente",
      "duration": 10
    }
  ],
  "difficulty": "medium",
  "mealType": "dinner",
  "servings": 4,
  "prepTime": 10,
  "cookTime": 15,
  "totalTime": 25,
  "image": "https://example.com/carbonara.jpg",
  "categoryId": "64f7b1e2c8e4a1b2c3d4e5f7",
  "tags": ["italian", "pasta", "traditional"],
  "authorId": "64f7b1e2c8e4a1b2c3d4e5f6",
  "isPublic": true,
  "rating": 4.5,
  "ratingCount": 28,
  "nutrition": {
    "calories": 520,
    "protein": 22,
    "carbs": 65,
    "fat": 18
  },
  "createdAt": "2023-09-06T11:00:00.000Z",
  "updatedAt": "2023-09-06T11:00:00.000Z"
}
```

---

### 3. Categories Collection

**Collection Name:** `categories`

**Purpose:** Organizes recipes by cuisine type, dietary restrictions, or cooking style.

**Schema:**

```typescript
{
  _id: ObjectId,                    // Unique category identifier
  name: string,                     // Category name (unique)
  description?: string,             // Category description
  
  // Visual elements
  icon?: string,                    // Icon name or URL
  color?: string,                   // Color theme (#hex)
  image?: string,                   // Category banner image
  
  // Management
  isActive: boolean,                // Whether category is active
  sortOrder: number,                // Display order
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (unique)
- `isActive`
- `sortOrder`

**Example Document:**
```json
{
  "_id": "64f7b1e2c8e4a1b2c3d4e5f7",
  "name": "Italian",
  "description": "Traditional and modern Italian cuisine",
  "icon": "🇮🇹",
  "color": "#e74c3c",
  "image": "https://example.com/italian-category.jpg",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2023-09-06T09:00:00.000Z",
  "updatedAt": "2023-09-06T09:00:00.000Z"
}
```

---

## Relationships

### User → Recipes (One-to-Many)
- A user can create multiple recipes
- `recipes.authorId` references `users._id`
- Users have `createdRecipes` array for quick access

### User → Saved Recipes (Many-to-Many)
- Users can save multiple recipes
- `users.savedRecipes` contains array of recipe ObjectIds

### Category → Recipes (One-to-Many)
- A category can contain multiple recipes
- `recipes.categoryId` references `categories._id`

### Recipe → User (Many-to-One)
- Multiple recipes can belong to one user
- `recipes.authorId` references `users._id`

---

## Performance Considerations

### Indexes
All collections have appropriate indexes for common query patterns:
- **users**: email (unique), googleId (unique, sparse), createdAt
- **recipes**: authorId, categoryId, isPublic, createdAt, tags, text search
- **categories**: name (unique), isActive, sortOrder

### Query Optimization
- Use projection to limit returned fields for list views
- Implement pagination using `limit()` and `skip()`
- Use aggregation pipeline for complex queries with joins
- Cache frequently accessed data (categories, popular recipes)

### Data Denormalization
- `users.createdRecipes` array for quick access to user's recipes
- `users.savedRecipes` array for quick access to saved recipes
- Recipe cards use aggregation to join with user data for author names

---

## Migration and Seeding

### Initial Data
The application should seed the database with:
1. **Default Categories**: Italian, Mexican, Asian, Vegetarian, Desserts, etc.
2. **Admin User**: Default admin account for management
3. **Sample Recipes**: A few sample recipes for demonstration

### Data Validation
- All required fields are validated at the application level
- Email uniqueness is enforced with unique indexes
- ObjectId references are validated before insertion
- Input sanitization prevents injection attacks

---

## Backup and Maintenance

### Backup Strategy
- Daily automated backups of the entire database
- Incremental backups for large collections
- Point-in-time recovery capability

### Data Cleanup
- Soft delete for user accounts (mark as inactive)
- Hard delete for recipes only when requested by user
- Regular cleanup of unused media files

---

This schema is designed to be flexible and scalable, supporting future features like meal planning, grocery lists, and advanced social features while maintaining good performance for current requirements.
