import React, { useState, useRef, useEffect } from 'react';
import { BookOpenIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

interface HeaderProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
    onDeleteClick: () => void;
    onProfileClick: () => void;
    onActivityClick: () => void;
    onSearchClick: () => void;
    onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onLoginClick,
    onSignUpClick,
    onDeleteClick,
    onProfileClick,
    onActivityClick,
    onSearchClick,
    onHomeClick
}) => {
    const { currentUser, logout } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 사용자 프로필 로드
    useEffect(() => {
        if (currentUser) {
            loadUserProfile();
        } else {
            setUserProfile(null);
        }
    }, [currentUser]);

    const loadUserProfile = async () => {
        if (!currentUser) return;

        try {
            const { UserProfileService } = await import('../services/userProfile');
            const profile = await UserProfileService.getUserProfile(currentUser.uid);
            setUserProfile(profile);
        } catch (error) {
            console.error('사용자 프로필 로드 실패:', error);
        }
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleUserMenuClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
    };

  const getDisplayName = () => {
    if (!userProfile) return currentUser?.email?.split('@')[0] || '사용자';
    return userProfile.nickname || userProfile.displayName || userProfile.email.split('@')[0];
  };

  const getProfileImageUrl = () => {
    if (!userProfile) return null;
    return userProfile.profileImageUrl || null;
  };

  const getProfileInitial = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 로고/홈 버튼 */}
                    <button
                        onClick={onHomeClick}
                        className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors duration-200"
                    >
                        <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        <h1 className="text-lg sm:text-2xl font-bold tracking-wider">북살롱</h1>
                    </button>

                    {/* 사용자 메뉴 */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        {currentUser ? (
                            <div className="relative" ref={dropdownRef}>
                                {/* 사용자 프로필 버튼 */}
                                <button
                                    onClick={handleUserMenuClick}
                                    className="flex items-center space-x-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-200"
                                >
                  {/* 프로필 이미지 */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                    {getProfileImageUrl() ? (
                      <img
                        src={getProfileImageUrl()!}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs sm:text-sm font-semibold">
                        {getProfileInitial()}
                      </span>
                    )}
                  </div>

                                    {/* 사용자명 (데스크톱에서만 표시) */}
                                    <span className="hidden sm:block text-xs sm:text-sm truncate max-w-24">
                                        {getDisplayName()}
                                    </span>

                                    {/* 드롭다운 화살표 */}
                                    <svg
                                        className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onProfileClick();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            프로필
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onActivityClick();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            활동 피드
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onSearchClick();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            사용자 검색
                                        </button>

                                        <hr className="my-1 border-gray-600" />

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onDeleteClick();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            계정 삭제
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="px-3 py-1 text-xs sm:text-sm text-cyan-400 hover:bg-gray-700 rounded-md transition-colors duration-200"
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;