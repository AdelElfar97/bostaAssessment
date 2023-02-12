const db = require("../models");
const Url = db.url;
const User = db.user;
var bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { publish } = require("../utils/helper");

exports.createUrl = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    const url = new Url(req.body);
    if (!url.emailNotification) {
      url.emailNotification = req.email;
    }
    await url.save();

    user.urls.push(url);

    await user.save();

    res.status(201).send(url);
    publish("create", JSON.stringify(url));
  } catch (err) {
    console.log("err", err);

    res.status(500).send({ message: err });
  }
};

exports.getUrl = async (req, res) => {
  try {
    const user = await User.findById(req.id);

    if (user && user.urls.includes(req.query.url)) {
      const url = await Url.findOne({ _id: req.query.url });
      publish("get", JSON.stringify(req.query.url));
      res.status(201).send({ url });
    } else {
      res.status(500).send({ message: "url does not exist" });
    }
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.editUrl = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (user && user.urls.includes(req.query.url)) {
      const option = { new: true }; //will return updated document

      const url = await Url.findByIdAndUpdate(req.query.url, req.body, option);

      publish("update", JSON.stringify({ data: url, id: req.query.url }));
      res.send({ message: url });
    } else {
      res.status(500).send({ message: "url does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err });
  }
};

exports.deleteUrl = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.id });

    if (user && user.urls.includes(req.query.url)) {
      User.findOneAndUpdate(
        { _id: req.id },
        { $pull: { urls: mongoose.Types.ObjectId(req.query.url) } }
      ).exec();

      await Url.findByIdAndDelete(req.query.url);
      publish("delete", JSON.stringify(req.query.url));

      res.send({ message: "deleted" });
    } else {
      res.status(500).send({ message: "url does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err });
  }
};
