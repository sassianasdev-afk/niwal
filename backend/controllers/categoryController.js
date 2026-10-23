import { v2 as cloudinary } from "cloudinary";
import categoryModel from "../models/categoryModel.js";

// helper to delete an image from Cloudinary using its secure_url
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    const urlObj = new URL(imageUrl);
    const pathParts = urlObj.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex !== -1) {
      const afterUpload = pathParts.slice(uploadIndex + 1);
      if (afterUpload.length > 0) {
        const publicIdWithExt = afterUpload.slice(1).join("/");
        const publicId = publicIdWithExt.split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
  } catch (err) {
    console.log(`Error deleting image: ${err.message}`);
  }
};

// Add category (admin)
const addCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;
        const image = req.file;

        let imageUrl = "";
        if (image) {
            const result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
            imageUrl = result.secure_url;
        }

        const categoryData = {
            name,
            slug,
            image: imageUrl,
        };

        const category = new categoryModel(categoryData);
        await category.save();

        res.json({ success: true, message: "Catégorie ajoutée", category });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single category (admin)
const singleCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.json({ success: false, message: "Catégorie non trouvée" });
        }
        res.json({ success: true, category });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List all categories (public - for client)
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove category (admin)
const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.json({ success: false, message: "Catégorie non trouvée" });
        }

        // Delete category image from Cloudinary
        if (category.image) {
            await deleteImageFromCloudinary(category.image);
        }

        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Catégorie supprimée" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update category (admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        const image = req.file;

        const category = await categoryModel.findById(id);
        if (!category) {
            return res.json({ success: false, message: "Catégorie non trouvée" });
        }

        let updateData = { name, slug };
        if (image) {
            // Delete old image from Cloudinary when changing the image
            if (category.image) {
                await deleteImageFromCloudinary(category.image);
            }
            const result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
            updateData.image = result.secure_url;
        }

        await categoryModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Catégorie mise à jour" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addCategory, listCategories, removeCategory, updateCategory, singleCategory };
