const db = require("./app/models");
const { publish } = require("./app/utils/helper");

const { checkUrl, editMonitor } = require("./monitor");
const amqp = require("amqplib/callback_api");

//first time
getUrls();
let monitoredUrls = {};

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
    let queueName = "create";
    channel.assertQueue(queueName, {
      durable: false,
    });
    channel.consume(queueName, (msg) => {
      let url = JSON.parse(msg.content.toString());
      monitorUrl(url);

      channel.ack(msg);
    });

    queueName = "delete";
    channel.assertQueue(queueName, {
      durable: false,
    });
    channel.consume(queueName, (msg) => {
      let url = JSON.parse(msg.content.toString());
      monitoredUrls[url]?.stop();
      channel.ack(msg);
    });

    queueName = "update";
    channel.assertQueue(queueName, {
      durable: false,
    });
    channel.consume(queueName, (msg) => {
      channel.ack(msg);
      let res = JSON.parse(msg.content.toString());
      let id = res.id;
      let data = res.data;
      editMonitor(data, monitoredUrls[id]);
    });
  });
});

async function monitorUrl(sentUrl) {
  switch (sentUrl.protocol) {
    case "https":
    case "http":
      sentUrl.website = sentUrl.protocol + "://" + sentUrl.url;
      sentUrl.port = 80;
    case "tcp":
      sentUrl.address = sentUrl.url;
  }
  // if (sentUrl.authentication) {
  //   let auth =
  //     "Basic " +
  //     Buffer.from(
  //       sentUrl.authentication.username + ":" + sentUrl.authentication.password
  //     ).toString("base64");

  //   sentUrl.httpHeaders.push({ key: "Authorization", value: auth });
  // }
  let myMonitor = await checkUrl(sentUrl);

  monitoredUrls[sentUrl._id] = myMonitor;
}
function getUrls() {
  try {
    db.url
      .find({ arr: { $all: [null] } })
      .then((res) => {
        res.forEach((url) => {
          publish("create", JSON.stringify(url));

          const amqp = require("amqplib/callback_api");

          let queueName = "create";
          let message = JSON.stringify(url);

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
        });
      })
      .catch((e) => {
        console.log("err", e);
      });
  } catch (err) {
    console.log("err", err);
  }
}
