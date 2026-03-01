const Note = require("../models/note");

/* =====================
   PUBLIC HUB
===================== */
exports.home = async (req, res) => {
  const popular = await Note.find().sort({ downloads: -1 }).limit(6);
  const recent = await Note.find().sort({ createdAt: -1 }).limit(6);

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
  }).limit(6);

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
  const branches = await Note.find({ year: req.params.year })
    .distinct("branch");

  res.render("notes/browse/branches", {
    year: req.params.year,
    branches
  });
};

exports.getSemesters = async (req, res) => {
  const semesters = await Note.find({
    year: req.params.year,
    branch: req.params.branch
  }).distinct("semester");

  res.render("notes/browse/semesters", {
    year: req.params.year,
    branch: req.params.branch,
    semesters
  });
};

exports.getSubjects = async (req, res) => {
  const subjects = await Note.find({
    year: req.params.year,
    branch: req.params.branch,
    semester: req.params.sem
  }).distinct("subject");

  res.render("notes/browse/subjects", {
    ...req.params,
    subjects
  });
};

exports.getModules = async (req, res) => {
  const modules = await Note.find(req.params)
    .distinct("module");

  res.render("notes/browse/modules", {
    ...req.params,
    modules
  });
};

exports.getFiles = async (req, res) => {
  const notes = await Note.find(req.params);

  res.render("notes/browse/files", {
    ...req.params,
    notes
  });
};

/* =====================
   UPLOAD
===================== */

exports.uploadPage = (req, res) => {
  res.render("notes/upload");
};

exports.uploadNote = async (req, res) => {
  await Note.create({
    ...req.body,
    fileUrl: req.file.path,
    uploadedBy: req.user.id
  });

  res.redirect("/notes/dashboard");
};