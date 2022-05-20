const mongoose = require('mongoose')

const linkSchema = mongoose.Schema({
	original_url: {
		type: String,
		required: true,
		unique: true
	},
	shorturl: {
		required: true,
		type: Number,
		unique: true
	}
})

const counterSchema = mongoose.Schema({
	count:{
		type: Number
	}
})

const link = mongoose.model('link', linkSchema)
const counter = mongoose.model('counter', counterSchema)

module.exports = {
	link, counter
}