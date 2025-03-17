const malobjSchema = require('../schema/mal')
const cache = require('./mal_user_list')
const discord_webhook = require('./discord_webhook')
const anilist = require('./anilist')
const malcache = require('./malcache')
const webhook = process.env.DISCORD_MAL_LOG_WEBHOOK

let malobj = null

module.exports.update = async (id, ep, anilist_id) => {
	if (malobj === null) malobj = (await malobjSchema.find())[0]
	const list = (await this.getUserList()).userlist
	var target_anime = null
	list.forEach((anime) => {
		if (anime.node.id === id) target_anime = anime
	})
	if (!target_anime) return 210
	const get_anime = await this.getAnime(id)
	const anilist_anime = await anilist.getAnime(anilist_id)
	if (
		target_anime.list_status.status === 'completed' ||
		target_anime.list_status.status === 'dropped'
	) {
		return 208
	}
	if (ep <= target_anime.list_status.num_episodes_watched) {
		return 209
	}
	const endpoint = `https://api.myanimelist.net/v2/anime/${id}/my_list_status`
	const todayDate = new Date().toISOString().slice(0, 10)
	let req = `num_watched_episodes=${ep}`
	if (ep < 2) {
		req += `&start_date=${todayDate}&status=watching`
	}
	if (ep === get_anime.num_episodes) {
		req += `&finish_date=${todayDate}`
	}
	const update_anime = await fetch(endpoint, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-MAL-CLIENT-ID': process.env.MAL_ID,
			Authorization: `Bearer ${malobj.access_token}`,
		},
		body: req,
	}).catch((e) => {
		console.log(e)
	})
	if (update_anime.status === 401) {
		malobj = await this.refreshToken()
		const update_anime2 = await fetch(endpoint, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-MAL-CLIENT-ID': process.env.MAL_ID,
				Authorization: `Bearer ${malobj.access_token}`,
			},
			body: req,
		}).catch(async (e) => {
			await discord_webhook.error(e, 'mal.js update()')
			console.log(e)
		})
		if (update_anime2.status > 399) {
			return false
		}
	}
	cache.clear()
	const update_embed = {
		color: 16711680,
		author: {
			name: 'Anime updated',
		},
		title: get_anime.title,
		url: `https://myanimelist.net/anime/${id}/`,
		description: `Episode: ${ep}/${get_anime.num_episodes}`,
		thumbnail: {
			url: anilist_anime ? anilist_anime.coverImage.large : get_anime.main_picture.large,
		},
		image: {
			url: anilist_anime ? anilist_anime.bannerImage : get_anime.main_picture.large,
		},
		timestamp: new Date(),
	}

	await discord_webhook.sendEmbed(webhook, update_embed)
	malcache.pushCache({
		id,
		title: get_anime.title,
		url: `https://myanimelist.net/anime/${id}/`,
		ep: ep,
		totalep: get_anime.num_episodes || null,
		thumbnail: anilist_anime ? anilist_anime.bannerImage : null,
		image: anilist_anime ? anilist_anime.coverImage.large : get_anime.main_picture.large,
		timestamp: Date.now(),
	})
	return true
}

module.exports.addToList = async (id, ep) => {
	if (!ep || isNaN(ep)) ep = 1
	if (malobj === null) malobj = (await malobjSchema.find())[0]
	const endpoint = `https://api.myanimelist.net/v2/anime/${id}/my_list_status`
	const todayDate = new Date().toISOString().slice(0, 10)
	const get_anime = await this.getAnime(id)
	let req = `num_watched_episodes=${ep}&start_date=${todayDate}&status=watching`
	const update_anime = await fetch(endpoint, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-MAL-CLIENT-ID': process.env.MAL_ID,
			Authorization: `Bearer ${malobj.access_token}`,
		},
		body: req,
	}).catch((e) => {
		console.log(e)
	})
	if (update_anime.status === 401) {
		malobj = await this.refreshToken()
		const update_anime2 = await fetch(endpoint, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-MAL-CLIENT-ID': process.env.MAL_ID,
				Authorization: `Bearer ${malobj.access_token}`,
			},
			body: req,
		}).catch(async (e) => {
			await discord_webhook.error(e, 'mal.js addToList()')
			console.log(e)
		})
		if (update_anime2.status > 399) {
			return false
		}
	}
	cache.clear()
	const update_embed = {
		color: 16711680,
		author: {
			name: 'Anime updated',
		},
		title: get_anime.title,
		url: `https://myanimelist.net/anime/${id}/`,
		description: `Episode: ${ep}/${get_anime.num_episodes}`,
		thumbnail: {
			url: get_anime.main_picture.large,
		},
		timestamp: new Date(),
	}

	await discord_webhook.sendEmbed(webhook, update_embed)
	cache.clear()
	return true
}

