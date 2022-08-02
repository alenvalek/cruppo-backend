const userRouter = require("express").Router();
const User = require("../models/User");
const validator = require("email-validator");
const generateRandomPassword = require("../utils/generateRandomPassword");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Email = require("email-templates");
const jwt = require("jsonwebtoken");

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
