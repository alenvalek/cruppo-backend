const verifyRole = require("../middleware/verifyRole");
const verifyUser = require("../middleware/verifyUser");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const projectsRouter = require("express").Router();

// get all projects
projectsRouter.get("/", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, userID } = req;

	let projects = [];

	try {
		if (isSuperUser) {
			projects = await Project.find({}).populate("teamLead");
			return res.status(200).json(projects);
		}

		projects = await Project.find({ teamMembers: userID }).populate("teamLead");
		return res.status(200).json(projects);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error!" });
	}
});

projectsRouter.get(
	"/:projectID",
	[verifyUser, verifyRole],
	async (req, res) => {
		const { isSuperUser } = req;
		const { projectID } = req.params;

		let project = {};

		try {
			if (isSuperUser) {
				project = await Project.findById(projectID).populate([
					"teamLead",
					"teamMembers",
				]);
				return res.status(200).json(project);
			}

			project = await Project.findById(projectID).populate([
				"teamLead",
				"teamMembers",
			]);
			return res.status(200).json(project);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error!" });
		}
	}
);

projectsRouter.get("/:projectID/summary", [verifyUser], async (req, res) => {
	const { projectID } = req.params;

	try {
		const projectTasks = await Task.find({ projectTeam: projectID });

		const todoTasks = projectTasks.filter((task) => task.column === "TODO");
		const progressTasks = projectTasks.filter(
			(task) => task.column === "IN_PROGRESS"
		);
		const reviewTasks = projectTasks.filter(
			(task) => task.column === "IN_REVIEW"
		);
		const doneTasks = projectTasks.filter((task) => task.column === "DONE");

		return res.status(200).json({
			todo: todoTasks || [],
			progress: progressTasks || [],
			review: reviewTasks || [],
			done: doneTasks || [],
			all: projectTasks || [],
			length: projectTasks.length,
			donePerc: (doneTasks.length / projectTasks.length) * 100,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error!" });
	}
});

// create a new project
projectsRouter.post("/", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, userID } = req;

	const { projectType, projectTag, projectDepartment, url } = req.body;

	if (!projectType || !projectTag || !projectDepartment)
		return res.status(400).json({ msg: "All fields are required." });
	try {
		if (isSuperUser) {
			let newProject = new Project({
				projectType,
				projectTag,
				projectDepartment,
				teamLead: userID,
			});
			if (url) newProject.url = url;
			newProject.teamMembers.unshift(userID);
			await newProject.save();
			const newActivityLog = new ActivityLog({
				actionType: "create",
				actionEffect: "project",
				user: userID,
			});
			newActivityLog.save();
			return res.status(200).json(newProject);
		}
		const currentUser = await User.findById(userID).populate("position");

		if (!currentUser.position.canStartProject)
			return res.status(400).json({ msg: "Insufficient permissions" });

		let newProject = new Project({
			projectType,
			projectTag,
			projectDepartment,
			teamLead: userID,
		});
		if (url) newProject.url = url;
		newProject.teamMembers.unshift(userID);
		await newProject.save();
		return res.status(200).json(newProject);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error!" });
	}
});

projectsRouter.post("/:projectid/:userid", [verifyUser], async (req, res) => {
	const { projectid, userid } = req.params;

	try {
		const project = await Project.findById(projectid);
		project.teamMembers.unshift(userid);
		await project.save();
		await Project.populate(project, "teamMembers");
		await Project.populate(project, "teamMembers.position");
		const newActivityLog = new ActivityLog({
			actionType: "update",
			actionEffect: "project",
			user: req.userID,
		});
		newActivityLog.save();
		return res.status(200).json(project.teamMembers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error!" });
	}
});

projectsRouter.delete("/:projectid/:userid", [verifyUser], async (req, res) => {
	const { projectid, userid } = req.params;

	try {
		const project = await Project.findById(projectid).populate("teamMembers");
		const elementToRemove = project.teamMembers.findIndex(
			(e) => e._id.toString() === userid
		);
		project.teamMembers.splice(elementToRemove, 1);
		await project.save();
		await Project.populate(project, "teamMembers.position");

		const newActivityLog = new ActivityLog({
			actionType: "delete",
			actionEffect: "project",
			user: req.userID,
		});
		newActivityLog.save();
		return res.status(200).json(project.teamMembers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error!" });
	}
});

// update project
projectsRouter.patch(
	"/:projectID/:user_id",
	[verifyUser, verifyRole],
	async (req, res) => {
		const { isSuperUser, userID } = req;
		const { projectID, user_id } = req.params;
		const { projectType, projectTag, projectDepartment, updateType } = req.body;

		try {
			const projectExists = await Project.findById(projectID);
			const currentUser = await User.findById(userID).populate("position");
			if (!currentUser.position.canStartProject || !isSuperUser)
				res.status(400).json({ msg: "Insufficient permissions" });

			if (!projectExists)
				return res.status(400).json({ msg: "Project doesn't exist" });

			if (updateType === "general") {
				if (projectType) projectExists.projectType = projectType;
				if (projectTag) projectExists.projectTag = projectTag;
				if (projectDepartment)
					projectExists.projectDepartment = projectDepartment;
			} else if (updateType === "removeUser") {
				const position = projectExists.teamMembers.findIndex(
					(user) => user.toString() === user_id
				);
				projectExists.teamMembers.splice(position, 1);
			} else if (updateType === "addUser") {
				projectExists.teamMembers.unshift(user_id);
			}
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "project",
				user: userID,
			});
			newActivityLog.save();
			return res.status(200).json(projectExists);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error!" });
		}
	}
);

module.exports = projectsRouter;
