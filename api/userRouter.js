const userRouter = require("express").Router();
const User = require("../models/User");
const Project = require("../models/Project");
const validator = require("email-validator");
const generateRandomPassword = require("../utils/generateRandomPassword");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Email = require("email-templates");
const jwt = require("jsonwebtoken");
const verifyUser = require("../middleware/verifyUser");
const verifyRole = require("../middleware/verifyRole");

const frontEndBaseURL = "http://localhost:3000";

// service for sending out emails using a company mail account
// ( currently set up to work with google gmail )
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.COMPANY_GMAIL,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
});

// get all users
userRouter.get("/", async (req, res) => {
	try {
		const users = await User.find({}).populate("position");
		return res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

userRouter.patch(
	"/user/:userID",
	[verifyUser, verifyRole],
	async (req, res) => {
		const { email, firstName, lastName, salary, position, role } = req.body;
		const { userID } = req.params;
		const { isSuperUser } = req;
		try {
			if (!isSuperUser || userID !== req.userID) {
				return res.status(401).json({ msg: "Not authorized" });
			}
			const user = await User.findById(userID);
			if (!user) {
				return res.status(400).json({ msg: "User doesn't exist" });
			}

			if (email) user.email = email;
			if (firstName) user.firstName = firstName;
			if (lastName) user.lastName = lastName;
			if (salary) user.salary = salary;
			if (position) user.position = position;
			if (role) user.role = role;
			await user.save();
			const newActivityLog = new ActivityLog({
				actionType: "update",
				actionEffect: "user",
				user: userID,
			});
			newActivityLog.save();
			return res.status(200).json(user);
		} catch (error) {
			res.status(500).json({ msg: "Server Error" });
			console.error(error);
		}
	}
);

userRouter.delete(
	"/user/:userID",
	[verifyUser, verifyRole],
	async (req, res) => {
		const { userID } = req.params;
		const { isSuperUser } = req;
		try {
			if (!isSuperUser) {
				return res.status(401).json({ msg: "Not authorized" });
			}

			await User.findByIdAndDelete(userID);
			const newActivityLog = new ActivityLog({
				actionType: "delete",
				actionEffect: "user",
				user: userID,
			});
			newActivityLog.save();
			return res.status(200).send();
		} catch (error) {
			res.status(500).json({ msg: "Server Error" });
			console.error(error);
		}
	}
);

// get users from specific team
userRouter.get("/:projectID", async (req, res) => {
	const { projectID } = req.params;
	try {
		const team = await Project.findById(projectID).populate("teamMembers");
		await Project.populate(team, "teamMembers.position");
		res.status(200).json(team.teamMembers);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

// get specific user
userRouter.get("/user/:userID", async (req, res) => {
	const { userID } = req.params;
	try {
		const user = await User.findById(userID);

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

userRouter.get("/confirm", async (req, res) => {
	const email = new Email({
		message: {
			from: "cruppo.noreply@gmail.com",
		},
		transport: transporter,
	});

	let user = {
		firstName: "Alen",
		lastName: "Valek",
		email: "valekalen@gmail.com",
	};

	await email.send({
		template: "confirmation",
		message: {
			to: "valekalen@gmail.com",
			subject: "Cruppo - Confirmation link",
		},
		locals: user,
	});
	res.status(200).send();
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

	const userFound = await User.findOne({ email: email });
	if (userFound) {
		return res
			.status(400)
			.json({ msg: "User with that email already exists." });
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
		const newActivityLog = new ActivityLog({
			actionType: "create",
			actionEffect: "user",
			user: userID,
		});
		newActivityLog.save();
		newUser = newUser.toJSON();
		delete newUser.password;
		const emailToSend = new Email({
			message: {
				from: "cruppo.noreply@gmail.com",
			},
			preview: false,
			send: true,
			transport: transporter,
		});

		const confirmToken = jwt.sign(
			{ uid: newUser._id },
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);

		let userEmailData = {
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			tempPassword: password,
			confirmationLink: `${frontEndBaseURL}/confirm/${confirmToken}`,
		};

		await emailToSend.send({
			template: "confirmation",
			message: {
				to: userEmailData.email,
				subject: "Cruppo - Confirmation link",
			},
			locals: userEmailData,
		});
		res.status(200).json({ tempPassword: password, ...newUser });
	} catch (error) {
		res.status(500).json({ msg: "Server Error" });
		console.error(error);
	}
});

module.exports = userRouter;
