import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/authContext"; // Исправленный путь

import '../styles/Profile.css';

interface Client {
  client_p_i_b: string;
  client_phone_number: string;
  client_email: string;
}

const Profile = () => {
  const { user } = useAuth(); // Используем useAuth для получения данных из контекста
  const [clientInfo, setClientInfo] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userId) {
      // Загрузка данных клиента с сервера, только если user существует и у него есть userId
      const fetchClientData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/client/${user.userId}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setClientInfo(data); // Устанавливаем данные клиента в состояние
          } else {
            console.error('Client not found');
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
        } finally {
          setLoading(false); // Загружено
        }
      };

      fetchClientData();
    } else {
      setLoading(false); // Если user не существует, сразу завершаем загрузку
    }
  }, [user]); // Следим за изменением user

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!clientInfo) {
    return <p>У вас немає подорожі</p>;
  }

  return (
    <div className="profile">
  <div>
    <div>
      <div className="profile-client">
        <span>{clientInfo.client_p_i_b}</span>
        <span>{clientInfo.client_phone_number}</span>
        <span>{clientInfo.client_email}</span>
        <span>Client</span>
      </div>
    </div>
  </div>
</div>
  );
};

export default Profile;
