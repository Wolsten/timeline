import Utils from "../Utils"

class TimelineSubCategory {

    name = ""
    category = "" // Mapping to parent category
    colour = ""

    constructor(index, rawSubCategory) {
        this.name = rawSubCategory.name
        this.category = rawSubCategory.category
        this.colour = rawSubCategory.colour == '' ? Utils.defaultColour(index) : rawSubCategory.colour
    }

    static init(rawSubCategories) {
        let subCategories = []
        rawSubCategories.forEach((item, index) => subCategories.push(new TimelineSubCategory(index, item)))
        return subCategories
    }
}


export default TimelineSubCategory