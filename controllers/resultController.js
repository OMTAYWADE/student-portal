const Result = require("../models/result");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { parseResult } = require("../services/resultServices");

exports.getResults = async (req, res, next) => {
  try {
    const result = await Result.findOne({ userId: req.user.id });

    res.render("results", {
      result: result || null
    });

  } catch (err) {
    next(err);
  }
};

exports.uploadResult = async (req, res, next) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const parsed = parseResult(pdfData.text);

    await Result.findOneAndUpdate(
      { userId: req.user.id },
      parsed,
      { upsert: true }
    );

    fs.unlinkSync(req.file.path);

    res.redirect("/results");

  } catch (err) {
    next(err);
  }
};