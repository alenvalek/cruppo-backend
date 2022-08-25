const taskRouter = require("express").Router();
const verifyUser = require("../middleware/verifyUser");
const verifyRole = require("../middleware/verifyRole");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const Task = require("../models/Task");

taskRouter.patch(
	"/:taskID/:projectID",
	[verifyUser, verifyRole],
	async (req, res) => {
		const { isSuperUser, userID } = req;
		const { taskID, projectID } = req.params;

		const { newPosition, newColumn } = req.body;

		try {
			const projectExists = await Project.findById(projectID);

			if (!projectExists) {
				return res.status(400).json({ msg: "Project doesn't exist." });
			}

			if (isSuperUser) {
				await Task.findOneAndUpdate(
					{ _id: taskID },
					{ $set: { position: newPosition, column: newColumn } }
				);
			}

			const hasUserPermission = projectExists.teamMembers.some(
				(member) => member.toString() === userID
			);

			if (!hasUserPermission) {
				return res.status(400).send({ msg: "Insufficient permissions." });
			}

			await Task.findOneAndUpdate(
				{ _id: taskID },
				{ $set: { position: newPosition, column: newColumn } }
			);
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "task",
				user: userID,
			});
			newActivityLog.save();
			return res.status(200);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error" });
		}
	}
);

taskRouter.patch("/:projectID/:taskID/vote", [verifyUser], async (req, res) => {
	const { userID } = req;
	const { projectID, taskID } = req.params;

	try {
		const projectExists = await Project.findById(projectID);

		if (!projectExists) {
			return res.status(400).json({ msg: "Project doesn't exist." });
		}

		const hasUserPermission = projectExists.teamMembers.some(
			(member) => member.toString() === userID
		);

		if (!hasUserPermission) {
			return res.status(401).json({ msg: "Insufficient permissions." });
		}

		const task = await Task.findById(taskID);
		if (!task) {
			return res.status(400).json({ msg: "Task doesn't exist." });
		}

		if (task.votes.some((vote) => vote.toString() === userID)) {
			const position = task.votes.findIndex(
				(vote) => vote.toString() === userID
			);
			task.votes.splice(position, 1);
		} else {
			task.votes.unshift(userID);
		}

		await task.save();
		const newActivityLog = new ActivityLog({
			actionType: "update",
			actionEffect: "task",
			user: userID,
		});
		newActivityLog.save();
		res.json(task.votes);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error" });
	}
});

taskRouter.patch(
	"/:projectID/:taskID/assign",
	[verifyUser],
	async (req, res) => {
		const { userID } = req;
		const { projectID, taskID } = req.params;

		try {
			const projectExists = await Project.findById(projectID);

			if (!projectExists) {
				return res.status(400).json({ msg: "Project doesn't exist." });
			}

			const hasUserPermission = projectExists.teamMembers.some(
				(member) => member.toString() === userID
			);

			if (!hasUserPermission) {
				return res.status(401).json({ msg: "Insufficient permissions." });
			}

			const task = await Task.findById(taskID).populate(["reportedBy"]);
			if (!task) {
				return res.status(400).json({ msg: "Task doesn't exist." });
			}

			if (task.asignee === null || task.asignee.toString() !== userID) {
				task.asignee = userID;
			} else {
				task.asignee = null;
			}
			await task.save();

			await Task.populate(task, "asignee");
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "task",
				user: userID,
			});
			newActivityLog.save();
			res.json(task.asignee);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error" });
		}
	}
);

taskRouter.patch(
	"/:projectID/:taskID/detail",
	[verifyUser],
	async (req, res) => {
		const { userID } = req;
		const { projectID, taskID } = req.params;

		const { title, body, type } = req.body;

		try {
			const projectExists = await Project.findById(projectID);

			if (!projectExists) {
				return res.status(400).json({ msg: "Project doesn't exist." });
			}

			const hasUserPermission = projectExists.teamMembers.some(
				(member) => member.toString() === userID
			);

			if (!hasUserPermission) {
				return res.status(401).json({ msg: "Insufficient permissions." });
			}

			const task = await Task.findById(taskID).populate([
				"reportedBy",
				"asignee",
			]);
			if (!task) {
				return res.status(400).json({ msg: "Task doesn't exist." });
			}

			if (title) task.title = title;
			if (type) task.taskType = type;
			if (body) task.taskBody = body;

			await task.save();
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "task",
				user: userID,
			});
			newActivityLog.save();
			res.json(task);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error" });
		}
	}
);

