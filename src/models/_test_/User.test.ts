import {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByGoogleId,
  updateUser,
  deleteUser,
  getAllUsers,
  getPublicUserProfile,
  saveRecipeForUser,
  removeSavedRecipeForUser,
  verifyEmailToken,
  generateEmailVerificationToken,
  generateToken
} from '../User';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { hashPassword } from '@/utils/password';
import { ObjectId } from 'mongodb';
import { CreateUserInput, UpdateUserInput, User } from '@/types/user';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/utils/password');
jest.mock('jsonwebtoken');

const mockGetCollection = getCollection as jest.MockedFunction<typeof getCollection>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('User Model Tests', () => {
  let mockCollection: any;
  let mockUser: User;
  let mockUserId: ObjectId;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock user data
    mockUserId = new ObjectId();
    mockUser = {
      _id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: false,
      dietaryRestrictions: [],
      favoriteCategories: [],
      savedRecipes: [],
      createdRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Setup mock collection
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    };

    mockGetCollection.mockResolvedValue(mockCollection);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserInput = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user'
      };

      const insertResult = { insertedId: mockUserId };
      mockCollection.insertOne.mockResolvedValue(insertResult);

      const result = await createUser(userData);

      expect(mockGetCollection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(result._id).toBe(mockUserId);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe('user');
      expect(result.isEmailVerified).toBe(false);
    });

    it('should hash password when provided', async () => {
      const userData: CreateUserInput = {
        email: 'user@example.com',
        name: 'User',
        password: 'plainPassword'
      };

      const hashedPassword = 'hashedPassword123';
      mockHashPassword.mockResolvedValue(hashedPassword);
      mockCollection.insertOne.mockResolvedValue({ insertedId: mockUserId });

      const result = await createUser(userData);

      expect(mockHashPassword).toHaveBeenCalledWith('plainPassword');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword
        })
      );
    });

    it('should set googleId when provided', async () => {
      const userData: CreateUserInput = {
        email: 'google@example.com',
        name: 'Google User',
        googleId: 'google123'
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: mockUserId });

      await createUser(userData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          googleId: 'google123'
        })
      );
    });

    it('should handle database errors', async () => {
      const userData: CreateUserInput = {
        email: 'error@example.com',
        name: 'Error User'
      };

      mockCollection.insertOne.mockRejectedValue(new Error('Database error'));

      await expect(createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findUserById', () => {
    it('should find user by ObjectId', async () => {
      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await findUserById(mockUserId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: mockUserId
      });
      expect(result).toBe(mockUser);
    });

    it('should find user by string ID', async () => {
      const stringId = mockUserId.toString();
      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await findUserById(stringId);

      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await findUserById(mockUserId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));

      await expect(findUserById(mockUserId)).rejects.toThrow('Failed to find user');
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email (case insensitive)', async () => {
      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await findUserByEmail('TEST@EXAMPLE.COM');

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await findUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));

      await expect(findUserByEmail('error@example.com')).rejects.toThrow('Failed to find user');
    });
  });

  describe('findUserByGoogleId', () => {
    it('should find user by Google ID', async () => {
      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await findUserByGoogleId('google123');

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        googleId: 'google123'
      });
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await findUserByGoogleId('notfound');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUserInput = {
        name: 'Updated Name',
        dietaryRestrictions: ['vegetarian']
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockCollection.findOneAndUpdate.mockResolvedValue(updatedUser);

      const result = await updateUser(mockUserId, updateData);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $set: expect.objectContaining({
            ...updateData,
            updatedAt: expect.any(Date)
          })
        },
        { returnDocument: 'after' }
      );
      expect(result).toBe(updatedUser);
    });

    it('should return null when user not found', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const result = await updateUser(mockUserId, { name: 'New Name' });

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      await expect(updateUser(mockUserId, { name: 'Error' })).rejects.toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteUser(mockUserId);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: mockUserId
      });
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await deleteUser(mockUserId);

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockCollection.deleteOne.mockRejectedValue(new Error('Database error'));

      await expect(deleteUser(mockUserId)).rejects.toThrow('Failed to delete user');
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with default pagination', async () => {
      const users = [mockUser, { ...mockUser, _id: new ObjectId() }];
      mockCollection.toArray.mockResolvedValue(users);

      const result = await getAllUsers();

      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockCollection.limit).toHaveBeenCalledWith(50);
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(result).toBe(users);
    });

    it('should get users with custom pagination', async () => {
      const users = [mockUser];
      mockCollection.toArray.mockResolvedValue(users);

      const result = await getAllUsers(10, 20);

      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.skip).toHaveBeenCalledWith(20);
      expect(result).toBe(users);
    });

    it('should handle database errors', async () => {
      mockCollection.toArray.mockRejectedValue(new Error('Database error'));

      await expect(getAllUsers()).rejects.toThrow('Failed to get users');
    });
  });

  describe('getPublicUserProfile', () => {
    it('should get public user profile', async () => {
      const publicProfile = {
        _id: mockUserId,
        name: mockUser.name,
        avatar: mockUser.avatar,
        createdRecipes: mockUser.createdRecipes,
        createdAt: mockUser.createdAt
      };

      mockCollection.findOne.mockResolvedValue(publicProfile);

      const result = await getPublicUserProfile(mockUserId);

      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          projection: {
            _id: 1,
            name: 1,
            avatar: 1,
            createdRecipes: 1,
            createdAt: 1
          }
        }
      );
      expect(result).toBe(publicProfile);
    });

    it('should return null when user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await getPublicUserProfile(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('saveRecipeForUser', () => {
    it('should save recipe for user', async () => {
      const recipeId = new ObjectId();
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await saveRecipeForUser(mockUserId, recipeId);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $addToSet: { savedRecipes: recipeId },
          $set: { updatedAt: expect.any(Date) }
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await saveRecipeForUser(mockUserId, new ObjectId());

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockCollection.updateOne.mockRejectedValue(new Error('Database error'));

      await expect(saveRecipeForUser(mockUserId, new ObjectId())).rejects.toThrow('Failed to save recipe');
    });
  });

  describe('removeSavedRecipeForUser', () => {
    it('should remove saved recipe for user', async () => {
      const recipeId = new ObjectId();
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await removeSavedRecipeForUser(mockUserId, recipeId);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $pull: { savedRecipes: recipeId },
          $set: { updatedAt: expect.any(Date) }
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when recipe not found', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await removeSavedRecipeForUser(mockUserId, new ObjectId());

      expect(result).toBe(false);
    });
  });

  describe('verifyEmailToken', () => {
    it('should verify email token successfully', async () => {
      const token = 'valid-token';
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      mockCollection.findOneAndUpdate.mockResolvedValue(verifiedUser);

      const result = await verifyEmailToken(token);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        {
          emailVerificationToken: token,
          emailVerificationExpires: { $gt: expect.any(Date) }
        },
        {
          $set: {
            isEmailVerified: true,
            updatedAt: expect.any(Date)
          },
          $unset: {
            emailVerificationToken: "",
            emailVerificationExpires: ""
          }
        },
        { returnDocument: 'after' }
      );
      expect(result).toBe(verifiedUser);
    });

    it('should return null for invalid token', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const result = await verifyEmailToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      const result = await verifyEmailToken('error-token');

      expect(result).toBeNull();
    });
  });

  describe('generateEmailVerificationToken', () => {
    beforeEach(() => {
      // Mock crypto.randomBytes
      global.crypto = {
        randomBytes: jest.fn().mockReturnValue({
          toString: jest.fn().mockReturnValue('mock-token')
        })
      } as any;
    });

    it('should generate email verification token', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await generateEmailVerificationToken(mockUserId);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $set: {
            emailVerificationToken: 'mock-token',
            emailVerificationExpires: expect.any(Date),
            updatedAt: expect.any(Date)
          }
        }
      );
      expect(result).toBe('mock-token');
    });

    it('should handle database errors', async () => {
      mockCollection.updateOne.mockRejectedValue(new Error('Database error'));

      await expect(generateEmailVerificationToken(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('generateToken', () => {
    beforeEach(() => {
      // Mock JWT
      const jwt = jest.requireActual('jsonwebtoken');
      jwt.sign = jest.fn().mockReturnValue('mock-jwt-token');
    });

    it('should generate JWT token', async () => {
      const payload = { userId: mockUserId, email: 'test@example.com' };
      const jwt = jest.requireActual('jsonwebtoken');

      const result = await generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        {
          expiresIn: '7d',
          issuer: 'smartplates-app'
        }
      );
      expect(result).toBe('mock-jwt-token');
    });
  });
});