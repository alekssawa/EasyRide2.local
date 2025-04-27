import { useState } from "react";

type View = "main" | "time" | "payment" | "class";

export default function TaxiOrder() {
  const [view, setView] = useState<View>("main");
  const [formData, setFormData] = useState({
    from: "",
    comment: "",
    to: "",
    time: "На зараз",
    payment: "Готівка",
    carClass: "Стандарт",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderMainView = () => (
    <div className="space-y-4 flex flex-col">
      <h2 className="text-xl font-bold text-center">Замовлення у м.Одеса</h2>

      <input
        type="text"
        name="from"
        placeholder="Звідки"
        value={formData.from}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        name="comment"
        placeholder="Коментар для водія"
        value={formData.comment}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        name="to"
        placeholder="Куди"
        value={formData.to}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-md"
      />

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

      {/* Price + Button */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <img src="/taxi-icon.png" alt="Taxi" className="w-8 h-8" />
          <div className="font-semibold">{formData.carClass}</div>
        </div>
        <div className="font-bold text-lg">80₴</div>
      </div>

      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg">
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
            if (type === "time")
              setFormData((prev) => ({ ...prev, time: option }));
            if (type === "payment")
              setFormData((prev) => ({ ...prev, payment: option }));
            if (type === "class")
              setFormData((prev) => ({ ...prev, carClass: option }));
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
        {view === "payment" && renderSelectView("payment", ["Готівка", "Карта"])}
        {view === "class" &&
          renderSelectView("class", ["Стандарт", "Комфорт", "Бізнес"])}
      </div>
    </div>
  );
}
