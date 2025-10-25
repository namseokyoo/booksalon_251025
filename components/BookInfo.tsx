
import React from 'react';
import type { Book } from '../types';

interface BookInfoProps {
  book: Book;
}

const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
      <img
        src={book.thumbnail || 'https://picsum.photos/120/174'}
        alt={book.title}
        className="w-24 h-auto sm:w-32 sm:h-auto rounded-md shadow-lg flex-shrink-0"
      />
      <div className="flex-grow">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{book.title}</h2>
        <p className="text-md text-gray-400 mt-1">{book.authors.join(', ')}</p>
        <p className="text-sm text-gray-500">{book.publisher}</p>
        <p className="text-sm text-gray-300 mt-3 line-clamp-3">{book.contents}</p>
      </div>
    </div>
  );
};

export default BookInfo;
