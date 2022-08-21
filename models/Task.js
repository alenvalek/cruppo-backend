const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
	{
		taskTitle: {
			type: String,
			required: true,
			min: 3,
		},
		taskType: {
			type: String,
			required: true,
			enum: ["task", "issue", "bug"],
		},
		taskBody: {
			type: String,
			required: true,
			min: 5,
		},
		position: {
			type: Number,
			required: true,
		},
		priority: {
			type: Number,
			required: true,
			enum: [1, 2, 3],
		},
		column: {
			type: String,
			required: true,
			enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
			default: "TODO",
		},
		reportedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			default: null,
		},
		asignee: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			default: null,
		},
		projectTeam: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Project",
		},
		deadLine: {
			type: Date,
		},
		workLogs: [
			{
				title: {
					type: String,
				},
				description: {
					type: String,
				},
				link: {
					type: String,
				},
				date: {
					type: Date,
					default: Date.now,
				},
			},
		],
		votes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
		],
	},
	{
		timestamps: true,
	}
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
