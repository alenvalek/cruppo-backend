module.exports = generateRandomPassword = (length = 10) => {
	const possibleCharacters =
		"abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+~`|}{[]:;?><,./-=0123456789";
	let password = "";
	while (password.length < length) {
		password += possibleCharacters.charAt(
			Math.floor(Math.random() * possibleCharacters.length)
		);
	}
	return password;
};
