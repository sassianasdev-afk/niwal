import { v2 as cloudinary } from "cloudinary";
import tableModel from "../models/tableModel.js";
import orderModel from "../models/orderModel.js";
import { CLIENTSITE } from '../config/env.js';
import QRCode from 'qrcode';

// Generate default tables 1-6 if they don't exist
const generateTables = async (req, res) => {
    try {
        const tablesToCreate = [];
        for (let i = 1; i <= 6; i++) {
            const existing = await tableModel.findOne({ number: i });
            if (!existing) {
                const qrUrl = `${CLIENTSITE}/table/placeholder`;
                const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);
                tablesToCreate.push({
                    number: i,
                    isActive: true,
                    qrCode: qrCodeDataUrl,
                });
            }
        }

        if (tablesToCreate.length > 0) {
            await tableModel.insertMany(tablesToCreate);
        }

        const allTables = await tableModel.find({}).sort({ number: 1 });
        res.json({ success: true, message: "Tables générées", tables: allTables });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List all tables (public - for client)
const listTables = async (req, res) => {
    try {
        const tables = await tableModel.find({}).sort({ number: 1 });
        res.json({ success: true, tables });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single table by MongoDB _id (public)
const getTable = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await tableModel.findById(id);
        if (!table) {
            return res.json({ success: false, message: "Table non trouvée" });
        }
        res.json({ success: true, table });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add table (admin)
const addTable = async (req, res) => {
    try {
        const { number } = req.body;
        const existing = await tableModel.findOne({ number });
        if (existing) {
            return res.json({ success: false, message: "Ce numéro de table existe déjà" });
        }

        const qrUrl = `${CLIENTSITE}/table/placeholder`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

        const table = new tableModel({
            number,
            isActive: true,
            qrCode: qrCodeDataUrl,
        });
        await table.save();

        res.json({ success: true, message: "Table ajoutée", table });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update table (admin)
const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, isActive } = req.body;

        const table = await tableModel.findById(id);
        if (!table) {
            return res.json({ success: false, message: "Table non trouvée" });
        }

        let qrCode = table.qrCode;
        if (number && number !== table.number) {
            const qrUrl = `${CLIENTSITE}/table/placeholder`;
            qrCode = await QRCode.toDataURL(qrUrl);
        }

        await tableModel.findByIdAndUpdate(id, {
            number: number || table.number,
            isActive: isActive !== undefined ? isActive : table.isActive,
            qrCode,
        });

        res.json({ success: true, message: "Table mise à jour" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove table (admin)
const removeTable = async (req, res) => {
    try {
        const { id } = req.body;
        await tableModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Table supprimée" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Download QR code for a table (admin)
const downloadQr = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await tableModel.findById(id);
        if (!table || !table.qrCode) {
            return res.json({ success: false, message: "QR non trouvé" });
        }

        res.json({ success: true, qrCode: table.qrCode, tableNumber: table.number });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { generateTables, listTables, getTable, addTable, updateTable, removeTable, downloadQr };
