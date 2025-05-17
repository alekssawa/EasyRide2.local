// src/pages/Settings.tsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import defaultAvatar from "../assets/img/default-avatar.png";

import { ToastContainer, toast } from "react-toastify";

const Settings = () => {
  const { user, refreshUser, updateUserAvatar } = useAuth();
  const [avatar, setAvatar] = useState<string>(user.picture || defaultAvatar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [oldAvatarKey, setOldAvatarKey] = useState<string | null>(null);

  // Извлекаем ключ из URL аватарки при загрузке
  useEffect(() => {
    if (user.picture) {
      setAvatar(user.picture);
      try {
        const url = new URL(user.picture);
        const key = decodeURIComponent(url.pathname.substring(1));
        setOldAvatarKey(key);
      } catch {
        console.warn("Could not extract key from avatar URL");
      }
    }
  }, [user.picture]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (!file.type.match("image.*")) {
      toast.error("Будь ласка, виберіть файл зображення");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл занадто великий (максимум 5MB)");
      return;
    }

    try {
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatar(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      const presignedResponse = await axios.get(
        `http://localhost:5000/api/${user.role}/avatar/upload-url`,
        {
          params: {
            filename: file.name,
            contentType: file.type,
          },
          withCredentials: true,
        }
      );

      const { presignedUrl, key, publicUrl } = presignedResponse.data;

      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      // Здесь меняем PUT на PATCH
      const updateResponse = await axios.patch(
        `http://localhost:5000/api/${user.role}/${user.userId}`,
        {
          avatarUrl: publicUrl,
          oldAvatarKey: oldAvatarKey,
        },
        { withCredentials: true }
      );

      console.log(updateResponse);
      updateUserAvatar(publicUrl);
      setOldAvatarKey(key);
      await refreshUser();

      toast.success("Аватар успішно оновлено.");
    } catch (err) {
      console.error("Ошибка загрузки аватарки:", err);
      toast.error("Не вдалося завантажити аватарку. Спробуйте ще раз.");
      if (user.picture) {
        setAvatar(user.picture);
      } else {
        setAvatar(defaultAvatar);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsLoading(true);

      const response = await axios.delete(
        `http://localhost:5000/api/${user.role}/${user.userId}/avatar`,
        { withCredentials: true }
      );

      console.log(response);

      updateUserAvatar("");
      setOldAvatarKey(null);
      setAvatar(defaultAvatar);
      await refreshUser();
      toast.success("Аватар успішно видалено!");
    } catch (err) {
      console.error("Ошибка удаления аватарки:", err);
      toast.error("Не вдалося видалити аватарку.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-[120px] max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Налаштування профілю
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Блок с аватаркой */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatar}
                alt="Аватар"
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 hover:border-blue-500 transition-all"
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity cursor-pointer"
                onClick={triggerFileInput}
              >
                <span className="text-white font-medium">Змінити</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-2 mt-4">
              {/* <button
                onClick={triggerFileInput}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Загрузка..." : "Изменить"}
              </button> */}

              {user.picture && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? "Видалення..." : "Видалити"}
                </button>
              )}
            </div>
          </div>

          {/* Блок с информацией */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Особиста інформація
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Ім'я</label>
                <p className="text-gray-800">{user.name || "Не указано"}</p>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <p className="text-gray-800">{user.email || "Не указан"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-center"
        pauseOnHover={false}
        limit={2}
        autoClose={1500}
      />
    </div>
  );
};

export default Settings;
