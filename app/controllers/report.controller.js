const db = require("../models");
const Url = require("../models/url.model");
const User = require("../models/user.model");
const { sendmail } = require("../utils/helper");
require("dotenv").config();

exports.getAllReports = async (monitor) => {
  try {
    const user = await User.findById(monitor.urlId);

    if (user && user.urls.includes(monitor.urlId)) {
      const url = await Url.findOne({ _id: monitor.urlId });

      res.status(201).send({ message: url.report });
    } else {
      res.status(500).send({ message: "url does not exist" });
    }
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.getLogsWithTags = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    const url = await Url.findOne({ _id: req.query.id });

    if (user.urls.includes(url._id)) {
      res.status(201).send({ message: url.report.history });
    }
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.getReportByTag = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    const urlWithTag = await Url.find({ tags: { $in: ["tag1"] } }).select(
      "-report.alerted -report.sumResponseTime -report.totalRequests -report.stillDown -report.history"
    );
    let reports = [];
    urlWithTag.forEach((url) => {
      if (user.urls.includes(url._id)) {
        reports.push(url.report);
      }
    });

    res.status(201).send({ message: reports });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.saveReport = async (monitor) => {
  if (!monitor.urlId) return;
  const url = await Url.findById(monitor.urlId);

  let data = {};
  data.totalRequests =
    (url?.report?.totalRequests + 1) | monitor?.totalRequests;
  data.status = url?.report?.status | monitor?.isUp ? "up" : "down";
  data.outages =
    (url?.report?.outages + (data.status == "down" ? 1 : 0)) |
    monitor?.totalDownTimes;

  data.availability =
    (url?.report?.availability >= 0) |
    Math.round(
      ((data.totalRequests - data.outages) / data.totalRequests) * 100
    );

  data?.totalRequests;

  data.sumResponseTime =
    (url?.report?.sumResponseTime | 0) + monitor.responseTime;

  data.avgResponseTime = Math.round(data.sumResponseTime / data?.totalRequests);

  data.upTime =
    (url?.report?.upTime | 0) + (data.status == "up" ? url.interval / 1000 : 0);

  data.downTime =
    (url?.report?.downTime | 0) +
    (data.status == "down" ? url.interval / 1000 : 0);

  data.stillDown = url.report?.stillDown | 0;
  data.alerted = url.report?.alerted | false;

  data.history = monitor?.history;

  if (monitor.isUp == false) {
    data.stillDown += 1;
  }

  if (
    url?.report?.stillDown >= url.threshold &&
    data?.alerted == false &&
    monitor?.isUp == false
  ) {
    let mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender
      to: url.emailNotification, // receiver
      subject: `warning `,
      html: `your URL ${url.url} is down plz check it`,
    };
    sendmail(mailOptions);
    data.alerted = true;
  }
  if (url?.report?.alerted == true && monitor?.isUp == true) {
    data.alerted = false;
    data.stillDown = 0;
    let mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender
      to: url.emailNotification, // receiver
      subject: `yaaaaaaah`,
      html: `your URL ${url.url} is back again :) `,
    };
    sendmail(mailOptions);
  }
  await Url.findByIdAndUpdate(monitor.urlId, { report: data });
};
