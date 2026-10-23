import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { backendUrl, navigate } = useContext(ShopContext);
  const navigateApp = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/order/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrder();
    setLoading(false);

    // Poll klli 3 secondes bach l status ykon real-time
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [orderId, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-900 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-50">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brown-900 mb-2">Commande non trouvée</h3>
          <button
            onClick={() => navigateApp('/')}
            className="px-6 py-2 bg-brown-900 text-white rounded-lg hover:bg-brown-800 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    'received': 'text-amber-600',
    'preparing': 'text-blue-600',
    'ready': 'text-blue-600',
    'served': 'text-green-600',
    'cancelled': 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-brown-50 text-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-amber-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-brown-900 mb-4">Commande confirmée !</h2>
          <p className="text-gray-600 mb-6">Merci pour votre commande. Voici vos détails :</p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex justify-between text-brown-900">
              <span className="font-medium">Numéro de commande:</span>
              <span className="font-bold">#{order._id}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between text-brown-900">
                <span className="font-medium">Table:</span>
                <span className="font-bold">Table {order.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-brown-900">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-amber-600">{order.amount} DH</span>
            </div>
            <div className="flex justify-between text-brown-900">
              <span className="font-medium">Mode de paiement:</span>
              <span className="font-bold">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-brown-900">
              <span className="font-medium">Statut:</span>
              <span className={`font-bold ${statusColors[order.status] || 'text-brown-600'}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="border-t border-amber-50 pt-6">
            <h4 className="font-bold text-brown-900 mb-4 text-left">Articles ({order.items.length}):</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-brown-900">{item.price * item.quantity} DH</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigateApp('/')}
            className="w-full py-3 mt-6 bg-brown-900 text-white font-bold rounded-xl hover:bg-brown-800 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
