const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/create-order", async (req,res)=>{

try{

const order = await razorpay.orders.create({
amount:500,
currency:"INR"
});

res.json(order);

}catch(err){

console.log(err);
res.status(500).send("Error creating order");

}

});

app.post("/verify-payment",(req,res)=>{

const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature
} = req.body;

const body = razorpay_order_id + "|" + razorpay_payment_id;

const expectedSignature = crypto
.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
.update(body)
.digest("hex");

if(expectedSignature === razorpay_signature){

res.json({success:true});

}else{

res.json({success:false});

}

});

app.listen(3000,()=>{
console.log("Server running on port 3000");
});