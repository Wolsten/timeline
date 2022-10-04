import Utils from "../Utils"
import TimelineDate from "./TimelineDate"

class TimelineXAxis {

    values = []
    ticks = []
    labels = []
    majorFirst = 0
    majorLast = 0
    majorRange = 0

    constructor(drawingWidth, intervals, startYear, interval) {
        // Canvas interval
        const canvasInterval = drawingWidth / intervals

        let canvasX = 0
        let value = startYear

        this.values = []
        this.ticks = []
        this.labels = []
        for (let i = 0; i <= intervals; i++) {
            const tick = canvasX
            this.ticks.push(tick)
            this.values.push(value)
            this.labels.push(TimelineDate.formatYear(value))
            canvasX += canvasInterval
            value += interval
        }

        this.majorFirst = this.labels[0]
        this.majorLast = this.labels[this.labels.length - 1]
        this.majorRange = this.majorLast - this.majorFirst

        // console.warn("Initialised xAxis")
        // console.table(this)
    }


}


export default TimelineXAxis