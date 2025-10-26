import React, { useState, useEffect } from 'react';
import type { Post, Comment, UserProfile } from '../types';
import CommentItem from './CommentItem';
import UserProfilePreview from './UserProfilePreview';
import { ArrowLeftIcon } from './icons';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';
import { SocialService } from '../services/socialService';
import { LikeIcon } from './icons/LikeIcon';

interface PostDetailProps {
    post: Post;
    isbn: string;
    onBack: () => void;
    onUserClick: (user: UserProfile) => void;
    onSendMessage?: (userId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, isbn, onBack, onUserClick, onSendMessage }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const [showMentionList, setShowMentionList] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadAuthorProfile = async () => {
            try {
                const profile = await UserProfileService.getUserProfile(post.author.uid);
                setAuthorProfile(profile);
            } catch (error) {
                console.error('작성자 프로필 로딩 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthorProfile();
    }, [post.author.uid]);

    useEffect(() => {
        if (currentUser && post.likes) {
            setIsLiked(post.likes.includes(currentUser.uid));
        }
    }, [currentUser, post.likes]);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(
                collection(db, 'forums', isbn, 'posts', post.id, 'comments'),
                orderBy('createdAt', 'asc')
            ),
            snapshot => {
                const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
                setComments(commentsData);
            }
        );

