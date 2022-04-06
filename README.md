# Simple Dealer locator

A drop-in module for a website that shows a google map with list of dealers in the sidebar.

## Features
- draws all dealers on a map
- shows a list of dealers in the side bar providing map navigation
- determines user location and sorts the dealers, showing nearest first
- shows a distance to each dealer from a given location (walking or driving)
- allows to search for nearest dealer to a given location
- provides a direction link to each dealer
- allows to set custom markers

## Usage

- Include [dealer-locator.js)(/dist/dealer-locator.js?raw=true) and [dealer-locator.css](/dist/dealer-locator.css?raw=true) on your page
- Add a container where you want the map to be rendered
- Initialize the script

```html
<div id="my-dealer-locator">
      <!-- map will be rendered here -->
</div>
<script src="dealer-locator.js"></script>
<script>
  dealerLocator({
    container: 'dealer-locator',
    apiKey: 'GOOGLE_MAPS_API_KEY',
    center: { lat: 37.061050, lng: -122.007920 },
    travelMode: 'WALKING',
    unitSystem: 'METRIC',
    dealerMarkerIcon: './dealerIcon.png',
    homeMarkerIcon: './homeIcon.png',
    markerIconSize: [40, 62],
    limit: 1,
    searchHint: "Not all dealers sell our whole range so if you're looking for a specific product we recommend you call ahead.",
    loadDealers: function(location) {
      // location: {lat, lng}
      // you can load your dealers based on location dynamically
      return Promise.resolve([
        {
            name: 'ADELAIDE HARLEY-DAVIDSON BIKEWORKS',
            address: '957 SOUTH ROAD MELROSE PARK, SA 5039, AU',
            location: {lat: -34.9793123, lng: 138.5741964},
            website: 'https://www.bellhelmets.com'
        },
        {
            name: "AJ'S MOTORCYCLES, PARTS & APPAREL",
            details: '4 PURCELL STREET SHEPPARTON, VIC 3630, AU',
            location: {lat: -36.3836446, lng: 145.4068033}
        }
      ])
    }
  })
</script>
```

## Configuration options

| Option | Description | Default |
| --- | --- | --- |
| `container` | id of the element where the map will be rendered
| `dealers` | an array of dealers to render on a map `[{name, address, location: {lat, lng}, website}]`
| `loadDealers` | a function that returns an array of dealers directly or a Promise. It accepts a location `{lat, lng}` param and is called every time location autocomplete is triggered
| `zoom` | initial map zoom | 6
| `center` | initial map center | `{lat: 37.061050, lng: -122.007920}`
| `dealerMarkerIcon` | custom dealer marker icon
| `homeMarkerIcon` | custom current location marker icon
| `markerIconSize` | an array of [x, y] to scale marker icon
| `searchHint` | text rendered after a search input
| `travelMode` | the mode used to calculate distance `WALKING` or `DRIVING` | `DRIVING`
| `unitSystem` | used to show distance `METRIC` or `IMPERIAL` | `METRIC`
| `limit` | shows only first n closest results to the location | 10
| `homeLocationHint` |  text that appears in an info window of home location marker | Current location
| `farAwayMarkerOpacity` | an opacity of a marker that is too far away (determined by `limit`) | 0.6
| `fullWidthMap` | changes the appearance to make the map full width and dealer list as an overlay on top of it