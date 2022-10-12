
import TimelineDate from "./TimelineDate.js"

class TimelineXRange {

    start
    end
    range = 0.0
    units = 'years'
    scale = 0.0

    constructor(s = '', e = '') {
        // debugger
        this.start = new TimelineDate(s)
        this.end = new TimelineDate(e)
        // @todo may need refining for small ranges
        // this.setRangeYears()
        this.setRange()
    }

    setStart(decimal) {
        this.start = TimelineDate.setDateFromDecimal(decimal)
        this.setRange()
    }

    setEnd(decimal) {
        this.end = TimelineDate.setDateFromDecimal(decimal)
        this.setRange()
    }


    copy() {
        return new TimelineXRange(this.start.value, this.end.value)
    }

    setPseudoEndDate(eventWidth, datasetXRange) {
        let pseudoEnd = this.start.year + datasetXRange.range / eventWidth
        if (pseudoEnd > datasetXRange.end.year) {
            pseudoEnd = datasetXRange.end.year
        }
        this.end = TimelineDate.setDate(pseudoEnd)
    }

    setRangeYears() {
        this.range = Math.abs(this.end.year - this.start.year)
    }


    setRange() {
        this.range = Math.abs(this.end.decimal - this.start.decimal)
    }

    dateInRange(date) {
        if (date) return this.start.decimal <= date.decimal && date.decimal <= this.end.decimal
        return false
    }

    eventInRange(event) {
        // Starts or ends in range
        if (this.dateInRange(event.start) || this.dateInRange(event.end)) return true
        // Surrounds the range
        const startedBefore = event.started() || event.start.before(this.start)
        const endedAfter = event.continuing() || event.end.after(this.end)
        if (startedBefore && endedAfter) return true
        // Not in range
        return false
        // Already started or starts in range AND continuing or ends in range
        // OR starts before and ends after
        // return ((event.started() || this.dateInRange(event.start)) &&
        //     (event.continuing() || this.dateInRange(event.end))) ||
        //     (event.start.before(this.start) && event.end.after(this.end))
    }



}



export default TimelineXRange