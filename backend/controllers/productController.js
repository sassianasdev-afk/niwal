import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

const cleanProductFromCarts = async (productId) => {
  try {
    const users = await userModel.find({ cartData: { $exists: true, $ne: {} } });
    for (const user of users) {
      let cartData = user.cartData;
      if (cartData[productId]) {
        delete cartData[productId];
        await userModel.findByIdAndUpdate(user._id, { cartData });
      }
    }
  } catch (error) {
    
  }
};

// function for add product
const addProduct = async (req,res)=>{

    try {
        const {name, description, price, category}=req.body

        const image = req.file

        if (!image) {
            return res.json({success:false,message:"Veuillez ajouter une image"})
        }

        const result = await cloudinary.uploader.upload(image.path,{resource_type:'image'});
        const imageUrl = result.secure_url

        const productData = {
            name,
            description,
            category,
            price:Number(price),
            image: [imageUrl],
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);

        await product.save()
        
        res.json({success:true,message:"Produit ajouté"})   
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message}) 
    }
    
}

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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, category } = req.body

    const product = await productModel.findById(id)
    if (!product) {
      return res.json({ success: false, message: "Produit non trouvé" })
    }

    let imageUrls = product.image

    if (req.file) {
      // Delete old images from Cloudinary when replacing the image
      if (imageUrls && imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          await deleteImageFromCloudinary(imageUrl)
        }
      }
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
      imageUrls = [result.secure_url]
    }

    await productModel.findByIdAndUpdate(id, {
      name,
      description,
      price: Number(price),
      category,
      image: imageUrls
    })

    await cleanProductFromCarts(id)

    res.json({ success: true, message:  "Produit mis à jour" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

//function for list product
const listProducts = async (req,res)=>{
    try {
        const products = await productModel.find({});
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

//function for removing product from cartData
const removeProductFromCarts = async (productId) => {
  try {
    const users = await userModel.find({ "cartData": { $exists: true, $ne: {} } });
    for (const user of users) {
      let cartData = user.cartData;
      if (cartData[productId]) {
        delete cartData[productId];
        await userModel.findByIdAndUpdate(user._id, { cartData });
      }
    }
  } catch (error) {
    
  }
};

//function for removing product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Produit non trouvé" });
    }

    // Delete product images from Cloudinary
    if (product.image && product.image.length > 0) {
      for (const imageUrl of product.image) {
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
      }
    }

    await productModel.findByIdAndDelete(id);
    await removeProductFromCarts(id);

    res.json({ success: true, message: "Produit supprimé" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//function for single product info
const singleProduct = async (req,res)=>{
    try {
        const {productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message}) 
    }

}

export {listProducts, addProduct, removeProduct, singleProduct,updateProduct}
