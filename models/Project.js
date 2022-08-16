const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
	projectType: {
		type: String,
		required: true,
		min: 3,
	},
	projectTag: {
		type: String,
		required: true,
		min: 1,
	},
	projectDepartment: {
		type: String,
		required: true,
	},
	teamLead: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
	teamMembers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "user",
		},
	],
	tasks: [
		{
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
			asignee: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				default: null,
			},
		},
	],
});

const Project = mongoose.model("project", projectSchema);

module.exports = Project;
