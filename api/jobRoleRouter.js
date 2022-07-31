const jobRoleRouter = require("express").Router();
const verifyUser = require("../middleware/verifyUser");
const JobRole = require("../models/JobRole");
const User = require("../models/User");

// get all job roles
jobRoleRouter.get("/", verifyUser, async (req, res) => {
	try {
		const user = await User.findById(req.userID);
		if (user.role !== "admin" || user.role !== "hr" || user.role !== "owner") {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		const roles = await JobRole.find({});
		res.json(roles);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// create a job role
jobRoleRouter.post("/", verifyUser, async (req, res) => {
	const { positionName, description } = req.body;

	if (!positionName) {
		return res.status(400).json({ msg: "All fields are required." });
	}

	if (positionName.length < 3) {
		return res
			.status(400)
			.json({ msg: "Position name must be at least 3 characters long" });
	}
	try {
		const user = await User.findById(req.userID);
		if (user.role !== "admin" || user.role !== "hr" || user.role !== "owner") {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		let newPosition = {};

		newPosition.positionName = positionName;
		if (description) newPosition.description = description;

		newPosition = new JobRole(newPosition);

		await newPosition.save();

		res.json(newPosition);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

module.exports = jobRoleRouter;
