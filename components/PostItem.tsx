
import React, { useState, useEffect } from 'react';
import type { Post, Comment } from '../types';
import CommentItem from './CommentItem';
import { ChatBubbleIcon } from './icons';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { db, firestore } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface PostItemProps {
  post: Post;
  isbn: string;
}

const PostItem: React.FC<PostItemProps> = ({ post, isbn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!isExpanded) return;

    const unsubscribe = db.collection('forums').doc(isbn).collection('posts').doc(post.id).collection('comments')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
        setComments(commentsData);
      });

    return () => unsubscribe();
  }, [isExpanded, isbn, post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      const postRef = db.collection('forums').doc(isbn).collection('posts').doc(post.id);
      const commentsRef = postRef.collection('comments');

      const commentData = {
        content: newComment.trim(),
        author: {
            uid: currentUser.uid,
            email: currentUser.email,
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      
      await commentsRef.add(commentData);
      await postRef.update({
          commentCount: firestore.FieldValue.increment(1)
      });

      setNewComment('');
    } else if (!currentUser) {
        alert("댓글을 작성하려면 로그인이 필요합니다.")
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ko });
    }
    return '방금 전';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-3 sm:p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-semibold text-base sm:text-lg text-white">{post.title}</h3>
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500 mt-2">
          <span className="font-medium text-cyan-400 truncate">{post.author.email}</span>
          <span className="hidden sm:inline">{formatDate(post.createdAt)}</span>
          <div className="flex items-center space-x-1">
            <ChatBubbleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{post.commentCount || 0}</span>
          </div>
        </div>
        <div className="sm:hidden text-xs text-gray-500 mt-1">
          {formatDate(post.createdAt)}
        </div>
        {!isExpanded && (
           <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 line-clamp-2 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm text-gray-200 mt-1 mb-3 sm:mb-4 whitespace-pre-wrap">{post.content}</p>
          <div className="border-t border-gray-700 pt-2">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">댓글</h4>
            <div className="space-y-2 divide-y divide-gray-700/50">
              {comments.length > 0 ? (
                comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 py-2 sm:py-3">아직 댓글이 없습니다.</p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={!currentUser}
              />
              <button
                type="submit"
                className="bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={!currentUser}
              >
                등록
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItem;
