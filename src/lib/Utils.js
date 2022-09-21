import { current_component } from "svelte/internal"

const SYMBOLS = 7 // Must match number of symbol classes in Symbol.svelte
const MIN_EVENT_WIDTH = 4
const DAYS_IN_MONTH = [
	31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
]
const DATE_BEFORE = -1


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


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getMonth = function (m) {
	return MONTHS[parseInt(m) - 1]
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



// const initXAxis = function (start, end) {
// 	// const s = parseFloat(start.year)
// 	// const e = parseFloat(end.year)
// 	const s = start.year
// 	const e = end.year
// 	const axis = {
// 		values: [],
// 		ticks: [],
// 		labels: [],
// 		majorFirst: start.year,
// 		majorLast: end.year,
// 		majorRange: end.year - start.year,
// 	}
// 	// console.log('initAxis: axis', axis)
// 	return axis
// }



/**
 * Initialise the settings with any optional user supplied settings
 * @param {string} userSettings Command separate list of setting=value pairs
 * @param {Object|Number} start Start date or number
 * @param {Object|Number} end End date or number
 * @param {String[]} subCats Array of dataset category strings
 * @param {String[]} subCats Array of dataset sub category strings
 * @returns {Object}
 */
const initSettings = function (userSettings, start, end, categories, subCats) {

	let settings = {
		symbols: false,
		readonly: false,
		totalise: false,
		categorise: false,
		logscale: false,
		search: '',
		filter: '',
		filterType: '',
		title: '',
		sort: 'x',
		categories,			// Defaults to all categories
		subCats
	}

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
					case 'subCats':
						const subCats = value.split('|')
						if (subCats.length > 0) {
							subCats.forEach(subCat => subCat.trim())
							settings.subCats = subCats
						}
				}
			}
		})
	}
	// xRange
	const s = start.year
	const e = end.year
	settings.xRange = {
		start: s,
		end: e,
		range: e - s
	}
	// console.log('initSettings', settings)
	return settings
}

/**
 * Group and return data series according to xRange and type (by category or sub-category)
 * @param {Array} series The raw series
 * @param {String} type Either category or subcategory
 * @param {Array} list A list of strings of either categories or sub categories
 */
const groupSeries = function (series, type, list) {

	if (series.length == 0) return []

	let groups = []

	list.forEach((item, index) => {

		let group = false

		series.forEach(entry => {

			// console.table(entry.points)
			entry.type = 'single'

			if ((type == 'category' && entry.category == item) ||
				(type == 'sub-category' && entry.subCategory == item.name)) {

				if (group === false) {

					const name = type == 'category' ? item : item.name
					const colour = type == 'category' ? defaultColour(index) : item.colour
					group = {
						...entry,
						max: Number.NEGATIVE_INFINITY,
						min: Number.POSITIVE_INFINITY,
						points: [],
						name,
						legend: name,
						type,
						colour,
						summary: `Data grouped by ${type} ${name}`
					}
				}

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

					if (group.points[match].y > group.max) {
						group.max = group.points[match].y
					}
					if (group.points[match].y < group.min) {
						group.min = group.points[match].y
					}

				})

				group.points.sort((a, b) => a.x.decimal - b.x.decimal)
			}

		})

		groups.push(group)
	})

	return groups
}


