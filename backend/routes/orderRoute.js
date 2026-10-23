import express from 'express';
import { placeOrder, allOrders, userOrders, getOrderById, updateStatus } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

// Public: get order by ID (for order success page)
orderRouter.get('/:orderId', getOrderById);

// Place order (COD only - NO AUTH REQUIRED)
orderRouter.post('/place', placeOrder);

// User orders (requires auth)
orderRouter.post('/userorders', authUser, userOrders);

export default orderRouter;
