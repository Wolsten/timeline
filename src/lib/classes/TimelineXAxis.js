
import TimelineDate from "./TimelineDate"

class TimelineXAxis {

    values = []
    ticks = []
    labels = []
    units = 'years'

    constructor(drawingWidth, xRange) {

        console.warn('xRange', xRange)

        let interval = 0
        let intervals = 0
        let month = 0
        let quarter = 0
        let year = 0

        if (xRange.range < 1) {
            interval = 1 / 12
            intervals = Math.ceil(xRange.range / interval)
            this.units = 'months'
        } else if (xRange.range < 2.5) {
            interval = 1 / 4
            intervals = Math.ceil(xRange.range / interval)
            this.units = 'quarters'
        } else if (xRange.range < 12) {
            interval = 1
            intervals = Math.ceil(xRange.range / interval)
            this.units = 'years'
        } else {
            interval = 10
            intervals = Math.ceil(xRange.range / interval)
            while (intervals > 12) {
                interval = 10 * interval
                intervals = Math.ceil(xRange.range / interval)
            }
            this.units = `${interval} years`
        }

        const canvasInterval = drawingWidth / intervals
        let canvasX = 0
        let decimal = xRange.start.decimal


        if (this.units == 'months') {
            month = xRange.start.month
        } else if (this.units == 'quarters') {
            quarter = Math.ceil(xRange.start.month / 3)
        } else {
            year = xRange.start.year
        }

        this.values = []
        this.ticks = []
        this.labels = []

        for (let i = 0; i <= intervals; i++) {
            let label = ''
            if (this.units == 'months') {
                label = TimelineDate.getMonth(month)
                month++
            } else if (this.units == 'quarters') {
                label = 'Q' + quarter
                if (quarter === 4) quarter = 0
                quarter++
            } else {
                label = TimelineDate.formatYear(year)
                year = Math.floor(year + interval)
            }
            this.labels.push(label)
            this.ticks.push(canvasX)
            this.values.push(decimal)

            canvasX += canvasInterval
            decimal += interval
        }


        // xRange.scale = drawingWidth / (decimal - interval)
        xRange.scale = drawingWidth / (interval * intervals)
        // debugger
        // this.majorFirst = this.labels[0]
        // this.majorLast = this.labels[this.labels.length - 1]
        // this.majorRange = this.majorLast - this.majorFirst

        console.warn("Initialised xAxis with scale", xRange.scale)
        console.table(this)
    }

    // constructor(drawingWidth, intervals, startYear, interval) {
    //     // Canvas interval
    //     const canvasInterval = drawingWidth / intervals

    //     let canvasX = 0
    //     let value = startYear

    //     this.values = []
    //     this.ticks = []
    //     this.labels = []
    //     for (let i = 0; i <= intervals; i++) {
    //         const tick = canvasX
    //         this.ticks.push(tick)
    //         this.values.push(value)
    //         this.labels.push(TimelineDate.formatYear(value))
    //         canvasX += canvasInterval
    //         value += interval
    //     }

    //     this.majorFirst = this.labels[0]
    //     this.majorLast = this.labels[this.labels.length - 1]
    //     this.majorRange = this.majorLast - this.majorFirst

    //     // console.warn("Initialised xAxis")
    //     // console.table(this)
    // }


}


export default TimelineXAxis