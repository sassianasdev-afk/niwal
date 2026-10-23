import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
}, { timestamps: true });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
