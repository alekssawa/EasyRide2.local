// pages/HomePage.tsx
import TaxiOrder from "../components/OrderMenu/OrderMenu";
import MapView from "../components/Map/MapView";

const HomePage = () => (
  <div className="relative w-full h-screen">
    {/* Фон-карта */}
    <div className="absolute inset-0 z-0 h-full w-full">
      <MapView address="Одеса, Україна" zoom={12} />
    </div>
    {/* Ваше меню поверх карты */}
    <div className="absolute inset-0 z-10 flex justify-start items-center p-8 pointer-events-none">
      <div className="pointer-events-auto">
        <TaxiOrder />
      </div>
    </div>
  </div>
);

export default HomePage;