// ----------------------------------------------------------------------------------------------------
// Initialize the map
let map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
});

// Create the base layers.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// This queries all earthquakes in the past 7 days above M2.5+
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// ----------------------------------------------------------------------------------------------------
// Function to get the color based on depth
function getColor(depth) {
    return depth > 90  ? '#FF5733' :  // Bright Orange for the deepest depths
           depth > 70  ? '#C70039' :  // Crimson Red
           depth > 50  ? '#900C3F' :  // Deep Red
           depth > 30  ? '#FFC300' :  // Bright Yellow
           depth > 10  ? '#DAF7A6' :  // Light Green
           depth > 0   ? '#B9FBC0' :  // Pale Green
                        '#D4EDDA';  // Very Light Green for depths below 0 (if applicable)
}

// ----------------------------------------------------------------------------------------------------
// Function to get the radius based on magnitude
function getRadius(magnitude) {
    return magnitude * 4; // Adjust the multiplier to scale the markers
}

// ----------------------------------------------------------------------------------------------------
// Function to process GeoJSON data and add markers
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(`
            <strong>Location:</strong> ${feature.properties.place}<br>
            <strong>Magnitude:</strong> ${feature.properties.mag}<br>
            <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km
            `);
        }
}

// ----------------------------------------------------------------------------------------------------
// Fetch the data and add it to the map
  fetch(queryUrl)
    .then(response => response.json())
    .then(data => {
      L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
          });
        },
        onEachFeature: onEachFeature
      }).addTo(map);
  
      // Create the legend
      const legend = L.control({position: 'bottomright'});
  
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        const depths = [-10, 10, 30, 50, 70, 90];
        const labels = [];
  
        // Loop through depth intervals and generate a color label
        for (let i = 0; i < depths.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
      };
  
      legend.addTo(map);
    })
    .catch(error => console.error('Error fetching the earthquake data:', error));