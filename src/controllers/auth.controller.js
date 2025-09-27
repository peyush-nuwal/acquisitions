import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookie.js';
import { formatValidationsError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signInSchema, signUpSchema } from '#validations/auth.validation.js';

// controllers/auth.controller.js
//next  removed next parem ;
export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationsError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    //Auth service
    const user = await createUser({ name, email, password, role });

    // creating jwt token
    const token = await jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    //setting cookie
    cookies.set(res, 'token', token);

    logger.info(`User register successfully with email: ${email}`);
    return res.status(201).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('sign up failed', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// sign in user
export const signIn = async (req, res) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationsError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);

    const token = await jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    return res.status(200).json({
      message: 'Sign in success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.message === 'User does not exist') {
      return res.status(404).json({ error: 'User does not exist' });
    }
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const signOut = (req, res) => {
  res.status(200).json({ message: 'User signed out successfully' });
};
