

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
	if (number >= 1000000) {
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
	debounce,
	toPrecision,
	formatNumber,
	colour,
	defaultColour,
	sentenceCase,
	COLOUR_INACTIVE: 'var(--tl-material-grey-400)',
	MIN_BOX_WIDTH: 80,
	CANVAS_MIN_HEIGHT: 300,
	CANVAS_PADDING_LEFT: 40,  // 20
	CANVAS_PADDING_RIGHT: 40,  // 20
	NAV_BREAK: 600
}

export default Utils