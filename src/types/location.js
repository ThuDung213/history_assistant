/**
 * @typedef {Object} TimelineEvent
 * @property {string} year
 * @property {string} event
 */

/**
 * @typedef {Object} ImageItem
 * @property {string} url
 * @property {string=} publicId
 * @property {string=} caption
 * @property {number=} width
 * @property {number=} height
 */

/**
 * @typedef {Object} HistoricalSitePayload
 * @property {string} siteName
 * @property {string=} siteType
 * @property {string=} locationType
 * @property {string=} thumbnailUrl
 * @property {string=} shortDescription
 * @property {number=} latitude
 * @property {number=} longitude
 * @property {string=} history
 * @property {string=} keyEvents
 * @property {string=} architecture
 * @property {string=} significance
 * @property {string=} additionalContent
 * @property {string=} address
 * @property {string=} openingHours
 * @property {string=} ticketPrice
 * @property {string=} tips
 * @property {TimelineEvent[]} timelineEvents
 * @property {ImageItem[]=} images
 */

/**
 * @typedef {Object} HistoricalSite
 * @property {string=} id
 * @property {string=} _id
 * @property {string} siteName
 * @property {string=} siteType
 * @property {string=} locationType
 * @property {string=} thumbnailUrl
 * @property {string=} shortDescription
 * @property {number=} latitude
 * @property {number=} longitude
 * @property {string=} history
 * @property {string=} keyEvents
 * @property {string=} architecture
 * @property {string=} significance
 * @property {string=} additionalContent
 * @property {string=} address
 * @property {string=} openingHours
 * @property {string=} ticketPrice
 * @property {string=} tips
 * @property {TimelineEvent[]=} timelineEvents
 * @property {ImageItem[]=} images
 * @property {string=} createdBy
 * @property {string=} createdAt
 * @property {string=} updatedAt
 */

export {};
