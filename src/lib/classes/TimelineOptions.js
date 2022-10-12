import TimelineXRange from "./TimelineXRange"

import Utils from "../Utils"


class TimelineOptions {

    symbols = false
    readonly = false
    group = false      // group by category or sub-category according to filter typ
    search = ''
    filter = ''
    filterType = ''
    title = ''
    sort = 'date'
    maxEventsHeight = '' // can be set to any valid css value
    categories = []
    subCategories = []
    xRange = new TimelineXRange()
    selectedEvent = undefined
    selectedPoint = undefined
    zoom = 1
    focus = undefined

    constructor(settings = '') {

        if (settings === '') {
            return
        }
        let start
        let end
        // Apply default settings where required
        // Note that only non-defaults should be set in user settings
        const pairs = settings.split(',')
        // console.log('pairs', pairs)
        pairs.forEach(pair => {
            // debugger
            const parts = pair.split('=')
            if (parts.length == 2) {
                const setting = parts[0].trim()
                const value = parts[1].trim()
                switch (setting) {
                    case 'symbols':
                        if (value === 'true') this.symbols = true
                        break
                    case 'readonly':
                        if (value === 'true') this.readonly = true
                        break
                    case 'group':
                        this.group = value ? true : false
                        break
                    case 'search':
                        this.search = value
                        break
                    case 'filter':
                        this.filter = value
                        break
                    case 'title':
                        this.title = value
                        break
                    case 'sort':
                        this.sort = value
                        break
                    case 'maxEventsHeight':
                        this.maxEventsHeight = value
                        break
                    case 'start':
                        // start = getDateParts(value)
                        start = value
                        break
                    case 'end':
                        // end = getDateParts(value)
                        end = value
                        break
                    case 'subCategories':
                        const subCategories = value.split('|')
                        if (subCategories.length > 0) {
                            subCategories.forEach(subCat => subCat.trim())
                            this.subCategories = subCategories
                        }
                        // console.log('subCategories', this.subCategories)
                        break;
                    case 'categories':
                        const cats = value.split('|')
                        if (cats.length > 0) {
                            cats.forEach(cat => cat.trim())
                            this.categories = cats
                        }
                    // console.log('subCategories', this.categories)
                }
            }
        })
        // xRange
        if (start && end) {
            this.xRange = new TimelineXRange(start, end)
        }

        // console.log('options', this)
    }

    setFocus(dsXRange) {
        if (this.selectedEvent === undefined) {
            return
        }
        if (this.selectedEvent.started()) {
            this.xRange.start = dsXRange.start
        } else {
            this.xRange.start = this.selectedEvent.start
        }
        if (this.selectedEvent.continuing()) {
            this.xRange.end = dsXRange.end
        } else if (this.selectedEvent.isPoint()) {
            // Start end end dates match so calculate a pseudo end date
            this.xRange.setPseudoEndDate(Utils.MIN_BOX_WIDTH, dsXRange)
        } else {
            this.xRange.end = this.selectedEvent.end
        }
        // this.xRange.setRangeYears()
        this.xRange.setRange()
        this.focus = this.xRange.copy()
        // console.log('options.xRange', this.xRange)
    }

    reset(xRange) {
        this.selectedEvent = undefined
        this.selectedPoint = undefined
        this.focus = undefined
        this.search = ""
        this.filter = ""
        this.sort = "date"
        this.symbols = false
        this.group = false
        this.xRange = xRange.copy()
    }
}


export default TimelineOptions