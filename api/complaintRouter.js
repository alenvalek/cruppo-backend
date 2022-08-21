const complaintRouter = require("express").Router();
const Complaint = require("../models/Complaint");
const verifyUser = require("../middleware/verifyUser");
const verifyRole = require("../middleware/verifyRole");

complaintRouter.get("/", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, isHR } = req;

	try {
		if (isSuperUser || isHR) {
			const complaints = await Complaint.find({}).populate("employee");
			return res.status(200).json(complaints);
		} else {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: "Server error" });
	}
});

complaintRouter.get("/:id", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, isHR } = req;
	const { id } = req.params;
	try {
		if (isSuperUser || isHR) {
			const complaint = await Complaint.findById(id).populate("employee");
			return res.status(200).json(complaint);
		} else {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: "Server error" });
	}
});

complaintRouter.post("/", [verifyUser, verifyRole], async (req, res) => {
	const { userID } = req;

	const { title, body, isAnon } = req.body;

	try {
		let complaint = new Complaint({
			title,
			body,
		});
		if (!isAnon) complaint.employee = userID;
		await complaint.save();
		return res.status(200).json(complaint);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: "Server error" });
	}
});

module.exports = complaintRouter;
