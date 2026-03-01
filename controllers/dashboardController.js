const Assignment = require("../models/assignment");
const Result = require("../models/result");
const { fetchCoursesAndWorks } = require("../services/googleService");

exports.getDashboard = async (req, res) => {
  try {

    const { courses, workResults } =
      await fetchCoursesAndWorks(req.user.accessToken);

    const existingAssignments =
      await Assignment.find({ userId: req.user.id });

    const existingIds = new Set(
      existingAssignments.map(a => a.googleId)
    );

    const newAssignments = [];

    for (let i = 0; i < courses.length; i++) {
      const works = workResults[i].data.courseWork || [];

      for (let work of works) {
        if (!existingIds.has(work.id)) {
          newAssignments.push({
            googleId: work.id,
            userId: req.user.id,
            title: work.title,
            courseName: courses[i].name
          });
        }
      }
    }
    if (newAssignments.length > 0) {
      await Assignment.insertMany(newAssignments);
    }

    const assignments =
      await Assignment.find({ userId: req.user.id });

    const result =await Result.findOne({ userId: req.user.id });

    let cgpa = 0;
    let totalKT = 0;
    let latestSGPA = 0;

    if (result) {
      cgpa = result.cgpa;
      totalKT = result.totalKT;
      latestSGPA = result.semesters.length
        ? result.semesters[result.semesters.length - 1].sgpa
        : 0;
    }

    // 📊 PRODUCTIVITY STATS
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const overdue = assignments.filter(a => a.overdue).length;
    const progress = total
      ? Math.round((completed / total) * 100)
      : 0;

    res.render("dashboard", {
      user: req.user,
      title: "Dashboard",
      assignments,
      totalKT,
      cgpa,
      latestSGPA,
      total, pending, completed, overdue, progress,
      result
    });

  } catch (err) {
    console.error(err);
    res.send("Dashboard error");
  }
};