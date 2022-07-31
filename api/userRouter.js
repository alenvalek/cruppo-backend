const userRouter = require("express").Router();
const User = require("../models/User");
const validator = require("email-validator");
const generateRandomPassword = require("../utils/generateRandomPassword");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyUser = require("../middleware/verifyUser");

// get logged in user
userRouter.get("/auth", verifyUser, async (req, res) => {
	try {
		let user = await User.findById(req.userID).select("-password");

		res.json(user);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// log in user
userRouter.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne(email).select("-password");

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

// register user
userRouter.post("/", async (req, res) => {
	const { firstName, lastName, email, salary, position, role } = req.body;

	if (!firstName || !lastName || !email || !salary || !position) {
		return res.status(400).json({ msg: "All fields are required." });
	}

	const validEmail = validator.validate(email);

	if (!validEmail) {
		return res.status(400).json({ msg: "Email must be valid." });
	}

	const password = generateRandomPassword();

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	try {
		let newUser = new User({
			firstName,
			lastName,
			email,
			salary,
			position,
			password: hashedPassword,
			role,
		});

		await newUser.save();

		await User.populate(newUser, "position");

		newUser = newUser.toJSON();
		delete newUser.password;

		res.status(200).json({ tempPassword: password, ...newUser });
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

module.exports = userRouter;
