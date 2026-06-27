import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "./theme-provider";
import { Skeleton } from "./ui/skeleton";
import { SheetStore } from "./store/sheet-store";

const containerStyle = {
   width: "100%",
   height: "100%",
};

const center = {
   lat: 15.602,
   lng: 121.0383,
};

const categoryIcons:any = {
   "Health Emergency": "/healthpin.png",
   "Crime or Security Threat": "/crimepin.png",
   "Fire Emergency": "/firepin.png",
   "Flood or Weather Disaster": "/floodpin.png",
};

const darkMapStyle = [
   { elementType: "geometry", stylers: [{ color: "#18181B" }] },
   { elementType: "labels.text.stroke", stylers: [{ color: "#18181B" }] },
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
   const { openSheet } = SheetStore();
   const { theme } = useTheme(); // <-- read current theme
   const alerts = useQuery(api.getLiveAlerts.getLiveAlerts);
   const [map, setMap] = useState<google.maps.Map | null>(null);
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

   if (!alerts) return <Skeleton className="flex-1 w-full h-full"/>;
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
            className="absolute top-2 cursor-pointer right-17 z-10 px-3 py-1.5 rounded-lg shadow-xs flex items-center font-poppins border-1 text-sm"
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
            {alerts.filter((alert: any) => alert.status === "Active").map((alert:any) => {
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
                           fontFamily: "Poppins-Bold, sans-serif",
                           fontSize: "16px",
                           fontWeight: "500",
                           color: theme === "dark" ? "#FFFFFF" : "#000000",
                        }}
                        icon={{
                           url: categoryIcons[alert.category],
                           scaledSize: new window.google.maps.Size(60, 60),
                           labelOrigin: new window.google.maps.Point(30, -10),
                        }}
                        onClick={() => openSheet(alert)}
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
