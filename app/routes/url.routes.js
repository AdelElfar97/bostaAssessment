const controller = require("../controllers/url.controller");
const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/authJwt");

router.post("/", isAuth, controller.createUrl);
router.get("/", isAuth, controller.getUrl);
router.put("/", isAuth, controller.editUrl);
router.delete("/", isAuth, controller.deleteUrl);

// router.post("/sendemail", controller.sendemail);
// router.post("/verify/:token", controller.verify);
// router.post("/signin", controller.signin);

module.exports = router;
