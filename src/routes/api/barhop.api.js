const express = require("express");
const router = express.Router();
const barhopController = require("../../controller/barhop.controler");
const { upload } = require("../../middleware/multer.middleware");
const { authGuard } = require("../../middleware/auth.middleware");

router
  .route("/create-barhop")
  .post(upload.single("image"), authGuard, barhopController.createBarhop);
router.route("/get-barhops").get(authGuard, barhopController.getAllBarhops);
router.route("/get-single-barhop/:id").get(authGuard, barhopController.getSingleBarhop);
router.route("/get-single-barhop/:id").get(authGuard, barhopController.getSingleBarhop);


module.exports = router;
