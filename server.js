const express = require("express");
const cors = require("cors");
const app = express();
require("./monitor");
require("./urls");

require("dotenv").config();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

const { DB_HOST, DB_PORT, DB_NAME } = process.env;

db.mongoose
  .connect(`mongodb://mongodb/bostaDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bosta application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const authenticationRouter = require("./app/routes/auth.routes");
const urlRouter = require("./app/routes/url.routes");
const reportRouter = require("./app/routes/report.routes");

app.use("/api/auth", authenticationRouter);

app.use("/api/url", urlRouter);
app.use("/api/report", reportRouter);

//Not found MW
app.use((request, response) => {
  response.status(404).json({ data: "Not Found" });
});

//Error MW
app.use((error, request, response, next) => {
  //JS  code function.length
  let status = error.status || 500;
  response.status(status).json({ Error: error + "" });
});
