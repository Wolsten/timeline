import Utils from "../Utils.js"

const DAYS_IN_MONTH = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

class TimelineDate {

    // Public properties
    value = ""
    year = 0
    month = 0
    day = 0
    decimal = 0.0

    /**
     * Takes in a date which can be one of the following:
     *   undefined         Ongoing at end of date range or started before start of data range
     *   1) 'YYYY'         e.g. 2020
     *   2) '[Y]YYYbc'     e.g. 500bc
     *   3) 'YYYY-MM[-DD]' e.g. 2020-06-28
     *   4) 'XXXmya'       e.g. 100mya, i.e. 100 Million years ago
     *   5) 'XXXmy'        e.g. 100my into the futire
     * 
     * Returns custom date object with following properties:
     *     value    Original stringDate or "-" if was undefined 
     *     day      Integer day of the month
     *     month    Integer month of the year
     *     year     Integer year
     *     decimal  Number representing fractional year (e.g. 1 July 2020 => 2020.5)
     * @param {String|undefined} date 
     * @returns
     */
    constructor(date) {
        // Check for no dates, either for empty initialiser or undefined
        if (date === "") {
            this.value = ""
            return
        }
        if (date === undefined) {
            this.value = '-'
            return
        }
        // Make sure this is a string
        this.value = '' + date
        // Try to split dates into parts
        const parts = this.value.split('-')
        // Format 1, 2, 4 or 5
        if (parts.length == 1) {
            parts[0] = parts[0].toLowerCase()
            // Format 2 
            if (parts[0].endsWith('bc')) {
                this.year = -parseInt(parts[0].split('bc')[0])
                // Format 4
            } else if (parts[0].endsWith('mya')) {
                this.year = -1000000 * parseFloat(parts[0].split('mya')[0])
                // Format 5
            } else if (parts[0].endsWith('my')) {
                this.year = 1000000 * parseFloat(parts[0].split('my')[0])
                // Format 1
            } else {
                this.year = parseInt(parts[0])
            }
        } else {
            // Format 3
            this.year = parseInt(parts[0])
            this.month = parseInt(parts[1])
            if (parts.length == 3) {
                this.day = parseInt(parts[2])
            }
        }
        this.decimal = this.getDecimalDate()
    }


    static setDateFromDecimal(decimal) {
        const year = Math.floor(decimal)
        // Millions of years
        if (Math.abs(year) >= 10000) {
            return new TimelineDate(Math.abs(year / 1000000) + 'my' + (year < 0 ? 'a' : ''))
        }
        // bc year
        if (year < 0) {
            return new TimelineDate(Math.abs(year) + 'bc')
        }
        // Normal dates
        const leap = TimelineDate.isLeap(year)
        const daysInYear = leap ? 366 : 365
        let days = Math.round(daysInYear * (decimal - year))
        if (days == 0) {
            return new TimelineDate(`${year}`)
        }
        let daysInMonth = [...DAYS_IN_MONTH]
        if (leap) daysInMonth[1] = 29
        let month = 0
        for (let m = 0; m < 12 && month == 0; m++) {
            if (days > daysInMonth[m]) {
                days = days - daysInMonth[m]
            } else {
                month = m + 1
            }
        }
        return new TimelineDate(`${year}-${month}-${days}`)
    }


    getDecimalDate() {
        const daysInYear = TimelineDate.isLeap(this.year) ? 366 : 365
        let total = 0
        // Add days for previous months (month is 1-based)
        for (let m = 1; m < this.month; m++) {
            total += m == 2 && TimelineDate.isLeap(this.year) ? 29 : DAYS_IN_MONTH[m - 1]
        }
        total += this.day
        return Utils.toPrecision((this.year + total / daysInYear), 6)
    }

    formatDate() {
        if (this.value === '') {
            return '-'
        }
        let formatted = TimelineDate.formatYear(this.year)
        if (this.month > 0 && this.day > 0) {
            formatted = `${this.day} ${TimelineDate.getMonth(this.month)} ${formatted}`
        }
        return formatted
    }

    before(date) {
        if (this.value === '-' && date.value === '-') return true
        if (this.decimal < date.decimal) return true
        return false
    }

    after(date) {
        if (this.value === '-' && date.value === '-') return true
        if (this.decimal > date.decimal) return true
        return false
    }

    isUnset() {
        return this.value === ''
    }

    static isLeap(year) {
        // three conditions to find out the leap year
        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
            return true
        }
        return false
    }

    static formatYear(year) {
        let magnitude = Math.abs(year)
        // Straight years
        if (magnitude < 10000) {
            return Utils.stringifyToPrecision(magnitude, 4) + (year < 0 ? 'bc' : '')
        }
        // Otherwise millions
        magnitude = magnitude / 1000000
        return Utils.stringifyToPrecision(magnitude, 2) + 'my' + (year < 0 ? 'a' : '')
    }

    static getMonth(oneBasedNumber) {
        return MONTHS[parseInt(oneBasedNumber) - 1]
    }

    static setDate(year = 0, month = 0, day = 0) {
        const d = new TimelineDate("")
        d.year = year
        d.month = month
        d.day = day
        d.decimal = d.getDecimalDate()
        return d
    }


}


export default TimelineDate