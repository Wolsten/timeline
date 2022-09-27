import TimelineDate from "./classes/TimelineDate.js"
import TimelineEvent from "./classes/TimelineEvent.js"
import TimelineXRange from "./classes/TimelineXRange.js"


const DAYS_IN_MONTH = [
	31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// https://materialui.co/colors
// 500 unless otherwise stated
const COLOUR_SET = [
	'var(--tl-material-600-red)',
	'var(--tl-material-400-indigo)',
	'var(--tl-material-500-teal)',
	'var(--tl-material-600-light-green)',
	'var(--tl-material-500-amber)',
	'var(--tl-material-300-brown)',
	'var(--tl-material-500-blue-grey)',
	'var(--tl-material-700-cyan)',
	'var(--tl-material-700-orange)'
]


const colour = function (index, colourIndex, group) {
	if (group) {
		index = colourIndex
	}
	return COLOUR_SET[index % COLOUR_SET.length]
}


const defaultColour = function (index) {
	return COLOUR_SET[index % COLOUR_SET.length]
}


const toPrecision = function (num, digits) {
	return parseFloat(num.toPrecision(digits))
}



const formatNumber = function (number, digits = 0) {
	let suffix = ''
	if (number > 1000000) {
		number = number / 1000000
		suffix = 'M'
	}
	if (digits == 0) {
		return new Intl.NumberFormat('en-GB').format(number) + suffix
	}
	return new Intl.NumberFormat('en-GB', { maximumSignificantDigits: digits }).format(number) + suffix
}


const sentenceCase = function (str) {
	if ((str === null) || (str === ''))
		return '';
	else
		str = str.toString();

	return str.replace(/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() +
				txt.substr(1).toLowerCase();
		});
}


/**
 * Group and return data series according taxonomy (by category or sub-category)
 * @param {Array} series The raw series
 * @param {String} taxonomy Either category or subcategory
 * @param {Array} list A list of strings of either categories or sub categories
 */
const groupSeries = function (series, taxonomy, list) {
	// Stop if have no series
	if (series.length == 0) return []
	// Initialise groups
	let groups = []
	list.forEach((item, index) => {
		let group
		series.forEach(entry => {
			if ((taxonomy == 'category' && entry.category == item.name) ||
				(taxonomy == 'sub-category' && entry.subCategory == item.name)) {
				// Initialise group
				if (!group) {
					const name = item.name
					group = {
						...entry,
						max: Number.NEGATIVE_INFINITY,
						min: Number.POSITIVE_INFINITY,
						points: [],
						name,
						legend: name,
						type: taxonomy,
						colour: item.colour ? item.colour : defaultColour(index),
						summary: `Data grouped by ${taxonomy} ${name}`
					}
				}
				// Accumulate data points
				entry.points.forEach(point => {
					// Look for point with same x
					let match = group.points.findIndex(pt => {
						return pt.x == point.x
					})
					// Create new point or add existing to match
					if (group.points.length == 0 || match == -1) {
						// *** IMPORTANT *** MUST PUSH A COPY NOT THE ORIGINAL
						group.points.push({ ...point })
						match = group.points.length - 1
					} else {
						group.points[match].y += point.y
					}
					// Update min and max values
					if (group.points[match].y > group.max) {
						group.max = group.points[match].y
					}
					if (group.points[match].y < group.min) {
						group.min = group.points[match].y
					}
				})
				// Sort points in date order
				group.points.sort((a, b) => a.x - b.x)
			}
		})
		groups.push(group)
	})
	return groups
}


const setTaxonomyColours = function (taxonomy) {
	taxonomy.forEach((item, index) => {
		if (item.colour == '') item.colour = defaultColour(index)
	})
}



const initSeries = function (series, settings, dataCategories, dataSubCategories) {
	// Filter series according to optional categories and sub categories
	let filtered = [...series]
	if (settings.categories.length > 0) {
		filtered = filtered.filter(item => settings.categories.includes(item.category.name))
	}
	if (settings.subCategories.length > 0) {
		filtered = filtered.filter(item => settings.subCategories.includes(item.category.name))
	}
	// Set original series type and colour property (if not set)
	filtered.forEach((entry, index) => {
		entry.type = 'single'
		if (!entry.colour) entry.colour = defaultColour(index)
	})
	// Generate and append category and sub-category groups to series
	const categoryGroups = groupSeries(filtered, 'category', dataCategories)
	const subCategoryGroups = groupSeries(filtered, 'sub-category', dataSubCategories)
	filtered = [
		...filtered,
		...categoryGroups,
		...subCategoryGroups
	]
	// console.log('Initialiased series', filtered)
	return filtered
}



/**
 * Convert raw json data ready for manipulating graphically, including
 * synthesising group series based on taxonomy and converting string
 * dates to app dates. This is called once per dataset on app load.
 * @param {Object} data The raw json data read from file
 * @param {Object} options The processed user settings 
 * @returns {Object} The process data datset
 */
