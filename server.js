require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const connectDB = require("./config/db");
const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const courseRoutes = require("./routes/courseRoutes");
const resultRoutes = require("./routes/resultRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

/* =========================
DATABASE
========================= */
connectDB();

/* =========================
VIEW ENGINE + STATIC
========================= */
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SESSION
========================= */
app.use(session({
  secret: process.env.SESSION_SECRET || "campus-secret",
  resave: false,
  saveUninitialized: false
}));

/* =========================
   PASSPORT
========================= */
app.use(passport.initialize());
app.use(passport.session());

/* =========================
   ROUTES
========================= */
app.use((req,res,next)=>{
  res.locals.user = req.user || null;
  next();
});

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", courseRoutes);
app.use("/", resultRoutes);
app.use("/", assignmentRoutes);
app.use("/", noteRoutes);
app.get("/busform",(req,res)=>{

res.render("busform",{
razorpayKey:process.env.RAZORPAY_KEY_ID
});

});

app.post("/create-order", async (req,res)=>{

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
key_id:process.env.RAZORPAY_KEY_ID,
key_secret:process.env.RAZORPAY_KEY_SECRET
});

const order = await razorpay.orders.create({
amount:500,
currency:"INR"
});

res.json(order);

});
const marketRoutes = require("./routes/marketRoutes");

app.use("/", marketRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/", paymentRoutes);
app.post("/create-order", createOrder);
app.post("/verify-payment", verifyPayment);

app.get("/privacy", (req, res) => res.render("privacy"));
app.get("/terms", (req, res) => res.render("terms"));

/* =========================  
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});