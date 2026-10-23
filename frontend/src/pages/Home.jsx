import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/frontend_assets/assets';

const Home = () => {
  const { products, categories, tables, clientsite } = useContext(ShopContext);

  return (
    <div className="min-h-screen bg-brown-50 text-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-brown-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-4 uppercase tracking-wider">
            specialty coffee
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            L'espresso parfait,<br />à votre table.
          </h2>
          <p className="text-lg md:text-xl text-amber-200 max-w-2xl mx-auto mb-10">
            Scan le QR de votre table ou choisissez-la ci-dessous,<br />
            commandez votre café et profitez du moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href='#tables' className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-brown-900 font-bold rounded-xl transition">
              Voir les tables
            </a>
            <a href="#products" className="px-8 py-3 border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-brown-900 font-bold rounded-xl transition">
              Voir le menu
            </a>
          </div>
        </div>
      </section>

      {/* Tables Section */}
      <section className="py-20 px-4" id="tables">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-serif font-bold text-brown-900 mb-2">Nos tables</h3>
              <p className="text-gray-600">Choisissez votre table et commandez sans attendre</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {tables.length > 0 ? (
              tables.map((table) => (
                <div
                  key={table._id}
                  onClick={() => window.location.href = `${clientsite}/table/${table._id}`}
                  className={`group relative aspect-square rounded-2xl border-2 p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${table.isActive !== false ? 'bg-white border-amber-100 hover:border-amber-500 hover:shadow-xl' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-brown-900 font-bold text-xl mb-3 transition-all ${table.isActive !== false ? 'bg-amber-100 group-hover:bg-amber-500 group-hover:text-white' : 'bg-gray-200'}">
                    ☕
                  </div>
                  <span className="text-xl font-bold text-brown-900 group-hover:text-amber-600 transition">Table {table.number}</span>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-square bg-white rounded-2xl border-2 border-amber-100 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-brown-900 font-bold text-xl mb-3">
                    ☕
                  </div>
                  <span className="text-xl font-bold text-brown-900">Table {n}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-brown-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-serif font-bold text-brown-900 mb-2">Catégories</h3>
              <p className="text-gray-600">Découvrez nos boissons et pâtisseries</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white rounded-2xl border border-amber-100 p-6 text-center hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => {
                    // Categories on homepage are for display only
                    // Ordering is done from the Table page
                    toast.info('Choisissez une table depuis l\'accueil pour commander')
                  }}
                >
                  <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-100 transition">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">☕</span>
                    )}
                  </div>
                  <h4 className="font-bold text-brown-900 text-lg">{cat.name}</h4>
                </div>
              ))
            ) : (
              [ 'Espresso', 'Latte', 'Thé', 'Pâtisserie' ].map((catName, i) => (
                <div key={i} className="bg-white rounded-2xl border border-amber-100 p-6 text-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">☕</span>
                  </div>
                  <h4 className="font-bold text-brown-900 text-lg">{catName}</h4>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Products Section (no add button - just display) */}
      <section className="py-20 px-4" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-serif font-bold text-brown-900 mb-2">Produits populaires</h3>
              <p className="text-gray-600">Nos meilleures boissons et douceurs</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.slice(0, 8).map((product) => (
                <div key={product._id} className="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-lg transition-all group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                    <img src={product.image?.[0] || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 className="font-bold text-brown-900 text-lg mb-1">{product.name}</h4>
                  <p className="text-amber-600 font-medium">{product.price} DH</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={assets.logo} alt="Espresso Shot logo" className="w-8 h-8" />
              <span className="font-bold text-2xl">Espresso Shot</span>
            </div>
            <p className="text-amber-300 text-sm">
              Espresso Shot - Spécialité café & coffer. Commande sans login, scan & dégustez.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
