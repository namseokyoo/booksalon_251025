
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignUpModalProps {
  onClose: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    if (password.length < 6) {
      return setError('비밀번호는 6자 이상이어야 합니다.');
    }
    if (!nickname.trim()) {
      return setError('닉네임을 입력해주세요.');
    }
    if (nickname.length < 2 || nickname.length > 20) {
      return setError('닉네임은 2자 이상 20자 이하여야 합니다.');
    }

    try {
      setError('');
      setLoading(true);
      const result = await signup(email, password);

      // 회원가입 후 닉네임 저장
      if (result?.user) {
        const { UserProfileService } = await import('../services/userProfile');
        await UserProfileService.createOrUpdateProfile(
          result.user.uid,
          email,
          email.split('@')[0], // displayName
          undefined, // bio
          nickname
        );
      }

      onClose();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium leading-6 text-white mb-3 sm:mb-4 text-center">회원가입</h3>
          {error && <p className="bg-red-900/50 text-red-300 text-xs sm:text-sm p-2 sm:p-3 rounded-md mb-3 sm:mb-4">{error}</p>}
          <div className="space-y-3 sm:space-y-4">
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              placeholder="닉네임 (2-20자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-900 px-3 sm:px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-cyan-600 text-sm sm:text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto disabled:bg-gray-500 transition-colors duration-200"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-3 sm:px-4 py-2 bg-gray-700 text-sm sm:text-base font-medium text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 sm:mt-0 sm:w-auto transition-colors duration-200"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpModal;
