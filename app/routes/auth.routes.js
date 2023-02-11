const controller = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/signup", controller.signup);

router.post("/signup", controller.signup);
router.post("/sendemail", controller.sendemail);
router.get("/verify/:token", controller.verify);
router.get("/signin", controller.signin);

module.exports = router;
