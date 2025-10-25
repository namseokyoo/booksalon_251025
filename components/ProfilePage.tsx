import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';
import { BookmarkService } from '../services/bookmarkService';
import { ProfileImageService } from '../services/profileImageService';
import type { UserProfile, Post, Comment, Forum } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ProfilePageProps {
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [bookmarkedForums, setBookmarkedForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'stats' | 'bookmarks'>('stats');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        nickname: '',
        bio: '',
        location: '',
        website: '',
        readingGoal: 0,
        favoriteGenres: [] as string[],
        profileImageFile: null as File | null
    });

    useEffect(() => {
        if (currentUser) {
            loadUserData();
        }
    }, [currentUser]);

    const loadUserData = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const [profileData, postsData, commentsData, bookmarksData] = await Promise.all([
                UserProfileService.getUserProfile(currentUser.uid),
                UserProfileService.getUserPosts(currentUser.uid),
                UserProfileService.getUserComments(currentUser.uid),
                BookmarkService.getBookmarkedForums(currentUser.uid)
            ]);

            setProfile(profileData);
            setPosts(postsData);
            setComments(commentsData);
            setBookmarkedForums(bookmarksData);

            if (profileData) {
                setEditForm({
                    displayName: profileData.displayName || '',
                    nickname: profileData.nickname || '',
                    bio: profileData.bio || '',
                    location: profileData.location || '',
                    website: profileData.website || '',
                    readingGoal: profileData.readingGoal || 0,
                    favoriteGenres: profileData.favoriteGenres || [],
                    profileImageFile: null
                });
            }
        } catch (error) {
            console.error('사용자 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUser || !profile) return;

        try {
            await UserProfileService.updateProfile(currentUser.uid, {
                displayName: editForm.displayName,
                nickname: editForm.nickname,
                bio: editForm.bio,
                location: editForm.location,
                website: editForm.website,
                readingGoal: editForm.readingGoal,
                favoriteGenres: editForm.favoriteGenres,
                profileImageFile: editForm.profileImageFile
            });

            // 프로필 다시 로드
            await loadUserData();
            setIsEditing(false);
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            alert('프로필 저장 중 오류가 발생했습니다.');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditForm(prev => ({ ...prev, profileImageFile: file }));
        }
    };

    const handleGenreToggle = (genre: string) => {
        setEditForm(prev => ({
            ...prev,
            favoriteGenres: prev.favoriteGenres.includes(genre)
                ? prev.favoriteGenres.filter(g => g !== genre)
                : [...prev.favoriteGenres, genre]
        }));
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '알 수 없음';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
        } catch {
            return '알 수 없음';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 p-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        ← 돌아가기
                    </button>
                    <div className="text-center p-8">
                        <p className="text-gray-300">프로필을 찾을 수 없습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        ← 돌아가기
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                    >
                        {isEditing ? '취소' : '프로필 편집'}
                    </button>
                </div>

                {/* 프로필 정보 */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <div className="flex items-start space-x-4">
                        {/* 아바타 */}
                        <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {profile.profileImageUrl ? (
                                <img src={profile.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                            ) : (
                                (profile.nickname || profile.displayName || profile.email).charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* 프로필 정보 */}
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-6">
                                    {/* 프로필 이미지 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">프로필 이미지</label>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                                {editForm.profileImageFile ? (
                                                    <img
                                                        src={URL.createObjectURL(editForm.profileImageFile)}
                                                        alt="프로필 미리보기"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : profile?.profileImageUrl ? (
                                                    <img
                                                        src={profile.profileImageUrl}
                                                        alt="프로필"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-xl font-semibold">
                                                        {(profile?.nickname || profile?.displayName || profile?.email || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="profile-image-input"
                                                />
                                                <label
                                                    htmlFor="profile-image-input"
                                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
                                                >
                                                    이미지 선택
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP (최대 5MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 기본 정보 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">닉네임</label>
                                            <input
                                                type="text"
                                                value={editForm.nickname}
                                                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                                                placeholder="닉네임을 입력하세요"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">지역</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                                                placeholder="지역을 입력하세요"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">웹사이트</label>
                                        <input
                                            type="url"
                                            value={editForm.website}
                                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">연간 독서 목표</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="1000"
                                            value={editForm.readingGoal}
                                            onChange={(e) => setEditForm({ ...editForm, readingGoal: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                                            placeholder="연간 독서 목표 권수"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">자기소개</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                                            placeholder="자기소개를 입력하세요"
                                            rows={3}
                                        />
                                    </div>

                                    {/* 선호 장르 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">선호 장르</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['문학', 'SF/판타지', '자기계발', '역사', '과학', '경제/경영', '예술', '철학', '종교'].map((genre) => (
                                                <button
                                                    key={genre}
                                                    onClick={() => handleGenreToggle(genre)}
                                                    className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${editForm.favoriteGenres.includes(genre)
                                                            ? 'bg-cyan-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 저장 버튼 */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                                        >
                                            저장
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">
                                        {profile.nickname || profile.displayName || profile.email.split('@')[0]}
                                    </h1>
                                    <p className="text-gray-400 mb-2">{profile.email}</p>
                                    {profile.bio && (
                                        <p className="text-gray-300 mb-4">{profile.bio}</p>
                                    )}
                                    {profile.location && <p className="text-gray-300 text-sm">지역: {profile.location}</p>}
                                    {profile.website && <p className="text-gray-300 text-sm">웹사이트: <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{profile.website}</a></p>}
                                    {profile.readingGoal > 0 && <p className="text-gray-300 text-sm">연간 독서 목표: {profile.readingGoal}권</p>}
                                    {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
                                        <p className="text-gray-300 text-sm">선호 장르: {profile.favoriteGenres.join(', ')}</p>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        <p>가입일: {formatDate(profile.createdAt)}</p>
                                        <p>마지막 로그인: {formatDate(profile.lastLoginAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex space-x-1 mb-6">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'stats'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        활동 통계
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'posts'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        작성한 글 ({posts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'comments'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        작성한 댓글 ({comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'bookmarks'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        북마크한 살롱 ({bookmarkedForums.length})
                    </button>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="bg-gray-800 rounded-lg p-6">
                    {activeTab === 'stats' && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">활동 통계</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-400">{profile.postCount}</div>
                                    <div className="text-gray-300">작성한 글</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-400">{profile.commentCount}</div>
                                    <div className="text-gray-300">작성한 댓글</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-400">{profile.forumCount}</div>
                                    <div className="text-gray-300">생성한 포럼</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">작성한 글</h2>
                            {posts.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">작성한 글이 없습니다.</p>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                                            <p className="text-gray-300 mb-2 line-clamp-2">{post.content}</p>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>{formatDate(post.createdAt)}</span>
                                                <span>댓글 {post.commentCount}개</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">작성한 댓글</h2>
                            {comments.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">작성한 댓글이 없습니다.</p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-300 mb-2">{comment.content}</p>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(comment.createdAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'bookmarks' && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">북마크한 살롱</h2>
                            {bookmarkedForums.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">북마크한 살롱이 없습니다.</p>
                            ) : (
                                <div className="space-y-4">
                                    {bookmarkedForums.map((forum) => (
                                        <div key={forum.isbn} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={forum.book.thumbnail}
                                                    alt={forum.book.title}
                                                    className="w-16 h-auto rounded flex-shrink-0"
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-semibold text-white text-lg mb-2">{forum.book.title}</h3>
                                                    <p className="text-gray-400 text-sm mb-1">{forum.book.authors.join(', ')}</p>
                                                    <p className="text-gray-500 text-xs mb-2">{forum.book.publisher}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                        <span>게시물 {forum.postCount || 0}개</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
