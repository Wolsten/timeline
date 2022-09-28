import TimelineDate from "./TimelineDate"

class TimelinePoint {

    x
    y
    colour = ''
    categoryColour = ''
    subCategoryColour = ''

    constructor(rawPoint, colour, categoryColour, subCategoryColour) {
        this.x = new TimelineDate(rawPoint.x)
        this.y = parseFloat(rawPoint.y)
        this.colour = colour
        this.categoryColour = categoryColour
        this.subCategoryColour = subCategoryColour
    }
}



export default TimelinePoint