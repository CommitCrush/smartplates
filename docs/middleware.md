# Authentication Middleware Documentation

## Overview

This document explains how to use the authentication middleware in SmartPlates. The middleware provides a clean, reusable way to protect API routes and ensure proper user authentication and authorization.

## Key Concepts

### 1. Authentication vs Authorization
- **Authentication**: Verifying who the user is (valid token, user exists)
- **Authorization**: Verifying what the user can do (role-based permissions)

### 2. Protection Levels
- **Public**: No authentication required
- **User**: Requires valid user login
- **Admin**: Requires valid admin login
- **Optional**: Works with or without authentication (shows different content)

---

## Available Middleware Functions

### Core Functions

#### `authenticateToken(request: NextRequest): Promise<AuthResult>`
**Purpose**: Validates JWT token and returns user data

**Usage**:
```typescript
const authResult = await authenticateToken(request);
if (authResult.success) {
  // User is authenticated
  const user = authResult.user;
}
```

#### `requireAuth(request: NextRequest): Promise<NextResponse | null>`
**Purpose**: Middleware to require authentication

**Usage**:
```typescript
export async function GET(request: NextRequest) {
  const authCheck = await requireAuth(request);
  if (authCheck) return authCheck; // Return error response
  
  // User is authenticated, continue with handler
}
```

#### `requireAdmin(request: NextRequest): Promise<NextResponse | null>`
**Purpose**: Middleware to require admin role

**Usage**:
```typescript
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck; // Return error response
  
  // User is admin, continue with handler
}
```

#### `optionalAuth(request: NextRequest): Promise<AuthResult>`
**Purpose**: Optional authentication for public routes

**Usage**:
```typescript
export async function GET(request: NextRequest) {
  const authResult = await optionalAuth(request);
  
  if (authResult.success) {
    // Show personalized content
  } else {
    // Show public content
  }
}
```

### Higher-Order Function

#### `withAuth(handler, requireAdminRole?)`
**Purpose**: Wraps API handlers with authentication

**Usage**:
```typescript
// Regular user protection
async function getUserProfile(request: AuthenticatedRequest, user: User) {
  // Handler receives authenticated request and user data
  return NextResponse.json({ user });
}
export const GET = withAuth(getUserProfile);

// Admin-only protection
async function deleteUser(request: AuthenticatedRequest, user: User) {
  // Only admins can access this
  return NextResponse.json({ success: true });
}
export const DELETE = withAuth(deleteUser, true);
```

---

## Implementation Examples

### 1. Public Route (No Authentication)
```typescript
// /api/recipes/route.ts
export async function GET(request: NextRequest) {
  // Anyone can access this
  const recipes = await getPublicRecipes();
  return NextResponse.json({ recipes });
}
```

### 2. User-Protected Route
```typescript
// /api/user/profile/route.ts
import { withAuth } from '@/middleware/authMiddleware';

async function getProfile(request: AuthenticatedRequest, user: User) {
  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      savedRecipes: user.savedRecipes
    }
  });
}

export const GET = withAuth(getProfile);
```

### 3. Admin-Only Route
```typescript
// /api/admin/users/route.ts
import { withAuth } from '@/middleware/authMiddleware';

async function getAllUsers(request: AuthenticatedRequest, user: User) {
  // Only admins can access this
  const users = await getAllUsersFromDB();
  return NextResponse.json({ users });
}

export const GET = withAuth(getAllUsers, true); // true = requires admin
```

### 4. Mixed Access Route (Own Profile or Admin)
```typescript
// /api/users/[id]/route.ts
import { withAuth } from '@/middleware/authMiddleware';

async function getUserById(request: AuthenticatedRequest, user: User) {
  const userId = request.url.split('/').pop();
  
  // Check if user is admin or accessing their own profile
  const isAdmin = user.role === 'admin';
  const isOwnProfile = user._id?.toString() === userId;
  
  if (!isAdmin && !isOwnProfile) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  const targetUser = await findUserById(userId);
  return NextResponse.json({ user: targetUser });
}

export const GET = withAuth(getUserById);
```

