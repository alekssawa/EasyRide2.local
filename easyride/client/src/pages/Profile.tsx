import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import "../styles/Profile.css";

import avatarDriver from "../assets/img/avatar_driver.jpg";

interface Client {
  client_p_i_b: string;
  client_phone_number: string;
  client_email: string;
  client_role: string;
}

interface Driver {
  driver_p_i_b: string;
  driver_phone_number: string;
  driver_email: string;
  driver_role: string;
  car_model: string;
  car_model_year: string;
  car_registration_plate: string;
  tariff_name: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [userInfo, setUserInfo] = useState<Client | Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.userId) {
        try {
          let response;
          if (user.role === "client") {
            response = await fetch(`http://localhost:5000/api/client/getClient/${user.userId}`, {
              credentials: "include",
            });
          } else if (user.role === "driver") {
            response = await fetch(`http://localhost:5000/api/driver/getDriver/${user.userId}`, {
              credentials: "include",
            });
          }

          if (response && response.ok) {
            const data = await response.json();
            setUserInfo(data);
            // console.log(data);
          } else {
            console.error("User not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (authLoading || isLoading || user === null) {
    return <p>Завантаження...</p>;
  }

  if (!userInfo) {
    return <p>Інформація про клієнта або водія не знайдена</p>;
  }

  const isClient = user.role === "client";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Details Profile</h2>
      <div className="flex items-start gap-6 border rounded-lg p-6">
        <img
          src={avatarDriver} // Замени на реальный путь к фото
          alt="Profile"
          className="w-32 h-32 object-cover rounded-full"
        />

        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-bold">
            {isClient ? (userInfo as Client).client_p_i_b : (userInfo as Driver).driver_p_i_b}
          </h3>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-500">Role</p>
              <p className="flex items-center gap-1">
                {user.role} <span>⭐ 4</span>
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-500">Phone Number</p>
              <p>{isClient ? (userInfo as Client).client_phone_number : (userInfo as Driver).driver_phone_number}</p>
            </div>

            <div>
              <p className="font-medium text-gray-500">Email Address</p>
              <p>{isClient ? (userInfo as Client).client_email : (userInfo as Driver).driver_email}</p>
            </div>

            {user.role === "driver" && (
              <>
                <div>
                  <p className="font-medium text-gray-500">Model</p>
                  <p>{(userInfo as Driver).car_model}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-500">Registration Plate</p>
                  <p>{(userInfo as Driver).car_registration_plate}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-500">Tariff</p>
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
