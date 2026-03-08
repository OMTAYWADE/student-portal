const Note = require("../models/note");


/* =====================
   PUBLIC HUB
===================== */

exports.home = async (req, res) => {

  const popular = await Note.find()
    .sort({ downloads: -1 })
    .limit(6);

  const recent = await Note.find()
    .sort({ createdAt: -1 })
    .limit(6);

  res.render("notes/home", {
    popular,
    recent
  });

};


/* =====================
   PERSONAL DASHBOARD
===================== */

exports.dashboard = async (req, res) => {

  const userYear = req.user.year;
  const userSem = req.user.semester;

  const recommended = await Note.find({
    year: userYear,
    semester: userSem
  }).limit(6);

  const myUploads = await Note.find({
    uploadedBy: req.user.id
  }).sort({ createdAt: -1 });

  res.render("notes/dashboard", {
    recommended,
    myUploads
  });

};


/* =====================
   BROWSE FLOW
===================== */

exports.getYears = async (req, res) => {

  const years = await Note.distinct("year");

  res.render("notes/browse/years", { years });

};


exports.getBranches = async (req, res) => {

  const branches = await Note.find({
    yearLower: req.params.year.toLowerCase()
  }).distinct("branch");

  res.render("notes/browse/branches", {
    year: req.params.year,
    branches
  });

};


exports.getSemesters = async (req, res) => {

  const semesters = await Note.find({
    yearLower: req.params.year.toLowerCase(),
    branchLower: req.params.branch.toLowerCase()
  }).distinct("semester");

  res.render("notes/browse/semesters", {
    year: req.params.year,
    branch: req.params.branch,
    semesters
  });

};


exports.getSubjects = async (req, res) => {

  const subjects = await Note.find({
    yearLower: req.params.year.toLowerCase(),
    branchLower: req.params.branch.toLowerCase(),
    semesterLower: req.params.sem.toLowerCase()
  }).distinct("subject");

  res.render("notes/browse/subjects", {
    ...req.params,
    subjects
  });

};


exports.getModules = async (req, res) => {

  const modules = await Note.find({
    yearLower: req.params.year.toLowerCase(),
    branchLower: req.params.branch.toLowerCase(),
    semesterLower: req.params.sem.toLowerCase(),
    subjectLower: req.params.subject.toLowerCase()
  }).distinct("module");

  res.render("notes/browse/modules", {
    ...req.params,
    modules
  });

};


exports.getFiles = async (req, res) => {

  const notes = await Note.find({
    yearLower: req.params.year.toLowerCase(),
    branchLower: req.params.branch.toLowerCase(),
    semesterLower: req.params.sem.toLowerCase(),
    subjectLower: req.params.subject.toLowerCase(),
    moduleLower: req.params.module.toLowerCase()
  });

  res.render("notes/browse/files", {
    ...req.params,
    notes
  });

};



/* =====================
   UPLOAD PAGE
===================== */

exports.uploadPage = (req, res) => {

  res.render("notes/upload");

};



/* =====================
   UPLOAD NOTE
===================== */

exports.uploadNote = async (req, res) => {

  try {

    const {
      title,
      year,
      branch,
      semester,
      subject,
      module,
      session,
      price
    } = req.body;

    await Note.create({

      title,

      year,
      branch,
      semester,
      subject,
      module,
      session,

      yearLower: year.toLowerCase(),
      branchLower: branch.toLowerCase(),
      semesterLower: semester.toLowerCase(),
      subjectLower: subject.toLowerCase(),
      moduleLower: module.toLowerCase(),
      sessionLower: session?.toLowerCase() || "",

      price: price || 0,

      fileUrl: req.file.path,

      uploadedBy: req.user.id

    });

    res.redirect("/notes/dashboard");

  }

  catch (err) {

    console.error(err);
    res.send("Upload failed");

  }

};