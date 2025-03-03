let streetName;
function getDetails2(osm_id) {
    console.log(osm_id);
    osm_id = osm_id.split("-").pop();
    console.log(osm_id); // 3913732054
    fetch(`https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=${osm_id}&format=json`)
        .then(response => response.json())
        .then(detailsStreet => {
            //console.log(detailsStreet);
            console.log(detailsStreet['names']['name:uk']);
            streetName = detailsStreet['names']['name:uk'];
            //streetName = detailsStreet['addresstags']['street'];
            //console.log(streetName);
        }) // Закрываем `then`
        .catch(error => {
            console.error('Ошибка при получении деталей:', error);
        });

    return streetName;

}
