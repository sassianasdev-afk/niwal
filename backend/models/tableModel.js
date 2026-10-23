import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    qrCode: { type: String },
}, { timestamps: true });

const tableModel = mongoose.models.table || mongoose.model("table", tableSchema);

export default tableModel;
