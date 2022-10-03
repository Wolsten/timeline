import TimelineXRange from "./TimelineXRange"

import Utils from "../Utils"


class TimelineOptions {

    symbols = false
    readonly = false
    group = false      // group by category or sub-category according to filter typ
    categorise = false
    search = ''
    filter = ''
    filterType = ''
    title = ''
    sort = 'date'
    categories = []
    subCategories = []
    xRange = new TimelineXRange()
    selectedEvent = undefined
    selectedPoint = undefined
    zoom = 1

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
                    case 'categorise':
                        if (value === 'true') this.categorise = true
                        break;
                    case 'logscale':
                        if (value === 'true') this.logscale = true
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
                    case 'start':
                        // start = getDateParts(value)
                        start = value
                        break
                    case 'end':
                        // end = getDateParts(value)
                        end = value
                        break
                    case 'subCategories':
                        const subCats = value.split('|')
                        if (subCats.length > 0) {
                            subCats.forEach(subCat => subCat.trim())
                            this.subCats = subCats
                        }
                        break;
                    case 'categories':
                        const cats = value.split('|')
                        if (cats.length > 0) {
                            cats.forEach(cat => cat.trim())
                            this.categories = cats
                        }
                }
            }
        })
        // xRange
        if (start && end) {
            this.xRange = new TimelineXRange(start, end)
        }
    }

    focus(dsXRange) {
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
        this.xRange.setRangeYears()
    }

    reset(xRange) {
        this.selectedEvent = undefined
        this.selectedPoint = undefined
        this.search = ""
        this.filter = ""
        this.sort = "date"
        this.symbols = false
        this.group = false
        this.xRange = xRange.copy()
    }
}


export default TimelineOptions