const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
		employee: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
	},
	{
		timestamps: true,
	}
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
