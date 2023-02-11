const assert = require("assert");
const { checkUrl } = require("./monitor");
let obj = {
  name: "test",
  url: "the-internet.herokuapp.com",
  path: "/basic_auth",
  protocol: "https",
  port: 80,
  interval: 5000,
  tags: ["tag1", "tag2"],
  httpHeaders: [
    {
      key: "header1",
      value: "val1Header",
    },
  ],
  threshold: "2",
  authentication: {
    username: "admin",
    password: "admin",
  },
  assert: {
    statusCode: 200,
  },
};

let url = checkUrl(obj).then((data) => {
  describe("sucessful URL", () => {
    it("should return 2", () => {
      console.log("DATA", data);
      assert.equal(data.isUp, true);
      data.stop();
      return;
    });
  });

  // obj.authentication.password = "wrongPass";
  // let url2 = checkUrl(obj);
  // describe("failed URL wrong password", () => {
  //   it("shouldnt connect wrong pass", () => {
  //     assert.equal(url2.isUp, false);
  //   });
  // });
});
