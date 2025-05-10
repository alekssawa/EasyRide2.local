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
      />
      </div>
      <div className="absolute inset-0 z-10 flex justify-start items-center p-8 pointer-events-none">
        <div className="pointer-events-auto">
          <TaxiOrder
            setFromCoordinates={setFromCoordinates}
            setToCoordinates={setToCoordinates}
            setSelectedTariff={setSelectedTariff}
            setSearchTriggered={setSearchTriggered}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
