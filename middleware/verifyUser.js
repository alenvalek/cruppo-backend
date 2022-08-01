const jwt = require("jsonwebtoken");

module.exports = verifyUser = (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return res.status(401).json({ msg: "No token present." });
		}
		const headerType = req.headers.authorization.split(" ")[0];
		if (!headerType === "Bearer") {
			return res.status(401).json({ msg: "Invalid token type." });
		}
		const token = req.headers.authorization.split(" ")[1];
		const data = jwt.verify(token, process.env.JWT_SECRET, {
			maxAge: "1 week",
		});

		if (!data) {
			return res.status(401).json({ msg: "Invalid token" });
		}

		req.userID = data.uid;
		next();
	} catch (error) {
		console.error(error);
		res.status(401).json({ msg: "Invalid token" });
	}
};
