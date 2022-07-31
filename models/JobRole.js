const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema({
	positionName: {
		type: String,
		required: true,
		min: 3,
	},
	description: {
		type: String,
	},
});

const JobRole = mongoose.model("Job role", jobRoleSchema);

module.exports = JobRole;
