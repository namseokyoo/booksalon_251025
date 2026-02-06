import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  onLoginRequired?: () => void;
}

/**
 * 인증이 필요한 라우트를 감싸는 래퍼 컴포넌트.
 * 비로그인 시 "/" 로 리다이렉트하며, onLoginRequired 콜백으로 로그인 모달을 열 수 있음.
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children, onLoginRequired }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      // 비로그인 시 홈으로 리다이렉트
      navigate('/', { replace: true });
      // 로그인 모달 열기 콜백 호출
      if (onLoginRequired) {
        onLoginRequired();
      }
    }
  }, [currentUser, loading, navigate, onLoginRequired]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    // 리다이렉트 중이므로 아무것도 렌더링하지 않음
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
