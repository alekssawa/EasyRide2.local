import React, { useState, useRef, /*useEffect*/ } from "react";

import { useAuth } from "../../context/authContext"; // Импортируем useAuth

import { ToastContainer, toast } from "react-toastify";

// Типы для представления данных
type View = "main" | "time" | "paymentType" | "class";

import CarBusiness from "../../assets/img/CarBusiness.png";
import CarComfort from "../../assets/img/CarComfort.png";
import CarMinibus from "../../assets/img/CarMinibus.png";
import CarStandard from "../../assets/img/CarStandard.png";

const ImgMap: Record<string, string> = {
      Standard: CarStandard,
      Comfort: CarComfort,
      Minibus: CarMinibus,
      Business: CarBusiness,
    };

interface NominatimResult {
  osm_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

type FormData = {
  from: string;
  to: string;
  comment?: string;
  time?: string;
  paymentType?: string;
  carClass?: string;
};

interface Coordinates {
  lat: number;
  lon: number;
  display_name: string;
}

type TaxiOrderProps = {
  setFromCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  setToCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  setSelectedPaymentType: (paymentType: string) => void;
  setSelectedTariff: (tariff: number) => void;
  setSearchTriggered: React.Dispatch<React.SetStateAction<boolean>>; // <-- добавлено
  selectedDriverId: string | undefined;
  selectedPaymentType: string;
  selectedTariff: number | null;
  IsRouteFound: boolean;

  driverToFromDistance: number;
  driverToFromTime: number;
  fromToToDistance: number;
  fromToToTime: number;
  totalDistance: number;
  totalTime: number;
};

export default function TaxiOrder({
  setFromCoordinates,
  setToCoordinates,
  setSelectedTariff,
  setSelectedPaymentType,
  setSearchTriggered,
  selectedDriverId,
  selectedPaymentType,
  selectedTariff,
  IsRouteFound,
  driverToFromDistance,
  driverToFromTime,
  fromToToDistance,
  fromToToTime,
  totalDistance,
  // searchTriggered,
  totalTime,
}: TaxiOrderProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [view, setView] = useState<View>("main");
  const [formData, setFormData] = useState<FormData>({
    from: "",
    comment: "",
    to: "",
    time: "На зараз",
    paymentType: "Cash",
    carClass: "Standard",
  });
  const { user } = useAuth();

  const [fromSuggestions, setFromSuggestions] = useState<NominatimResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<NominatimResult[]>([]);

  const [selectedFrom, setSelectedFrom] = useState<NominatimResult | null>(
    null
  );
  const [selectedTo, setSelectedTo] = useState<NominatimResult | null>(null);

  const fromTypingTimeout = useRef<NodeJS.Timeout | null>(null);
  const toTypingTimeout = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   console.log("fromSuggestions changed:", selectedFrom);
  // }, [selectedFrom]);

  // useEffect(() => {
  //   console.log("toSuggestions changed:", selectedTo);
  // }, [selectedTo]);

  const handleConfirm = async () => {
    if (user.authenticated && selectedFrom !== null && selectedTo !== null) {
      console.log([selectedFrom, selectedTo]);

      const formatLocation = (location: NominatimResult) => {
        const parts = location.display_name.split(",").map((s) => s.trim());
        const houseNumber = parts[0] || "";
        const street = parts[1] || "";
        const osmId = location.osm_id;
        return `${street}-${houseNumber}-${osmId}`;
      };

      const fromInfo = formatLocation(selectedFrom);
      const toInfo = formatLocation(selectedTo);

      console.log(user)

      console.log([
        user.userId,
        selectedDriverId,
        selectedTariff,
        new Date().toISOString(),
        fromInfo,
        toInfo,
        (totalDistance / 1000).toFixed(1),
        selectedPaymentType,
      ]);

      try {
        const response = await fetch(`http://localhost:5000/api/order/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            client_id: user.userId, // предположим, что user содержит id клиента
            driver_id: selectedDriverId,
            tariff_id: selectedTariff,
            order_time: new Date().toISOString(),
            start_location: fromInfo,
            destination: toInfo,
            distance: (fromToToDistance / 1000).toFixed(1),
            payment_type: selectedPaymentType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Помилка при створенні замовлення");
        }

        toast.success("Замовлення прийнято");
        setIsConfirmed(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Щось пішло не так");
        } else {
          toast.error("Невідома помилка");
        }

        // toast.success("Замовлення прийнято");
        // setIsConfirmed(true);
      }
    } else {
      toast.error("Ви не авторизовані!");
    }
  };

  {
    /* TODO: Сделать локальный OSM сервер */
  }
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const fetchSuggestions = async (
      input: string,
      setter: React.Dispatch<React.SetStateAction<NominatimResult[]>>
    ) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=uk&q=${encodeURIComponent(
            input + ", Odessa, Ukraine"
          )}`
        );
        const data = (await res.json()) as NominatimResult[];
        setter(data);
      } catch (error) {
        console.error("Ошибка при поиске адреса", error);
      }
    };

    if (field === "from" && value.length > 2) {
      if (fromTypingTimeout.current) clearTimeout(fromTypingTimeout.current);
      fromTypingTimeout.current = setTimeout(() => {
        fetchSuggestions(value, setFromSuggestions);
        // console.log(fromSuggestions);
      }, 500);
    } else if (field === "to" && value.length > 2) {
      if (toTypingTimeout.current) clearTimeout(toTypingTimeout.current);
      toTypingTimeout.current = setTimeout(() => {
        fetchSuggestions(value, setToSuggestions);
        // console.log(toSuggestions);
      }, 500);
    } else {
      // console.log("TEST");
      if (field === "from") setFromSuggestions([]);
      if (field === "to") setToSuggestions([]);
    }
  };

  const handleSelectAddress = (
    address: NominatimResult,
    field: keyof FormData
  ) => {
    const newCoordinates: Coordinates = {
      lat: parseFloat(address.lat),
      lon: parseFloat(address.lon),
      display_name: address.display_name,
    };

    setFormData((prev) => ({ ...prev, [field]: address.display_name }));

    if (field === "from") {
      setFromCoordinates([newCoordinates]);
    }
    if (field === "to") {
      setToCoordinates([newCoordinates]);
    }

    if (field === "from") setFromSuggestions([]);
    if (field === "to") setToSuggestions([]);
  };

  const handlePaymentTypeChange = (paymentType: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: paymentType,
    }));
    setSelectedPaymentType(paymentType); // уведомим родителя
  };

  const handleTariffChange = (tariff: string) => {
    const tariffMap: Record<string, number> = {
      Standard: 2,
      Comfort: 3,
      Minibus: 4,
      Business: 5,
    };
    setFormData((prev) => ({
      ...prev,
      carClass: tariff,
    }));
    setSelectedTariff(tariffMap[tariff]); // уведомим родителя
  };

  const handleSubmit = () => {
    if (formData.from && formData.to) {
      // console.log("setSearchTriggered TRUE");
      setSearchTriggered(true);
    } else {
      toast.warn("Будь ласка, заповніть поля");
    }
  };
  const renderMainView = () => (
    <div className="space-y-4 flex flex-col">
      <h2 className="text-xl font-bold text-center">Замовлення у м.Одеса</h2>

      <div className="relative">
        <input
          type="text"
          name="from"
          placeholder="Звідки"
          value={formData.from}
          onChange={(e) => handleChange(e, "from")}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        {fromSuggestions.length > 0 && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
            {fromSuggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  handleSelectAddress(item, "from");
                  setSelectedFrom(item);
                }}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="text"
        name="comment"
        placeholder="Коментар для водія"
        value={formData.comment}
        onChange={(e) => handleChange(e, "comment")}
        className="w-full p-3 border border-gray-300 rounded-md"
      />

      <div className="relative">
        <input
          type="text"
          name="to"
          placeholder="Куди"
          value={formData.to}
          onChange={(e) => handleChange(e, "to")}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        {toSuggestions.length > 0 && (
          <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
            {toSuggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  handleSelectAddress(item, "to");
                  setSelectedTo(item);
                }}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        onClick={() => setView("time")}
        className="flex justify-between items-center p-3 border border-gray-300 rounded-md cursor-pointer"
      >
        <span>Час:</span>
        <span className="font-semibold">{formData.time}</span>
      </div>

      <div
        onClick={() => setView("paymentType")}
        className="flex justify-between items-center p-3 border border-gray-300 rounded-md cursor-pointer"
      >
        <span>Спосіб оплати:</span>
        <span className="font-semibold">{formData.paymentType}</span>
      </div>

      <div
        onClick={() => setView("class")}
        className="flex justify-between items-center p-3 border border-gray-300 rounded-md cursor-pointer"
      >
        <span>Клас:</span>
        <span className="font-semibold">{formData.carClass}</span>
      </div>

      {/* FIXME: исправить иконку */}

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <img src={ImgMap[formData.carClass as keyof typeof ImgMap] || CarStandard} alt="Taxi" className="w-9 h-9" />
          <div className="font-semibold">{formData.carClass}</div>
        </div>
        <div className="font-bold text-lg pr-4">80₴</div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg"
      >
        Знайти водія
      </button>
      {/* TODO: Сделать реализацию добавление заказа */}

      {IsRouteFound && totalDistance !== 0 && (
        <div className="absolute top-1/2 transform -translate-y-1/2 right-8 bg-white p-4 rounded-xl shadow-lg z-50">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Маршрут:</h3>
            <p>
              Driver → From: {(driverToFromDistance / 1000).toFixed(2)} км,{" "}
              {(driverToFromTime / 60).toFixed(1)} мин
            </p>
            <p>
              From → To: {(fromToToDistance / 1000).toFixed(2)} км,{" "}
              {(fromToToTime / 60).toFixed(1)} мин
            </p>
            <p>
              Total: {(totalDistance / 1000).toFixed(1)} км,{" "}
              {(totalTime / 60).toFixed(1)} мин
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isConfirmed}
            className={`${
              isConfirmed ? "bg-gray-500 cursor-not-allowed" : "bg-green-500"
            } text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none`}
          >
            Підтвердити подорож
          </button>
        </div>
      )}
    </div>
  );

  const renderSelectView = (type: View, options: string[]) => (
    <div className="flex flex-col space-y-4">
      <button
        onClick={() => setView("main")}
        className="text-blue-500 text-left"
      >
        ← Назад
      </button>

      {options.map((option) => (
        <div
          key={option}
          onClick={() => {
            if (type === "class") {
              handleTariffChange(option);
            }
            if (type === "paymentType") {
              handlePaymentTypeChange(option);
            } else {
              setFormData((prev) => ({
                ...prev,
                [type]: option,
              }));
            }
            setView("main");
          }}
          className="p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
        >
          {option}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex justify-start items-start">
      <div className="bg-white rounded-2xl shadow p-6 w-[370px] h-[610px] overflow-hidden flex flex-col">
        {view === "main" && renderMainView()}
        {view === "time" &&
          renderSelectView("time", [
            "На зараз",
            "Через 15 хвилин",
            "Через 30 хвилин",
            "Через 1 годину",
          ])}
        {/* FIXME: при смене типа оплаты водитель не находиться */}
        {view === "paymentType" &&
          renderSelectView("paymentType", ["Cash", "Card"])}
        {view === "class" &&
          renderSelectView("class", [
            "Standard",
            "Comfort",
            "Minibus",
            "Business",
          ])}
      </div>
      <ToastContainer
        position="bottom-center"
        pauseOnHover={false}
        limit={2}
        autoClose={1500}
      />
    </div>
  );
}
