import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"

// add products to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body

        
        const product = await productModel.findById(itemId)
        if (!product) {
            return res.json({
                success: false,
                message: "Produit non trouvé"
            })
        }

        
        if (!product.sizes.includes(size)) {
            return res.json({
                success: false,
                message: "Taille non disponible"
            })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({
                success: false,
                message: "Utilisateur non trouvé"
            })
        }

        let cartData = userData.cartData || {}

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, { cartData })

        res.json({ success: true, message: "Ajouté au panier" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// updatecart user cart
const updatecart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body

    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "Utilisateur non trouvé" })
    }

    let cartData = userData.cartData || {}

    // product ما كاينش
    if (!cartData[itemId]) {
      return res.json({ success: false, message: "Produit non dans le panier" })
    }

    // size ما كاينش
    if (!cartData[itemId][size]) {
      return res.json({ success: false, message: "Taille non dans le panier" })
    }

    /* ================= CORE LOGIC ================= */

    if (quantity <= 0) {
      // حيد size
      delete cartData[itemId][size]
    } else {
      // update quantity
      cartData[itemId][size] = quantity
    }

    // ila ما بقا حتى size ف داك product → حيد product كامل
    if (Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId]
    }

    await userModel.findByIdAndUpdate(userId, { cartData })

    res.json({ success: true, message: "Panier mis à jour" })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// get user cart
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({success:true , cartData});

    } catch (error) {
        
        res.json({success:false,message:error.message})
    }

    
}

export { addToCart, updatecart, getUserCart}
