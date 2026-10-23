import orderModel from "../models/orderModel.js";
import tableModel from "../models/tableModel.js";

// placing orders using COD (NO AUTH REQUIRED - supports table orders)
const placeOrder = async (req, res) => {
    try {
        const { userId, tableId, items, amount, address, paymentMethod } = req.body;

        let tableNumber = null;
        if (tableId) {
            const table = await tableModel.findById(tableId);
            if (table) {
                tableNumber = table.number;
            }
        }

        const orderData = {
            userId: userId || null,
            tableId: tableId || null,
            tableNumber: tableNumber,
            items,
            address: address || null,
            amount,
            paymentMethod: paymentMethod || 'COD',
            payment: false,
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        res.json({
            success: true,
            message: "Commande passée",
            orderId: newOrder._id,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All orders for admin
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get order by ID (public - for order success page)
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Commande non trouvée" });
        }
        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User orders (requires auth)
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        let updateData = { status };

        if (status === "served") {
            updateData.payment = true;
        }
        if (status === "cancelled") {
            updateData.payment = false;
        }

        await orderModel.findByIdAndUpdate(orderId, updateData);
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { placeOrder, allOrders, userOrders, getOrderById, updateStatus };
