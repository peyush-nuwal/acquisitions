// routes/auth.routes.js
import express from 'express';
import { signUp, signIn, signOut } from '#controllers/auth.controller.js';

const router = express.Router();

router.get('/sign-up', signUp);
router.get('/sign-in', signIn);
router.get('/sign-out', signOut);

export default router;
