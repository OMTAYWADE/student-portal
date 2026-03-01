const Assignment = require("../models/assignment");

exports.completeAssignment = async (assignmentId, userId) => {
  return await Assignment.findOneAndUpdate(
    { _id: assignmentId, userId },
    {
      status: "completed",
      completedAt: new Date()
    },
    { new: true }
  );
};

exports.undoAssignment = async (assignmentId, userId) => {
  return await Assignment.findOneAndUpdate(
    { _id: assignmentId, userId },
    {
      status: "pending",
      completedAt: null
    },
    { new: true }
  );
};

exports.syncAssignments = async (courses, workResults, userId) => {
  const existing = await Assignment.find({ userId });
  const existingIds = new Set(existing.map(a => a.googleId));

  const newAssignments = [];

  for (let i = 0; i < courses.length; i++) {
    const works = workResults[i].data.courseWork || [];

    for (let work of works) {
      if (!existingIds.has(work.id)) {

        const dueDate = work.dueDate
          ? new Date(
              work.dueDate.year,
              work.dueDate.month - 1,
              work.dueDate.day
            )
          : null;

        newAssignments.push({
          googleId: work.id,
          userId,
          title: work.title,
          courseName: courses[i].name,
          alternateLink: work.alternateLink,
          dueDate
        });
      }
    }
  }

  if (newAssignments.length) {
    await Assignment.insertMany(newAssignments);
  }
};