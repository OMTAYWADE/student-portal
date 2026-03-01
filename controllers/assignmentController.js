const Assignment = require("../models/assignment");

exports.getAssignments = async (req, res) => {
  try {

    const filter = { userId: req.user.id };

    if (req.query.course) {
      filter.courseName = req.query.course;
    }

    let assignments = await Assignment.find(filter);

    const today = new Date();

    assignments = assignments.map(a => {
      const overdue =
        a.dueDate &&
        a.status === "pending" &&
        new Date(a.dueDate) < today;

      return {
        ...a.toObject(),
        overdue
      };
    });

    const total = assignments.length;
    const pending = assignments.filter(a => a.status === "pending").length;
    const completed = assignments.filter(a => a.status === "completed").length;
    const overdueCount = assignments.filter(a => a.overdue).length;

    const progress = total
      ? Math.round((completed / total) * 100)
      : 0;

    res.render("assignments", {
      user: req.user,
      assignments,
      total,
      pending,
      completed,
      overdue: overdueCount,
      progress,
      courses: [...new Set(assignments.map(a => a.courseName))]
    });

  } catch (err) {
    console.error(err);
    res.send("Assignment error");
  }
};