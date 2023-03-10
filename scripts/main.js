mapboxgl.accessToken = 'pk.eyJ1IjoiYXByaWw0MjkiLCJhIjoiY2xhMTdmYW83MDRxajNucWlnajZycXljYiJ9.6lp57MluBmbXVuoSV_FBwA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style : 'mapbox://styles/april429/clen5lufa000301mkrlqpvs02',
    zoom: 11.5, // starting zoom
    center: [-122.325167, 47.608013], // starting center
    projection: 'albers'
});

async function geojsonFetch() {
    // Load GeoJson asynchronously
    let response, Starbucks, inStore, driveThru, both;

    response = await fetch('assets/Starbucks_Seattle.geojson');
    Starbucks = await response.json();

    response = await fetch('assets/in_store.geojson');
    inStore = await response.json();

    response = await fetch('assets/drive_thru.geojson');
    driveThru = await response.json();

    response = await fetch('assets/both.geojson');
    both = await response.json();

    // Add map sources
    map.on('load', function loadingData() {
        map.addSource('Starbucks', {
            type: 'geojson',
            data: Starbucks
        });

        map.addSource('inStore', {
            type: 'geojson',
            data: inStore
        });

        map.addSource('driveThru', {
            type: 'geojson',
            data: driveThru
        });

        map.addSource('both', {
            type: 'geojson',
            data: both
        });
        // Add map layers
        map.addLayer({
            'id': 'Starbucks-layer',
            'type': 'circle',
            'source': 'Starbucks',
            'paint': {
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-color': 'green',
              'circle-stroke-color': 'white'
          }
        });

        map.addLayer({
            'id': 'inStore-layer',
            'type': 'circle',
            'source': 'inStore',
            'paint': {
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-color': '#98bf64',
              'circle-stroke-color': 'white'
          }
        });

        map.addLayer({
            'id': 'driveThru-layer',
            'type': 'circle',
            'source': 'driveThru',
            'paint': {
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-color': '#728c69',
              'circle-stroke-color': 'white'
          }
        });

        map.addLayer({
            'id': 'both-layer',
            'type': 'circle',
            'source': 'both',
            'paint': {
              'circle-radius': 5,
              'circle-stroke-width': 2,
              'circle-color': '#32612d',
              'circle-stroke-color': 'white'
          }
        });
        // Add geocoder
        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                container: 'geocoder-container',
                placeholder: 'Find a store...',
                proximity: {
                    longitude: -122.3321,
                    latitude: 47.6062
                },
                countries: 'us',
                types: 'poi'
            }),
            'top-left'
        );

        // Add interactivity : center and zoom on allStore-layer
        map.on('click', 'Starbucks-layer', (event) => {
            map.flyTo({
            center: event.features[0].geometry.coordinates,
            zoom: 13
            });
        });


        map.on('click', (event) => {
            const features = map.queryRenderedFeatures(event.point, {
            layers: ['Starbucks-layer', 'inStore-layer', 'driveThru-layer', 'both-layer']
            });
            if (!features.length) {
            return;
            }
            const feature = features[0];

            // Create a new html element(slide side bar) for the side panel
            const sidebar = document.getElementById('sidebar');
            const sidebarContent = document.querySelector('.sidebar-content');
            sidebarContent.innerHTML = `<h3>${feature.properties.Name}</h3><p>${feature.properties.description}</p>`;
            sidebar.classList.add('open');

            // Create the close button and add it to the sidebar
            const closeButton = document.createElement('button');
            closeButton.innerHTML = 'Close';
            closeButton.classList.add('sidebar-close');
            sidebar.appendChild(closeButton);

            // Add an event listener to the close button
            closeButton.addEventListener('click', () => {
            // Remove the "open" class from the sidebar element
            sidebar.classList.remove('open');
            });

            // Create popup box
            const popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(
            `<h3>${feature.properties.Name}</h3><p>${feature.properties.description}</p>`
            )
            .addTo(map);

        }); // map.on('click') closing tab

        // Get the layer selector buttons by their ids
        const allStoreSelector = document.getElementById('all-store-selector');
        const inStoreSelector = document.getElementById('in-store-selector');
        const driveThruSelector = document.getElementById('drive-thru-selector');
        const driveThruInStoreSelector = document.getElementById('drive-thru-in-store-selector');

        // Add click event listeners to the layer selector buttons
        allStoreSelector.addEventListener('click', function() {
            toggleLayerVisibility('Starbucks-layer');
            toggleSelectorActiveState(allStoreSelector);
        });

        inStoreSelector.addEventListener('click', function() {
            toggleLayerVisibility('inStore-layer');
            toggleSelectorActiveState(inStoreSelector);
        });

        driveThruSelector.addEventListener('click', function() {
            toggleLayerVisibility('driveThru-layer');
            toggleSelectorActiveState(driveThruSelector);
        });

        driveThruInStoreSelector.addEventListener('click', function() {
            toggleLayerVisibility('both-layer');
            toggleSelectorActiveState(driveThruInStoreSelector);
        });

        // Function to toggle the visibility of a layer
        function toggleLayerVisibility(layerId) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            if (visibility === 'visible') {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            } else {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        }

        // Function to toggle the active state of a selector button
        function toggleSelectorActiveState(selector) {
            const isActive = selector.classList.contains('active');
            if (isActive) {
                selector.classList.remove('active');
            } else {
                // Remove "active" class from all selector buttons
                const selectors = document.querySelectorAll('.layer-selector');
                selectors.forEach(function(selector) {
                    selector.classList.remove('active');
                });

                // Add "active" class to clicked selector button
                selector.classList.add('active');
            }
        }
    });
}

geojsonFetch();