const { google } = require("googleapis");

exports.fetchCoursesAndWorks = async (accessToken) => {

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const classroom = google.classroom({
    version: "v1",
    auth: oauth2Client
  });

  const coursesRes = await classroom.courses.list();
  const courses = coursesRes.data.courses || [];

  const workPromises = courses.map(course =>
    classroom.courses.courseWork.list({ courseId: course.id })
  );

  const workResults = await Promise.all(workPromises);

  return { courses, workResults };
};