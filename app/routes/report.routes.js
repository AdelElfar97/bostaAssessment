const controller = require("../controllers/report.controller");
const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/authJwt");

router.get("/", isAuth, controller.getReportByTag);
router.get("/reports", isAuth, controller.getAllReports);
router.get("/logs", isAuth, controller.getLogsWithTags);

module.exports = router;
