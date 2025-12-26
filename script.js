mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWVyYWphbiIsImEiOiJjbWpuYnVsengxNnI1M2dwdnl4M3hiNWI4In0.AgN2Huu4h-bCwPLr10jdsg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-78.6382, 35.7796], // Wake County-ish
  zoom: 10
});

map.on('load', () => {
  map.addSource('schools', {
    type: 'geojson',
    data: 'data/schools.geojson'
  });

  // Magnet schools
  map.addLayer({
    id: 'magnet-schools',
    type: 'circle',
    source: 'schools',
    filter: ['==', ['get', 'magnet'], true],
    paint: {
      'circle-radius': 6,
      'circle-color': '#d7191c'
    }
  });

  // Charter schools
  map.addLayer({
    id: 'charter-schools',
    type: 'circle',
    source: 'schools',
    filter: ['==', ['get', 'charter'], true],
    paint: {
      'circle-radius': 6,
      'circle-color': '#2c7bb6'
    }
  });
});
map.on('click', 'schools-test', (e) => {
  const props = e.features[0].properties;

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <strong>${props.name}</strong><br/>
      Magnet: ${props.magnet}<br/>
      Charter: ${props.charter}<br/>
      Year-round: ${props.year_round}
    `)
    .addTo(map);
});

map.on('mouseenter', 'schools-test', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'schools-test', () => {
  map.getCanvas().style.cursor = '';
});

