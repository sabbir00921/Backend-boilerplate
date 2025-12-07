const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "../../public/temp");
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname.replace(" ", ""));
  },
});

const upload = multer({ storage: storage });
module.exports = { upload };
