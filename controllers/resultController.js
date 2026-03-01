const Result = require("../models/result");
const fs = require("fs");
const pdfParse = require("pdf-parse");

function parseResult(text) {

  const sgpaMatch = text.match(/SGPA\s*:\s*(\d+\.\d+)/);
  const cgpaMatch = text.match(/CGPA\s*:\s*(\d+\.\d+)/);

  const sgpa = sgpaMatch ? parseFloat(sgpaMatch[1]) : 0;
  const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : 0;

  return {
    cgpa,
    totalKT: 0,
    semesters: [{
      semesterNumber: 1,
      sgpa,
      subjects: []
    }]
  };
}

exports.getResults = async (req, res) => {
  const result = await Result.findOne({ userId: req.user.id });

  res.render("results", {
    result: result || null
  });
};

exports.uploadResult = async (req, res) => {

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);
  const parsed = parseResult(pdfData.text);

  await Result.findOneAndUpdate(
    { userId: req.user.id },
    parsed,
    { upsert: true }
  );

  res.redirect("/results");
};