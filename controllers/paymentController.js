const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  const options = {
    amount: 500, // ₹5
    currency: "INR",
    receipt: "receipt_order"
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send("Error creating order");
  }
};

exports.verifyPayment = (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};