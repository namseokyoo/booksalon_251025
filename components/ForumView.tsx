
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
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
import { useLoginModal } from '../contexts/LoginModalContext';
import { UserProfileService } from '../services/userProfile';

interface ForumViewProps {
  onBack: () => void;
  onNavigateToMessaging?: (userId: string) => void;
  onLoginRequired?: () => void;
}

const ForumView: React.FC<ForumViewProps> = ({ onBack, onNavigateToMessaging, onLoginRequired }) => {
  const { isbn } = useParams<{ isbn: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [forumLoading, setForumLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { currentUser } = useAuth();
  const { openLoginModal } = useLoginModal();

  // 포럼 데이터 로드
  useEffect(() => {
    if (!isbn) return;

    setForumLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'forums', isbn), (docSnap) => {
      if (docSnap.exists()) {
        setForum({ isbn: docSnap.id, ...docSnap.data() } as Forum);
      } else {
        setForum(null);
      }
      setForumLoading(false);
    });

    return () => unsubscribe();
  }, [isbn]);

  // 게시물 로드
  useEffect(() => {
    if (!isbn) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'forums', isbn, 'posts'), orderBy('createdAt', 'desc')),
      snapshot => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
        setPosts(postsData);
      });
    return () => unsubscribe();
  }, [isbn]);

  const handleWriteClick = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    setIsModalOpen(true);
  };

  const handleAddPost = async (title: string, content: string) => {
    if (!currentUser || !isbn) {
      openLoginModal();
      return;
    }

    const forumRef = doc(db, 'forums', isbn);
    const postsRef = collection(db, 'forums', isbn, 'posts');

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

  if (forumLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-900">해당 살롱을 찾을 수 없습니다.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

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
        onClick={handleWriteClick}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-cyan-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 z-30 transition-colors duration-200"
        aria-label="Write a new post"
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
