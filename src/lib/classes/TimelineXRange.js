
import TimelineDate from "./TimelineDate.js"

class TimelineXRange {

    start
    end
    range = 0

    constructor(s = '', e = '') {
        this.start = new TimelineDate(s)
        this.end = new TimelineDate(e)
        // @todo may need refining for small ranges
        this.setRangeYears()
    }

    copy() {
        console.error('range to copy', this)
        const newXRange = new TimelineXRange(this.start.value, this.end.value)
        console.error('new XRAnge', newXRange)
        return newXRange
    }


    setPseudoEndDate(eventWidth, datasetXRange) {
        let pseudoEnd = this.start.year + datasetXRange.range / eventWidth
        if (pseudoEnd > datasetXRange.end.year) {
            pseudoEnd = datasetXRange.end.year
        }
        this.end = TimelineDate.setDate(pseudoEnd)
    }

    setRangeYears() {
        this.range = this.end.year - this.start.year
    }

    dateInRange(date) {
        if (date) return this.start.decimal <= date.decimal && date.decimal <= this.end.decimal
        return false
    }

    eventInRange(event) {
        // console.log('options xRange', range)
        // Not in range if defined and doesn't fit in the range
        if (!event.started() && !this.dateInRange(event.start)) {
            return false
        }
        // Start in range, end in range if end is undefined or fites in date range
        return !event.continuing() || this.dateInRange(event.end)
    }

    // static copy(xRange) {
    //     console.error('range to copy', xRange)
    //     let newXRange = new TimelineXRange(xRange.start.value, xRange.end.value)
    //     console.error('new XRAnge', newXRange)
    //     return newXRange
    // }

}

// export const copyXRange = function(xRange){
//     console.error('range to copy', xRange)
//     let newXRange = new TimelineXRange(xRange.start.value, xRange.end.value)
//     console.error('new XRAnge', newXRange)
//     return newXRange
// }

export default TimelineXRange