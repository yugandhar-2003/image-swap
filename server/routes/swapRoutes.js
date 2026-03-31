const express = require("express");
const multer = require("multer");
const { generateFaceSwap, getHistory } = require("../controllers/swapController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "portrait", maxCount: 1 },
  ]),
  generateFaceSwap,
);

router.get("/history", getHistory);

module.exports = router;
