
import React, { useState, useEffect } from 'react';
import type { Forum, Post, UserProfile } from '../types';
import BookInfo from './BookInfo';
import PostList from './PostList';
import PostDetail from './PostDetail';
import UserMenu from './UserMenu';
import UserProfilePreview from './UserProfilePreview';
import CreatePostModal from './CreatePostModal';
import { ArrowLeftIcon, PlusIcon } from './icons';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';

interface ForumViewProps {
  forum: Forum;
  onBack: () => void;
  onNavigateToMessaging?: (userId: string) => void;
}

const ForumView: React.FC<ForumViewProps> = ({ forum, onBack, onNavigateToMessaging }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!forum.isbn) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'forums', forum.isbn, 'posts'), orderBy('createdAt', 'desc')),
      snapshot => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
        setPosts(postsData);
      });
    return () => unsubscribe();
  }, [forum.isbn]);

  const handleAddPost = async (title: string, content: string) => {
    if (!currentUser) {
      alert("글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    const forumRef = doc(db, 'forums', forum.isbn);
    const postsRef = collection(db, 'forums', forum.isbn, 'posts');

    const newPost = {
      title,
      content,
      author: {
        uid: currentUser.uid,
        email: currentUser.email,
      },
      createdAt: serverTimestamp(),
      commentCount: 0,
      likeCount: 0,
      likes: [],
    };

    await addDoc(postsRef, newPost);
    await updateDoc(forumRef, {
      postCount: increment(1)
    });

    // 사용자 통계 업데이트
    if (currentUser) {
      await UserProfileService.updateUserStats(currentUser.uid, 'post', true);
    }

    setIsModalOpen(false);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserMenu(true);
  };

  const handleShowProfile = () => {
    setShowUserMenu(false);
    setShowUserProfile(true);
  };

  const handleCloseUserMenu = () => {
    setShowUserMenu(false);
    setSelectedUser(null);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleSendMessage = (userId: string) => {
    if (onNavigateToMessaging) {
      onNavigateToMessaging(userId);
    } else {
      console.log('Send message to user:', userId);
    }
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        isbn={forum.isbn}
        onBack={handleBackToList}
        onUserClick={handleUserClick}
        onSendMessage={handleSendMessage}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-3 sm:p-6 lg:p-8 sticky top-[65px] bg-white border-b border-gray-200 z-10 shadow-sm">
        <button onClick={onBack} className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors duration-200">
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <BookInfo book={forum.book} forum={forum} />
      </div>

      <div className="px-3 sm:px-6 lg:px-8 pb-20">
        <PostList
          posts={posts}
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-cyan-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 z-30 transition-colors duration-200"
        aria-label="Write a new post"
        disabled={!currentUser}
        title={!currentUser ? "로그인이 필요합니다" : "새로운 글 작성"}
      >
        <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddPost} />}

      {showUserMenu && selectedUser && (
        <div className="fixed inset-0 z-40" onClick={handleCloseUserMenu}>
          <div className="absolute top-20 left-4" onClick={(e) => e.stopPropagation()}>
            <UserMenu
              user={selectedUser}
              onClose={handleCloseUserMenu}
              onShowProfile={handleShowProfile}
            />
          </div>
        </div>
      )}

      {showUserProfile && selectedUser && (
        <UserProfilePreview
          user={selectedUser}
          onClose={handleCloseUserProfile}
        />
      )}
    </div>
  );
};

export default ForumView;
