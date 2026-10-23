import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true }, // category name from category collection
}, { timestamps: true });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
