exports.toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

exports.normalize = (str) => {
  return str.trim().toLowerCase();
};