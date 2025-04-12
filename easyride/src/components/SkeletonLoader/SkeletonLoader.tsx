// SkeletonLoader.tsx
import React from 'react';
import '@/components/SkeletonLoader/Skeleton.module.css';  // Подключаем стили для скелетона

const SkeletonLoader: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: '100%', height: '200px' }}></div> {/* Скелетон для изображения */}
      <div className="skeleton" style={{ width: '80%', height: '20px', marginTop: '10px' }}></div> {/* Скелетон для текста */}
      <div className="skeleton" style={{ width: '60%', height: '20px', marginTop: '10px' }}></div> {/* Еще один скелетон для текста */}
    </div>
  );
};

export default SkeletonLoader;
