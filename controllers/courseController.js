const Assignment = require("../models/assignment");

exports.getAllCourses = async (req, res) => {
  try {

    const assignments = await Assignment.find({
      userId: req.user.id
    });

    const coursesMap = {};

    assignments.forEach(a => {
      if (!coursesMap[a.courseName]) {
        coursesMap[a.courseName] = [];
      }
      coursesMap[a.courseName].push(a);
    });

    const courses = Object.keys(coursesMap).map(name => {

      const related = coursesMap[name];

      const total = related.length;
      const pending = related.filter(a => a.status === "pending").length;
      const completed = related.filter(a => a.status === "completed").length;
      const progress = total
        ? Math.round((completed / total) * 100)
        : 0;

      return {
        name,
        total,
        pending,
        completed,
        progress
      };
    });

    res.render("allCourses", {
      user: req.user,
      courses
    });

  } catch (err) {
    console.error(err);
    res.send("Course error");
  }
};