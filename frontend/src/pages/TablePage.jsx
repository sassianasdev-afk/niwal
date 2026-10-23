import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const TablePage = () => {
  const { tableId } = useParams();
  const { products, categories, addToCart, updateQuantity, cartItems, getCartCount, getCartAmount, clearCart, placeOrder, clientsite, loading, backendUrl } = useContext(ShopContext);
  const navigateApp = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [table, setTable] = useState(null);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/table/${tableId}`);
        if (response.data.success) {
          setTable(response.data.table);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setTableLoading(false);
      }
    };
    fetchTable();
  }, [tableId, backendUrl]);

  const filteredProducts = products.filter((product) => {
    if (activeCategory === 'all') return true;
    return product.category === activeCategory;
  });

  const handlePlaceOrder = async () => {
    const itemCount = getCartCount();
    if (itemCount === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    const orderItems = [];
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        if (cartItems[productId][size] > 0) {
          const productInfo = products.find((p) => p._id === productId);
          if (productInfo) {
            orderItems.push({
              name: productInfo.name,
              price: productInfo.price,
              quantity: cartItems[productId][size],
              size: size,
              image: productInfo.image?.[0] || '',
            });
          }
        }
      }
    }

    const orderData = {
      tableId,
      items: orderItems,
      amount: getCartAmount(),
      paymentMethod: 'COD',
    };

    const newOrderId = await placeOrder(orderData);
    if (newOrderId) {
      setCartOpen(false);
      navigateApp(`/order-success/${newOrderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-brown-50 text-gray-900">
      <header className="bg-brown-900 text-white py-4 px-4 flex items-center justify-between">
        <button
          onClick={() => window.location.href = `${clientsite}/`}
          className="flex items-center gap-2 text-amber-200 hover:text-white text-sm font-medium"
        >
          ← Retour accueil
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-brown-900 font-bold">
            T
          </div>
          <span className="font-bold text-lg">Table #{table ? table.number : tableId}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative text-white hover:text-amber-300 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full font-medium transition ${activeCategory === 'all' ? 'bg-brown-900 text-white' : 'bg-white border border-amber-200 text-brown-900'}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2 rounded-full font-medium transition ${activeCategory === cat.name ? 'bg-brown-900 text-white' : 'bg-white border border-amber-200 text-brown-900'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-lg transition-all group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                  <img
                    src={product.image?.[0] || ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <h4 className="font-bold text-brown-900 text-lg mb-1">{product.name}</h4>
                <p className="text-amber-600 font-medium mb-3">{product.price} DH</p>
                <button
                  onClick={() => {
                    addToCart(product._id, 'default');
                  }}
                  className="w-full py-2 bg-brown-900 text-white font-bold rounded-lg hover:bg-brown-800 transition"
                >
                  Ajouter +
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500">Aucun produit dans cette catégorie.</p>
            </div>
          )}
        </div>
      </main>

      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-right">
          <div className="w-full sm:w-[420px] bg-white h-screen shadow-2xl transform transition-transform duration-300 flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-brown-900">Votre panier</h3>
              <button onClick={() => setCartOpen(false)} className="text-gray-500 hover:text-brown-900">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {Object.keys(cartItems).length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  {Object.entries(cartItems).map(([productId, sizes]) => (
                    <div key={productId} className="flex gap-4">
                      {Object.entries(sizes).map(([size, qty]) => {
                        if (qty <= 0) return null;
                        const productInfo = products.find((p) => p._id === productId);
                        if (!productInfo) return null;
                        return (
                          <div key={size} className="flex gap-3 items-start">
                            <img
                              src={productInfo.image?.[0] || ''}
                              alt={productInfo.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-brown-900">{productInfo.name}</h4>
                              <p className="text-sm text-gray-600">Taille: {size}</p>
                              <p className="text-amber-600 font-medium">{productInfo.price * qty} DH</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateQuantity(productId, size, qty - 1)}
                                  className="w-6 h-6 rounded border border-amber-200 flex items-center justify-center text-brown-900 font-bold"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center">{qty}</span>
                                <button
                                  onClick={() => updateQuantity(productId, size, qty + 1)}
                                  className="w-6 h-6 rounded border border-amber-200 flex items-center justify-center text-brown-900 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  </>
              )}
            </div>
            <div className="p-6 border-t bg-amber-50">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-brown-900">Total</span>
                <span className="font-bold text-brown-900">{getCartAmount()} DH</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={getCartCount() === 0 || loading}
                className="w-full py-3 bg-brown-900 text-white font-bold rounded-xl hover:bg-brown-800 disabled:opacity-50 transition"
              >
                {loading ? 'Commande en cours...' : `Passer la commande (${getCartAmount()} DH)`}
              </button>
              <button
                onClick={() => clearCart()}
                className="w-full py-2 mt-3 border border-amber-200 text-amber-600 font-medium rounded-xl hover:bg-amber-100 transition"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePage;
