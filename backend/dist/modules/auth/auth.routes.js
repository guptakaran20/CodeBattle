import { Router } from 'express';
import { register, login, googleLogin, linkGoogle, refresh, logout, getMe, changePassword, forgotPasswordReset } from './auth.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google/link', requireAuth, linkGoogle);
router.post('/refresh', refresh);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/change-password', requireAuth, changePassword);
router.post('/forgot-password/reset', forgotPasswordReset);
export default router;
//# sourceMappingURL=auth.routes.js.map