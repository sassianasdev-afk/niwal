import express from 'express';
import { generateTables, listTables, getTable, addTable, updateTable, removeTable, downloadQr } from '../controllers/tableController.js';
import adminAuth from '../middleware/adminAuth.js';

const tableRouter = express.Router();

// Public: list all tables (for client - returns MongoDB _id)
tableRouter.get('/list', listTables);

// Public: get single table by MongoDB _id
tableRouter.get('/:id', getTable);

// Admin only
tableRouter.post('/generate', adminAuth, generateTables);
tableRouter.post('/add', adminAuth, addTable);
tableRouter.put('/update/:id', adminAuth, updateTable);
tableRouter.post('/remove', adminAuth, removeTable);
tableRouter.get('/qr/:id', adminAuth, downloadQr);

export default tableRouter;
