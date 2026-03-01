const Result = require("../models/result");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const {parseResult } = require("../services/resultServices");

exports.uploadResult = async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const parsed = parseResult(pdfData.text); // 👈 service call

    await Result.findOneAndUpdate(
      { userId: req.user.id },
      parsed,
      { upsert: true }
    );

    fs.unlinkSync(req.file.path);

    res.redirect("/results");
  } catch (err) {
    console.error(err);
    res.send("Result upload failed");
  }
};