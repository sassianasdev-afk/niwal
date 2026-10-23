import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TablePage from "./pages/TablePage";
import OrderSuccess from "./pages/OrderSuccess";
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import { ShopContext } from "./context/ShopContext";

const App = () => {
  const { setMenu } = useContext(ShopContext);
  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/table/:tableId" element={<TablePage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      </Routes>
    </div>
  );
};

export default App;
