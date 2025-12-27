mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWVyYWphbiIsImEiOiJjbWpuYnVsengxNnI1M2dwdnl4M3hiNWI4In0.AgN2Huu4h-bCwPLr10jdsg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-78.6382, 35.7796], // Wake County-ish
  zoom: 10
});

// Color mapping for different school combinations
const getSchoolColor = (properties) => {
  if (properties.magnet && properties.charter) return '#9d4edd'; // Purple - both magnet and charter
  if (properties.magnet) return '#d7191c'; // Red - magnet
  if (properties.charter) return '#2c7bb6'; // Blue - charter
  if (properties.year_round) return '#fdae61'; // Orange - year-round
  return '#2ca25f'; // Green - traditional
};

// Build dynamic filter based on checkbox states
const buildFilter = () => {
  const levelFilters = [];
  const typeFilters = [];
  
  // Level filters
  if (document.getElementById('elementary').checked) {
    levelFilters.push(['==', ['get', 'level'], 'Elementary']);
  }
  if (document.getElementById('middle').checked) {
    levelFilters.push(['==', ['get', 'level'], 'Middle']);
  }
  if (document.getElementById('high').checked) {
    levelFilters.push(['==', ['get', 'level'], 'High']);
  }
  
  // Type filters
  if (document.getElementById('traditional').checked) {
    typeFilters.push(['==', ['get', 'traditional'], true]);
  }
  if (document.getElementById('magnet').checked) {
    typeFilters.push(['==', ['get', 'magnet'], true]);
  }
  if (document.getElementById('charter').checked) {
    typeFilters.push(['==', ['get', 'charter'], true]);
  }
  if (document.getElementById('year-round').checked) {
    typeFilters.push(['==', ['get', 'year_round'], true]);
  }
  
  // If no filters selected, show everything
  if (levelFilters.length === 0 && typeFilters.length === 0) {
    return true; // Show all
  }
  
  // If only one category has filters, use just that category
  if (levelFilters.length === 0) {
    return ['any', ...typeFilters];
  }
  if (typeFilters.length === 0) {
    return ['any', ...levelFilters];
  }
  
  // Both categories have filters - combine them
  const levelFilter = ['any', ...levelFilters];
  const typeFilter = ['any', ...typeFilters];
  
  return ['all', levelFilter, typeFilter];
};

// Update map layer with current filter
const updateMapFilter = () => {
  if (map.getLayer('schools')) {
    map.setFilter('schools', buildFilter());
  }
};

map.on('load', () => {
  map.addSource('schools', {
    type: 'geojson',
    data: 'data/schools.geojson'
  });

  // Single layer for all schools with dynamic styling
  map.addLayer({
    id: 'schools',
    type: 'circle',
    source: 'schools',
    filter: buildFilter(),
    paint: {
      'circle-radius': [
        'case',
        ['all', ['get', 'magnet'], ['get', 'charter']], 8, // Larger for combined types
        6 // Normal size
      ],
      'circle-color': [
        'case',
        ['all', ['get', 'magnet'], ['get', 'charter']], '#9d4edd', // Purple - both
        ['get', 'magnet'], '#d7191c', // Red - magnet
        ['get', 'charter'], '#2c7bb6', // Blue - charter  
        ['get', 'year_round'], '#fdae61', // Orange - year-round
        '#2ca25f' // Green - traditional
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Add event listeners for checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateMapFilter);
  });
  
  // Reset button functionality
  document.getElementById('reset-filters').addEventListener('click', () => {
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    updateMapFilter();
  });
});

// Popup on click
map.on('click', 'schools', (e) => {
  const props = e.features[0].properties;
  
  const getTypeText = (props) => {
    const types = [];
    if (props.magnet) types.push('Magnet');
    if (props.charter) types.push('Charter');
    if (props.year_round) types.push('Year-round');
    if (props.traditional) types.push('Traditional');
    return types.join(', ');
  };

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <strong>${props.name}</strong><br/>
      <strong>Level:</strong> ${props.level}<br/>
      <strong>Type:</strong> ${getTypeText(props)}
    `)
    .addTo(map);
});

// Cursor changes
map.on('mouseenter', 'schools', () => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'schools', () => {
  map.getCanvas().style.cursor = '';
});

