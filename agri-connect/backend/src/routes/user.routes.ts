import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

import { upload } from '../middleware/upload.middleware';

// Public/Buyer accessible farmer profile
router.get('/farmer/:id', authenticate, userController.getFarmerProfile);
router.put('/profile', authenticate, upload.single('profile_image'), userController.updateProfile);

export default router;
