import { useState } from "react";
import TaxiOrder from "../components/OrderMenu/OrderMenu";
import MapView from "../components/Map/MapView";

// Интерфейс для координат
interface Coordinates {
  lat: number;
  lon: number;
  display_name: string;
}

const HomePage = () => {
  const [fromCoordinates, setFromCoordinates] = useState<Coordinates[]>([]);
  const [toCoordinates, setToCoordinates] = useState<Coordinates[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<string>("Standard");
  const [searchTriggered, setSearchTriggered] = useState(false);

    const [driverToFromDistance, setDriverToFromDistance] = useState(0);
    const [driverToFromTime, setDriverToFromTime] = useState(0);
    const [fromToToDistance, setFromToToDistance] = useState(0);
    const [fromToToTime, setFromToToTime] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [totalTime, setTotalTime] = useState(0);


  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
      <MapView
          fromSuggestions={fromCoordinates}
          toSuggestions={toCoordinates}
          zoom={12}
          selectedTariff={selectedTariff}
          searchTriggered={searchTriggered}
          setSearchTriggered={setSearchTriggered} // 🔧 Добавить!
          setDriverToFromDistance={setDriverToFromDistance} 
          setDriverToFromTime={setDriverToFromTime} 
          setFromToToDistance={setFromToToDistance} 
          setFromToToTime={setFromToToTime} 
          setTotalDistance={setTotalDistance} 
          setTotalTime={setTotalTime}      />
      </div>
      <div className="absolute inset-0 z-10 flex justify-start items-center p-8 pointer-events-none">
        <div className="pointer-events-auto">
          <TaxiOrder
            setFromCoordinates={setFromCoordinates}
            setToCoordinates={setToCoordinates}
            setSelectedTariff={setSelectedTariff}
            setSearchTriggered={setSearchTriggered} 
            driverToFromDistance={driverToFromDistance}
            driverToFromTime={driverToFromTime}
            fromToToDistance={fromToToDistance}
            fromToToTime={fromToToTime}
            totalDistance={totalDistance}
            totalTime={totalTime}
            />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
