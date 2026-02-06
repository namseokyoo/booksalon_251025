import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AdminService } from '../services/adminService';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * 관리자 전용 라우트를 감싸는 래퍼 컴포넌트.
 * 로그인 + 관리자 권한 이중 검증.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const adminStatus = await AdminService.isAdmin(currentUser.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('관리자 확인 실패:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [currentUser, loading]);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-900">접근 권한이 없습니다.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
