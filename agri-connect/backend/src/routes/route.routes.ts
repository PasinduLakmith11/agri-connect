import { Router } from 'express';
import * as routeController from '../controllers/route.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/optimize', authorize(['logistics', 'admin']), routeController.optimizeRoute);

export default router;
