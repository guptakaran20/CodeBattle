import { Router } from 'express';
import { register, login, googleLogin, linkGoogle, refresh, logout, getMe, changePassword, forgotPasswordReset } from './auth.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/google', googleLogin as any);
router.post('/google/link', requireAuth as any, linkGoogle as any);
router.post('/refresh', refresh as any);
router.post('/logout', requireAuth as any, logout as any);
router.get('/me', requireAuth as any, getMe as any);
router.patch('/change-password', requireAuth as any, changePassword as any);
router.post('/forgot-password/reset', forgotPasswordReset as any);

export default router;
