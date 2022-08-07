const authenticationRouter = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verifyUser = require("../middleware/verifyUser");
const bcrypt = require("bcryptjs");

// get user data
authenticationRouter.get("/", verifyUser, async (req, res) => {
	try {
		const user = await User.findById(req.userID).select("-password");
		if (!user) {
			return res
				.status(401)
				.json({ msg: "Account you're trying to access no longer exists." });
		}
		res.send(user);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// log in user
authenticationRouter.post("/", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ msg: "All fields are required." });
	}

	try {
		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(401).json({ msg: "Invalid credentials." });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ msg: "Invalid credentials." });
		}
		const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1 week",
		});
		res.status(200).json({ token });
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

module.exports = authenticationRouter;
