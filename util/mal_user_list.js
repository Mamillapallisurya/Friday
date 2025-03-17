let db = {
	userlist: null,
	time: Date.now(),
}

module.exports.get = () => {
	return db
}

module.exports.push = (arr) => {
	db.userlist = arr
	db.time = Date.now()
}

module.exports.clear = () => {
	db = {
		userlist: null,
		time: Date.now(),
	}
}
