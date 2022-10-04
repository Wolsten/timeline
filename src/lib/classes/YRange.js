
import Utils from "../Utils.js"

class YRange {

    // Public properties
    min = 0
    max = 0
    range = 0
    horizontals = []

    constructor(series) {

        this.min = series.reduce(
            (min, entry) => (entry.min < min ? entry.min : min),
            Number.POSITIVE_INFINITY
        )

        this.max = series.reduce(
            (max, entry) => (entry.max > max ? entry.max : max),
            Number.NEGATIVE_INFINITY
        )

        this.range = Utils.toPrecision(this.max - this.min, 1)

        const step = this.range / 10

        this.min = this.findNormalisedMin(step, this.min)

        // Normalise the maximum value and range and get y intervals (horizontals)
        let y = this.min
        this.horizontals = []
        while (y < this.max) {
            this.horizontals.push({
                y,
                label: y,
            })
            y += step * 2
        }
        this.max = y
        this.range = this.max - this.min
    }


    findNormalisedMin(step, min) {
        let y = 0
        if (min < 0) {
            while (y > min) {
                y -= step
            }
        } else {
            while (y < min) {
                y += step
            }
            y -= step
        }
        return y
    }


}

export default YRange 