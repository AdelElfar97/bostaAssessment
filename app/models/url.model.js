const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Url = mongoose.model(
  "Url",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      immutable: true,
    },
    protocol: {
      type: String,
      enum: ["http", "https", "tcp"],
      lowercase: true,
      trim: true,
      required: true,
    },
    path: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },

    port: {
      type: Number,
      required: false,
    },
    webhook: {
      type: String,
      required: false,
    },
    emailNotification: {
      type: String,
      required: false,
    },
    timeout: {
      type: Number,
      required: false,
      default: 50 * 1000,
    },
    interval: {
      type: Number,
      required: false,
      default: 10 * 1000 * 60,
    },
    threshold: {
      type: Number,
      required: false,
      default: 1,
    },

    authentication: {
      required: false,
      username: {
        type: String,
      },
      password: {
        type: String,
      },
    },

    httpHeaders: [{ key: String, value: String }],
    assert: {
      required: false,
      statusCode: {
        type: Number,
      },
    },
    tags: { type: Array, default: [], required: false },

    ignoreSSL: {
      type: Boolean,
      required: false,
    },
    report: {
      type: Object,
    },
  })
);

module.exports = Url;
