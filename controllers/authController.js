exports.home = (req, res) => {
  res.render("index", { user: req.user });
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};