require("dotenv").config()
const express = require("express")
const app = express()
const port = process.env.PORT||6969
const path = require("path")
const chrome_extensions = require("./routes/chrome_extensions")
const MAL = require("./routes/MAL")
const mongo = require("./mongo")
const CHROME_EXTENSION_AUTH = require("./middleware/auth_chrome_extension")
const cors = require('cors')
const cookieParser = require('cookie-parser')





app.use(cors({ origin: '*' })) // Allow requests from any origin
app.use(cookieParser())

app.set('trust proxy', 1)

app.get("/",(req,res)=>{
    return res.sendFile(path.join(__dirname,"index.html"))
})

app.use("/chrome_extension",CHROME_EXTENSION_AUTH,chrome_extensions)

app.use("/MAL",MAL)

app.use((req,res)=>{
    return res.status(404).send("404 PAGE NOT FOUND")
})


app.listen(port,async()=>{
    await mongo()
    console.log('server online')
})

