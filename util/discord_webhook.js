const { WebhookClient, EmbedBuilder } = require('discord.js')

module.exports.webhook = async (content, webhookUrl, embed) => {
	if (!webhookUrl) {
		webhookUrl = process.env.DISCORD_ERROR_WEBHOOK
	}

	try {
		const webhookClient = new WebhookClient({ url: webhookUrl })

		let params = {
			...(content && { content }),
			...(embed && { embeds: [embed] }),
		}

		const response = await webhookClient.send(params)

		return response
	} catch (err) {
		console.error(err)
	}
}

module.exports.error = async (err, from) => {
	return await module.exports.sendEmbed(process.env.DISCORD_ERROR_WEBHOOK, {
		title: err.message,
		description: err.message,
		color: '#FF0000',
		footer: { text: from },
		timestamp: Date.now(),
	})
}

/**
 * Converts a JSON embed object into an EmbedBuilder instance and sends it.
 * @param {string} url - The Webhook URL.
 * @param {Object} embedData - The embed JSON object.
 * @param {string} [embedData.title] - Embed title.
 * @param {string} [embedData.description] - Embed description.
 * @param {string} [embedData.url] - Embed URL.
 * @param {number} [embedData.color] - Embed color in hex (e.g., 0x0099ff).
 * @param {number|string} [embedData.timestamp] - ISO timestamp or milliseconds.
 * @param {Object} [embedData.author] - Author details.
 * @param {string} [embedData.author.name] - Author name.
 * @param {string} [embedData.author.icon_url] - Author icon URL.
 * @param {string} [embedData.author.url] - Author URL.
 * @param {Object} [embedData.thumbnail] - Thumbnail object.
 * @param {string} [embedData.thumbnail.url] - Thumbnail image URL.
 * @param {Object[]} [embedData.fields] - Array of field objects.
 * @param {string} embedData.fields[].name - Field name.
 * @param {string} embedData.fields[].value - Field value.
 * @param {boolean} [embedData.fields[].inline] - Whether the field is inline.
 * @param {Object} [embedData.image] - Image object.
 * @param {string} [embedData.image.url] - Image URL.
 * @param {Object} [embedData.footer] - Footer object.
 * @param {string} embedData.footer.text - Footer text.
 * @param {string} [embedData.footer.icon_url] - Footer icon URL.
 */
module.exports.sendEmbed = async (url, embedData = {}) => {
	const embed = new EmbedBuilder()

	if (embedData.title) embed.setTitle(embedData.title)
	if (embedData.description) embed.setDescription(embedData.description)
	if (embedData.url) embed.setURL(embedData.url)
	if (embedData.color) embed.setColor(embedData.color)
	if (embedData.timestamp) embed.setTimestamp(new Date(embedData.timestamp))

	if (embedData.author) {
		embed.setAuthor({
			name: embedData.author.name,
			iconURL: embedData.author.icon_url,
			url: embedData.author.url,
		})
	}

	if (embedData.thumbnail) {
		embed.setThumbnail(embedData.thumbnail.url)
	}

	if (embedData.fields) {
		embed.addFields(embedData.fields)
	}

	if (embedData.image) {
		embed.setImage(embedData.image.url)
	}

	if (embedData.footer) {
		embed.setFooter({
			text: embedData.footer.text,
			iconURL: embedData.footer.icon_url,
		})
	}

	return await module.exports.webhook(null, url, embed)
}
