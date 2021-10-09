export const displayMap = function(locations){
    mapboxgl.accessToken = process.env.MAILBOX_ACCESS_TOKEN;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ahmed-ehsherbini/cku2so8hh1tq317puaubchr9h',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc=> {
        const el = document.createElement('div')
        el.className = 'marker'

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map)

        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p> Day ${loc.day}: ${loc.description} </p>`).addTo(map)

        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}