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


const findNormalisedMin = function (step, min) {
	let y = 0
	// debugger
	if (min < 0) {
		while (y > min) {
			y -= step
		}
	} else {
		while (y < min) {
			y += step
		}
	}
	return y
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


const formatDate = function (date) {
	let formatted = formatYear(date.year)
	if (date.month > 0 && date.day > 0) {
		formatted = `${date.day} ${getMonth(date.month)} ${formatted}`
	}
	return formatted
}


const getMonth = function (m) {
	return MONTHS[parseInt(m) - 1]
}


const setDate = function (year = 0, month = 0, day = 0) {
	const date = { year, month, day }
	const decimal = getDecimalDate(date)
	return { ...date, decimal }
}


const setRange = function (date1, date2) {
	const start = setDate(date1)
	const end = setDate(date2)
	return {
		start,
		end,
		range: end.year - start.year
	}
}


const formatYear = function (year) {
	const magnitude = Math.abs(year)
	let millions = magnitude / 1000000
	let thousands = millions * 1000
	// let formatted = new Intl.NumberFormat().format(Math.round(millions))
	// console.log(year,magnitude,millions,thousands,formatted)
	if (millions > 1) {
		// let formatted = new Intl.NumberFormat().format(Math.round(millions))
		let formatted = Number.parseFloat(millions).toPrecision(2)
		formatted = new Intl.NumberFormat().format(formatted)
		if (year < 0) {
			return formatted + 'mya'
		}
		return formatted + 'my'
	} else if (thousands > 10) {
		let formatted = parseInt(thousands / 100) * 100
		if (year < 0) {
			return formatted + 'tya'
		}
		return formatted + 'ty'
	} else if (year < 0) {
		return Math.abs(year) + 'bc'
	}
	return year
}


const eventDates = function (event) {
	// debugger
	let html = ''
	if (event.start != '-') {
		html += formatDate(event.start)
	}
	if (event.end) {
		if (event.end == '-') {
			html += ' - '
		} else {
			html += ` - ${formatDate(event.end)}`
		}
	}
	html = `(${html})`
	return html
}


/**
 * Initialise the settings with any optional user supplied settings
 * @param {String} userSettings Command separate list of setting=value pairs
 * @returns {Object}
 */
const initSettings = function (userSettings) {
	let settings = {
		symbols: false,
		readonly: false,
		totalise: false,
		categorise: false,
		search: '',
		filter: '',
		filterType: '',
		title: '',
		sort: 'x',
		categories: [],
		subCategories: [],
		xRange: {
			start: setDate(),
			end: setDate(),
			range: 0
		}
	}
	let start = { year: 0, month: 0, day: 0, decimal: 0 }
	let end = { year: 0, month: 0, day: 0, decimal: 0 }
	// Apply default settings where required
	// Note that only non-defaults should be set in user settings
	if (userSettings !== '') {
		const pairs = userSettings.split(',')
		// console.log('pairs', pairs)
		pairs.forEach(pair => {
			// debugger
			const parts = pair.split('=')
			if (parts.length == 2) {
				const setting = parts[0].trim()
				const value = parts[1].trim()
				switch (setting) {
					case 'symbols':
						if (value === 'true') settings.symbols = true
						break;
					case 'readonly':
						if (value === 'true') settings.readonly = true
						break;
					case 'totalise':
						if (value === 'true') {
							settings.totalise = true
							settings.categorise = true
						}
						break;
					case 'categorise':
						if (value === 'true') settings.categorise = true
						break;
					case 'logscale':
						if (value === 'true') settings.logscale = true
						break;
					case 'search':
						settings.search = value
						break
					case 'filter':
						settings.filter = value
						break
					case 'title':
						settings.title = value
						break
					case 'sort':
						settings.sort = value
						break
					case 'start':
						start = getDateParts(value)
						break;
					case 'end':
						end = getDateParts(value)
						break;
					case 'subCategories':
						const subCats = value.split('|')
						if (subCats.length > 0) {
							subCats.forEach(subCat => subCat.trim())
							settings.subCats = subCats
						}
						break;
					case 'categories':
						const cats = value.split('|')
						if (cats.length > 0) {
							cats.forEach(cat => cat.trim())
							settings.categories = cats
						}
				}
			}
		})
	}
	// xRange
	if (start.range != 0 && end.range !== 0) {
		settings.xRange = {
			start,
			end,
			range: end.year - start.year
		}
	}
	// console.log('initSettings', settings)
	return settings
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


const initEvents = function (events, settings, dataCategories, dataSubCategories) {
	// Filter events according to optional categories and dsubcategories
	let filtered = [...events]
	if (settings.categories.length > 0) {
		filtered = filtered.filter(event => settings.categories.includes(event.category))
	}
	if (settings.subCategories.length > 0) {
		filtered = filtered.filter(event => settings.subCategories.includes(event.category))
	}
	// Convert string start and end dates to date objects and set taxonomy colours
	//
	// Event start dates can be on eof the following:
	// 		a valid date string
	// 		'-' - started before the start of the data range
	// Event end dates can be one of the following:
	// 		undefined - i.e. same as the start date 
	// 		a valid date string
	// 		'-' ended after the end of the data range
	//
	// Convert undefined end dates to match start dates
	// In either case convert '-' to undefined
	filtered.forEach((event) => {
		if (event.start === '-') {
			delete (event.start)
		} else {
			event.start = getDateParts(event.start)
		}
		if (event.end === undefined) {
			event.end = event.start
		} else if (event.end === '-') {
			delete (event.end)
		} else {
			event.end = getDateParts(event.end)
		}
		event.categoryColour = dataCategories.find(item => item.name == event.category).colour
		event.subCategoryColour = dataSubCategories.find(item => item.name == event.subCategory).colour
	})
	// If have user settings for start and end then filter events
	if (settings.xRange.range != 0) {
		filtered = filtered.filter(event => eventInRange(settings.xRange, event))
	}
	// Sort events
	sortEvents(filtered, dataSubCategories)
	// Return the filtered list of events
	return filtered
}


const sortEvents = function (events, subCategories) {
	// Set event sorting indices
	// First sort by date, 
	// then set date ordering and sub category index
	// Finally sort by this index
	events.sort(sortEventsByDate)
	events.forEach((event, index) => {
		event.index = index
		event.sci = subCategories.findIndex(sc => sc.name == event.subCategory)
	})
	events.sort(sortEventsBySubCategory)
	events.forEach((event, index) => {
		event.scIndex = index
		delete (event.sci)
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
 * @param {Object} settings The processed user settings 
 * @returns {Object} The process data datset
 */
const initDataset = function (data, settings) {
	// debugger
	// console.log('raw events', data.events)
	// Set taxonomy colours
	setTaxonomyColours(data.categories)
	setTaxonomyColours(data.subCategories)
	// Process events
	data.xRange = {
		start: setDate(),
		end: setDate(),
		range: 0
	}
	if (data.events.length > 0) {
		// Optional filtering, set start & end dates, and colours
		data.events = initEvents(data.events, settings, data.categories, data.subCategories)
		// Find min start value and max end value
		data.xRange.start = data.events.reduce((min, event) => aBeforeB(event.start, min) ? event.start : min, data.events[0].start)
		data.xRange.end = data.events.reduce((max, event) => {
			if (event.end === undefined) {
				return aBeforeB(max, event.start) ? event.start : max
			}
			return aBeforeB(max, event.end) ? event.end : max
		}, data.xRange.start)
	}
	// console.log('data start', data.xRange.start)
	// console.log('data end', data.xRange.end)
	// Process series
	if (data.series.length > 0) {
		// Optional filtering, set type and colours, group by taxonomies
		data.series = initSeries(data.series, settings, data.categories, data.subCategories)
		// Process series (including newly created groups)
		data.series.forEach((entry, index) => {
			// Convert string dates to custom date objects and set colours
			entry.points.forEach(point => {
				point.x = getDateParts(point.x)
				point.colour = entry.colour ? entry.colour : defaultColour(index)
				point.categoryColour = data.categories.find(item => item.name == entry.category).colour
				point.subCategoryColour = data.subCategories.find(item => item.name == entry.subCategory).colour
			})
			// Filter by settings range?
			if (settings.xRange.range > 0) {
				entry.points = entry.points.filter(point => dateInRange(settings.xRange, point.x))
			}
			// Find x-range start and end, plus y range min and max
			const start = data.xRange.range > 0 ? data.xRange.start : entry.points[0].x
			const end = data.xRange.range > 0 ? data.xRange.end : entry.points[0].x
			data.xRange.start = entry.points.reduce((min, point) => aBeforeB(point.x, min) ? point.x : min, start)
			data.xRange.end = entry.points.reduce((max, point) => aBeforeB(point.x, max) ? max : point.x, end)
			data.yRange = {
				min: entry.points.reduce((min, point) => point.y < min ? point.y : min, entry.points[0].y),
				max: entry.points.reduce((max, point) => point.y > max ? point.y : max, data.min)
			}
		})
	}
	data.xRange.range = data.xRange.end.year - data.xRange.start.year
	// console.log('dataset', data)
	return data
}


/**
 * Filter the full set of events to return ones which match the filtering criteria. 
 * Invoked when the date range or search text changes
 * @param {Object[]} events 
 * @param {Object} xRange Options xRange {start date, end date,range years} 
 * @param {String} search 
 * @param {Object[]} subCategories The data set sub categories
 * @returns {Object[]}
 */
const processEvents = function (events, xRange, search, subCategories) {
	let filtered = [...events]
	// Search?
	if (search != '') {
		const pattern = new RegExp(search, 'i')
		filtered = filtered.filter(event => event.name.search(pattern) != -1)
	}
	// Filter
	if (xRange.range > 0) {
		filtered = filtered.filter(event => eventInRange(xRange, event))
	}
	// Sort events - has to happen each time as event position is based on the 
	// date and sub category indices
	sortEvents(filtered, subCategories)
	// console.log('filtered events', [...filtered])
	return filtered
}


/**
 * Filter the events by start/end times and category
 * @param {Array} events 
 * @param {Number} scale 
 * @param {Number} xStart 
 * @param {Number} xEnd 
 * @param {Array} datasetSubCats 
 * @returns {Array}
 */
// const filterEventsByXRange = function (events, scale, xStart, xEnd, datasetSubCats) {
// 	let filtered = []
// 	// Scale each event
// 	events.forEach((event, index) => {
// 		// if (event.name == 'Liz Truss') {
// 		// 	console.error('event', event)
// 		// 	debugger
// 		// }
// 		// Check if starts in the the range defined by ()
// 		const startsIn =
// 			// Already started
// 			event.start === '-' ||
// 			// or started after reference startValue && started before reference end value
// 			(event.start.year >= xStart && event.start.year <= xEnd)
// 		// Check if ends in the range
// 		const endsIn = event.end && event.end.year >= xStart && event.end.year <= xEnd

// 		if (startsIn || endsIn) {

// 			event.index = index

// 			if (event.start.decimal !== undefined) {
// 				event.left = Math.round((event.start.decimal - xStart) * scale)
// 			} else {
// 				event.left = Math.round((xStart) * scale)
// 			}

// 			let right = 0
// 			if (event.end === undefined) {
// 				right = event.left
// 			} else if (event.end === '-') {
// 				right = Math.round((xEnd - xStart) * scale)
// 			} else {
// 				right = Math.round((event.end.decimal - xStart) * scale)
// 			}

// 			event.width = right - event.left

// 			event.left += Utils.CANVAS_PADDING_LEFT

// 			if (event.width < MIN_EVENT_WIDTH) {
// 				event.width = MIN_EVENT_WIDTH
// 			}

// 			let subCatIndex = datasetSubCats.findIndex(c => c == event.subCategory)
// 			if (subCatIndex == -1) {
// 				subCatIndex = 0
// 			} else {
// 				subCatIndex = subCatIndex % COLOUR_SET.length
// 			}
// 			event.colour = COLOUR_SET[subCatIndex]

// 			filtered.push(event)
// 		}
// 	})

// 	// console.log('filtered', filtered)
// 	return filtered
// }


function isLeap(year) {
	// three conditions to find out the leap year
	if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
		// console.log(year + ' is a leap year');
		return true
	}
	//console.log(year + ' is not a leap year');
	return false
}


function getDecimalDate(date) {
	const daysInYear = isLeap(date.year) ? 366 : 365
	let total = 0
	// Add days for previous months (month is 1-based)
	for (let m = 1; m < date.month; m++) {
		total += m == 2 && isLeap(date.year) ? 29 : DAYS_IN_MONTH[m - 1]
	}
	total += date.day
	return toPrecision((date.year + total / daysInYear), 6)
}


/**
 * Takes in a stringDate which can be one of the following:
 *   undefined
 *   '-'           Ongoing at end of date range or started before start of data range
 *   'YYYY'        e.g. 2020
 *   '[Y]YYYbc'    e.g. 500bc
 *   'YYYY-MM-DD'  e.g. 2020-06-28
 *   'XXXmya'      e.g. 100mya, i.e. 100 Million years ago
 * 
 * Returns one of:
 * 	 original string if was undefined or set to '-'
 * or
 *   custom date object with following properties:
 *     day      Integer day of the month
 *     month    Integer month of the year
 *     year     Integer year
 *     decimal  Number representing fractional year (e.g. 1 July 2020 => 2020.5)
 *   
 * @param {Number|String} stringDate 
 * @returns {undefined|String|Object}
 */
const getDateParts = function (stringDate) {
	// debugger
	if (stringDate === undefined ||
		stringDate === '-') {
		return stringDate
	}
	// console.log('stringDate', stringDate)
	stringDate = '' + stringDate
	const parts = stringDate.split('-')
	// console.log('parts',parts)
	let year = 0
	let month = 0
	let day = 0
	// Format 1c), 2 or 3
	if (parts.length == 1) {
		parts[0] = parts[0].toLowerCase()
		// Format 2 
		if (parts[0].endsWith('bc')) {
			year = -parseInt(parts[0].split('bc')[0])
			// Format 3
		} else if (parts[0].endsWith('mya')) {
			year = -1000000 * parts[0].split('mya')[0]
		} else if (parts[0].endsWith('my')) {
			year = 1000000 * parts[0].split('my')[0]
			// Format 1c)
		} else {
			year = parseInt(parts[0])
		}
	} else {
		// Format 1b)
		year = parseInt(parts[0])
		month = parseInt(parts[1])
		if (parts.length == 3) {
			day = parseInt(parts[2])
		}
	}
	let date = { year, month, day }
	date.decimal = getDecimalDate(date)
	return date
}


const dateInRange = function (range, date) {
	return range.start.decimal <= date.decimal && date.decimal <= range.end.decimal
}


const eventInRange = function (range, event) {
	// console.log('options xRange', range)
	// Not in range if defined and doesn't fit in the range
	if (event.start !== undefined && dateInRange(range, event.start) == false) {
		return false
	}
	// Start in range, end in range if end is undefined or fites in date range
	return event.end == undefined || dateInRange(range, event.end)
}


const aBeforeB = function (a, b) {
	// Either undefined
	if (a === undefined || b === undefined) {
		return false;
	}
	if (a === '-' && b !== '-') {
		return true
	}
	// date
	if (a?.decimal < b?.decimal) {
		return true
	}
	return false
}


/**
 * See getDateParts for description of date formats
 * @param {string|Object} a (may be undefined)
 * @param {string|Object} b  (may be undefined)
 * @returns {number} a < b -1, a == b 0,  a > b 1
 */
const compareDates = function (a, b) {
	// console.log('compareDates a and b', a, b)
	// Either undefined
	if (a === undefined || b === undefined) {
		return 0;
	}
	// Already started or ongoing?
	if (a === '-' || b === '-') {
		if (a === '-' || b !== '-') {
			return -1;
		} else if (a !== '-' || b === '-') {
			return 1;
		}
		return 0;
	}
	// Year
	if (a.year < b.year) {
		return -1
	} else if (a.year > b.year) {
		return 1
	}
	// Month
	if (a.month < b.month) {
		return -1
	} else if (a.month > b.month) {
		return 1
	}
	// Day
	if (a.day < b.day) {
		return -1
	} else if (a.day > b.day) {
		return 1
	}
	return 0
}

const sortEventsByDate = function (a, b) {
	// console.log('a', a, 'b', b)
	if (a.start === '-') return -1
	if (b.start === '-') return 1
	if (a.start.decimal !== undefined && b.start.decimal !== undefined) {
		return a.start.decimal - b.start.decimal
	}
	return 0
}


const sortEventsBySubCategory = function (a, b) {
	return a.sci - b.sci
}


const processSeries = function (series, scale, xRange, filter, type, totalise) {
	// Initialise the filtered list
	let filtered = []
	// Totalised values only?
	if (totalise) {
		filtered = series.filter((entry) => entry.type !== "single")
	} else {
		filtered = series.filter((entry) => entry.type === "single")
	}
	// Filter by category or sub-category?
	if (filter !== '') {
		if (type === 'category') {
			filtered = filtered.filter(entry => entry.category == filter)
		} else {
			filtered = filtered.filter(entry => entry.subCategory == filter)
		}
	}
	// console.warn('init filtered series', filtered)
	// console.warn('set',set)
	// console.log('scale',scale)
	// console.log('xStart',xStart)
	// console.log('xEnd',xEnd)
	// Filter data by start and end range and generate data from points
	filtered.forEach((entry, index) => {
		entry.data = []
		entry.points.forEach((point, i) => {
			// Range test
			if (dateInRange(xRange, point.x)) {
				const valueX = point.x.decimal
				const canvasX = Utils.CANVAS_PADDING_LEFT + (valueX - xRange.start.decimal) * scale
				const newPoint = {
					index,
					i,
					xLabel: formatDate(point.x),
					x: parseInt(canvasX),
					// @todo Will need to fix in component - think done in Canvas but need to check
					value: point.y,
					y: 0 // To be scaled in the component
				}
				filtered[index].data.push(newPoint)
			}
		})

	})
	// console.error('filtered', filtered)
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


const Utils = {
	getVersionHistory,
	initDataset,
	initSettings,
	processEvents,
	processSeries,
	eventDates,
	debounce,
	toPrecision,
	formatNumber,
	formatYear,
	colour,
	findNormalisedMin,
	defaultColour,
	setRange,
	setDate,
	COLOUR_INACTIVE: 'var(--tl-material-grey-400)',
	MIN_BOX_WIDTH: 80,
	CANVAS_MIN_HEIGHT: 300,
	CANVAS_PADDING_LEFT: 30,  // 20
	CANVAS_PADDING_RIGHT: 30,  // 20
	NAV_BREAK: 600,
}

export default Utils