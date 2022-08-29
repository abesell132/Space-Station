var poly;
var map;
var passMarkerArray = [];
var infoWindowArray = [];

// Convert Number String to Float
const float = (num) => parseFloat(num);

// Halt script execution for some milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

// Convert Coordinates to a Google Maps Position
const latLng = (lat, lng) => new google.maps.LatLng(float(lat), float(lng));

function initMap() {
  // Initialize The Map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    disableDefaultUI: true,
    center: { lat: 41.879, lng: -87.624 },
    styles: [
      {
        featureType: "administrative",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "poi",
        stylers: [
          {
            visibility: "simplified",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "water",
        stylers: [
          {
            visibility: "simplified",
          },
        ],
      },
      {
        featureType: "transit",
        stylers: [
          {
            visibility: "simplified",
          },
        ],
      },
      {
        featureType: "landscape",
        stylers: [
          {
            visibility: "simplified",
          },
        ],
      },
      {
        featureType: "road.highway",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road.local",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "water",
        stylers: [
          {
            color: "#84afa3",
          },
          {
            lightness: 52,
          },
        ],
      },
      {
        stylers: [
          {
            saturation: -17,
          },
          {
            gamma: 0.36,
          },
        ],
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [
          {
            color: "#3f518c",
          },
        ],
      },
    ],
  });

  // Ensure map stays between 3 and 14 zoom level
  map.addListener("zoom_changed", function () {
    if (map.getZoom() > 14) map.setZoom(14);
    if (map.getZoom() < 3) map.setZoom(3);
  });

  // Initialize the line and add to map
  poly = new google.maps.Polyline({
    strokeColor: "#DEB730",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });
  poly.setMap(map);

  // Start Requesting Space Station Location Data
  updateStationPosition();
}

const updateStationPosition = () =>
  axios
    .get("https://api.wheretheiss.at/v1/satellites/25544")
    .then(async (response) => {
      let res = response.data;

      // Create a google maps position object
      let ssLocation = latLng(res.latitude, res.longitude);

      addMapMarker(ssLocation);

      // Wait and load the next position
      await sleep(4000);
      await updateStationPosition();
    })
    .catch((e) => console.log(e));

// Adds a map marker to the map - requires a Google Position object
const addMapMarker = (latLng) => {
  const mapMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 3,
    fillColor: "e74c3c",
    strokeColor: "#e74c3c",
  };
  var path = poly.getPath();

  // Extend the polyline to the new position
  path.push(latLng);
  map.panTo(latLng);

  // Add the map marker in the new position
  return new google.maps.Marker({
    position: latLng,
    icon: mapMarkerIcon,
    map: map,
  });
};
