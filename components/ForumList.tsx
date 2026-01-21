
import React, { useState, useEffect } from 'react';
import type { Forum, Book } from '../types';
import { searchBookByIsbn, searchBookByTitle } from '../services/kakaoApi';
import CreateForumModal from './CreateForumModal';
import { SearchIcon } from './icons';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';
import { BookmarkService } from '../services/bookmarkService';
import { FilterService, type FilterOptions } from '../services/filterService';
import { BookmarkIcon } from './icons/BookmarkIcon';
import FilterPanel from './FilterPanel';

interface ForumListProps {
  onSelectForum: (forum: Forum) => void;
}

const ForumList: React.FC<ForumListProps> = ({ onSelectForum }) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Book | null>(null);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [existingForums, setExistingForums] = useState<Forum[]>([]);
  const [bookmarkedForums, setBookmarkedForums] = useState<Forum[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [filteredForums, setFilteredForums] = useState<Forum[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'forums'), snapshot => {
      const forumsData = snapshot.docs.map(doc => ({ isbn: doc.id, ...doc.data() })) as Forum[];

      // 카테고리와 태그가 없는 포럼에 자동으로 설정
      const enrichedForums = forumsData.map(forum => {
        if (!forum.category || !forum.tags) {
          const category = forum.category || FilterService.categorizeBook(forum.book);
          const tags = forum.tags || FilterService.generateTags(forum.book);
          const popularity = FilterService.calculatePopularity(forum);

          // Firestore에 업데이트
          updateDoc(doc(db, 'forums', forum.isbn), {
            category,
            tags,
            popularity,
            lastActivityAt: forum.lastActivityAt || new Date()
          });

          return { ...forum, category, tags, popularity };
        }
        return forum;
      });

      setForums(enrichedForums);
    });
    return () => unsubscribe();
  }, []);

  // 필터링 적용
  useEffect(() => {
    const filtered = FilterService.filterAndSortForums(forums, filterOptions);
    setFilteredForums(filtered);
  }, [forums, filterOptions]);

  // 북마크 데이터 로드
  useEffect(() => {
    if (currentUser) {
      loadBookmarks();
    } else {
      setBookmarkedForums([]);
      setBookmarks(new Set());
    }
  }, [currentUser]);

  const loadBookmarks = async () => {
    if (!currentUser) return;

    try {
      const bookmarkedForumsData = await BookmarkService.getBookmarkedForums(currentUser.uid);
      setBookmarkedForums(bookmarkedForumsData);

      const bookmarkSet = new Set(bookmarkedForumsData.map(forum => forum.isbn));
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('북마크 로드 실패:', error);
    }
  };

  const handleToggleBookmark = async (isbn: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 포럼 클릭 이벤트 방지

    if (!currentUser) {
      alert('북마크하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const isBookmarked = await BookmarkService.toggleBookmark(currentUser.uid, isbn);

      if (isBookmarked) {
        setBookmarks(prev => new Set([...prev, isbn]));
        // 북마크한 포럼 목록에 추가
        const forum = forums.find(f => f.isbn === isbn);
        if (forum) {
          setBookmarkedForums(prev => [...prev, forum]);
        }
      } else {
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(isbn);
          return newSet;
        });
        setBookmarkedForums(prev => prev.filter(f => f.isbn !== isbn));
      }
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      alert('북마크 처리 중 오류가 발생했습니다.');
    }
  };


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const trimmedSearchTerm = searchTerm.trim();
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setSearchResults([]);
    setExistingForums([]);

    // Firebase 체크를 임시로 비활성화하고 카카오 API만 테스트
    console.log('🔍 검색 시작:', trimmedSearchTerm);

    // 먼저 기존 살롱에서 비슷한 제목 검색
    const matchingForums = forums.filter(forum =>
      forum.book.title.toLowerCase().includes(trimmedSearchTerm.toLowerCase()) ||
      forum.book.authors.some(author => author.toLowerCase().includes(trimmedSearchTerm.toLowerCase()))
    );

    if (matchingForums.length > 0) {
      setExistingForums(matchingForums);
      console.log('🏛️ 기존 살롱 발견:', matchingForums.length, '개');
    }

    // ISBN인지 확인 (숫자로만 구성된 10자리 또는 13자리)
    const isIsbn = /^\d{10}$|^\d{13}$/.test(trimmedSearchTerm);

    if (isIsbn) {
      // ISBN으로 검색
      const book = await searchBookByIsbn(trimmedSearchTerm);
      if (book) {
        setSearchResult(book);
      } else {
        setError('해당 ISBN을 가진 책을 찾을 수 없습니다. 다른 ISBN을 시도해보세요.');
      }
    } else {
      // 제목으로 검색
      const books = await searchBookByTitle(trimmedSearchTerm);
      if (books.length > 0) {
        setSearchResults(books);
      } else if (matchingForums.length === 0) {
        setError('해당 제목의 책을 찾을 수 없습니다. 다른 제목을 시도해보세요.');
      }
    }
    setIsLoading(false);
  };

  const handleCreateForum = async (book: Book) => {
    const newForum: Forum = {
      isbn: book.isbn,
      book,
      postCount: 0,
    };
    await setDoc(doc(db, 'forums', book.isbn), newForum);

    // 사용자 통계 업데이트
    if (currentUser) {
      await UserProfileService.updateUserStats(currentUser.uid, 'forum', true);
    }

    setSearchResult(null);
    onSelectForum(newForum);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8">
      <form onSubmit={handleSearch} className="mb-4 sm:mb-6 sticky top-[65px] z-10 bg-white border-b border-gray-200 py-3 sm:py-4 rounded-lg shadow-sm">
        <label htmlFor="isbn-search" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          ISBN 또는 책 제목으로 검색
        </label>
        <div className="mt-1 flex rounded-lg shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="text"
              name="isbn-search"
              id="isbn-search"
              className="focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full rounded-none rounded-l-lg bg-white border border-gray-300 text-gray-900 pl-3 sm:pl-4 text-sm sm:text-sm"
              placeholder="ISBN 번호 또는 책 제목을 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="-ml-px relative inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border border-l-0 border-gray-300 text-xs sm:text-sm font-medium rounded-r-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="hidden sm:inline">검색</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-xs sm:text-sm text-red-500">{error}</p>}
      </form>

      {/* 필터 패널 - 비활성화 */}
      {/* <FilterPanel
        onFilterChange={setFilterOptions}
        currentOptions={filterOptions}
      /> */}

      {/* 북마크한 살롱 표시 */}
      {bookmarkedForums.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⭐ 북마크한 살롱</h2>
          <div className="space-y-3 sm:space-y-4">
            {bookmarkedForums.map((forum) => (
              <div
                key={forum.isbn}
                onClick={() => onSelectForum(forum)}
                className="bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-300 cursor-pointer transition-all duration-200 flex items-start sm:items-center space-x-3 sm:space-x-4 border-l-4 border-l-amber-400"
              >
                <img
                  src={forum.book.thumbnail}
                  alt={forum.book.title}
                  className="w-10 h-auto sm:w-12 sm:h-auto rounded-lg flex-shrink-0 shadow-sm"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{forum.book.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{forum.book.authors.join(', ')}</p>
                  <p className="text-xs text-gray-500 mt-1">{forum.book.publisher}</p>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                  <button
                    onClick={(e) => handleToggleBookmark(forum.isbn, e)}
                    className="p-1 hover:bg-amber-50 rounded transition-colors duration-200"
                    title="북마크 해제"
                  >
                    <BookmarkIcon
                      className="h-4 w-4 text-amber-500"
                      filled={true}
                    />
                  </button>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">게시물</p>
                    <p className="text-base sm:text-lg font-bold text-amber-500">{forum.postCount || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기존 살롱 검색 결과 표시 */}
      {existingForums.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 최근 개설된 살롱</h2>
          <div className="space-y-3 sm:space-y-4">
            {existingForums
              .sort((a, b) => {
                // createdAt 기준으로 정렬 (최신순)
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return bTime.getTime() - aTime.getTime();
              })
              .slice(0, 5) // 최대 5개만 표시
              .map((forum) => (
                <div
                  key={forum.isbn}
                  onClick={() => onSelectForum(forum)}
                  className="bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-300 cursor-pointer transition-all duration-200 flex items-start sm:items-center space-x-3 sm:space-x-4 border-l-4 border-l-cyan-500"
                >
                  <img
                    src={forum.book.thumbnail}
                    alt={forum.book.title}
                    className="w-10 h-auto sm:w-12 sm:h-auto rounded flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{forum.book.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{forum.book.authors.join(', ')}</p>
                    <p className="text-xs text-gray-500 mt-1">{forum.book.publisher}</p>
                    {forum.averageRating && forum.averageRating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-yellow-400 font-semibold">{forum.averageRating.toFixed(1)}</span>
                        {forum.totalRatings && (
                          <span className="text-xs text-gray-500">({forum.totalRatings})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => handleToggleBookmark(forum.isbn, e)}
                      className="p-1 hover:bg-cyan-50 rounded transition-colors duration-200"
                      title={bookmarks.has(forum.isbn) ? "북마크 해제" : "북마크 추가"}
                    >
                      <BookmarkIcon
                        className="h-4 w-4"
                        filled={bookmarks.has(forum.isbn)}
                      />
                    </button>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">게시물</p>
                      <p className="text-base sm:text-lg font-bold text-cyan-400">{forum.postCount || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 새로운 도서 검색 결과 표시 */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 새로운 도서 검색 결과</h2>
          <div className="space-y-3 sm:space-y-4">
            {searchResults.map((book, index) => {
              // 기존 살롱에 같은 ISBN이 있는지 확인
              const existingForum = forums.find(forum => forum.isbn === book.isbn);
              const hasExistingForum = !!existingForum;

              return (
                <div
                  key={`${book.isbn}-${index}`}
                  onClick={hasExistingForum ? () => onSelectForum(existingForum!) : () => setSearchResult(book)}
                  className={`bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-300 cursor-pointer transition-all duration-200 flex items-start sm:items-center space-x-3 sm:space-x-4 ${hasExistingForum ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-cyan-500'
                    }`}
                >
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-10 h-auto sm:w-12 sm:h-auto rounded flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{book.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{book.authors.join(', ')}</p>
                    <p className="text-xs text-gray-500 mt-1">{book.publisher}</p>
                    {hasExistingForum && existingForum!.averageRating && existingForum!.averageRating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-yellow-400 font-semibold">{existingForum!.averageRating.toFixed(1)}</span>
                        {existingForum!.totalRatings && (
                          <span className="text-xs text-gray-500">({existingForum!.totalRatings})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => handleToggleBookmark(book.isbn, e)}
                      className="p-1 hover:bg-cyan-50 rounded transition-colors duration-200"
                      title={bookmarks.has(book.isbn) ? "북마크 해제" : "북마크 추가"}
                    >
                      <BookmarkIcon
                        className="h-4 w-4"
                        filled={bookmarks.has(book.isbn)}
                      />
                    </button>
                    <div>
                      {hasExistingForum ? (
                        <>
                          <p className="text-xs sm:text-sm text-amber-600 font-medium">기존 살롱 참여</p>
                          <p className="text-xs text-gray-500">게시물 {existingForum!.postCount || 0}개</p>
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-cyan-600 font-medium">살롱 만들기</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 최근 개설된 살롱 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 최근 개설된 살롱</h2>
        <div className="space-y-3 sm:space-y-4">
          {filteredForums.length > 0 ? (
            filteredForums
              .sort((a, b) => {
                // createdAt 기준으로 정렬 (최신순)
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return bTime.getTime() - aTime.getTime();
              })
              .slice(0, 5) // 최대 5개만 표시
              .map(forum => (
                <div
                  key={forum.isbn}
                  onClick={() => onSelectForum(forum)}
                  className="bg-white border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-300 cursor-pointer transition-all duration-200 flex items-start sm:items-center space-x-3 sm:space-x-4"
                >
                  <img
                    src={forum.book.thumbnail}
                    alt={forum.book.title}
                    className="w-10 h-auto sm:w-12 sm:h-auto rounded flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{forum.book.title}</h3>
                      {forum.category && (
                        <span className="px-2 py-1 text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full font-medium">
                          {forum.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{forum.book.authors.join(', ')}</p>
                    {forum.averageRating && forum.averageRating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-yellow-400 font-semibold">{forum.averageRating.toFixed(1)}</span>
                        {forum.totalRatings && (
                          <span className="text-xs text-gray-500">({forum.totalRatings})</span>
                        )}
                      </div>
                    )}
                    {forum.tags && forum.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {forum.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {forum.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
                            +{forum.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => handleToggleBookmark(forum.isbn, e)}
                      className="p-1 hover:bg-cyan-50 rounded transition-colors duration-200"
                      title={bookmarks.has(forum.isbn) ? "북마크 해제" : "북마크 추가"}
                    >
                      <BookmarkIcon
                        className={`h-4 w-4 ${bookmarks.has(forum.isbn) ? 'text-amber-500' : 'text-gray-400'} hover:text-amber-500`}
                        filled={bookmarks.has(forum.isbn)}
                      />
                    </button>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">게시물</p>
                      <p className="text-base sm:text-lg font-bold text-cyan-400">{forum.postCount || 0}</p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 sm:py-10 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <p className="text-sm sm:text-base text-gray-700">
                {Object.keys(filterOptions).length > 0
                  ? '필터 조건에 맞는 살롱이 없습니다.'
                  : '아직 만들어진 살롱이 없습니다.'
                }
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {Object.keys(filterOptions).length > 0
                  ? '다른 필터 조건을 시도해보세요.'
                  : 'ISBN 또는 책 제목으로 검색하여 첫 번째 살롱을 만들어보세요.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {searchResult && (
        <CreateForumModal book={searchResult} onClose={() => setSearchResult(null)} onCreate={handleCreateForum} />
      )}
    </div>
  );
};

export default ForumList;