        return () => unsubscribe();
    }, [isbn, post.id]);

    const handleUserClick = (user: UserProfile) => {
        setSelectedUser(user);
    };

    const handleCloseUserProfile = () => {
        setSelectedUser(null);
    };

    const handleToggleLike = async () => {
        if (!currentUser) {
            alert('좋아요하려면 로그인이 필요합니다.');
            return;
        }

        try {
            const newIsLiked = await SocialService.toggleLike(
                currentUser.uid,
                'post',
                post.id,
                isbn,
                post.id // 게시물의 경우 postId는 자기 자신
            );

            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewComment(value);

        // '@' 기호로 멘션 리스트 보이기
        const atIndex = value.lastIndexOf('@');
        if (atIndex !== -1) {
            const searchTerm = value.substring(atIndex + 1).toLowerCase();
            const spaceIndex = searchTerm.indexOf(' ');
            if (spaceIndex === -1) {
                setMentionSearch(searchTerm);
                setShowMentionList(true);
            } else {
                setShowMentionList(false);
            }
        } else {
            setShowMentionList(false);
        }
    };

    const [mentionableUsers, setMentionableUsers] = useState<{ uid: string; email: string }[]>([]);

    useEffect(() => {
        // 댓글 작성자들의 고유 ID 수집
        const commentAuthorIds = comments.map(c => c.author.uid);
        const uniqueAuthors = Array.from(new Set(commentAuthorIds));

        // 게시물 작성자 포함
        if (post.author.uid && !uniqueAuthors.includes(post.author.uid)) {
            uniqueAuthors.unshift(post.author.uid);
        }

        const users = uniqueAuthors.map(uid => {
            const comment = comments.find(c => c.author.uid === uid);
            return {
                uid,
                email: comment ? comment.author.email : post.author.email
            };
        }).filter(user => user.email);

        setMentionableUsers(users);
    }, [comments, post.author]);

    const getMentionUsers = () => {
        if (!mentionSearch) return mentionableUsers;

        return mentionableUsers.filter(user =>
            user.email?.toLowerCase().includes(mentionSearch)
        );
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || newComment.trim() === '') return;

        try {
            const commentsRef = collection(db, 'forums', isbn, 'posts', post.id, 'comments');
            await addDoc(commentsRef, {
                content: newComment,
                author: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                },
                createdAt: serverTimestamp(),
            });

            // 게시물의 댓글 수 업데이트
            const postRef = doc(db, 'forums', isbn, 'posts', post.id);
            await updateDoc(postRef, {
                commentCount: increment(1)
            });

            // 사용자 통계 업데이트
            await UserProfileService.updateUserStats(currentUser.uid, 'comment', true);

            setNewComment('');
            setShowMentionList(false);
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    const handleEditPost = async () => {
        if (!currentUser || currentUser.uid !== post.author.uid) {
            alert('본인의 게시물만 수정할 수 있습니다.');
            return;
        }

        if (editTitle.trim() === '' || editContent.trim() === '') {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        try {
            const postRef = doc(db, 'forums', isbn, 'posts', post.id);
            await updateDoc(postRef, {
                title: editTitle,
                content: editContent,
                updatedAt: serverTimestamp(),
            });

            setIsEditing(false);
        } catch (error) {
            console.error('게시물 수정 실패:', error);
        }
    };

    const handleDeletePost = async () => {
        if (!currentUser || currentUser.uid !== post.author.uid) {
            alert('본인의 게시물만 삭제할 수 있습니다.');
            return;
        }

        if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
            try {
                // 게시물 삭제
                const postRef = doc(db, 'forums', isbn, 'posts', post.id);
                await deleteDoc(postRef);

                // 포럼의 게시물 수 업데이트
                const forumRef = doc(db, 'forums', isbn);
                await updateDoc(forumRef, {
                    postCount: increment(-1)
                });

                // 사용자 통계 업데이트
                await UserProfileService.updateUserStats(currentUser.uid, 'post', false);

                onBack();
            } catch (error) {
                console.error('게시물 삭제 실패:', error);
            }
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    };

    const getDisplayName = () => {
        if (isLoading) return '로딩 중...';
        return authorProfile?.nickname || authorProfile?.displayName || post.author.email?.split('@')[0] || '익명';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-3 sm:p-6 lg:p-8 sticky top-[65px] bg-gray-900 z-10">
                <button onClick={onBack} className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white mb-3 sm:mb-4 transition-colors duration-200">
                    <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>목록으로 돌아가기</span>
                </button>
            </div>

            <div className="px-3 sm:px-6 lg:px-8 pb-20">
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-2xl font-bold text-white bg-transparent border-b border-gray-600 focus:border-cyan-500 focus:outline-none w-full"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                        )}
                        {currentUser && currentUser.uid === post.author.uid && (
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditPost}
                                            className="text-green-400 hover:text-green-300 text-sm"
                                        >
                                            저장
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditTitle(post.title);
                                                setEditContent(post.content);
                                            }}
                                            className="text-gray-400 hover:text-gray-300 text-sm"
                                        >
                                            취소
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={handleDeletePost}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <button
                            onClick={() => {
                                if (authorProfile) {
                                    handleUserClick(authorProfile);
                                }
                            }}
                            className="hover:text-cyan-400 transition-colors"
                        >
                            {getDisplayName()}
                        </button>
                        <span>{formatTime(post.createdAt)}</span>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleToggleLike}
                                className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                    }`}
                            >
                                <LikeIcon className="w-4 h-4" />
                                <span>{likeCount}</span>
                            </button>
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{comments.length}</span>
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        {isEditing ? (
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 resize-none"
                                placeholder="내용을 입력하세요..."
                            />
                        ) : (
                            <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                        )}
                    </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">댓글 ({comments.length})</h3>

                    {comments.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    postId={post.id}
                                    isbn={isbn}
                                    onUserClick={handleUserClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm mb-6">아직 댓글이 없습니다.</p>
                    )}

                    {currentUser ? (
                        <div className="relative">
                            <form onSubmit={handleAddComment} className="flex space-x-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={handleCommentChange}
                                        placeholder="댓글을 입력하세요... (멘션: @닉네임)"
                                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-white"
                                    />
                                    {showMentionList && getMentionUsers().length > 0 && (
                                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-60 overflow-y-auto z-10">
                                            {getMentionUsers().map((user) => (
                                                <button
                                                    key={user.uid}
                                                    type="button"
                                                    onClick={() => {
                                                        // 간단한 멘션 처리
                                                        const atIndex = newComment.lastIndexOf('@');
                                                        if (atIndex !== -1) {
                                                            const beforeAt = newComment.substring(0, atIndex);
                                                            const nickname = user.email?.split('@')[0] || '';
                                                            setNewComment(beforeAt + '@' + nickname + ' ');
                                                            setShowMentionList(false);
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 text-sm"
                                                >
                                                    @{user.email?.split('@')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                                >
                                    등록
                                </button>
                            </form>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">로그인 후 댓글을 작성할 수 있습니다.</p>
                    )}
                </div>
            </div>

            {selectedUser && (
                <UserProfilePreview
                    user={selectedUser}
                    onClose={handleCloseUserProfile}
                    onSendMessage={onSendMessage ? () => onSendMessage(selectedUser.uid) : undefined}
                />
            )}
        </div>
    );
};

export default PostDetail;
