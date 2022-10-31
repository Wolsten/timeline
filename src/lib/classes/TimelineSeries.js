import Utils from "../Utils"
import TimelinePoint from "../classes/TimelinePoint.js"
import TimelineSubCategory from "./TimelineSubCategory"

class TimelineSeries {

    sIndex = -1
    name = ''
    legend = ''
    category = ''
    subCategory = ''
    citations = ''
    summary = ''
    colour = ''
    min = 0
    max = 0
    points = []


    constructor(oxRange, dxRange, sIndex, rawEntry, dataCategories = [], dataSubCategories = []) {
        // Save basic data
        this.sIndex = sIndex
        this.name = rawEntry.name
        this.legend = rawEntry.legend
        this.citations = rawEntry.citations
        this.category = rawEntry.category
        this.subCategory = rawEntry.subCategory
        this.summary = rawEntry.summary
        this.min = rawEntry.min
        this.max = rawEntry.max
        this.type = rawEntry.type ? rawEntry.type : "off"
        // Set colours
        switch (this.type) {
            case "off":
                this.colour = rawEntry.colour ? rawEntry.colour : Utils.defaultColour(sIndex)
                break
            case "category":
                // case "total":
                this.colour = dataCategories.find(item => item.name == rawEntry.category).colour
                break
            case "sub-category":
                this.colour = dataSubCategories.find(item => item.name == rawEntry.subCategory).colour
                break
        }
        // Points
        rawEntry.points.forEach(point => {
            // Convert the point into a {TimelineDate, y}
            const pt = new TimelinePoint(sIndex, point, this.colour)
            // If have options xRange set then constrain points accordingly
            if (oxRange.range === 0 || oxRange.dateInRange(pt.x)) {
                this.points.push(pt)
                if (dxRange.start.isUnset() || pt.x.before(dxRange.start)) {
                    dxRange.start = pt.x
                }
                if (dxRange.end.isUnset() || pt.x.after(dxRange.end)) {
                    dxRange.end = pt.x
                }
            }
        })
    }


    static init(xRange, rawSeries, options, dataCategories, dataSubCategories) {
        // Filter series according to optional categories and sub categories
        if (options.categories.length > 0) {
            rawSeries = rawSeries.filter(entry => options.categories.includes(entry.category.name))
        }
        if (options.subCategories.length > 0) {
            rawSeries = rawSeries.filter(entry => options.subCategories.includes(entry.category.name))
        }
        // Generate grouped series
        const categoryGroups = TimelineSeries.groupSeries(rawSeries, 'category', dataCategories)
        const subCategoryGroups = TimelineSeries.groupSeries(rawSeries, 'sub-category', dataSubCategories)
        // Generate new entries for each series ... do this individually to make sure the sIndex is restarted 
        // for each set as when displayed they are displayed in these sets only
        const series = []
        rawSeries.forEach((entry, sIndex) => {
            series.push(new TimelineSeries(options.xRange, xRange, sIndex, entry, dataCategories, dataSubCategories))
        })
        // Only add category groups if there are less groups than the original series
        // Otherwise means there would be one category per series
        if (categoryGroups.length < rawSeries.length) {
            categoryGroups.forEach((entry, sIndex) => {
                const totalSeries = new TimelineSeries(options.xRange, xRange, sIndex, entry, dataCategories, dataSubCategories)
                // Order the points
                totalSeries.points.sort(TimelineSeries.sortGroup)
                series.push(totalSeries)
            })
        }
        // Only add sub-category groups if there are less groups than the original series
        // Otherwise means there would be one sub-category per series
        if (subCategoryGroups.length < rawSeries.length) {
            subCategoryGroups.forEach((entry, sIndex) => {
                const groupSeries = new TimelineSeries(options.xRange, xRange, sIndex, entry, dataCategories, dataSubCategories)
                // Order the points
                groupSeries.points.sort(TimelineSeries.sortGroup)
                series.push(groupSeries)
            })
        }
        // console.log('Initialiased series', series)
        return series
    }


    static sortGroup(a, b) {
        if (a.x.before(b.x)) return -1
        if (a.x.after(b.x)) return 1
        return 0
    }


    static process(series, xRange, group) {
        if (series.length == 0) return []
        // Initialise the filtered list
        let filtered = []
        // console.log("process group", group)
        // debugger
        // Group data? 
        // group can be 'single' (meaning not grouped), 'category' or 'sub-category'
        filtered = series.filter((entry) => entry.type === group)
        // Filter data by start and end range and generate data from points
        filtered.forEach((entry) => {
            entry.filteredPoints = []
            entry.min = Number.POSITIVE_INFINITY
            entry.max = Number.NEGATIVE_INFINITY
            entry.points.forEach((point, opIndex) => {
                if (xRange.dateInRange(point.x)) {
                    // console.log('point in range', point.x.formatDate())
                    // Check ranges
                    if (point.y < entry.min) entry.min = point.y
                    if (point.y > entry.max) entry.max = point.y
                    // Add to the array of points to display
                    // console.log('Adding filtered point with index', opIndex)
                    entry.filteredPoints.push(opIndex)
                }
            })
        })
        // console.warn('processed series', [...filtered])
        return filtered
    }


    static groupSeries(rawSeries, taxonomy, taxonomyList) {
        // Stop if have no series
        if (rawSeries.length == 0) return []
        // Initialise groups
        let groups = []

        taxonomyList.forEach((tax, index) => {

            // Ignore the 'other' category or sub-category
            // if (tax.name != 'other') {

            let taxEntry
            rawSeries.forEach(entry => {
                // Does the series match the taxonomy name?
                if ((taxonomy == 'category' && entry.category == tax.name) ||
                    (taxonomy == 'sub-category' && entry.subCategory == tax.name)) {
                    // Initialise group
                    if (!taxEntry) {
                        const summary = `Data grouped by ${taxonomy} ${name}`
                        taxEntry = {
                            ...entry,
                            name: tax.name,
                            legend: tax.name,
                            summary: summary,
                            max: Number.NEGATIVE_INFINITY,
                            min: Number.POSITIVE_INFINITY,
                            type: taxonomy,
                            points: [],
                        }
                    }
                    // Accumulate data points
                    entry.points.forEach(point => {
                        // Look for point with same x
                        let match = taxEntry.points.findIndex(pt => {
                            return pt.x == point.x
                        })
                        // Create new point or add existing to match
                        if (taxEntry.points.length == 0 || match == -1) {
                            // *** IMPORTANT *** 
                            // MUST PUSH A COPY NOT THE ORIGINAL
                            // Otherwise will sum the original points as well as the new one
                            taxEntry.points.push({ ...point })
                            match = taxEntry.points.length - 1
                        } else {
                            taxEntry.points[match].y += point.y
                        }
                        // Update min and max values
                        if (taxEntry.points[match].y > taxEntry.max) {
                            taxEntry.max = taxEntry.points[match].y
                        }
                        if (taxEntry.points[match].y < taxEntry.min) {
                            taxEntry.min = taxEntry.points[match].y
                        }
                    })
                    // Points sorted after being converted to TimelineDates
                }
            })
            groups.push(taxEntry)
            // }
        })
        return groups
    }

}

export default TimelineSeries