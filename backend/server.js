const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SlXkETnXVDOsYQ",       // 🔥 replace with your test key
  key_secret: "pbhaRGUnl9Vv072zHmk35AiU"
});

// Create Order API
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert ₹ to paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating order");
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});