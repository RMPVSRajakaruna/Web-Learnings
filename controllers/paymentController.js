import Order from "../models/order.js";
import generateHash from "../utils/payhere.js";
import crypto from "crypto";

// Create payment hash
export async function createPayment(req, res) {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        message: "Order ID and amount are required",
      });
    }

    // Verify order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = "LKR";
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Validate merchant credentials
    if (!merchantId || !merchantSecret) {
      console.error('❌ Missing PayHere credentials in .env');
      return res.status(500).json({
        message: "Payment gateway not configured properly",
      });
    }

    // 🔍 DEBUG LOG
    console.log('=== PAYMENT HASH GENERATION ===');
    console.log('Merchant ID:', merchantId);
    console.log('Merchant Secret (first 10 chars):', merchantSecret?.substring(0, 10));
    console.log('Order ID:', orderId);
    console.log('Amount (formatted):', formattedAmount);
    console.log('Currency:', currency);

    const hash = generateHash(
      merchantId,
      orderId,
      formattedAmount,
      currency,
      merchantSecret
    );

    console.log('Generated Hash:', hash);
    console.log('================================');

    // Prepare response with ALL fields that will be sent to PayHere
    const responseData = {
      merchant_id: merchantId,
      order_id: orderId,
      amount: formattedAmount,  // Use the same formatted amount used in hash
      currency: currency,        // Use the same currency used in hash
      hash,
      items: order.name || "Order Items",
      first_name: order.name.split(" ")[0] || "Customer",
      last_name: order.name.split(" ").slice(1).join(" ") || ".",
      email: order.email,
      phone: order.phone,
      address: order.address,
    };

    console.log('Response data:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
}

// PayHere notify endpoint - receives payment status updates
export async function paymentNotify(req, res) {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      status_message,
      card_holder_name,
      card_no,
    } = req.body;

    // Verify the hash
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localMd5sig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    if (localMd5sig === md5sig) {
      // Valid notification
      const order = await Order.findOne({ orderId: order_id });

      if (!order) {
        console.error("Order not found:", order_id);
        return res.status(404).send("Order not found");
      }

      // Update order status based on payment status
      if (status_code === "2") {
        // Success
        order.status = "Paid";
      } else if (status_code === "0") {
        // Pending
        order.status = "Pending Payment";
      } else if (status_code === "-1") {
        // Canceled
        order.status = "Payment Canceled";
      } else if (status_code === "-2") {
        // Failed
        order.status = "Payment Failed";
      } else if (status_code === "-3") {
        // Chargedback
        order.status = "Chargedback";
      }

      await order.save();

      console.log("Payment notification processed:", {
        order_id,
        status_code,
        status_message,
      });

      res.status(200).send("OK");
    } else {
      // Invalid hash
      console.error("Invalid payment notification hash");
      res.status(400).send("Invalid hash");
    }
  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(500).send("Error processing notification");
  }
}

// PayHere return endpoint - user is redirected here after payment
export async function paymentReturn(req, res) {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({ orderId: order_id });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Payment processed",
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Payment return error:", error);
    res.status(500).json({
      message: "Failed to process payment return",
      error: error.message,
    });
  }
}

// PayHere cancel endpoint - user canceled the payment
export async function paymentCancel(req, res) {
  try {
    const { order_id } = req.query;

    if (order_id) {
      const order = await Order.findOne({ orderId: order_id });
      if (order) {
        order.status = "Payment Canceled";
        await order.save();
      }
    }

    res.json({
      message: "Payment canceled",
      order_id,
    });
  } catch (error) {
    console.error("Payment cancel error:", error);
    res.status(500).json({
      message: "Failed to process payment cancellation",
      error: error.message,
    });
  }
}

// Get payment status for an order
export async function getPaymentStatus(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      orderId: order.orderId,
      status: order.status,
      amount: order.total,
      date: order.date,
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      message: "Failed to get payment status",
      error: error.message,
    });
  }
}



