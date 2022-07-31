const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

module.exports = connectToDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("[DB] Connection established");
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
