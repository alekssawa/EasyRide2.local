import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

import defaultAvatar from "../assets/img/default-avatar.png";

interface Client {
  client_p_i_b: string;
  client_phone_number: string;
  client_email: string;
  client_role: string;
  client_avatar_url: string;
}

interface Driver {
  driver_p_i_b: string;
  driver_phone_number: string;
  driver_email: string;
  driver_role: string;
  driver_avatar_url: string;

  car_model: string;
  car_model_year: string;
  car_registration_plate: string;
  tariff_name: string;
  average_rating: string;
}

const ProfileSkeleton = () => {
  const { user } = useAuth();
  // console.log(user.role);
  return (
    <div
      className={
        user.role === "client"
          ? "w-full max-w-[550px] h-[281.59px] mx-auto mt-[120px] p-6 bg-white rounded-xl shadow-md"
          : "w-full max-w-[700px] h-[293.6px] mx-auto mt-[120px] p-6 bg-white rounded-xl shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold mb-6">Детали профиля</h2>

      <div
        className={
          user.role === "client"
            ? "flex justify-center items-center gap-6 border rounded-lg p-6 w-full max-w-[651.9px] h-[177.6px]"
            : "flex justify-center items-center gap-6 border rounded-lg p-6 w-full max-w-[651.9px] h-[189.6px]"
        }
      >
        <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>

        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-bold bg-gray-200 h-6 rounded w-75 animate-pulse mx-auto text-center"></h3>

          <div
            className={
              user.role === "client"
                ? "inline-grid grid-cols-2 gap-4 text-sm text-gray-700 justify-items-start"
                : "grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 justify-center items-start"
            }
          >
            {/* Условие для рендеринга блока "Роль" для водителей */}
            {user.role === "driver" && (
              <div className="text-left ">
                <p className="font-medium text-gray-500">Роль</p>
                <div className="flex justify-left">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="bg-gray-200 h-5 rounded w-20 animate-pulse"></span>
                    <span className="bg-gray-200 h-5 rounded w-8 animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Общие данные для всех пользователей */}
            <div className="text-left">
              <p className="font-medium text-gray-500">Номер телефона</p>
              <p className="bg-gray-200 h-5 rounded w-28 animate-pulse text-left"></p>
            </div>

            <div className="text-left">
              <p className="font-medium text-gray-500">Электронная почта</p>
              <p className="bg-gray-200 h-5 rounded w-36 animate-pulse text-left"></p>
            </div>

            {/* Условие для рендеринга данных, относящихся к водителям */}
            {user.role === "driver" && (
              <>
                <div className="text-left">
                  <p className="font-medium text-gray-500">Модель автомобиля</p>
                  <p className="bg-gray-200 h-5 rounded w-32 animate-pulse text-left"></p>
                </div>

                <div className="text-left">
                  <p className="font-medium text-gray-500">Номерной знак</p>
                  <p className="bg-gray-200 h-5 rounded w-32 animate-pulse text-left"></p>
                </div>

                <div className="text-left">
                  <p className="font-medium text-gray-500">Тариф</p>
                  <p className="bg-gray-200 h-5 rounded w-20 animate-pulse text-left"></p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [userInfo, setUserInfo] = useState<Client | Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true); // Состояние для контроля показа скелетона
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUserData = async () => {
      if (!user.authenticated || !user.userId || !user.role) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let response;
        if (user.role === "client") {
          response = await fetch(
            `http://localhost:5000/api/client/getClient/${user.userId}`,
            {
              credentials: "include",
            }
          );
        } else if (user.role === "driver") {
          response = await fetch(
            `http://localhost:5000/api/driver/getDriver/${user.userId}`,
            {
              credentials: "include",
            }
          );
        }

        if (response) {
          if (response.status === 401) {
            // Если неавторизован, редирект на главную
            navigate("/");
            logout();
            return;
          }

          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            console.error("Пользователь не найден");
            setUserInfo(null);
          }
        }
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Добавим задержку для отображения скелетона
    setTimeout(() => {
      setShowSkeleton(false); // После 1 секунды скрываем скелетон
    }); // Задержка на 1 секунду
  }, []);

  if (isLoading || authLoading || showSkeleton) {
    return <ProfileSkeleton />;
  }

  if (!user.authenticated) {
    navigate("/");
  }

  if (!isLoading && !userInfo) {
    return <p>Информация о клиенте или водителе не найдена</p>;
  }

  const isClient = user.role === "client";

  return (
    <div
      className={
        isClient
          ? "w-full max-w-[550px] mx-auto mt-[120px] p-6 bg-white rounded-xl shadow-md"
          : "w-[700px] h-[293.6px] max-w-4xl mx-auto mt-[120px] p-6 bg-white rounded-xl shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold mb-6">Детали профиля</h2>
      <div className=" max-w-full flex items-center gap-6 border rounded-lg p-6">
        <img
          src={
            isClient
              ? (userInfo as Client)?.client_avatar_url || defaultAvatar
              : (userInfo as Driver)?.driver_avatar_url || defaultAvatar
          }
          alt="Profile"
          className="w-32 h-32 object-cover rounded-full m-0 p-0"
        />
        <div className="flex-1 space-y-4 max-w-full">
          <h3 className="text-xl font-bold text-center">
            {isClient
              ? (userInfo as Client)?.client_p_i_b
              : (userInfo as Driver)?.driver_p_i_b}
          </h3>

          <div
            className={
              isClient
                ? "inline-grid grid-cols-2 gap-4 text-sm text-gray-700 justify-items-start"
                : "grid grid-cols-3 gap-4 text-sm text-gray-700"
            }
          >
            {user.role === "driver" && userInfo && (
              <div>
                <p className="font-medium text-gray-500">Роль</p>
                <div className="flex justify-left">
                  <div className="flex items-left gap-1 text-sm">
                    <span>{isClient ? "Клиент" : "Водитель"}</span>
                    <span className="text-base leading-none">
                      ⭐ {(userInfo as Driver)?.average_rating}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-500 text-left">
                Номер телефона
              </p>
              <p>
                {isClient
                  ? (userInfo as Client)?.client_phone_number
                  : (userInfo as Driver)?.driver_phone_number}
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-500">Электронная почта</p>
              <p>
                {isClient
                  ? (userInfo as Client)?.client_email
                  : (userInfo as Driver)?.driver_email}
              </p>
            </div>

            {user.role === "driver" && userInfo && (
              <>
                <div>
                  <p className="font-medium text-gray-500">Модель автомобиля</p>
                  <p>{(userInfo as Driver).car_model}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-500">Номерной знак</p>
                  <p>{(userInfo as Driver).car_registration_plate}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-500">Тариф</p>
                  <p>{(userInfo as Driver).tariff_name}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
