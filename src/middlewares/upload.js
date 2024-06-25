const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    if (!req.user || !req.user.id) {
      return cb(new Error("User ID is missing in the request"));
    }
    const ext = path.extname(file.originalname);
    const fileName = `${req.user.id}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage }).single("profilePicture");

module.exports = upload;
