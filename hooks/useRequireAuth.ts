import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * 액션 레벨 인증 보호 훅.
 * 비로그인 시 로그인 모달을 여는 콜백을 반환.
 *
 * 현재 상태: 미사용 (ForumList/ForumView는 onLoginRequired prop 방식 사용 중)
 * 향후 활용: 새로운 컴포넌트에서 인증 보호가 필요할 때 prop drilling 대신 이 훅을 사용할 수 있음.
 * 유지 사유: 기존 onLoginRequired prop 방식이 안정적으로 동작하므로,
 *           기존 코드를 리팩토링하지 않고 향후 신규 컴포넌트에서 활용하기 위해 보존.
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