const initDataset = function (data, options) {
	// console.log('raw events', data.events)
	// Set taxonomy colours
	setTaxonomyColours(data.categories)
	setTaxonomyColours(data.subCategories)
	// Initialise data range for events and series
	data.xRange = new TimelineXRange()
	// Process events
	if (data.events.length > 0) {
		// Optional filtering, set start & end dates, and colours
		// data.xRange is also updated as passed by reference
		data.events = TimelineEvent.init(data.xRange, data.events, options, data.categories, data.subCategories)
	}
	// console.log('data start', data.xRange.start)
	// console.log('data end', data.xRange.end)
	// Process series
	if (data.series.length > 0) {
		// Optional filtering, set type and colours, group by taxonomies
		data.series = initSeries(data.series, options, data.categories, data.subCategories)
		// Process series (including newly created groups)
		data.series.forEach((entry, index) => {
			// Convert string dates to custom date objects and set colours
			entry.points.forEach(point => {
				// point.x = getDateParts(point.x)
				point.x = new TimelineDate(point.x)
				point.colour = entry.colour ? entry.colour : defaultColour(index)
				point.categoryColour = data.categories.find(item => item.name == entry.category).colour
				point.subCategoryColour = data.subCategories.find(item => item.name == entry.subCategory).colour
			})
			// Filter by settings range?
			if (options.xRange.range > 0) {
				entry.points = entry.points.filter(point => options.xRange.dateInRange(point.x))
			}
			// Find x-range start and end, plus y range min and max
			const start = data.xRange.range > 0 ? data.xRange.start : entry.points[0].x
			const end = data.xRange.range > 0 ? data.xRange.end : entry.points[0].x
			data.xRange.start = entry.points.reduce((min, point) => point.x.before(min) ? point.x : min, start)
			data.xRange.end = entry.points.reduce((max, point) => point.x.after(max) ? point.x : max, end)
			entry.min = entry.points.reduce((min, point) => point.y < min ? point.y : min, Number.POSITIVE_INFINITY)
			entry.max = entry.points.reduce((max, point) => point.y > max ? point.y : max, Number.NEGATIVE_INFINITY)
		})
	}
	data.xRange.range = data.xRange.end.year - data.xRange.start.year
	console.log('dataset', data)
	return data
}



const processSeries = function (series, xRange, filter, type, group) {
	console.warn('processing series with type and group', type, group)
	// Initialise the filtered list
	let filtered = []
	// Totalised values only?
	if (group) {
		console.log('Filtering grouped data from series', series)
		filtered = series.filter((entry) => entry.type === type)
	} else {
		console.log('Filtering single data from series', series)
		filtered = series.filter((entry) => entry.type === "single")
	}
	// Filter by category or sub-category?
	if (group && filter !== '') {
		if (type === 'category') {
			filtered = filtered.filter(entry => entry.category == filter)
		} else {
			filtered = filtered.filter(entry => entry.subCategory == filter)
		}
	}
	// Filter data by start and end range and generate data from points
	filtered.forEach((entry, seriesIndex) => {

		entry.filteredPoints = []

		// @todo - probably don;t need this
		entry.min = Number.POSITIVE_INFINITY
		entry.max = Number.NEGATIVE_INFINITY
		entry.points.forEach((point, opIndex) => {
			if (xRange.dateInRange(point.x)) {
				// Check ranges
				if (point.y < entry.min) entry.min = point.y
				if (point.y > entry.max) entry.max = point.y
				// Add to the array of points to display
				entry.filteredPoints.push(opIndex)
			}
		})
	})
	console.warn('filtered', [...filtered])
	return filtered
}


/**
 * Smooth out user interaction
 * @param {function} fn a callback function
 * @param {number} delay delay in ms before callback triggered
 * @returns 
 */
const debounce = function (fn, delay) {
	let timeOutId
	return function (...args) {
		// Clear previous timeout if not expired
		if (timeOutId) {
			clearTimeout(timeOutId)
		}
		// Set new timeout
		timeOutId = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}


const getVersionHistory = function (history = []) {
	let created = ''
	let updated = false
	let versions = []
	if (history) {
		history.forEach(version => {
			const parts = version.split('§')
			if (parts.length == 2) {
				versions.push({
					date: new Date(parts[0].trim()),
					change: parts[1].trim()
				})
			}
		})
		if (versions.length > 0) {
			created = versions[0].date
		}
		if (versions.length > 1) {
			updated = versions[versions.length - 1].date
		}
	}
	return { created, updated, versions }
}

const copyXRange = function (xRange) {
	console.error('range to copy', xRange)
	let newXRange = new TimelineXRange(xRange.start.value, xRange.end.value)
	console.error('new XRAnge', newXRange)
	return newXRange
}


const Utils = {
	getVersionHistory,
	initDataset,
	// initSettings,
	// processEvents,
	processSeries,
	// eventDates,
	debounce,
	toPrecision,
	formatNumber,
	copyXRange,
	// formatYear,
	// formatDate,
	colour,
	defaultColour,
	// setRange,
	// setDate,
	sentenceCase,
	COLOUR_INACTIVE: 'var(--tl-material-grey-400)',
	MIN_BOX_WIDTH: 80,
	CANVAS_MIN_HEIGHT: 300,
	CANVAS_PADDING_LEFT: 30,  // 20
	CANVAS_PADDING_RIGHT: 30,  // 20
	NAV_BREAK: 600
}

export default Utils