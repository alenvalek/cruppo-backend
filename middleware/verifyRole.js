const User = require("../models/User");

module.exports = verifyRole = async (req, res, next) => {
	try {
		const user = await User.findById(req.userID);
		if (user.role === "admin" || user.role === "owner") {
			req.isSuperUser = true;
			req.isHR = false;
		} else if (user.role === "hr") {
			req.isSuperUser = false;
			req.isHR = true;
		} else {
			res.isSuperUser = false;
			req.isHR = false;
		}
		next();
	} catch (error) {
		console.error(error);
		res.status(401).json({ msg: "Server Error" });
	}
};
