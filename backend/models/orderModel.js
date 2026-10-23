import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String },
    tableId: { type: String },
    tableNumber: { type: Number },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object },
    status: { type: String, required: true, default: 'received' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type : Number, required: true },
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
