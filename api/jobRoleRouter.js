const jobRoleRouter = require("express").Router();
const verifyUser = require("../middleware/verifyUser");
const ActivityLog = require("../models/ActivityLog");
const JobRole = require("../models/JobRole");
const User = require("../models/User");

// get all job roles
jobRoleRouter.get("/", verifyUser, async (req, res) => {
	try {
		const user = await User.findById(req.userID);
		if (user.role !== "admin") {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		const roles = await JobRole.find({});
		res.json(roles);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// get all job roles
jobRoleRouter.get("/:jobid", verifyUser, async (req, res) => {
	try {
		const allowedRoles = ["admin", "hr", "owner"];
		const user = await User.findById(req.userID);
		if (!allowedRoles.includes(user.role)) {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		const job = await JobRole.findById(req.params.jobid);
		res.json(job);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

jobRoleRouter.delete("/:jobid", verifyUser, async (req, res) => {
	const allowedRoles = ["admin", "hr", "owner"];
	const { userID } = req;
	const { jobid } = req.params;

	try {
		const user = await User.findById(req.userID);
		if (!allowedRoles.includes(user.role)) {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		const newActivityLog = new ActivityLog({
			actionType: "delete",
			actionEffect: "jobRole",
			user: userID,
		});
		newActivityLog.save();
		await JobRole.findByIdAndDelete(jobid);
		return res.status(200).send();
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// create a job role
jobRoleRouter.post("/", [verifyUser], async (req, res) => {
	const { positionName, description, recommendedSalary, canStartProject } =
		req.body;
	const { userID } = req;

	if (!positionName) {
		return res.status(400).json({ msg: "All fields are required." });
	}

	if (positionName.length < 3) {
		return res
			.status(400)
			.json({ msg: "Position name must be at least 3 characters long" });
	}
	const allowedRoles = ["admin", "hr", "owner"];
	try {
		const user = await User.findById(req.userID);
		if (!allowedRoles.includes(user.role)) {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
		let newPosition = {};

		newPosition.positionName = positionName;
		newPosition.recommendedSalary = recommendedSalary;
		newPosition.canStartProject = canStartProject;
		if (description) newPosition.description = description;

		newPosition = new JobRole(newPosition);
		const newActivityLog = new ActivityLog({
			actionType: "create",
			actionEffect: "jobRole",
			user: userID,
		});
		newActivityLog.save();
		await newPosition.save();

		res.json(newPosition);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

jobRoleRouter.patch("/:jobid", [verifyUser], async (req, res) => {
	const { positionName, description, recommendedSalary, canStartProject } =
		req.body;

	const { jobid } = req.params;

	const allowedRoles = ["admin", "hr", "owner"];
	try {
		const user = await User.findById(req.userID);
		if (!allowedRoles.includes(user.role)) {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}

		let position = await JobRole.findById(jobid);
		if (!position) {
			return res.status(400).json({ msg: "Job doesnt exist" });
		}

		position.positionName = positionName;
		position.recommendedSalary = recommendedSalary;
		position.canStartProject = canStartProject;
		if (description) newPosition.description = description;

		position.save();
		const newActivityLog = new ActivityLog({
			actionType: "update",
			actionEffect: "jobRole",
			user: req.userID,
		});
		newActivityLog.save();
		res.status(200).json(position);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

module.exports = jobRoleRouter;