taskRouter.patch(
	"/:projectID/:taskID/worklog",
	[verifyUser],
	async (req, res) => {
		const { userID } = req;
		const { projectID, taskID } = req.params;

		const { title, body, link } = req.body;

		try {
			const projectExists = await Project.findById(projectID);

			if (!projectExists) {
				return res.status(400).json({ msg: "Project doesn't exist." });
			}

			const hasUserPermission = projectExists.teamMembers.some(
				(member) => member.toString() === userID
			);

			if (!hasUserPermission) {
				return res.status(401).json({ msg: "Insufficient permissions." });
			}

			const task = await Task.findById(taskID);
			if (!task) {
				return res.status(400).json({ msg: "Task doesn't exist." });
			}

			let newLog = {
				title,
				description: body,
			};
			if (link) newLog.link = link;

			task.workLogs.unshift(newLog);

			await task.save();
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "task",
				user: userID,
			});
			newActivityLog.save();
			res.json(task.workLogs);
		} catch (error) {
			console.error(error);
			res.status(500).json({ msg: "Server Error" });
		}
	}
);

// add a new task to the current project
taskRouter.post("/:projectID", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, userID } = req;
	const { projectID } = req.params;

	const { taskTitle, taskType, taskBody, position, priority, deadLine } =
		req.body;

	try {
		const projectExists = await Project.findById(projectID);

		if (!projectExists) {
			return res.status(400).json({ msg: "Project doesn't exist." });
		}

		if (isSuperUser) {
			const newTask = new Task({
				taskTitle,
				taskType,
				taskBody,
				position,
				priority,
				reportedBy: userID,
				projectTeam: projectID,
			});
			if (deadLine) newTask.deadLine = deadLine;
			const newActivityLog = new ActivityLog({
				actionType: "create",
				actionEffect: "task",
				user: userID,
			});
			newActivityLog.save();
			await newTask.save();
			await Task.populate(newTask, ["reportedBy", "asignee"]);
			return res.status(200).json(newTask);
		}

		const hasUserPermission = projectExists.teamMembers.some(
			(member) => member.toString() === userID
		);

		if (!hasUserPermission) {
			return res.status(400).send({ msg: "Insufficient permissions." });
		}

		let newTask = new Task({
			taskType,
			taskBody,
			position,
			priority,
			reportedBy: userID,
			projectTeam: projectID,
		});

		if (deadLine) newTask.deadLine = deadLine;

		await newTask.save();
		await Task.populate(newTask, ["reportedBy", "asignee"]);
		return res.status(200).json(newTask);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error" });
	}
});

// get all tasks within a project scope
taskRouter.get("/:projectID", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, userID } = req;
	const { projectID } = req.params;

	try {
		const projectExists = await Project.findById(projectID);

		if (!projectExists) {
			return res.status(400).json({ msg: "Project doesn't exist." });
		}

		let projectTasks = [];

		if (isSuperUser) {
			projectTasks = await Task.find({ projectTeam: projectID }).populate([
				"reportedBy",
				"asignee",
			]);
			return res.status(200).send({ tasks: projectTasks });
		}

		const hasUserPermission = projectExists.teamMembers.some(
			(member) => member.toString() === userID
		);

		if (hasUserPermission) {
			projectTasks = await Task.find({ projectTeam: projectID });
			return res.status(200).send({ tasks: projectTasks });
		} else {
			return res.status(400).send({ msg: "Insufficient permissions." });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Server Error" });
	}
});

module.exports = taskRouter;
