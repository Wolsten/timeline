
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
        this.range = this.end.year - this.start.year
        // this.scaledRange = this.range
    }

    setRange() {
        this.range = this.end.decimal - this.start.decimal
        if (this.range < 0.2) {
            this.units = 'weeks'
        } else if (this.range < 0.5) {
            this.units = 'months'
        } else if (this.range < 2.5) {
            this.units = 'quarters'
        } else if (this.range < 15) {
            this.units = 'years'
        } else if (this.range < 100) {
            this.units = 'decades'
        } else if (this.range < 1000) {
            this.units = 'thousands'
        } else if (this.range < 10000) {
            this.units = '10 thousands'
        }
    }

    dateInRange(date) {
        if (date) return this.start.decimal <= date.decimal && date.decimal <= this.end.decimal
        return false
    }

    eventInRange(event) {
        // Already started or starts in range AND continuing or ends in range
        return (event.started() || this.dateInRange(event.start)) &&
            (event.continuing() || this.dateInRange(event.end))
    }



}



export default TimelineXRange