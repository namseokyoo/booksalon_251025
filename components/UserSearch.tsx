import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SocialService } from '../services/socialService';
import type { UserProfile } from '../types';

interface UserSearchProps {
    onBack: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onBack }) => {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [following, setFollowing] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentUser && searchTerm.trim()) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchTerm, currentUser]);

    useEffect(() => {
        if (currentUser) {
            loadFollowingStatus();
        }
    }, [currentUser, users]);

    const searchUsers = async () => {
        if (!currentUser || !searchTerm.trim()) return;

        try {
            setLoading(true);
            const searchResults = await SocialService.searchUsers(searchTerm.trim());
            setUsers(searchResults.filter(user => user.uid !== currentUser.uid)); // 자기 자신 제외
        } catch (error) {
            console.error('사용자 검색 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFollowingStatus = async () => {
        if (!currentUser || users.length === 0) return;

        try {
            const followingSet = new Set<string>();
            for (const user of users) {
                const isFollowing = await SocialService.isFollowing(currentUser.uid, user.uid);
                if (isFollowing) {
                    followingSet.add(user.uid);
                }
            }
            setFollowing(followingSet);
        } catch (error) {
            console.error('팔로우 상태 로드 실패:', error);
        }
    };

    const handleToggleFollow = async (targetUserId: string) => {
        if (!currentUser) return;

        try {
            const newIsFollowing = await SocialService.toggleFollow(currentUser.uid, targetUserId);

            setFollowing(prev => {
                const newSet = new Set(prev);
                if (newIsFollowing) {
                    newSet.add(targetUserId);
                } else {
                    newSet.delete(targetUserId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('팔로우 토글 실패:', error);
            alert('팔로우 처리 중 오류가 발생했습니다.');
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="text-center py-8">
                        <p className="text-gray-400">로그인이 필요합니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>돌아가기</span>
                    </button>
                    <h1 className="text-2xl font-bold text-white">사용자 검색</h1>
                    <div></div>
                </div>

                {/* 검색 입력 */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="사용자명, 이메일, 자기소개로 검색..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 검색 결과 */}
                <div className="bg-gray-800 rounded-lg p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                            <p className="text-gray-400 mt-2">검색 중...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">
                                {searchTerm.trim()
                                    ? '검색 결과가 없습니다.'
                                    : '사용자를 검색해보세요.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.uid} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">
                                                    {(user.displayName || user.email.split('@')[0]).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">
                                                    {user.displayName || user.email.split('@')[0]}
                                                </h3>
                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                                {user.bio && (
                                                    <p className="text-gray-300 text-sm mt-1">{user.bio}</p>
                                                )}
                                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                                    <span>게시물 {user.postCount || 0}개</span>
                                                    <span>댓글 {user.commentCount || 0}개</span>
                                                    <span>살롱 {user.forumCount || 0}개</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleFollow(user.uid)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${following.has(user.uid)
                                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                                    : 'bg-cyan-600 text-white hover:bg-cyan-700'
                                                }`}
                                        >
                                            {following.has(user.uid) ? '팔로잉' : '팔로우'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearch;
