# README.md

Timeline is a flexible application for displaying events and charts over long and short time periods. It is built using svelte.


## Setting up a timeline in an HTML file 

This app populates custom HTML tags as follows:

```
      <time-line 
        data-url="URL of the json dataset file" 
        data-settings="...">
      </time-line>
```

## Optional settings

A number of optional settings can be specified as a comma separated string:

```
    data-settings="setting1=xxx,setting2=yyy,etc"
```

Possible settings (with defaults) are as follows:

| Setting | Default | Usage |
|---------|---------|-------|
| symbols | false | Whether to display symbols on charts |
| readonly | false | If set to `true` constrains user interactions |
| group | false | If set to `true` group charted data by sub-category |
| totals | false | If set to `true` group charted data by category |
| search | '' | Show events with name containing the text |
| filter | '' | Highlights events and graphical series according to category or sub-category |
| filterType | '' | The taxonomy to filter against, allowed values include `single` for highlighting a series in a chart, `sub-category` for highlighting events and series by sub-category and `category` for highlighting events and series by category |
| title | 'dataset name' | Override the dataset name specified in the json dataset file |
| sort | 'date' | The order in which events are displayed, by `date` or by `category` (and date within category) |
| maxEventsHeight | '' | Set to any valid css value, e.g. `200px` or `60vh` |
| start | 'dataset start date' | Override the dataset start date to display a subset of data |
| end | 'dataset end date' | Override the dataset end date to display a subset of data |
| categories | '' | Pipe  `\|` separated list of categories to filter by. Only events or series that match will be displayed |
| subCategories | '' | Pipe `\|` separated list of sub-categories to filter by. Only events or series that match will be displayed |



## Dataset json format

Input data should be specified in json files with following format:


```
{
    "name": String (override on display by setting `title`),
    "summary": String,
    "categories": [
        {
            "name": String, e.g. "category name A",
            "colour": String Any HTML colour code
        },
        ...
    ],
    "subCategories": [
        {
            "category": String e.g. "category A",
            "name": String e.g. "sub category 1",
            "colour": String Any HTML colour code
        },
        ...
    ],
    "events": [
        {
            "name": String,
            "category": String e.g. "category A",
            "subCategory": String e.g. "sub category 1",
            "summary": Markdown String,
            "start": String (See note 1),
            "end": (optional) String As `start` (see note 2),
            "citations": Markdown String
        },
        ...
    ],
    "series": [
        {
            "name": String,
            "legend": String,
            "category": String e.g. "category A",
            "subCategory": String e.g. "sub category 1",
            "colour": String Any HTML colour code
            "summary": String,
            "citations": Markdown String,
            "min": Number,
            "max": Number,
            "points": [
                {
                    "x": String (see note 1),
                    "y": Number
                },
        },
        ...
    ]

```

### Notes on data format

1. This app supports an extended time range from recent times to past millenia. Allowed formats are: <br/>`YYYY`, <br/>`YYYY-MM-DD`, <br/>`YYYYbc`, <br/>`YYYY.Ymya`, <br/>`-` (events only).
2. Event `end` dates are optional. If not specified timeline assumes this is a <strong>point</strong> event. If you want to specify an event that started before the main dataset `start` then set to `-`. Likewise if you want to specific an unfinished date going on into the future set the `end` date to `-`.
3. Summaries and citations can be specified using Markdown syntax.

