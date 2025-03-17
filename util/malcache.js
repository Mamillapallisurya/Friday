let cache = []

module.exports.getCache = () => {
	return cache
}

module.exports.pushCache = (animeobj) => {
	cache.push(animeobj)
}

module.exports.clearCache = () => {
	cache = []
}
