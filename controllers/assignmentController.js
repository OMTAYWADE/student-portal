const {
  completeAssignment,
  undoAssignment
} = require("../services/assignmentService");

exports.complete = async (req, res, next) => {
  try {
    const updated = await completeAssignment(
      req.params.id,
      req.user.id
    );

    if (!updated) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.undo = async (req, res, next) => {
  try {
    const updated = await undoAssignment(
      req.params.id,
      req.user.id
    );

    if (!updated) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};