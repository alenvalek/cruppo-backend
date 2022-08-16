const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
	{
		actionType: {
			type: String,
			required: true,
			enum: ["create", "update", "delete"],
		},
		actionEffect: {
			type: String,
			required: true,
			enum: ["jobRole", "project", "user"],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const ActivityLog = mongoose.model("activity log", activityLogSchema);

module.exports = ActivityLog;
