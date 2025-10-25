
import React, { useState, useEffect } from 'react';
import type { Forum, Post } from '../types';
import BookInfo from './BookInfo';
import PostItem from './PostItem';
import CreatePostModal from './CreatePostModal';
import { ArrowLeftIcon, PlusIcon } from './icons';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';

interface ForumViewProps {
  forum: Forum;
  onBack: () => void;
}

const ForumView: React.FC<ForumViewProps> = ({ forum, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-3 sm:p-6 lg:p-8 sticky top-[65px] bg-gray-900 z-10">
        <button onClick={onBack} className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white mb-3 sm:mb-4 transition-colors duration-200">
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>목록으로 돌아가기</span>
        </button>
        <BookInfo book={forum.book} />
      </div>

      <div className="px-3 sm:px-6 lg:px-8 pb-20 space-y-3 sm:space-y-4">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostItem key={post.id} post={post} isbn={forum.isbn} />
          ))
        ) : (
          <div className="text-center py-8 sm:py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg mt-3 sm:mt-4">
            <p className="text-sm sm:text-base text-gray-400">아직 게시물이 없습니다.</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">첫 번째 글을 작성해보세요.</p>
          </div>
        )}
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
    </div>
  );
};

export default ForumView;
