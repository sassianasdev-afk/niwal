import express from 'express'

import { listProducts, addProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.single('image'), addProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts)
productRouter.put('/update/:id', adminAuth, upload.single('image'), updateProduct)


export default productRouter