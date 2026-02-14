import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public/Buyer accessible farmer profile
router.get('/farmer/:id', authenticate, userController.getFarmerProfile);
router.put('/profile', authenticate, userController.updateProfile);

export default router;
