import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import users from '#models/user.model.js';

// salt rounds
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    logger.error('Error hashing password:', err);
    throw new Error('Internal server error while hashing password');
  }
};

/**
 * Compare a plain text password with a bcrypt hash
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Internal server error while verifying password');
  }
};

/**
 * Check if a user exists by email
 * @returns user object if found, otherwise null
 */
export const isUserExist = async email => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return existingUser || null;
  } catch (error) {
    logger.error('Error checking if user exists:', error);
    throw new Error('Internal server error while checking user exists');
  }
};

/**
 * Create User in database
 */
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // Reuse isUserExist
    const existingUser = await isUserExist(email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    // hashing password
    const hashed_password = await hashPassword(password);

    // creating user if not exists
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashed_password, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.email} created successfully`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    if (error.message === 'User already exists') {
      throw error; // preserve specific error
    }
    throw new Error('Internal server error while creating user');
  }
};

// sign in 
export const authenticateUser = async (email, password) => {
  const user = await isUserExist(email);
  if (!user) throw new Error('User does not exist');

  const isPasswordCorrect = await comparePassword(password, user.password);
  if (!isPasswordCorrect) throw new Error('Invalid credentials');

  return user; // controller decides what to do with it
};
