const Assignment = require("../models/assignment");
const { google } = require("googleapis");

exports.getAllCourses = async (req, res) => {
  try {

    // 🔹 Setup Google OAuth
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const classroom = google.classroom({
      version: "v1",
      auth: oauth2Client
    });

    // 🔹 Fetch courses from Google
    const coursesRes = await classroom.courses.list({
      pageSize: 100,
      courseStates: ["ACTIVE"]
    });

    const googleCourses = coursesRes.data.courses || [];

    // 🔹 Fetch assignments from DB
    const assignments = await Assignment.find({
      userId: req.user.id
    });

    // 🔹 Merge data
    const courses = googleCourses.map(course => {

      const related = assignments.filter(
        a => a.courseName === course.name
      );

      const total = related.length;
      const pending = related.filter(a => a.status === "pending").length;
      const completed = related.filter(a => a.status === "completed").length;
      const progress = total
        ? Math.round((completed / total) * 100)
        : 0;

      return {
        id: course.id,
        name: course.name,
        section: course.section,
        backgroundColor: course.backgroundColor,
        alternateLink: course.alternateLink,
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