import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "./theme-provider";

const containerStyle = {
   width: "100%",
   height: "100%",
};

const center = {
   lat: 15.599,
   lng: 121.0384,
};

const categoryIcons:any = {
   "Health Emergency": "/healthpin.png",
   "Crime or Security Threat": "/crimepin.png",
   "Fire Emergency": "/firepin.png",
   "Flood or Weather Disaster": "/floodpin.png",
};

const mapOptions = {
   styles: [
      {
         featureType: "all",
         elementType: "labels",
         stylers: [{ visibility: "off" }],
      },
   ],
};

const darkMapStyle = [
   { elementType: "geometry", stylers: [{ color: "#101828" }] },
   { elementType: "labels.text.stroke", stylers: [{ color: "#101828" }] },
   { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
   {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
   },
   {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
   },
   {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
   },
   {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
   },
   {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
   },
   {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
   },
   {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
   },
   {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
   },
   {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
   },
   {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
   },
   {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
   },
   {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
   },
   {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
   },
   {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
   },
   {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
   },
];


const MapSection = () => {
   const { theme } = useTheme(); // <-- read current theme
   const alerts = useQuery(api.getLiveAlerts.getLiveAlerts);
   const [map, setMap] = useState(null);
   const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
   });

   const noLabelsStyle = [
      {
         featureType: "all",
         elementType: "labels",
         stylers: [{ visibility: "off" }],
      },
   ];
   
   const mapOptions = {
      styles: theme === "dark" 
         ? [...darkMapStyle, ...noLabelsStyle] 
         : noLabelsStyle,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      rotateControl: false
   };
   

   if (!alerts) return <p>Loading live alerts...</p>;
   if (!isLoaded) return <div>Loading...</div>;

   return (
      <>
         <button
            onClick={() => {
               if (map) {
                  map.panTo(center);
                  map.setZoom(16);
               }
            }}
            style={{
               position: "absolute",
               fontSize: "16px",
               top: "6px",
               borderRadius: "6px",
               right: "70px",
               zIndex: 100,
               padding: "5px 12px",
               border: "1px solid rgba(125, 125, 125, 0.3)",
               cursor: "pointer",
            }}
         >
            Recenter
         </button>
         <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={16}
            options={mapOptions}
            onLoad={(mapInstance) => setMap(mapInstance)}
            mapContainerClassName="rounded-xl w-full h-full"
         >
            {alerts.map((alert: any) => {
               if (alert.latitude && alert.longitude) {
                  return (
                     <Marker
                        key={alert._id}
                        position={{
                           lat: alert.latitude,
                           lng: alert.longitude,
                        }}
                        label={{
                           text: alert.userName,
                           color: theme === "dark" ? "#FFFFFF" : "#000000",
                           fontSize: "16px",
                           fontWeight: "bold",
                        }}
                        icon={{
                           url: categoryIcons[alert.category],
                           scaledSize: new window.google.maps.Size(60, 60),
                           labelOrigin: new window.google.maps.Point(30, -10),
                        }}
                     />
                  );
               } else {
                  console.log("Invalid coordinates for alert:", alert);
                  return null;
               }
            })}
         </GoogleMap>
      </>
   );
};


export default MapSection;
