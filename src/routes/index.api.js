const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));
router.use("/event", require("./api/event.api"));
router.use("/quick-rally", require("./api/quickrally.api"));
router.use("/barhop", require("./api/barhop.api"));
router.use("/rallychat", require("./api/rallychat.api"));


module.exports = router;
