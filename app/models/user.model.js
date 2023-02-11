const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      unique: true, // `username` must be unique,
      required: true,
    },

    username: {
      type: String,
      unique: true, // `username` must be unique,
      required: true,
    },
    email: {
      type: String,
      unique: true, // `email` must be unique
      required: true,
    },
    password: String,
    verified: Boolean,

    urls: [
      {
        type: Schema.Types.ObjectId,
        ref: "Url",
      },
    ],
  })
);

module.exports = User;
