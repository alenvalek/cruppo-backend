const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	salary: {
		type: Number,
		required: true,
	},
	position: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Job role",
		required: true,
	},
	password: {
		type: String,
		required: true,
		min: 6,
	},
	hasTempPassword: {
		type: Boolean,
		default: true,
	},
	role: {
		type: String,
		enum: ["owner", "hr", "admin", "employee"],
		required: true,
		default: "employee",
	},
	recentlyViewed: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
		},
	],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
