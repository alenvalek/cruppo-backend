const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
	projectName: {
		type: String,
		required: true,
		min: 3,
	},
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
	url: {
		type: String,
		default: "",
	},
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
