const multer = require("multer");
const path = require("path");

const FILE_SIZE_LIMIT = 1 * 1024 * 1024;

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

const upload = multer({
  storage: storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
}).single("profilePicture");

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size should not exceed 1MB" });
      }
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    next();
  });
};
