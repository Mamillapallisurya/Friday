const anilist = require('anilist-node')
const Anilist = new anilist()

module.exports.getAnime = async (id) => {
	if (!id || isNaN(id)) return null
	try {
		const anime = await Anilist.media.anime(id)
		return anime
	} catch {
		try {
			const anime = await Anilist.media.manga(id)
			return anime
		} catch {
			return null
		}
	}
}
