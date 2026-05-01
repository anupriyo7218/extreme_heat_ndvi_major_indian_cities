// ===============================
// Project: Extreme Heat & NDVI Analysis (Multi-City) with Working Hover/Click
// ===============================

// 🗺️ Better basemap
Map.setOptions('HYBRID');

// 🔥 Load MODIS LST (Extreme Heat - 95th percentile)
var lst = ee.ImageCollection("MODIS/061/MOD11A2")
  .filterDate('2024-04-01', '2024-06-30')
  .select('LST_Day_1km')
  .reduce(ee.Reducer.percentile([95]));

// Convert to Celsius
lst = lst.multiply(0.02).subtract(273.15);

// 🌿 Load NDVI
var ndvi = ee.ImageCollection("MODIS/061/MOD13Q1")
  .filterDate('2024-04-01', '2024-06-30')
  .select('NDVI')
  .mean()
  .multiply(0.0001);

// 🗺️ Load India boundaries
var india = ee.FeatureCollection("FAO/GAUL/2015/level1");

// 📍 Regions
var regions = {
  Kolkata: india.filter(ee.Filter.eq('ADM1_NAME', 'West Bengal')),
  Delhi: india.filter(ee.Filter.eq('ADM1_NAME', 'Delhi')),
  Mumbai: india.filter(ee.Filter.eq('ADM1_NAME', 'Maharashtra')),
  Bangalore: india.filter(ee.Filter.eq('ADM1_NAME', 'Karnataka'))
};

// 🎯 SELECT CITY (CHANGE THIS ONLY)
var selectedCity = 'Delhi';   // Kolkata / Mumbai / Bangalore

var region = regions[selectedCity];

// 🎨 Visualization
var heatVis = {
  min: 32,
  max: 45,
  palette: ['blue', 'green', 'yellow', 'orange', 'red']
};

var ndviVis = {
  min: 0.1,
  max: 0.7,
  palette: ['brown', 'yellow', 'green']
};

// 🗺️ Center map
Map.centerObject(region, 10);

// ✂️ Clip data
var cityLST = lst.clip(region);
var cityNDVI = ndvi.clip(region);

// 🔥 Add layers
Map.addLayer(cityLST, heatVis, selectedCity + ' Heatwave 2024', false, 0.7);
Map.addLayer(cityNDVI, ndviVis, selectedCity + ' NDVI 2024', true, 0.8);

// ===============================
// 📦 EXPORT FUNCTIONS
// ===============================

