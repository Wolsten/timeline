import Utils from "../Utils"

class TimelineCategory {

    name = ""
    colour = ""

    constructor(index, rawCategory) {
        this.name = rawCategory.name
        this.colour = rawCategory.colour == '' ? Utils.defaultColour(index) : rawCategory.colour
    }

    static init(rawCategories) {
        let categories = []
        rawCategories.forEach((item, index) => categories.push(new TimelineCategory(index, item)))
        return categories
    }
}


export default TimelineCategory