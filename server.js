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
const expressLayouts = require("express-ejs-layouts");

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
app.use(expressLayouts);
app.set("layout", "layouts/main");

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
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", courseRoutes);
app.use("/", resultRoutes);
app.use("/", assignmentRoutes);
app.use("/", noteRoutes);

app.get("/privacy", (req, res) => res.render("privacy"));
app.get("/terms", (req, res) => res.render("terms"));

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});