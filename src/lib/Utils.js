
import TimelineEvent from "./classes/TimelineEvent.js"
import TimelineSeries from "./classes/TimelineSeries.js"
import TimelineXRange from "./classes/TimelineXRange.js"
import TimelineCategory from "./classes/TimelineCategory.js"
import TimelineSubCategory from "./classes/TimelineSubCategory.js"


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
	data.categories = TimelineCategory.init(data.categories)
	data.subCategories = TimelineSubCategory.init(data.subCategories)
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
		data.series = TimelineSeries.init(data.xRange, data.series, options, data.categories, data.subCategories)
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
	debounce,
	toPrecision,
	formatNumber,
	copyXRange,
	colour,
	defaultColour,
	sentenceCase,
	COLOUR_INACTIVE: 'var(--tl-material-grey-400)',
	MIN_BOX_WIDTH: 80,
	CANVAS_MIN_HEIGHT: 300,
	CANVAS_PADDING_LEFT: 30,  // 20
	CANVAS_PADDING_RIGHT: 30,  // 20
	NAV_BREAK: 600
}

export default Utils