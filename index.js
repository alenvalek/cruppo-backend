const express = require("express");
const dotenv = require("dotenv");
const connectToDB = require("./config/connectToDb");
const userRouter = require("./api/userRouter");
const jobRoleRouter = require("./api/jobRoleRouter");
const authenticationRouter = require("./api/authentication");
const cors = require("cors");
dotenv.config();

const PORT = process.env.PORT || 5000;

// creating the server instance
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));

// configuration and database connection
connectToDB();
app.use(express.json());

// api endpoints
app.use("/api/v1/users", userRouter);
app.use("/api/v1/authentication", authenticationRouter);
app.use("/api/v1/roles", jobRoleRouter);

app.listen(PORT, () =>
	console.log(`[SERVER] Listening for requests at: http://localhost/${PORT}`)
);