const initCategories = function (events, series) {

	// console.log('creating new group from series', series)
	let groups = []

	// Get two lists of unique sub categories
	let seriesSubCats = new Set
	series.forEach(entry => {
		seriesSubCats.add(entry.subCategory)
	})

	let eventsSubCats = new Set
	events.forEach(entry => {
		eventsSubCats.add(entry.subCategory)
	})

	seriesSubCats = Array.from(seriesSubCats)
	eventsSubCats = Array.from(eventsSubCats)

	// Sort and add extra full total group for series
	if (seriesSubCats.length > 1) {
		seriesSubCats.sort((a, b) => a - b)
		seriesSubCats.push('total')
	}

	// debugger

	// Generate totalised sub category groups
	if (series.length > 0) {

		seriesSubCats.forEach((cat, index) => {

			let group = {
				id: index + 1,
				max: Number.NEGATIVE_INFINITY,
				min: Number.POSITIVE_INFINITY,
				name: cat,
				points: [],
				subCategory: cat,
				citations: ''
			}

			series.forEach(series => {

				group.citations = series.citations

				if (cat == 'total' || series.subCategory == cat) {
					series.points.forEach(point => {

						// Look for point with same x
						let match = group.points.findIndex(pt => {
							return pt.x.year == point.x.year
						})

						// Create new point or add existing to match
						if (group.points.length == 0 || match == -1) {
							// match = 0
							// *** IMPORTANT *** MUST PUSH A COPY NOT THE ORIGINAL
							group.points.push({ ...point })
							match = group.points.length - 1
						} else {
							group.points[match].y += point.y
						}

						if (group.points[match].y > group.max) {
							group.max = group.points[match].y
						}
						if (group.points[match].y < group.min) {
							group.min = group.points[match].y
						}

					})
				}
			})

			group.points.sort((a, b) => a.x.decimal - b.x.decimal)

			groups.push(group)
		})

	}

	// console.error('groups', groups, 'seriesSubCats', seriesSubCats)

	return { groups, eventsSubCats, seriesSubCats }
}


const initSeriesColours = function (series, groups) {
	const indices = []
	series.forEach((entry, index) => {
		let subCatIndex = index
		if (entry.subCategory != '') {
			subCatIndex = indices.findIndex(cat => cat == entry.subCategory)
			if (subCatIndex == -1) {
				indices.push(entry.subCategory)
				subCatIndex = indices.length - 1
			}
		}
		entry.colourIndex = subCatIndex % COLOUR_SET.length
		entry.symbolIndex = index % SYMBOLS
	})
	groups.forEach((entry, index) => {
		let subCatIndex = index
		if (entry.subCategory != '') {
			subCatIndex = indices.findIndex(cat => cat == entry.subCategory)
			if (subCatIndex == -1) {
				indices.push(entry.subCategory)
				subCatIndex = indices.length - 1
			}
		}
		entry.colourIndex = subCatIndex % COLOUR_SET.length
		entry.symbolIndex = index % SYMBOLS
	})

	// console.log('series',series)

	return { series, groups }
}


const processDataset = function (data) {
	// Initialise sub category colours
	data.subCategories.forEach((item, index) => {
		if (item.colour == '') item.colour = defaultColour(index)
	})
	// Process events
	if (data.events.length > 0) {
		// Convert string dates to custom date objects
		data.events.forEach(event => {
			event.start = getDateParts(event.start)
			event.end = getDateParts(event.end)
		})
		// Find min start value and max end value
		data.start = data.events.reduce((min, event) => aBeforeB(event.start, min) ? event.start : min, data.events[0].start);
		data.end = data.events.reduce((max, event) => aBeforeB(event.end, max) ? max : event.end, data.start);
	}
	console.log('series', data.series)
	// Generate and append category and sub-category groups to series
	const categoryGroups = groupSeries(data.series, 'category', data.categories)
	const subCategoryGroups = groupSeries(data.series, 'sub-category', data.subCategories)
	data.series = [
		...data.series,
		...categoryGroups,
		...subCategoryGroups
	]
	// Process series
	data.series.forEach((item, index) => {
		// debugger
		// Convert string dates to custom date objects
		item.points.forEach(point => {
			point.x = getDateParts(point.x)
			point.colour = item.colour ? item.colour : defaultColour(index)
		})
		// Find x-range start and end, plus y range min and max
		data.start = item.points.reduce((min, point) => aBeforeB(point.x, min) ? point.x : min, item.points[0].x)
		data.end = item.points.reduce((max, point) => aBeforeB(point.x, max) ? max : point.x, data.start);
		data.min = item.points.reduce((min, point) => point.y < min ? point.y : min, item.points[0].y)
		data.max = item.points.reduce((max, point) => point.y > max ? point.y : max, data.min)
	})
	// Initialise x axis 
	data.xAxis = {
		values: [],
		ticks: [],
		labels: [],
		majorFirst: data.start.year,
		majorLast: data.end.year,
		majorRange: data.end.year - data.start.year,
	}
	// Initialise categories and colours
	// const groupsAndSubCats = initCategories(data.events, data.series)
	// data.eventsSubCats = groupsAndSubCats.eventsSubCats
	// data.seriesSubCats = groupsAndSubCats.seriesSubCats
	// const seriesAndGroups = initSeriesColours(data.series, groupsAndSubCats.groups)
	// data.series = seriesAndGroups.series
	// data.groups = seriesAndGroups.groups
	console.log('dataset', data)
	return data
}


