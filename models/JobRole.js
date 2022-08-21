const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema({
	positionName: {
		type: String,
		required: true,
		min: 3,
	},
	recommendedSalary: {
		type: Number,
		required: true,
	},
	canStartProject: {
		type: Boolean,
		required: true,
		default: false,
	},
	description: {
		type: String,
	},
});

const JobRole = mongoose.model("Job role", jobRoleSchema);

module.exports = JobRole;