// Function to export both layers for any city
function exportCityLayers(city, regionGeometry) {
  
  // Clip images for the selected city
  var cityLST_export = lst.clip(regionGeometry);
  var cityNDVI_export = ndvi.clip(regionGeometry);
  
  // Export Heatwave Layer
  Export.image.toDrive({
    image: cityLST_export,
    description: city + '_Heatwave_2024',
    folder: 'GEE_Exports',  // Creates a folder in your Google Drive
    scale: 1000,
    region: regionGeometry,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
  
  // Export NDVI Layer
  Export.image.toDrive({
    image: cityNDVI_export,
    description: city + '_NDVI_2024',
    folder: 'GEE_Exports',  // Same folder
    scale: 500,  // Higher resolution for NDVI
    region: regionGeometry,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
  
  print('✅ Export tasks created for ' + city);
  print('📁 Files will be saved to Google Drive folder: GEE_Exports');
  print('🌡️ Heatwave file: ' + city + '_Heatwave_2024.tif');
  print('🌿 NDVI file: ' + city + '_NDVI_2024.tif');
}

// Export for current city
exportCityLayers(selectedCity, region.geometry());

// Optional: Export for ALL cities at once (Uncomment if needed)
/*
var allCities = ['Kolkata', 'Delhi', 'Mumbai', 'Bangalore'];
for (var i = 0; i < allCities.length; i++) {
  var city = allCities[i];
  var cityRegion = regions[city];
  if (cityRegion) {
    exportCityLayers(city, cityRegion.geometry());
  }
}
print('🚀 Exporting all 4 cities to Google Drive...');
*/

// ===============================
// 🗺️ ENHANCED DELHI LOCATION DATABASE
// ===============================

// Function to get detailed location name for Delhi with better coverage
function getDelhiLocation(lon, lat) {
  var delhiLocations = {
    // Central Delhi
    '77.22,28.61': 'Connaught Place',
    '77.23,28.60': 'India Gate',
    '77.21,28.62': 'Janpath',
    '77.24,28.61': 'ITO',
    '77.22,28.63': 'Daryaganj',
    '77.23,28.64': 'Chandni Chowk',
    '77.21,28.59': 'Lodhi Colony',
    '77.20,28.60': 'Gole Market',
    
    // South Delhi
    '77.21,28.57': 'South Extension',
    '77.22,28.56': 'Hauz Khas',
    '77.23,28.55': 'Saket',
    '77.20,28.55': 'Malviya Nagar',
    '77.19,28.58': 'Greater Kailash',
    '77.18,28.56': 'Vasant Kunj',
    '77.17,28.55': 'Vasant Vihar',
    '77.24,28.54': 'Nehru Place',
    '77.25,28.53': 'Okhla',
    '77.20,28.58': 'Green Park',
    '77.19,28.57': 'Khan Market',
    '77.26,28.55': 'Govindpuri',
    '77.27,28.54': 'Tughlakabad',
    '77.16,28.54': 'Mahipalpur',
    
    // North Delhi
    '77.22,28.67': 'Delhi University',
    '77.21,28.69': 'Model Town',
    '77.20,28.70': 'Rohini',
    '77.23,28.68': 'Civil Lines',
    '77.24,28.66': 'Kashmere Gate',
    '77.22,28.71': 'Pitampura',
    '77.23,28.72': 'Prashant Vihar',
    '77.21,28.73': 'Saraswati Vihar',
    '77.25,28.67': 'Timarpur',
    '77.20,28.68': 'Kamla Nagar',
    
    // East Delhi
    '77.28,28.63': 'Laxmi Nagar',
    '77.29,28.64': 'Preet Vihar',
    '77.30,28.65': 'Patparganj',
    '77.31,28.63': 'Mayur Vihar',
    '77.32,28.62': 'Anand Vihar',
    '77.27,28.67': 'Shahdara',
    '77.33,28.64': 'Karkardooma',
    
    // West Delhi
    '77.12,28.65': 'Rajouri Garden',
    '77.10,28.66': 'Tilak Nagar',
    '77.09,28.64': 'Janakpuri',
    '77.08,28.62': 'Dwarka',
    '77.11,28.61': 'Patel Nagar',
    '77.13,28.63': 'Punjabi Bagh',
    '77.07,28.60': 'Najafgarh',
    '77.06,28.59': 'Uttam Nagar',
    '77.05,28.61': 'Vikaspuri',
    
    // NCR
    '77.32,28.61': 'Noida Sector 18',
    '77.05,28.46': 'Gurgaon',
    '77.42,28.69': 'Ghaziabad',
    '77.33,28.70': 'Indirapuram'
  };
  
  // Find the closest matching location
  var closestName = null;
  var minDistance = 0.08;
  
  for (var coord in delhiLocations) {
    var parts = coord.split(',');
    var locLon = parseFloat(parts[0]);
    var locLat = parseFloat(parts[1]);
    
    var distance = Math.sqrt(Math.pow(lon - locLon, 2) + Math.pow(lat - locLat, 2));
    
    if (distance < minDistance) {
      minDistance = distance;
      closestName = delhiLocations[coord];
    }
  }
  
  // Fallback to quadrants
  if (!closestName) {
    if (lat > 28.70 && lon < 77.20) closestName = 'North-West Delhi';
    else if (lat > 28.70 && lon > 77.20) closestName = 'North-East Delhi';
    else if (lat < 28.55 && lon < 77.15) closestName = 'South-West Delhi';
    else if (lat < 28.55 && lon > 77.15) closestName = 'South-East Delhi';
    else if (lat >= 28.55 && lat <= 28.70 && lon < 77.15) closestName = 'West Delhi';
    else if (lat >= 28.55 && lat <= 28.70 && lon > 77.25) closestName = 'East Delhi';
    else closestName = 'Central Delhi';
  }
  
  return closestName;
}

// ===============================
// 🖱️ CLICK FUNCTIONALITY
// ===============================

// Create info panel
var infoPanel = ui.Panel({
  style: {
    position: 'top-right',
    width: '340px',
    backgroundColor: 'white',
    padding: '12px',
    border: '2px solid #333',
    borderRadius: '8px'
  }
});

infoPanel.add(ui.Label({
  value: '📍 ' + selectedCity + ' - Location Information',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px 0', color: '#2c3e50'}
}));

var contentLabel = ui.Label({
  value: 'Click anywhere on the map\nto see NDVI values and location names',
  style: {fontSize: '12px', whiteSpace: 'pre-line', color: '#555'}
});
infoPanel.add(contentLabel);

Map.add(infoPanel);

// Add mouse position indicator
var mousePositionLabel = ui.Label({
  value: '🖱️ Click anywhere on the map to see details',
  style: {
    position: 'bottom-right',
    backgroundColor: '#f0f0f0',
    padding: '5px',
    fontSize: '10px',
    border: '1px solid #ccc'
  }
});
Map.add(mousePositionLabel);

// Main click handler
Map.onClick(function(coords) {
  var lon = coords.lon;
  var lat = coords.lat;
  
  mousePositionLabel.setValue('📍 Last clicked: ' + lon.toFixed(5) + ', ' + lat.toFixed(5));
  
  var point = ee.Geometry.Point([lon, lat]);
  var ndviValue = cityNDVI.sample(point, 500).first();
  
  ndviValue.evaluate(function(ndviResult) {
    
    var ndviDisplay = 'No data available';
    var category = '';
    var vegetationIcon = '';
    
    if (ndviResult && ndviResult.properties && ndviResult.properties.NDVI !== undefined) {
      var ndvi = ndviResult.properties.NDVI;
      ndviDisplay = ndvi.toFixed(4);
      
      if (ndvi > 0.6) {
        category = 'Dense Vegetation';
        vegetationIcon = '🌲🌾';
      } else if (ndvi > 0.4) {
        category = 'Moderate Vegetation';
        vegetationIcon = '🌿';
      } else if (ndvi > 0.2) {
        category = 'Sparse Vegetation';
        vegetationIcon = '🍂';
      } else if (ndvi > 0) {
        category = 'Barren / Built-up';
        vegetationIcon = '🏙️';
      } else {
        category = 'Water Body';
        vegetationIcon = '💧';
      }
    }
    
    if (selectedCity === 'Delhi') {
      var delhiLocation = getDelhiLocation(lon, lat);
      
      var displayText = 
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📍 ' + delhiLocation + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📌 Coordinates:\n   ' + lon.toFixed(5) + '°E, ' + lat.toFixed(5) + '°N\n\n' +
        '🌿 NDVI: ' + ndviDisplay + '\n' +
        '📊 ' + category + ' ' + vegetationIcon;
      
      var heatSample = cityLST.sample(point, 1000).first();
      heatSample.evaluate(function(heatResult) {
        if (heatResult && heatResult.properties && heatResult.properties.LST_Day_1km_percentile !== undefined) {
          var temp = heatResult.properties.LST_Day_1km_percentile;
          if (temp !== undefined) {
            displayText += '\n\n🌡️ Temp: ' + temp.toFixed(1) + '°C';
            if (temp > 40) displayText += ' (Extreme Heat 🔥)';
          }
        }
        contentLabel.setValue(displayText);
      });
    } else {
      var admin2 = ee.FeatureCollection("FAO/GAUL/2015/level2");
      var containingFeature = admin2.filterBounds(point);
      
      containingFeature.evaluate(function(adminResult) {
        var adminName = 'Local Area';
        if (adminResult && adminResult.features && adminResult.features.length > 0) {
          var props = adminResult.features[0].properties;
          adminName = props.ADM2_NAME || props.ADM1_NAME || 'Local Area';
        }
        
        var displayText = 
          '━━━━━━━━━━━━━━━━━━━━━━\n' +
          '📍 ' + adminName + '\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '📌 Coordinates:\n   ' + lon.toFixed(5) + '°E, ' + lat.toFixed(5) + '°N\n\n' +
          '🌿 NDVI: ' + ndviDisplay + '\n' +
          '📊 ' + category + ' ' + vegetationIcon;
        
        var heatSample = cityLST.sample(point, 1000).first();
        heatSample.evaluate(function(heatResult) {
          if (heatResult && heatResult.properties && heatResult.properties.LST_Day_1km_percentile !== undefined) {
            var temp = heatResult.properties.LST_Day_1km_percentile;
            if (temp !== undefined) {
              displayText += '\n\n🌡️ Temp: ' + temp.toFixed(1) + '°C';
              if (temp > 40) displayText += ' (Extreme Heat 🔥)';
            }
          }
          contentLabel.setValue(displayText);
        });
      });
    }
  });
});

// Add tip label
var hoverInfo = ui.Label({
  value: '💡 Tip: Click for location info | Exports will go to Google Drive folder: GEE_Exports',
  style: {
    position: 'bottom-left',
    backgroundColor: '#34495e',
    color: 'white',
    padding: '8px',
    fontSize: '11px',
    borderRadius: '5px'
  }
});
Map.add(hoverInfo);

// 📊 Stats
print('📊 ' + selectedCity + ' - Average Temperature (°C):', 
  cityLST.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: 1000,
    bestEffort: true
  })
);

print('📊 ' + selectedCity + ' - Average NDVI:', 
  cityNDVI.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: 500,
    bestEffort: true
  })
);

