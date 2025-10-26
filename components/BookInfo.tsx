
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
      
      // 평균 평점 다시 로드
      const avg = await RatingService.getAverageRating(forum.isbn);
      setAverageRating(avg.average);
      setTotalRatings(avg.total);
    } catch (error) {
      console.error('평점 저장 실패:', error);
    }
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-600'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
        <img
          src={book.thumbnail || 'https://picsum.photos/120/174'}
          alt={book.title}
          className="w-20 h-auto sm:w-24 sm:h-auto lg:w-32 lg:h-auto rounded-md shadow-lg flex-shrink-0 mx-auto sm:mx-0"
        />
        <div className="flex-grow text-center sm:text-left w-full">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{book.title}</h2>
          <p className="text-sm sm:text-md text-gray-400 mt-1">{book.authors.join(', ')}</p>
          <p className="text-xs sm:text-sm text-gray-500">{book.publisher}</p>
          
          {/* 평점 표시 */}
          {(averageRating > 0 || totalRatings > 0) && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-300">
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

          <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">{book.contents}</p>
        </div>
      </div>

      {/* 내 평점 선택 UI */}
      {currentUser && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">내 평점:</span>
              {myRating ? (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleRatingClick(1)}
                    className="px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatingClick(2)}
                    className="px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatingClick(3)}
                    className="px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    3
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatingClick(4)}
                    className="px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    4
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatingClick(5)}
                    className="px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    5
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 text-sm">평점을 입력하세요:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleRatingClick(1)}
                      className="px-2 py-1 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingClick(2)}
                      className="px-2 py-1 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingClick(3)}
                      className="px-2 py-1 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingClick(4)}
                      className="px-2 py-1 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      4
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingClick(5)}
                      className="px-2 py-1 text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      5
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {myRating && (
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span>평균</span>
                <span className="text-white font-semibold">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookInfo;
