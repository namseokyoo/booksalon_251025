import React, { useState } from 'react';
import type { Forum, Book } from '../types';
import { searchBookByIsbn, searchBookByTitle } from '../services/kakaoApi';
import { SearchService, type CommunitySearchResult } from '../services/searchService';
import { SearchIcon } from './icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForum: (forum: Forum) => void;
  onCreateForum: (book: Book) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectForum, onCreateForum }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'book' | 'community'>('book');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [communityResults, setCommunityResults] = useState<CommunitySearchResult>({
    forums: [],
    posts: [],
    comments: [],
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setIsLoading(true);
    setError(null);
    setBookResults([]);
    setCommunityResults({ forums: [], posts: [], comments: [] });

    try {
      if (searchType === 'book') {
        // 책 검색
        const isIsbn = /^\d{10}$|^\d{13}$/.test(term);
        if (isIsbn) {
          const book = await searchBookByIsbn(term);
          if (book) {
            setBookResults([book]);
          } else {
            setError('해당 ISBN을 가진 책을 찾을 수 없습니다.');
          }
        } else {
          const books = await searchBookByTitle(term);
          if (books.length > 0) {
            setBookResults(books);
          } else {
            setError('해당 제목의 책을 찾을 수 없습니다.');
          }
        }
      } else {
        // 커뮤니티 검색
        const results = await SearchService.searchAll(term);
        setCommunityResults(results);
      }
    } catch (error: any) {
      console.error('검색 실패:', error);
      setError(error.message || '검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    onCreateForum(book);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">통합 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 타입 선택 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setSearchType('book');
              setSearchTerm('');
              setError(null);
              setBookResults([]);
              setCommunityResults({ forums: [], posts: [], comments: [] });
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              searchType === 'book'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            책 검색
          </button>
          <button
            onClick={() => {
              setSearchType('community');
              setSearchTerm('');
              setError(null);
              setBookResults([]);
              setCommunityResults({ forums: [], posts: [], comments: [] });
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              searchType === 'community'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            커뮤니티 검색
          </button>
        </div>

        {/* 검색 입력 */}
        <form onSubmit={handleSearch} className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder={searchType === 'book' ? 'ISBN 또는 책 제목을 입력하세요' : '살롱, 게시글, 댓글을 검색하세요'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
              disabled={isLoading || !searchTerm.trim()}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : searchType === 'book' ? (
            // 책 검색 결과
            <div className="space-y-3">
              {bookResults.length > 0 ? (
                bookResults.map((book, index) => (
                  <div
                    key={`${book.isbn}-${index}`}
                    onClick={() => handleBookClick(book)}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:border-cyan-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-16 h-auto rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600 truncate mt-1">{book.authors.join(', ')}</p>
                        <p className="text-xs text-gray-500 mt-1">{book.publisher}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <p className="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>
              ) : (
                <p className="text-center text-gray-400 py-8">검색어를 입력하세요.</p>
              )}
            </div>
          ) : (
            // 커뮤니티 검색 결과
            <div className="space-y-6">
              {communityResults.forums.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">살롱 ({communityResults.forums.length})</h3>
                  <div className="space-y-2">
                    {communityResults.forums.map(forum => (
                      <div
                        key={forum.isbn}
                        onClick={() => {
                          onSelectForum(forum);
                          onClose();
                        }}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:border-cyan-300 hover:shadow-sm cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{forum.book.title}</p>
                          {forum.category && (
                            <span className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5 ml-2">
                              {forum.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">{forum.book.authors.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {communityResults.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">게시글 ({communityResults.posts.length})</h3>
                  <div className="space-y-2">
                    {communityResults.posts.map(post => (
                      <div
                        key={post.id}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {communityResults.comments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">댓글 ({communityResults.comments.length})</h3>
                  <div className="space-y-2">
                    {communityResults.comments.map(comment => (
                      <div
                        key={comment.id}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <p className="text-xs text-gray-600 line-clamp-2">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {searchTerm && 
                communityResults.forums.length === 0 && 
                communityResults.posts.length === 0 && 
                communityResults.comments.length === 0 && (
                <p className="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>
              )}
              {!searchTerm && (
                <p className="text-center text-gray-400 py-8">검색어를 입력하세요.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
