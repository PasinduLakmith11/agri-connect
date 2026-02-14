import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.patch('/:id', orderController.updateOrder);

export default router;
