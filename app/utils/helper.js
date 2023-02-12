const jwt = require("jsonwebtoken");
require("dotenv").config();
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

exports.generateVerificationToken = (userId, email) => {
  const verificationToken = jwt.sign(
    {
      id: userId,
      email: email,
    },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "1hr",
    }
  );
  return verificationToken;
};

exports.sendmail = async (mailOptions) => {
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

  transport.sendMail(mailOptions, function (err, result) {
    if (err) {
      // res.status(500).send({ message: err });
      return;
    } else {
      transport.close();
      // res.status(500).send({ message: result });
      return;
    }
  });
};
exports.publish = (queueName, message) => {
  const amqp = require("amqplib/callback_api");

  //AMQP_URL: amqp://guest:guest@rabbitmq:5672

  amqp.connect("amqp://rabbitmq:5672", (err, connection) => {
    if (err) {
      console.log("ERROR", err);

      throw err;
    }
    connection.createChannel((err, channel) => {
      if (err) {
        console.log("ERROR", err);
        throw err;
      }
      channel.assertQueue(queueName, {
        durable: false,
      });
      channel.sendToQueue(queueName, Buffer.from(message));
      setTimeout(() => {
        connection.close();
      }, 1000);
    });
  });
};
