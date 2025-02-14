import express from 'express';
import { getProfile, login, logout, register, resetPassword, sendPasswordResetOtp, sendVerifyOtp, updateProfile, verifyEmail } from '../controllers/authController.js';
import { userAuth } from '../middleware/userAuth.js';
import { addRole } from '../controllers/moduleController.js';

const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-account', userAuth, verifyEmail)
authRouter.post('/reset-password-otp', userAuth, sendPasswordResetOtp)
authRouter.post('/reset-password', userAuth, resetPassword)
authRouter.post('/profile', userAuth, updateProfile)
authRouter.get('/profile', userAuth, getProfile)


export default authRouter;