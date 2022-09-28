import TimelineDate from "./TimelineDate.js"
import TimelineXRange from "./TimelineXRange.js"

class TimelineEvent {

    // Raw event properties
    // start and end properties optional, 
    // in practice start always specified
    start
    end
    name = ''
    category = ''
    subCategory = ''
    citations = ''

    // Derived event properties
    index = 0               // Set in sortEvents
    scIndex = 0             // Ditto
    categoryColour = ''
    subCategoryColour = ''

    constructor(rawEvent, categories = [], subCategories = []) {
        // debugger
        this.name = rawEvent.name
        this.category = rawEvent.category
        this.subCategory = rawEvent.subCategory
        this.citations = rawEvent.citations
        // '-' for raw dates means started before or after the dataset range
        // In either case the start or end would be undefined
        if (rawEvent.start !== '-') {
            this.start = new TimelineDate(rawEvent.start)
        }
        // Undefined means same as start
        if (rawEvent.end === undefined) {
            this.end = this.start
        } else if (rawEvent.end !== '-') {
            this.end = new TimelineDate(rawEvent.end)
        }
        this.categoryColour = categories.find(item => item.name == this.category).colour
        this.subCategoryColour = subCategories.find(item => item.name == this.subCategory).colour
    }

    started() {
        return this.start === undefined
    }

    continuing() {
        return this.end === undefined
    }

    isPoint() {
        return this.start?.decimal === this.end?.decimal
    }

    eventDates() {
        // debugger
        let html = ''
        if (this.start) {
            // html += formatDate(event.start)
            html += this.start.formatDate()
        }
        if (this.continuing()) {
            html += ' - '
        } else if (!this.isPoint()) {
            html += ` - ${this.end.formatDate()}`
        }
        // if (this.end) {
        //     if (this.end == '-') {
        //         html += ' - '
        //     } else {
        //         // html += ` - ${formatDate(event.end)}`
        //         html += ` - ${this.end.formatDate()}`
        //     }
        // }
        html = `(${html})`
        return html
    }

    static sortByDate(a, b) {
        if (a.started()) return -1
        if (b.started()) return 1
        return a.start.decimal - b.start.decimal
    }

    static sortBySubCategory(a, b) {
        a.subCategoryIndex - b.subCategoryIndex
    }

    static sort(events, subCategories) {
        // Set event sorting indices
        // First sort by date, 
        events.sort(TimelineEvent.sortByDate)
        // Set index and sub category index
        events.forEach((event, index) => {
            event.index = index
            event.sci = subCategories.findIndex(sc => sc.name == event.subCategory)
        })
        // Sort by sub categpry
        events.sort(TimelineEvent.sortBySubCategory)
        events.forEach((event, index) => {
            event.scIndex = index
            delete (event.sci)
        })
    }

    /**
     * Filter the full set of events to return ones which match the filtering criteria. 
     * Invoked when the date range or search text changes
     * @param {TimelineEvent[]} events 
     * @param {XRange} xRange Options xRange
     * @param {String} search 
     * @param {Object[]} subCategories The data set sub categories
     * @returns {Object[]}
     */
    static process(events, xRange, search, subCategories) {
        let filtered = [...events]
        // Search?
        if (search != '') {
            const pattern = new RegExp(search, 'i')
            filtered = filtered.filter(event => event.name.search(pattern) != -1)
        }
        // Filter
        if (xRange.range > 0) {
            filtered = filtered.filter(event => xRange.eventInRange(event))
        }
        // Sort events - has to happen each time as event position is based on the 
        // date and sub category indices
        TimelineEvent.sort(filtered, subCategories)
        // console.log('filtered events', [...filtered])
        return filtered
    }


    static init(xRange, rawEvents, options, dataCategories, dataSubCategories) {
        // Filter events according to optional settings
        let filtered = [...rawEvents]
        if (options.categories.length > 0) {
            filtered = filtered.filter(event => options.categories.includes(event.category))
        }
        if (options.subCategories.length > 0) {
            filtered = filtered.filter(event => options.subCategories.includes(event.category))
        }
        if (options.xRange.range > 0) {

        }
        // Convert string start and end dates to objects
        let newEvents = []
        filtered.forEach((event) => {
            const evt = new TimelineEvent(event, dataCategories, dataSubCategories)
            // Check for optional xRange filtering
            if (options.xRange.range === 0 || options.xRange.eventInRange(evt)) {
                newEvents.push(evt)
            }
        })
        filtered = newEvents
        // If have user settings for start and end then filter events
        if (options.xRange.range != 0) {
            filtered = filtered.filter(event => options.xRange.eventInRange(event))
        }
        // Sort events
        TimelineEvent.sort(filtered, dataSubCategories)
        // Find min start value and max end value
        xRange.start = filtered.reduce((start, event) =>
            event.start.before(start) ? event.start : start, filtered[0].start
        )
        xRange.end = filtered.reduce((end, event) => {
            if (event.end === undefined) {
                return end.after(event.start) ? end : event.start
            }
            return end.after(event.end) ? end : event.end
        }, xRange.start)
        // Return the filtered list of events
        return filtered
    }


}

export default TimelineEvent