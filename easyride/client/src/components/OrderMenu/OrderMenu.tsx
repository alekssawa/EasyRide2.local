import React, { useState, useRef } from "react";

// Типы для представления данных
type View = "main" | "time" | "payment" | "class";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

type FormData = {
  from: string;
  to: string;
  comment?: string;
  time?: string;
  payment?: string;
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
  setSelectedTariff: (tariff: string) => void;
  setSearchTriggered: React.Dispatch<React.SetStateAction<boolean>>; // <-- добавлено
};

export default function TaxiOrder({ setFromCoordinates, setToCoordinates, setSelectedTariff, setSearchTriggered}: TaxiOrderProps) {
  const [view, setView] = useState<View>("main");
  const [formData, setFormData] = useState<FormData>({
    from: "",
    comment: "",
    to: "",
    time: "На зараз",
    payment: "Cash",
    carClass: "Standard",
  });
  const [fromSuggestions, setFromSuggestions] = useState<NominatimResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<NominatimResult[]>([]);

  const fromTypingTimeout = useRef<NodeJS.Timeout | null>(null);
  const toTypingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const fetchSuggestions = async (input: string, setter: React.Dispatch<React.SetStateAction<NominatimResult[]>>) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(input + ", Odessa, Ukraine")}`
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
      }, 500);
    } else if (field === "to" && value.length > 2) {
      if (toTypingTimeout.current) clearTimeout(toTypingTimeout.current);
      toTypingTimeout.current = setTimeout(() => {
        fetchSuggestions(value, setToSuggestions);
      }, 500);
    } else {
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

  const handleTariffChange = (tariff: string) => {
    setFormData((prev) => ({
      ...prev,
      carClass: tariff,
    }));
    setSelectedTariff(tariff); // уведомим родителя
  };

  const handleSubmit = () => {
    if (formData.from && formData.to) {
      setSearchTriggered(true);
    } else {
      alert("Будь ласка, заповніть поля 'Звідки' та 'Куди'");
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
                onClick={() => handleSelectAddress(item, "from")}
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
                onClick={() => handleSelectAddress(item, "to")}
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
        onClick={() => setView("payment")}
        className="flex justify-between items-center p-3 border border-gray-300 rounded-md cursor-pointer"
      >
        <span>Спосіб оплати:</span>
        <span className="font-semibold">{formData.payment}</span>
      </div>

      <div
        onClick={() => setView("class")}
        className="flex justify-between items-center p-3 border border-gray-300 rounded-md cursor-pointer"
      >
        <span>Клас:</span>
        <span className="font-semibold">{formData.carClass}</span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <img src="/taxi-icon.png" alt="Taxi" className="w-8 h-8" />
          <div className="font-semibold">{formData.carClass}</div>
        </div>
        <div className="font-bold text-lg">80₴</div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg"
      >
        Замовити таксі
      </button>
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
        {view === "payment" &&
          renderSelectView("payment", ["Готівка", "Карта"])}
        {view === "class" &&
          renderSelectView("class", ["Standard", "Comfort", "Business", "Minibus"])}
      </div>
    </div>
  );
}