// ===============================
// 🎨 LEGEND PANEL
// ===============================

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '12px',
    backgroundColor: 'white',
    border: '2px solid #333',
    borderRadius: '8px',
    maxWidth: '240px'
  }
});

legend.add(ui.Label('📊 Legend - ' + selectedCity, {fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px 0'}));
legend.add(ui.Label('🌿 NDVI (Visible)', {fontWeight: 'bold', margin: '5px 0 5px 0', color: '#27ae60'}));

var ndviColors = ['brown', 'yellow', 'green'];
var ndviLabels = ['Low (<0.2)', 'Medium (0.2-0.5)', 'High (>0.5)'];

for (var j = 0; j < ndviColors.length; j++) {
  legend.add(ui.Panel([
    ui.Label('    ', {backgroundColor: ndviColors[j], padding: '10px', margin: '0 8px 0 0'}),
    ui.Label(ndviLabels[j], {fontSize: '11px'})
  ], ui.Panel.Layout.Flow('horizontal')));
}

legend.add(ui.Label('━━━━━━━━━━━━━━', {margin: '8px 0'}));
legend.add(ui.Label('🌡️ Heatwave (Hidden)', {fontWeight: 'bold', margin: '5px 0 5px 0', color: '#e74c3c'}));

var heatColors = ['blue', 'green', 'yellow', 'orange', 'red'];
var heatLabels = ['32-34°C', '35-37°C', '38-40°C', '41-43°C', '44-45°C'];

for (var i = 0; i < heatColors.length; i++) {
  legend.add(ui.Panel([
    ui.Label('    ', {backgroundColor: heatColors[i], padding: '8px', margin: '0 8px 0 0'}),
    ui.Label(heatLabels[i], {fontSize: '11px'})
  ], ui.Panel.Layout.Flow('horizontal')));
}

legend.add(ui.Label({
  value: '\n📦 EXPORT STATUS:\n• Tasks created for ' + selectedCity + '\n• Check "Tasks" tab (top-right)\n• Files go to GEE_Exports folder',
  style: {fontSize: '10px', color: '#27ae60', margin: '10px 0 0 0', whiteSpace: 'pre-line'}
}));

Map.add(legend);

print('✅ Script loaded for ' + selectedCity);
print('📦 EXPORT TASKS CREATED!');
print('👉 Go to "Tasks" tab (top-right corner) to start the exports');
print('📁 Files will be saved to your Google Drive in folder: GEE_Exports');
print('🌡️ File 1: ' + selectedCity + '_Heatwave_2024.tif');
print('🌿 File 2: ' + selectedCity + '_NDVI_2024.tif');