module.exports.getUserList = async () => {
	let list = cache.get()
	if (list.userlist === null || Date.now() - list.time > 10 * 60 * 1000) {
		const userlist = await this.fetchUserList()
		cache.push(userlist)
		list = cache.get()
	}
	return list
}

module.exports.fetchUserList = async () => {
	if (malobj === null) malobj = (await malobjSchema.find())[0]
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'X-MAL-CLIENT-ID': process.env.MAL_ID,
		Authorization: `Bearer ${malobj.access_token}`,
	}
	const check_endpoint =
		'https://api.myanimelist.net/v2/users/Suryaprathap/animelist?fields=list_status&limit=1000&nsfw=1'
	let user_list = await fetch(check_endpoint, {
		method: 'GET',
		headers,
	}).catch((e) => {
		console.log(e)
	})
	if (user_list.status === 401) {
		malobj = await this.refreshToken()
		user_list = await fetch(check_endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-MAL-CLIENT-ID': process.env.MAL_ID,
				Authorization: `Bearer ${malobj.access_token}`,
			},
		}).catch(async (e) => {
			await discord_webhook.error(e, 'mal.js fetchUserlist()')
			console.log(e)
		})
		if (user_list.status > 399) {
			return
		}
	}
	const malarr = (await user_list.json()).data
	return malarr
}

module.exports.getAnime = async (id) => {
	const endpoint = `https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics`
	if (malobj === null) malobj = (await malobjSchema.find())[0]
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'X-MAL-CLIENT-ID': process.env.MAL_ID,
		Authorization: `Bearer ${malobj.access_token}`,
	}
	let get_anime = await fetch(endpoint, {
		method: 'GET',
		headers,
	}).catch((e) => {
		console.log(e)
	})
	if (get_anime.status === 401) {
		malobj = await this.refreshToken()
		get_anime = await fetch(endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-MAL-CLIENT-ID': process.env.MAL_ID,
				Authorization: `Bearer ${malobj.access_token}`,
			},
		}).catch(async (e) => {
			await discord_webhook.error(e, 'mal.js getAnime()')
			console.log(e)
		})
		if (get_anime.status > 399) {
			return
		}
	}
	const data = await get_anime.json()
	return data
}

module.exports.search = async (name) => {
	if (!name || name === '' || name === undefined) return 401
	if (malobj === null) malobj = (await malobjSchema.find())[0]
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'X-MAL-CLIENT-ID': process.env.MAL_ID,
		Authorization: `Bearer ${malobj.access_token}`,
	}
	const check_endpoint = `https://api.myanimelist.net/v2/anime?q=${name}=100`
	let user_list = await fetch(check_endpoint, {
		method: 'GET',
		headers,
	}).catch((e) => {
		console.log(e)
	})
	if (user_list.status === 401) {
		malobj = await this.refreshToken()
		user_list = await fetch(check_endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-MAL-CLIENT-ID': process.env.MAL_ID,
				Authorization: `Bearer ${malobj.access_token}`,
			},
		}).catch(async (e) => {
			await discord_webhook.error(e, 'mal.js search()')
			console.log(e)
		})
		if (user_list.status > 399) {
			return
		}
	}
	const malarr = (await user_list.json()).data
	return malarr
}

module.exports.refreshToken = async () => {
	const obj = (await malobjSchema.find())[0]
	const refresh_token = await fetch(`https://myanimelist.net/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: `grant_type=refresh_token&client_id=${process.env.MAL_ID}&client_secret=${process.env.MAL_TOKEN}&refresh_token=${malobj.refresh_token}`,
	})
	const data = await refresh_token.json()
	obj.set({
		access_token: data.access_token,
		refresh_token: data.refresh_token,
	})
	await obj.save()
	await discord_webhook.webhook('Token refreshed', webhook)
	return obj
}

module.exports.getWatchHistory = () => {
	return malcache.getCache()
}
