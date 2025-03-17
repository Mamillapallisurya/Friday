require('dotenv').config()
const express = require('express')
const mal = require('../util/mal')
const router = express.Router()
const anilist = require('../util/anilist')

// /update?id=anime_id&ep=100&anilist_id=anilist_id
router.get('/update', async (req, res) => {
	const id = parseInt(req.query.id)
	const ep = parseInt(req.query.ep)
	const anilist_id = parseInt(req.query.anilist_id)

	if (isNaN(id) || isNaN(ep)) {
		res.status(400)
		return res.json({
			message: 'invalid parameters',
		})
	}

	const update_mal = await mal.update(id, ep, anilist_id)
	if (update_mal === false) {
		res.status(200)
		return res.json({ message: 401 })
	}
	if (update_mal === 209) {
		res.status(200)
		return res.json({ message: 209 })
	}
	if (update_mal === 210) {
		res.status(200)
		return res.json({ message: 210 })
	}
	res.status(200)
	return res.json({ message: 200 })
})

// /add?id=anime_id&ep=1
router.get('/add', async (req, res) => {
	const id = parseInt(req.query.id)
	const ep = parseInt(req.query.ep) || 1
	if (isNaN(id) || isNaN(ep)) {
		res.status(400)
		return res.json({
			message: 'invalid parameters',
		})
	}
	const addto_mal = await mal.addToList(id, ep)
	if (addto_mal === false) {
		res.status(200)
		return res.json({ message: 401 })
	}
	if (addto_mal === 209) {
		res.status(200)
		return res.json({ message: 209 })
	}
	if (addto_mal === 210) {
		res.status(200)
		return res.json({ message: 210 })
	}
	res.status(200)
	return res.json({ message: 200 })
})

router.get('/search', async (req, res) => {
	const name = req.query.name

	const search = await mal.search(name)
	if (search === false) {
		res.status(200)
		return res.json({ message: 401 })
	}
	if (search === 209) {
		res.status(200)
		return res.json({ message: 209 })
	}
	if (search === 210) {
		res.status(200)
		return res.json({ message: 210 })
	}
	res.status(200)
	return res.json(search)
})

router.get('/getanime', async (req, res) => {
	const id = req.query.id
	const anilist_id = parseInt(req.query.anilist_id)

	const search = await mal.getAnime(id)
	let anilist_anime = await anilist.getAnime(anilist_id)

	if (search === false) {
		res.status(200)
		return res.json({ message: 401 })
	}
	if (search === 209) {
		res.status(200)
		return res.json({ message: 209 })
	}
	if (search === 210) {
		res.status(200)
		return res.json({ message: 210 })
	}
	if (anilist_anime && anilist_anime.format === 'MANGA') {
		anilist_anime.coverImage.large = search.main_picture.large
	}
	if (anilist_anime === null) {
		anilist_anime = {
			coverImage: { large: search.main_picture.large },
			bannerImage: search.main_picture.large,
		}
	}
	res.status(200)
	return res.json({ ...search, anilist: anilist_anime })
})

module.exports = router