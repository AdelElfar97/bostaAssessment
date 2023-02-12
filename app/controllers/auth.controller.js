const db = require("../models");
const User = db.user;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { generateVerificationToken, sendmail } = require("../utils/helper");
require("dotenv").config();
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then(async (user) => {
      if (!user) {
        const user = new User({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
        });

        user.save(async (err, user) => {
          if (err) {
            console.log(err.keyValue);
            res.status(500).send({ message: err });
            return;
          } else {
            res.send({
              message:
                "account registered,plz open your mail and verify your account",
            });
            this.sendemail(req, res);
          }
        });
      }
      if (user && user.verified) {
        res.send({ message: "User is already verified, plz login" });
        return;
      } else if (user && !user.verified) {
        res.send({ message: "plz verify ur account " });
        return;
      }
    })
    .catch((e) => {
      return e;
    });
};

exports.sendemail = async (req, res) => {
  User.findOne({
    username: req.body.username,
    email: req.body.email,
  })
    .then(async (user) => {
      if (!user) {
        res.send({ message: "plz signup first" });
        return;
      }
      if (user && user.verified) {
        res.send({ message: "User is already verified, plz login" });
        return;
      } else if (user && !user.verified) {
        const myOAuth2Client = new OAuth2(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );

        myOAuth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN,
        });

        const myAccessToken = myOAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.EMAIL_USERNAME, //your gmail account you used to set the project up in google cloud console"
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: myAccessToken, //access token variable we defined earlier
          },
        });
        const verificationToken = generateVerificationToken(user._id);

        const url = `http://localhost:8080/api/auth/verify/${verificationToken}`;

        const mailOptions = {
          from: process.env.EMAIL_USERNAME, // sender
          to: req.body.email, // receiver
          subject: "Verify Account",
          html: `Click <a href = '${url}'>here</a> to confirm your email.`,
        };

        transport.sendMail(mailOptions, function (err, result) {
          if (err) {
            res.status(500).send({ message: err });
            return;
          } else {
            transport.close();
            res.status(500).send({ message: result });
            return;
          }
        });

        res.send({ message: "verication mail sent" });
        return;
      }
    })
    .catch((e) => {
      return e;
    });
};
exports.verify = async (req, res) => {
  const { token } = req.params;
  // Check we have an id
  if (!token) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }
  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.SECRET_TOKEN);
  } catch (err) {
    return res.status(500).send(err);
  }
  try {
    const user = await User.findOne({ _id: payload.id }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }
    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return res.status(200).send({
      message: "Account Verified",
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.signin = async (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .then(async (user) => {
      if (!user) {
        res.send({ message: "user does not exist" });
      }
      if (user && user.verified) {
        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: req.body.email,
          },
          process.env.SECRET_TOKEN,
          {
            expiresIn: 86400, // 24 hours
          }
        );

        res.status(200).send({
          accessToken: token,
        });

        res.send({ message: "loginned successfully" });
        return;
      } else if (user && !user.verified) {
        res.send({ message: "plz verify ur account " });
        return;
      }
    })
    .catch((e) => {
      return e;
    });

  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
  });
};
