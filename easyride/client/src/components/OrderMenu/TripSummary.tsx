import React, { useState } from "react";

interface TripSummaryProps {
  driverToFromDistance: number;
  driverToFromTime: number;
  fromToToDistance: number;
  fromToToTime: number;
  totalDistance: number;
  totalTime: number;
  onConfirm?: () => void; // Теперь onConfirm может быть передан как необязательная функция
}

const TripSummary: React.FC<TripSummaryProps> = ({
  driverToFromDistance,
  driverToFromTime,
  fromToToDistance,
  fromToToTime,
  totalDistance,
  totalTime,
  onConfirm,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirm) {
      onConfirm(); // Вызов родительской функции при подтверждении
    }
  };

  return (
    <div className="absolute top-1/2 transform -translate-y-1/2 right-5 bg-white p-4 rounded-xl shadow-lg z-50">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Маршрут:</h3>
        <p>
          Driver → From:{" "}
          {(driverToFromDistance / 1000).toFixed(2)} км,{" "}
          {(driverToFromTime / 60).toFixed(1)} мин
        </p>
        <p>
          From → To:{" "}
          {(fromToToDistance / 1000).toFixed(2)} км,{" "}
          {(fromToToTime / 60).toFixed(1)} мин
        </p>
        <p>
          Total:{" "}
          {(totalDistance / 1000).toFixed(2)} км,{" "}
          {(totalTime / 60).toFixed(1)} мин
        </p>
      </div>
      <button
        onClick={handleConfirm}
        disabled={isConfirmed} // Блокируем кнопку после подтверждения
        className={`${
          isConfirmed ? "bg-gray-500 cursor-not-allowed" : "bg-green-500"
        } text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none`}
      >
        {isConfirmed ? "Поездка подтверждена" : "Подтвердить поездку"}
      </button>
    </div>
  );
};

export default TripSummary;
