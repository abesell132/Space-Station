var poly;
var map;
var initialLocation = true;
var passMarkerArray = [];
var infoWindowArray = [];
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    disableDefaultUI: true,
    center: { lat: 41.879, lng: -87.624 },
    styles: [
      {
        featureType: "administrative",
        stylers: [
          {
            visibility: "on"
          }
        ]
      },
      {
        featureType: "poi",
        stylers: [
          {
            visibility: "simplified"
          }
        ]
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [
          {
            visibility: "off"
          }
        ]
      },
      {
        featureType: "water",
        stylers: [
          {
            visibility: "simplified"
          }
        ]
      },
      {
        featureType: "transit",
        stylers: [
          {
            visibility: "simplified"
          }
        ]
      },
      {
        featureType: "landscape",
        stylers: [
          {
            visibility: "simplified"
          }
        ]
      },
      {
        featureType: "road.highway",
        stylers: [
          {
            visibility: "off"
          }
        ]
      },
      {
        featureType: "road.local",
        stylers: [
          {
            visibility: "off"
          }
        ]
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [
          {
            visibility: "on"
          }
        ]
      },
      {
        featureType: "water",
        stylers: [
          {
            color: "#84afa3"
          },
          {
            lightness: 52
          }
        ]
      },
      {
        stylers: [
          {
            saturation: -17
          },
          {
            gamma: 0.36
          }
        ]
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [
          {
            color: "#3f518c"
          }
        ]
      }
    ]
  });

  poly = new google.maps.Polyline({
    strokeColor: "#DEB730",
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  poly.setMap(map);
  updateStationPosition();
  // Add a listener for the click event
  window.setInterval(updateStationPosition, 5000);
  map.addListener("click", stationPassInfoWindow);
  map.addListener("zoom_changed", function() {
    if (map.getZoom > 14) {
      map.options({ zoom: 14 });
    }
  });
}

function stationPassInfoWindow(event) {
  var geocoder = new google.maps.Geocoder();
  var cors_api_url = "https://cors-anywhere.herokuapp.com/";

  var clickLat = parseFloat(event.latLng.lat());
  var clickLng = parseFloat(event.latLng.lng());
  var clickLocation = {
    lat: clickLat,
    lng: clickLng
  };

  clearMarkerInfoWindow();

  var passMarker = new google.maps.Marker({
    position: clickLocation,
    map: map,
    title: "Uluru (Ayers Rock)"
  });
  var passInfoWindow = new google.maps.InfoWindow({
    content: "Predicting Path...",
    maxWidth: 400
  });
  passInfoWindow.addListener("closeclick", function() {
    clearMarkerInfoWindow();
  });
  passInfoWindow.open(map, passMarker);
  infoWindowArray.push(passInfoWindow);
  passMarkerArray.push(passMarker);

  var passInformationURL = `http://api.open-notify.org/iss-pass.json?lat=${clickLat}&lon=${clickLng}`;

  fetch(passInformationURL)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log("Fetch API:" + JSON.stringify(myJson));
    });

  // Get The Formated Address of the Clicked Location and Put it in an Info Window

  const doCORSRequest = (options, printResult) => {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
      printResult(x.responseText);
    };
    x.setRequestHeader("Content-Type", "application/json");

    x.send(options.data);
  };
  // Bind event
  (function() {
    doCORSRequest(
      {
        method: "GET",
        url: passInformationURL
      },
      function printResult(result) {
        let passTimeArr = eval("(" + result + ")");

        let unixPassTime = passTimeArr.response[0];
        let passLength = unixPassTime.duration;
        //TODO: Add the Info Window and Clear Info Window Functionality
        geocoder.geocode(
          {
            location: clickLocation
          },
          function(address, status) {
            if (status === "OK") {
              if (address[0]) {
                passInfoWindow.setContent(
                  `The Space Station will pass through the sky at <b>${
                    address[0].formatted_address
                  }</b> on ${timeConverter(
                    unixPassTime.risetime
                  )} for ${getTimeInSky(passLength)}`
                );
              } else {
                window.alert("No results found");
              }
            } else {
              clearMarkerInfoWindow();
              window.alert("Location must be on a landmass");
            }
          }
        );
      }
    );
  })();
}

function updateStationPosition(event) {
  var path = poly.getPath();

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var locArr = JSON.parse(this.responseText);

      var newLocation = new google.maps.LatLng(
        parseFloat(locArr.iss_position.latitude),
        parseFloat(locArr.iss_position.longitude)
      );
      path.push(newLocation);
      if (initialLocation) {
        map.panTo(newLocation);
        map.set(newLocation);
        initialLocation = false;
      }
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          parseFloat(locArr.iss_position.latitude),
          parseFloat(locArr.iss_position.longitude)
        ),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: "e74c3c",
          strokeColor: "#e74c3c"
        },

        map: map
      });
    }
  };
  xmlhttp.open("GET", "http://api.open-notify.org/iss-now.json", true);
  xmlhttp.send();
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var timeofDay;
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();

  if (hour == 0) {
    hour = 12;
    timeofDay = "AM";
  } else if (hour == 12) {
    timeofDay = "PM";
  } else if (hour > 12) {
    hour = hour - 12;
    timeofDay = "PM";
  } else {
    timeofDay = "AM";
  }
  var min = addZero(a.getMinutes());
  var time =
    month +
    " " +
    date +
    " " +
    year +
    " at " +
    hour +
    ":" +
    min +
    " " +
    timeofDay;
  return time;
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function clearMarkerInfoWindow() {
  if (passMarkerArray.length != 0) {
    for (var i = 0; i < passMarkerArray.length; i++) {
      passMarkerArray[i].setMap(null);
    }
    passMarkerArray = [];
  }

  if (infoWindowArray.length != 0) {
    for (var i = 0; i < passMarkerArray.length; i++) {
      infoWindowArray[i].setMap(null);
    }

    infoWindowArray = [];
  }
}

function getTimeInSky(seconds) {
  let passMinutes = Math.floor(seconds / 60);
  let passSeconds = seconds % 60;
  if (passMinutes == 0) {
    return passSeconds + " seconds";
  } else if (passMinutes == 1) {
    return "1 minute and " + passSeconds + " seconds";
  } else {
    return passMinutes + " minutes and " + passSeconds + " seconds.";
  }
}