const processEvents = function (events, scale, startValue, endValue, datasetSubCats, optionsSubCats, search) {

	// console.log('start value', startValue, 'endValue', endValue)
	// console.warn('\nProcessing events', events, '\ndatasetSubCats', datasetSubCats, '\noptionsSubCats', optionsSubCats, '\nsearch', search)
	// debugger
	let filtered = filterEventsBySearchAndCategory(events, search, optionsSubCats)
	// console.log('filtered', [...filtered])

	filtered = filterEventsByXRange(filtered, scale, startValue, endValue, datasetSubCats)
	console.log('filtered events', [...filtered])

	return sortEventsVertically(filtered, datasetSubCats)
}


const filterEventsBySearchAndCategory = function (events, search, optionsSubCats) {
	const pattern = new RegExp(search, 'i')
	let filtered = []
	events.forEach(event => {
		let matched = search == '' || event.name.search(pattern) != -1
		if (matched && optionsSubCats.includes(event.subCategory)) {
			filtered.push(event)
		}
	})
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
const filterEventsByXRange = function (events, scale, xStart, xEnd, datasetSubCats) {
	let filtered = []
	// Scale each event
	events.forEach((event, index) => {
		// if (event.name == 'Liz Truss') {
		// 	console.error('event', event)
		// 	debugger
		// }
		// Check if starts in the the range defined by ()
		const startsIn =
			// Already started
			event.start === '-' ||
			// or started after reference startValue && started before reference end value
			(event.start.year >= xStart && event.start.year <= xEnd)
		// Check if ends in the range
		const endsIn = event.end && event.end.year >= xStart && event.end.year <= xEnd

		if (startsIn || endsIn) {

			event.index = index

			if (event.start.decimal !== undefined) {
				event.left = Math.round((event.start.decimal - xStart) * scale)
			} else {
				event.left = Math.round((xStart) * scale)
			}

			let right = 0
			if (event.end === undefined) {
				right = event.left
			} else if (event.end === '-') {
				right = Math.round((xEnd - xStart) * scale)
			} else {
				right = Math.round((event.end.decimal - xStart) * scale)
			}

			event.width = right - event.left

			event.left += Utils.CANVAS_PADDING_LEFT

			if (event.width < MIN_EVENT_WIDTH) {
				event.width = MIN_EVENT_WIDTH
			}

			let subCatIndex = datasetSubCats.findIndex(c => c == event.subCategory)
			if (subCatIndex == -1) {
				subCatIndex = 0
			} else {
				subCatIndex = subCatIndex % COLOUR_SET.length
			}
			event.colour = COLOUR_SET[subCatIndex]

			filtered.push(event)
		}
	})

	// console.log('filtered', filtered)
	return filtered
}


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
	return (date.year + total / daysInYear).toPrecision(6) * 1.0
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
 * @param {string} stringDate 
 * @returns {string|Object}
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


const isDate = function (d) {
	return d !== undefined &&
		d.day !== undefined &&
		d.month !== undefined &&
		d.year !== undefined
}

const getYearOrValue = function (dv) {
	if (isDate(dv)) {
		return dv.year
	}
	if (typeof dv === 'number') {
		return dv
	}
	return false
}



const aBeforeB = function (a, b) {
	// Either undefined
	// if (a === undefined || b === undefined) {
	// 	return true;
	// }
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
	// if (!isDate(a) && !isDate(b) &&
	// 	typeof a !== 'number') {
	// 	return 0
	// }
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

const sortEventsByCategory = function (a, b) {
	return a.cIndex - b.cIndex
}



const sortEventsVertically = function (events, datasetSubCats) {
	// console.error('sortEventsVertically events',events)
	// console.log('subcats',datasetSubCats)
	// A sort indices
	// x sorted
	events.sort(sortEventsByDate)
	// Save the xOrder and lookup/save category indices for subsequent category sort
	events.forEach((e, i) => {
		e.xOrder = i
		e.cIndex = datasetSubCats.findIndex(sc => sc == e.subCategory)
	})
	// console.error('sorted events series by decimal',[...events])
	// Sub-category sorted
	events.sort(sortEventsByCategory)
	events.forEach((e, i) => e.cOrder = i)
	// console.warn('sorted events by x-axis value and category',events)
	return [...events]
}



const processSeries = function (series, scale, xStart, xEnd, filter, type, totalise) {

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

	// console.warn('set',set)
	// console.log('scale',scale)
	// console.log('xStart',xStart)
	// console.log('xEnd',xEnd)

	// Filter data by start and end range and generate data from points
	filtered.forEach((entry, index) => {

		entry.data = []

		entry.points.forEach((point, i) => {

			// debugger

			// Range test
			const inRange = point.x.decimal >= xStart && point.x.decimal <= xEnd

			if (inRange) {

				const valueX = isDate(point.x) ? point.x.decimal : point.x
				const canvasX = Utils.CANVAS_PADDING_LEFT + (valueX - xStart) * scale

				let xLabel = ''
				if (isDate(point.x)) {
					xLabel = formatDate(point.x)
				} else {
					xLabel = formatYear(point.x)
				}

				const newPoint = {
					index,
					i,
					xLabel,
					x: parseInt(canvasX),
					// @todo Will need to fix in component - think done in Canvas but need to check
					value: point.y,
					y: 0 // To be scaled in the component
				}

				filtered[index].data.push(newPoint)
			}
		})

	})

	console.error('filtered', filtered)

	return filtered
}

/**
 * Scale and label the axis based on the current data range defined in xAxis
 * and constrained by the options range
 * @param {Object} xAxis 
 * @param {Number} drawingWidth 
 * @param {Object} optionsXRange 
 * @returns {Object}
 */
const scaleXAxis = function (xAxis, drawingWidth, optionsXRange) {

	// console.warn('scaleXAxis: options x range', optionsXRange)
	// console.log('scaleXAxis: old xAxis')
	// console.table(xAxis)

	// debugger
	const intervals = Math.floor(drawingWidth / Utils.MIN_BOX_WIDTH)
	const canvasInterval = Math.round(drawingWidth / intervals)
	const dataInterval = Math.round(optionsXRange.range / intervals)

	// console.log('scaleXAxis: intervals, canvasInterval, dataInterval', intervals, canvasInterval, dataInterval)

	let canvasX = Utils.CANVAS_PADDING_LEFT
	let dataX = optionsXRange.start
	let newAxis = { ...xAxis }

	// Initialise values, ticks and labels
	newAxis.values = []
	newAxis.ticks = []
	newAxis.labels = []

	for (let i = 0; i <= intervals; i++) {

		newAxis.ticks.push(parseInt(canvasX))
		newAxis.values.push(parseInt(dataX))
		newAxis.labels.push(formatYear(parseInt(dataX)))

		canvasX += canvasInterval
		dataX += dataInterval
	}

	newAxis.majorLast = newAxis.labels[newAxis.labels.length - 1]
	newAxis.majorRange = newAxis.majorLast - newAxis.majorFirst

	// console.table(newAxis)

	return newAxis
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


// const fetchData = async function (dataName) {
// 	const post = await fetch(`/data/${dataName}.json`)
// 	const data = await post.json()
// 	return data
// }

// const fetchDataset = async function (datasetName) {
// 	const post = await fetch(`/data/${datasetName}.json`)
// 	const dataset = await post.json()
// 	return processDataset(dataset)
// }


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
	processDataset,
	initSettings,
	processEvents,
	processSeries,
	eventDates,
	scaleXAxis,
	debounce,
	toPrecision,
	formatNumber,
	formatYear,
	colour,
	findNormalisedMin,
	defaultColour,
	COLOUR_INACTIVE: 'var(--tl-material-grey-400)',
	MIN_BOX_WIDTH: 80,
	CANVAS_MIN_HEIGHT: 300,
	CANVAS_PADDING_LEFT: 20,  // 20
	CANVAS_PADDING_RIGHT: 20,  // 20
	NAV_BREAK: 600,
}

export default Utils