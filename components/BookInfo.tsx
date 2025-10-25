
import React from 'react';
import type { Book } from '../types';

interface BookInfoProps {
  book: Book;
}

const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
      <img
        src={book.thumbnail || 'https://picsum.photos/120/174'}
        alt={book.title}
        className="w-20 h-auto sm:w-24 sm:h-auto lg:w-32 lg:h-auto rounded-md shadow-lg flex-shrink-0 mx-auto sm:mx-0"
      />
      <div className="flex-grow text-center sm:text-left">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{book.title}</h2>
        <p className="text-sm sm:text-md text-gray-400 mt-1">{book.authors.join(', ')}</p>
        <p className="text-xs sm:text-sm text-gray-500">{book.publisher}</p>
        <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">{book.contents}</p>
      </div>
    </div>
  );
};

export default BookInfo;
