import { createContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) =>{

    const currency = 'MAD :';
    const delivery_fee = 0;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const clientsite = import.meta.env.VITE_CLIENTSITE;
    const [search,setSearch] = useState('');
    const [menu,setMenu] = useState(false);
    const [showSearch,setShowSearch] = useState(false);
    const [cartItems,setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tables, setTables] = useState([]);
    const [token,setToken] = useState('');
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();


    const addToCart = (itemId, size = 'default') => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        toast.success('Produit ajouté au panier');
    };

    const updateQuantity = (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity <= 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                }
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0 && itemInfo) {
                    totalAmount += itemInfo.price * cartItems[items][item];
                }
            }
        }
        return totalAmount;
    };

    const clearCart = () => {
        setCartItems({});
    };

    const getProductsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getCategoriesData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getTablesData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/table/list');
            if (response.data.success) {
                setTables(response.data.tables);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const placeOrder = async (orderData) => {
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/order/place', orderData);
            if (response.data.success) {
                clearCart();
                return response.data.orderId;
            } else {
                toast.error(response.data.message);
                return null;
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProductsData();
        getCategoriesData();
        getTablesData();
    }, []);

    const value = {
        products, categories, tables, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, updateQuantity,
        getCartCount, getCartAmount, clearCart,
        navigate, backendUrl, clientsite,
        setToken, token, getProductsData,
        menu, setMenu, loading, placeOrder
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );

}

export default ShopContextProvider;
