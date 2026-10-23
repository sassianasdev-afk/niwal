import express from 'express';
import { addCategory, listCategories, removeCategory, updateCategory, singleCategory } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const categoryRouter = express.Router();

// Public: list categories (for client)
categoryRouter.get('/list', listCategories);

// Admin only
categoryRouter.post('/add', adminAuth, upload.single('image'), addCategory);
categoryRouter.post('/single', adminAuth, singleCategory);
categoryRouter.post('/remove', adminAuth, removeCategory);
categoryRouter.put('/update/:id', adminAuth, upload.single('image'), updateCategory);

export default categoryRouter;
