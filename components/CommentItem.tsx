
import React from 'react';
import type { Comment } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ko });
    }
    return '방금 전';
  };

  return (
    <div className="py-2 sm:py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-cyan-400 truncate">{comment.author.email}</p>
        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
          {formatDate(comment.createdAt)}
        </p>
      </div>
      <p className="text-xs sm:text-sm text-gray-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};

export default CommentItem;
