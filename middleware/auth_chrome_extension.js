require('dotenv').config()
const middleware = (req,res,next)=>{
    if(req.query.auth !== process.env.CHROME_EXTENSION_AUTH ) return res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        next()
}

module.exports = middleware