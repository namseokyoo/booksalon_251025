import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * 액션 레벨 인증 보호 훅.
 * 비로그인 시 로그인 모달을 여는 콜백을 반환.
 *
 * 사용 예:
 * const requireAuth = useRequireAuth(openLoginModal);
 * requireAuth(() => { 인증 필요한 액션 });
 */
export function useRequireAuth(onLoginRequired: () => void) {
  const { currentUser } = useAuth();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!currentUser) {
        onLoginRequired();
        return;
      }
      action();
    },
    [currentUser, onLoginRequired]
  );

  return requireAuth;
}
