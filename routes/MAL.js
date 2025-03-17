require('dotenv').config()
const express = require("express")
const router = express.Router()
const random_str = require(`../util/randomstr`)
const codeChallenge = random_str(128)
const mal = require(`../schema/mal`)

const getRedirect = (req) => {
	const hostname = req.get('host')
	let url = `https://${hostname}/MAL/callback`
	if (hostname.includes('localhost')) {
		url = `http://localhost:6969/MAL/callback`
	}
	return url
}

router.get("/login",(req,res)=>{
    const redirect = req.query.r
	res.cookie('redirect',redirect,{
		maxAge : 2*60*1000
	})
    const redirect_url = getRedirect(req)
    return res.redirect(`https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.MAL_ID}&code_challenge=${codeChallenge}&redirect_uri=${redirect_url}`)
})
 router.get("/callback",async(req,res)=>{
	const redirect = req.cookies.redirect||`/`
	res.clearCookie('redirect')
    const url = getRedirect(req)
	const getToken = await fetch(`https://myanimelist.net/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: `grant_type=authorization_code&code=${req.query.code}&client_id=${process.env.MAL_ID}${
            process.env.MAL_SECRET ? `&client_secret=${process.env.MAL_SECRET}` : ''
            }&code_verifier=${codeChallenge}&redirect_uri=${url}`,
	})
	const responce = await getToken.json()
	malobj = (await mal.find())[0]
	if (!malobj) {
		malobj = new mal({
			access_token: responce.access_token,
			refresh_token: responce.refresh_token,
		})
	} else {
		malobj.set({
			access_token: responce.access_token,
			refresh_token: responce.refresh_token,
		})
	}
	await malobj.save()
	return res.redirect(redirect)
 })
  



 module.exports = router