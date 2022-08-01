const userRouter = require("express").Router();
const User = require("../models/User");
const validator = require("email-validator");
const generateRandomPassword = require("../utils/generateRandomPassword");
const bcrypt = require("bcryptjs");

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
