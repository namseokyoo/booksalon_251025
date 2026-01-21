
import React, { useState, useEffect } from 'react';
import type { Book, Forum } from '../types';
import { RatingService } from '../services/ratingService';
import { useAuth } from '../contexts/AuthContext';

interface BookInfoProps {
  book: Book;
  forum?: Forum;
}

const BookInfo: React.FC<BookInfoProps> = ({ book, forum }) => {
  const [myRating, setMyRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadRatings = async () => {
      if (!forum?.isbn) return;

      try {
        const avg = await RatingService.getAverageRating(forum.isbn);
        setAverageRating(avg.average);
        setTotalRatings(avg.total);

        if (currentUser) {
          const userRating = await RatingService.getUserRating(forum.isbn, currentUser.uid);
          setMyRating(userRating);
        }
      } catch (error) {
        console.error('평점 로딩 실패:', error);
      }
    };

    loadRatings();
  }, [forum?.isbn, currentUser]);

  const handleRatingClick = async (rating: number) => {
    if (!currentUser || !forum?.isbn) {
      alert('평점을 주시려면 로그인이 필요합니다.');
      return;
    }

    try {
      await RatingService.setUserRating(forum.isbn, currentUser.uid, rating);
      setMyRating(rating);
      setIsEditing(false);
      
      // 평균 평점 다시 로드
      const avg = await RatingService.getAverageRating(forum.isbn);
      setAverageRating(avg.average);
      setTotalRatings(avg.total);
    } catch (error) {
      console.error('평점 저장 실패:', error);
    }
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`w-4 h-4 ${filled ? 'text-amber-500' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
        <img
          src={book.thumbnail || 'https://picsum.photos/120/174'}
          alt={book.title}
          className="w-20 h-auto sm:w-24 sm:h-auto lg:w-32 lg:h-auto rounded-lg shadow-md flex-shrink-0 mx-auto sm:mx-0"
        />
        <div className="flex-grow text-center sm:text-left w-full">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{book.title}</h2>
          <p className="text-sm sm:text-md text-gray-600 mt-1">{book.authors.join(', ')}</p>
          <p className="text-xs sm:text-sm text-gray-500">{book.publisher}</p>
          
          {/* 평점 표시 */}
          {(averageRating > 0 || totalRatings > 0) && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-700">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon 
                    key={star} 
                    filled={star <= averageRating} 
                  />
                ))}
              </div>
              <span className="font-semibold">
                {averageRating.toFixed(1)} ({totalRatings}명 평가)
              </span>
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">{book.contents}</p>
        </div>
      </div>

      {/* 내 평점 선택 UI */}
      {currentUser && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {!isEditing && myRating && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-700 font-medium">내 평점</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= myRating} />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{myRating}.0</span>
                  </div>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <span>평균</span>
                    <span className="text-gray-900 font-semibold text-lg">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleEditClick}
                className="px-3 py-1 text-sm text-cyan-600 hover:text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                수정
              </button>
            </div>
          )}
          
          {(!myRating || isEditing) && (
            <div>
              <div className="mb-3">
                <span className="text-sm text-gray-700 font-medium">
                  {myRating ? '평점 수정' : '평점을 입력하세요'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="w-12 h-12 text-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-cyan-50 border-2 border-gray-300 hover:border-cyan-500 rounded-lg transition-all"
                  >
                    {rating}
                  </button>
                ))}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mt-3 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  취소
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookInfo;
