// routes/auth.routes.js
import express from 'express';
import { signUp, signIn, signOut } from '#controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/sign-out', signOut);

export default router;
