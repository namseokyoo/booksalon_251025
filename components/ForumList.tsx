
import React, { useState, useEffect } from 'react';
import type { Forum, Book } from '../types';
import { searchBookByIsbn } from '../services/kakaoApi';
import CreateForumModal from './CreateForumModal';
import { SearchIcon } from './icons';
import { db } from '../services/firebase';

interface ForumListProps {
  onSelectForum: (forum: Forum) => void;
}

const ForumList: React.FC<ForumListProps> = ({ onSelectForum }) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Book | null>(null);

  useEffect(() => {
    const unsubscribe = db.collection('forums').onSnapshot(snapshot => {
      const forumsData = snapshot.docs.map(doc => ({ isbn: doc.id, ...doc.data() })) as Forum[];
      setForums(forumsData);
    });
    return () => unsubscribe();
  }, []);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const trimmedIsbn = searchTerm.trim();
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    // Check firestore first
    const forumDoc = await db.collection('forums').doc(trimmedIsbn).get();
    if (forumDoc.exists) {
      onSelectForum({ isbn: forumDoc.id, ...forumDoc.data() } as Forum);
      setIsLoading(false);
      return;
    }

    // If not in firestore, search Kakao API
    const book = await searchBookByIsbn(trimmedIsbn);
    if (book) {
      setSearchResult(book);
    } else {
      setError('해당 ISBN을 가진 책을 찾을 수 없거나 API 키에 문제가 있습니다.');
    }
    setIsLoading(false);
  };

  const handleCreateForum = async (book: Book) => {
    const newForum: Forum = {
      isbn: book.isbn,
      book,
      postCount: 0,
    };
    await db.collection('forums').doc(book.isbn).set(newForum);
    setSearchResult(null);
    onSelectForum(newForum);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8">
      <form onSubmit={handleSearch} className="mb-4 sm:mb-6 sticky top-[65px] z-10 bg-gray-900 py-3 sm:py-4">
        <label htmlFor="isbn-search" className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
          ISBN으로 책 검색 및 살롱 참여/만들기
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="text"
              name="isbn-search"
              id="isbn-search"
              className="focus:ring-cyan-500 focus:border-cyan-500 block w-full rounded-none rounded-l-md bg-gray-700 border-gray-600 text-gray-200 pl-3 sm:pl-4 text-sm sm:text-sm"
              placeholder="ISBN 번호를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="-ml-px relative inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-r-md text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <span className="hidden sm:inline">검색</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-xs sm:text-sm text-red-500">{error}</p>}
      </form>

      <div className="space-y-3 sm:space-y-4">
        {forums.length > 0 ? (
          forums.map(forum => (
            <div
              key={forum.isbn}
              onClick={() => onSelectForum(forum)}
              className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition-colors duration-200 flex items-start sm:items-center space-x-3 sm:space-x-4"
            >
              <img 
                src={forum.book.thumbnail} 
                alt={forum.book.title} 
                className="w-10 h-auto sm:w-12 sm:h-auto rounded flex-shrink-0" 
              />
              <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-white truncate">{forum.book.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate mt-1">{forum.book.authors.join(', ')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm text-gray-400">게시물</p>
                  <p className="text-base sm:text-lg font-bold text-cyan-400">{forum.postCount || 0}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg">
            <p className="text-sm sm:text-base text-gray-400">아직 만들어진 살롱이 없습니다.</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">ISBN으로 책을 검색하여 첫 번째 살롱을 만들어보세요.</p>
          </div>
        )}
      </div>

      {searchResult && (
        <CreateForumModal book={searchResult} onClose={() => setSearchResult(null)} onCreate={handleCreateForum} />
      )}
    </div>
  );
};

export default ForumList;
