import React from 'react';
import { useNavigate } from 'react-router';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
      <div className="text-center max-w-md w-full">
        <p className="text-8xl sm:text-9xl font-bold text-cyan-600 leading-none">
          404
        </p>

        <h1 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-900">
          페이지를 찾을 수 없습니다
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
          >
            홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            이전 페이지
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
