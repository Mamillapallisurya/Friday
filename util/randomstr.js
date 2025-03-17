module.exports = (length) => {
	const random_str = (Length) => {
		var result = ''
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
		var charactersLength = characters.length
		for (var i = 0; i < Length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength))
		}
		return result
	}

	return random_str(length)
}