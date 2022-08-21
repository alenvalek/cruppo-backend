const verifyRole = require("../middleware/verifyRole");
const verifyUser = require("../middleware/verifyUser");
const ActivityLog = require("../models/ActivityLog");

const activityRouter = require("express").Router();

activityRouter.get("/", [verifyUser, verifyRole], async (req, res) => {
	const { isSuperUser, isHR } = req;

	try {
		if (isSuperUser || isHR) {
			const activityList = await ActivityLog.find({})
				.populate("user")
				.sort([["createdAt", -1]]);
			res.status(200).json(activityList);
		} else {
			return res.status(401).json({ msg: "Insufficient permissions" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ msg: "Server error" });
	}
});

module.exports = activityRouter;
