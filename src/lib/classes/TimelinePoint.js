import TimelineDate from "./TimelineDate"
import Utils from "../Utils"

class TimelinePoint {

    x
    y = 0
    sIndex = 0
    colour = ''
    categoryColour = ''
    subCategoryColour = ''

    constructor(sIndex, rawPoint, colour, categoryColour, subCategoryColour) {
        this.x = new TimelineDate(rawPoint.x)
        this.y = parseFloat(rawPoint.y)
        this.sIndex = sIndex
        this.colour = colour
        this.categoryColour = categoryColour
        this.subCategoryColour = subCategoryColour
    }

    dataPoint(opIndex, oXRange, yRange, canvasHeight) {
        return {
            opIndex,
            sIndex: this.sIndex,
            x: this.x,
            y: this.y,
            xLabel: this.x.formatDate(),
            scaledX: this.scaleX(oXRange.scale, oXRange),
            scaledY: TimelinePoint.scaleY(this.y, yRange, canvasHeight)
        }
    }

    scaleX(scale, oXRange) {
        const scaled = (this.x.decimal - oXRange.start.decimal) * scale
        return Math.round(Utils.CANVAS_PADDING_LEFT + scaled)
    }

    // Static as also invoked directly in canvas
    static scaleY(y, yRange, canvasHeight) {
        return Math.round(canvasHeight * (1 - (y - yRange.min) / yRange.range))
    }

}



export default TimelinePoint