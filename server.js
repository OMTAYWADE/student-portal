// git test 999
require('dotenv').config(); // MUST BE FIRST

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const Razorpay = require('razorpay');

// mongodb
const mongoose = require('mongoose');
const Assignment = require('./models/assignment');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// pdf uploader setup
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const Result = require("./models/result");

const upload = multer({ dest: "uploads/" });

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // ADD THIS near top (after static)

// Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || "campus-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://student-portal-ui03.onrender.com/auth/google/callback"
},
    (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        return done(null, profile);
    }));

// Auth Routes
app.get('/auth/google',
    passport.authenticate('google', {
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
            'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
            'https://www.googleapis.com/auth/classroom.announcements.readonly'
        ]
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard')
);

// Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

// Home
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.get('/busform', (req, res) => {
    res.render('busform', {
        user: req.user,
        razorpayKey: process.env.RAZORPAY_KEY_ID
    });
});

app.post("/create-order", async (req, res) => {
    try {
        const options = {
            amount: 500, // 500 paise = ₹5
            currency: "INR",
            receipt: "receipt_order_1"
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating order");
    }
});

//Dashboard
app.get("/dashboard", isLoggedIn, async (req, res) => {

  const assignments = await Assignment.find({ userId: req.user.id });
  const result = await Result.findOne({ userId: req.user.id });

  const total = assignments.length;
  const completed = assignments.filter(a => a.status === "completed").length;
  const pending = assignments.filter(a => a.status === "pending").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  let cgpa = 0;
  let totalKT = 0;
  let latestSGPA = 0;

  if(result){
    cgpa = result.cgpa;
    totalKT = result.totalKT;
    latestSGPA = result.semesters.length
      ? result.semesters[result.semesters.length - 1].sgpa
      : 0;
  }

  res.render("dashboard", {
    user: req.user,
    total,
    completed,
    pending,
    progress,
    cgpa,
    totalKT,
    latestSGPA
  });
});

// Assignment notifications 
app.get('/assignNotification', isLoggedIn, async (req, res) => {
  try {

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const classroom = google.classroom({
      version: 'v1',
      auth: oauth2Client
    });

    const coursesRes = await classroom.courses.list();
    const courses = coursesRes.data.courses || [];

    // 🔁 LOOP THROUGH ALL COURSES
    for (let course of courses) {

      const workRes = await classroom.courses.courseWork.list({
        courseId: course.id
      });

      const works = workRes.data.courseWork || [];

      for (let work of works) {

        const dueDate = work.dueDate
          ? new Date(
              work.dueDate.year,
              work.dueDate.month - 1,
              work.dueDate.day
            )
          : null;

        const exists = await Assignment.findOne({
          googleId: work.id,
          userId: req.user.id
        });

        if (!exists) {
          await Assignment.create({
            googleId: work.id,
            userId: req.user.id,
            title: work.title,
              courseName: course.name,
            alternateLink: work.alternateLink,
            dueDate
          });
        }
      }
    }

    // 📦 FETCH FROM DATABASE
    let assignments = await Assignment.find({
      userId: req.user.id
    });

    const today = new Date();

    assignments = assignments.map(a => {
      const overdue =
        a.dueDate &&
        a.status === 'pending' &&
        a.dueDate < today;

      return {
        ...a.toObject(),
        overdue
      };
    });

    // 📊 PRODUCTIVITY STATS
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const overdue = assignments.filter(a => a.overdue).length;
    const progress = total
      ? Math.round((completed / total) * 100)
      : 0;

    res.render('dashboard', {
      user: req.user,
      courses,
      assignments,
      total,
      pending,
      completed,
      overdue,
      progress
    });

  } catch (err) {
    console.error(err);

    if (err.code === 401) {
      return res.redirect('/auth/google');
    }

    res.send("Error loading dashboard");
  }
});

app.post('/assignments/:id/complete', async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, {
    status: 'completed',
    completedAt: new Date()
  });
    res.json({ success: true });
});

app.post('/assignments/:id/undo', async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, {
    status: 'pending',
    completedAt: null
  });

  res.json({ success: true });
});        

// courses page
app.get("/allcourses", isLoggedIn, (req, res) => {
    const assignments = Assignment.find({ userId: req.user.id });
    const coursesWithStats = courses.map(course => {
        const related = assignments.filter(a => a.courseName === course.name);

        const total = related.length;
        const pending = related.filter(a => a.status === 'pending').length;
        const completed = related.filter(a => a.status === 'completed').length;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        
        return {
            ...course,
            total,
            pending,
            completed,
            progress
        };
    });
    res.render("allCourses", {
        user: req.user,
        courses: coursesWithStats
    });
});

/* =======================
   RESULTS PAGE
======================= */

app.get("/results", isLoggedIn, async (req, res) => {

  const result = await Result.findOne({ userId: req.user.id });

  if (!result) {
    return res.render("results", {
      result: null
    });
  }

  res.render("results", { result });
});


/* =======================
   PDF UPLOAD
======================= */

app.post("/upload-result", isLoggedIn, upload.single("resultPdf"), async (req, res) => {

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;

  // ⚠ Customize this parsing according to your university format
  const parsed = parseResult(text);

  await Result.findOneAndUpdate(
    { userId: req.user.id },
    parsed,
    { upsert: true }
  );

  res.redirect("/results");
});


/* =======================
   SIMPLE PARSER EXAMPLE
======================= */

function parseResult(text) {

  const sgpaMatch = text.match(/SGPA\s*:\s*(\d+\.\d+)/);
  const cgpaMatch = text.match(/CGPA\s*:\s*(\d+\.\d+)/);

  const sgpa = sgpaMatch ? parseFloat(sgpaMatch[1]) : 0;
  const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : 0;

  const subjects = [];
  const subjectRegex = /([A-Za-z\s]+)\s+(\d+)\s+(\d+)\s+([A-Z])/g;

  let match;
  while ((match = subjectRegex.exec(text)) !== null) {
    subjects.push({
      name: match[1].trim(),
      marks: parseInt(match[2]),
      total: parseInt(match[3]),
      grade: match[4],
      kt: match[4] === "F"
    });
  }

  const totalKT = subjects.filter(s => s.kt).length;

  return {
    cgpa,
    totalKT,
    semesters: [
      {
        semesterNumber: 1,
        sgpa,
        subjects
      }
    ]
  };
}



// Private policy and terms
app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));