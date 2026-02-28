import express from "express";
import {
  createPayment,
  paymentNotify,
  paymentReturn,
  paymentCancel,
  getPaymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create payment hash for PayHere checkout
router.post("/create-payment", createPayment);

// PayHere notify endpoint - receives payment status updates
router.post("/notify", paymentNotify);

// PayHere return endpoint - user redirected here after payment
router.get("/return", paymentReturn);

// PayHere cancel endpoint - user canceled payment
router.get("/cancel", paymentCancel);

// Get payment status for an order
router.get("/status/:orderId", getPaymentStatus);

export default router;