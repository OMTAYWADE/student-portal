function parseResult(text) {

const sgpaMatch = text.match(/SGPA\s*[:\-]?\s*(\d+(\.\d+)?)/i);
const cgpaMatch = text.match(/CGPA\s*[:\-]?\s*(\d+(\.\d+)?)/i);

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

module.exports = {
  parseResult
};