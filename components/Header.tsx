
import React from 'react';
import { BookOpenIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
    onDeleteClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignUpClick, onDeleteClick }) => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                        <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wider">북살롱</h1>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        {currentUser ? (
                            <>
                                <span className="text-xs sm:text-sm text-gray-300 hidden sm:block truncate max-w-32">
                                    {currentUser.email}
                                </span>
                                <button 
                                    onClick={onDeleteClick} 
                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-400 hover:bg-red-900/50 rounded-md transition-colors duration-200"
                                >
                                    탈퇴
                                </button>
                                <button 
                                    onClick={logout} 
                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-200"
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={onLoginClick} 
                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-200"
                                >
                                    로그인
                                </button>
                                <button 
                                    onClick={onSignUpClick} 
                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-cyan-600 text-white hover:bg-cyan-700 rounded-md transition-colors duration-200"
                                >
                                    회원가입
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
