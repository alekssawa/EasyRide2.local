import { useState } from "react";
import TaxiOrder from "../components/OrderMenu/OrderMenu";
import MapView from "../components/Map/MapView";

// Интерфейс для координат
interface Coordinates {
  lat: number;
  lon: number;
  display_name: string;
}

interface DriverGWithCoordinates {
  id: string;
  coordinates: [number, number];
}

const HomePage = () => {
  const [fromCoordinates, setFromCoordinates] = useState<Coordinates[]>([]);
  const [toCoordinates, setToCoordinates] = useState<Coordinates[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<DriverGWithCoordinates | undefined>(undefined);
  const [selectedTariff, setSelectedTariff] = useState<number>(2);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("Cash");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [IsRouteFound, setIsRouteFound] = useState(false);

  const [tempOrderId, setTempOrderId] = useState<number>(0);

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
          setSelectedDriverId={setSelectedDriverId}
          selectedTariff={selectedTariff}
          searchTriggered={searchTriggered}
          setIsRouteFound={setIsRouteFound}
          setSearchTriggered={setSearchTriggered}
          setDriverToFromDistance={setDriverToFromDistance}
          setDriverToFromTime={setDriverToFromTime}
          setFromToToDistance={setFromToToDistance}
          setFromToToTime={setFromToToTime}
          setTotalDistance={setTotalDistance}
          setTotalTime={setTotalTime}
          tempOrderId={tempOrderId}
        />
      </div>
      <div className="absolute inset-0 z-10 flex justify-start items-center p-8 pointer-events-none">
        <div className="pointer-events-auto">
          <TaxiOrder
            selectedDriverId={selectedDriverId}
            selectedPaymentType={selectedPaymentType}
            selectedTariff={selectedTariff}
            fromCoordinates={fromCoordinates}
            toCoordinates={toCoordinates}
            setFromCoordinates={setFromCoordinates}
            setToCoordinates={setToCoordinates}
            setSelectedPaymentType={setSelectedPaymentType}
            setSelectedTariff={setSelectedTariff}
            setSearchTriggered={setSearchTriggered}
            IsRouteFound={IsRouteFound}
            driverToFromDistance={driverToFromDistance}
            driverToFromTime={driverToFromTime}
            fromToToDistance={fromToToDistance}
            fromToToTime={fromToToTime}
            totalDistance={totalDistance}
            totalTime={totalTime}
            setTempOrderId={setTempOrderId}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
