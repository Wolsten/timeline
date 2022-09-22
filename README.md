# README.md

A resuable svelte app for displaying timelines of events and data.

Input data should be specified in json files with following format:


```
{
    "slug": String hyphenated,
    "name": String,
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
            "summary": String,
            "start": String Allowed are YYYY, YYYY-MM-YY, YYYYbc, Ymya
            "end": String As above
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
            "citations": String,
            "min": Number,
            "max": Number,
            "points": [
                {
                    "x": String Allowed are YYYY, YYYY-MM-YY, YYYYbc, Ymya
                    "y": Number
                },
        },
        ...
    ]

```

