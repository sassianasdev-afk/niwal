import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";



const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.body.userId;

    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "Produit non trouvé"
      });
    }

    
    const existingReview = await reviewModel.findOne({
      productId,
      userId
    });

    if (existingReview) {
      return res.json({
        success: false,
        message: "Vous avez déjà évalué ce produit"
      });
    }

    const reviewData = {
      productId,
      userId,
      userName: user.name,
      rating: Number(rating),
      comment,
      date: Date.now()
    };

    const newReview = new reviewModel(reviewData);
    await newReview.save();

    res.json({
      success: true,
      message: "Avis ajouté"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};


const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.body;
        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });

        
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }

        res.json({ success: true, reviews, averageRating, totalReviews: reviews.length });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviews = await reviewModel.find({ userId });
        res.json({ success: true, reviews });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addReview, getProductReviews, getUserReviews }