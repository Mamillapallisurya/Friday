const mongoose = require('mongoose')

const mal = mongoose.Schema({
	access_token: {
		type: String,
		required: true,
	},
	refresh_token: {
		type: String,
		required: true,
	},
})

module.exports = mongoose.model('mal', mal)