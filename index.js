const express = require("express");
const dotenv = require("dotenv");
const connectToDB = require("./config/connectToDb");
const userRouter = require("./api/userRouter");
const jobRoleRouter = require("./api/jobRoleRouter");
const authenticationRouter = require("./api/authentication");
const cors = require("cors");
const taskRouter = require("./api/taskRouter");
const projectsRouter = require("./api/projectsRouter");
const complaintRouter = require("./api/complaintRouter");
const activityRouter = require("./api/activityRouter");
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
app.use("/api/v1/activity", activityRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/projects", projectsRouter);

app.listen(PORT, () =>
	console.log(`[SERVER] Listening for requests at: http://localhost/${PORT}`)
);
