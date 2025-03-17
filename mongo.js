const mongoose = require("mongoose")
require("dotenv").config
const MONGO_URL =  process.env.MONGO_URL

module.exports = async () =>{
    mongoose.connect(MONGO_URL)
    console.log("connected to mongo")
    return MONGO_URL

}
