import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import "../styles/Profile.css";

interface Client {
  client_p_i_b: string;
  client_phone_number: string;
  client_email: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [clientInfo, setClientInfo] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Подгружаем данные пользователя, если его нет


  // Загружаем данные клиента
  useEffect(() => {
    const fetchClientData = async () => {
      if (user && user.userId) {
        try {
          const response = await fetch(`http://localhost:5000/api/client/${user.userId}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setClientInfo(data);
          } else {
            console.error("Client not found");
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  if (authLoading || isLoading || user === null) {
    return <p>Завантаження...</p>;
  }

  if (!clientInfo) {
    return <p>Інформація про клієнта не знайдена</p>;
  }

  return (
    <div className="profile">
      <div className="profile-client">
        <span>{clientInfo.client_p_i_b}</span>
        <span>{clientInfo.client_phone_number}</span>
        <span>{clientInfo.client_email}</span>
        <span>Client</span>
      </div>
    </div>
  );
};

export default Profile;