### 5. Optional Authentication Route
```typescript
// /api/recipes/route.ts
import { optionalAuth } from '@/middleware/authMiddleware';

export async function GET(request: NextRequest) {
  const authResult = await optionalAuth(request);
  
  let recipes;
  if (authResult.success) {
    // Show personalized recipes including user's private recipes
    recipes = await getPersonalizedRecipes(authResult.user!._id);
  } else {
    // Show only public recipes
    recipes = await getPublicRecipes();
  }
  
  return NextResponse.json({
    recipes,
    isAuthenticated: authResult.success
  });
}
```

---

## Token Management

### How Tokens Are Handled
1. **Authorization Header**: `Bearer <token>`
2. **Cookies**: `auth-token` cookie (fallback)

### Token Validation
- JWT tokens are verified using the `JWT_SECRET` environment variable
- Tokens contain `userId` and `email` claims
- User data is fetched from database on each request (ensures fresh data)

### Example Token Usage in Frontend
```typescript
// Login response sets token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
const protectedResponse = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Error Responses

### 401 Unauthorized
**When**: No token provided, invalid token, or user not found
```json
{
  "error": "Authentication required",
  "message": "No authentication token provided"
}
```

### 403 Forbidden
**When**: User is authenticated but lacks required permissions
```json
{
  "error": "Admin access required",
  "message": "You do not have permission to access this resource"
}
```

### 429 Too Many Requests
**When**: Rate limit exceeded
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

---

## Utility Functions

### CORS Handling
```typescript
import { handleCors, createCorsHeaders } from '@/middleware/authMiddleware';

export async function GET(request: NextRequest) {
  // Handle preflight requests
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  // Your handler logic here
  return NextResponse.json(data, {
    headers: createCorsHeaders()
  });
}
```

### Rate Limiting
```typescript
import { rateLimit } from '@/middleware/authMiddleware';

export async function POST(request: NextRequest) {
  // Apply rate limiting (100 requests per 15 minutes)
  const rateLimitResponse = rateLimit(request, 100, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Your handler logic here
}
```

---

## Best Practices

### 1. Always Use Type Safety
```typescript
// Good: Use AuthenticatedRequest type
async function handler(request: AuthenticatedRequest, user: User) {
  // TypeScript knows about user property
}

// Bad: Use regular NextRequest
async function handler(request: NextRequest) {
  // No type safety for user data
}
```

### 2. Validate Input Data
```typescript
async function createRecipe(request: AuthenticatedRequest, user: User) {
  const data = await request.json();
  
  // Validate required fields
  if (!data.title || !data.description) {
    return NextResponse.json(
      { error: 'Title and description are required' },
      { status: 400 }
    );
  }
  
  // Continue with creation
}
```

### 3. Use Appropriate Protection Level
```typescript
// Public data - no auth needed
export const GET = publicHandler;

// User data - user auth required
export const POST = withAuth(createUserContent);

// Admin data - admin auth required
export const DELETE = withAuth(deleteUser, true);
```

### 4. Handle Permissions Granularly
```typescript
async function updateUser(request: AuthenticatedRequest, user: User) {
  const targetUserId = getIdFromUrl(request.url);
  const updateData = await request.json();
  
  const isAdmin = user.role === 'admin';
  const isOwnProfile = user._id?.toString() === targetUserId;
  
  if (!isAdmin && !isOwnProfile) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // Restrict what non-admins can update
  if (!isAdmin) {
    delete updateData.role;
    delete updateData.isEmailVerified;
  }
  
  // Proceed with update
}
```

---

## Testing Protected Routes

### Using curl
```bash
# Get token first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Use token in protected request
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript
```javascript
// Test protected route
async function testProtectedRoute() {
  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Protected data:', data);
    } else {
      console.log('Access denied:', response.status);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

---

This middleware provides a robust, scalable foundation for API security in SmartPlates. It's designed to be beginner-friendly while maintaining production-level security standards.
