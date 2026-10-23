import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';

const Navbar = () => {
  const { getCartCount } = useContext(ShopContext);

  return (
    <nav className="bg-brown-900 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer">
          <img src={assets.logo} alt="Espresso Shot logo" className="w-9 h-9" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Espresso Shot</h1>
            <p className="text-amber-200 text-xs">Specialty Coffee & Coffer</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-white hover:text-amber-300 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
