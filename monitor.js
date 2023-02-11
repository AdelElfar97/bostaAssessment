const Monitor = require("ping-monitor");
const { saveReport } = require("./app/controllers/report.controller");

exports.editMonitor = async (url, monitor) => {
  if (!monitor) {
    return;
  }
  monitor.pause();
  monitor.title = url.name;
  monitor.port = url?.port;
  monitor.config = {
    intervalUnits: "milliseconds",
  };
  monitor.expect = {
    statusCode: url.assert.statusCode,
  };

  if (url.authentication) {
    let auth =
      "Basic " +
      Buffer.from(
        url.authentication.username + ":" + url.authentication.password
      ).toString("base64");

    url.httpHeaders.push({ key: "Authorization", value: auth });
  }
  monitor.httpOptions = {
    path: url.path,
    headers: Object.fromEntries(
      url.httpHeaders.map((item) => [item.key, item.value])
    ),
  };

  monitor.interval = url.interval;
  monitor.ignoreSSL = url.ignoreSSL;
  monitor.resume();
};

exports.checkUrl = async (url) => {
  if (url.authentication) {
    let auth =
      "Basic " +
      Buffer.from(
        url.authentication.username + ":" + url.authentication.password
      ).toString("base64");

    url.httpHeaders.push({ key: "Authorization", value: auth });
  }
  let monObj = {
    title: url?.name,
    port: url?.port,
    config: {
      intervalUnits: "milliseconds",
    },
    expect: {
      statusCode: url?.assert?.statusCode,
    },

    httpOptions: {
      path: url?.path,
      headers: Object.fromEntries(
        url?.httpHeaders?.map((item) => [item.key, item.value])
      ),
    },
    interval: url?.interval,
    ignoreSSL: url?.ignoreSSL,
    urlId: url._id,
  };
  if (url?.website) {
    monObj.website = url.website;
  } else if (url?.address) {
    monObj.address = url.address;
  }
  const myMonitor = new Monitor(monObj);

  myMonitor.on("up", function (res, state) {
    if (myMonitor.history == undefined) myMonitor.history = [];
    myMonitor.history.push({ time: new Date(), state: state });

    if (res.responseTime) {
      myMonitor.responseTime = res.responseTime;
      if (myMonitor["sumResponseTime"]) {
        myMonitor.sumResponseTime =
          myMonitor.sumResponseTime + parseInt(res.responseTime);
      } else {
        myMonitor.sumResponseTime = parseInt(res.responseTime);
      }
    }
    saveReport(myMonitor);
  });
  myMonitor.on("down", function (res, state) {
    if (myMonitor.history == undefined) myMonitor.history = [];
    myMonitor.history.push({ time: new Date(), state: state });

    if (res.responseTime) {
      myMonitor.responseTime = res.responseTime;
      if (myMonitor["sumResponseTime"]) {
        myMonitor.sumResponseTime =
          myMonitor.sumResponseTime + parseInt(res.responseTime);
      } else {
        myMonitor.sumResponseTime = parseInt(res.responseTime);
      }
    }
    saveReport(myMonitor);
  });

  myMonitor.on("stop", function (website) {});

  myMonitor.on("error", function (error) {
    console.log(error);
  });

  return myMonitor;
};
