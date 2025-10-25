
import React from 'react';
import type { Book } from '../types';
import BookInfo from './BookInfo';

interface CreateForumModalProps {
  book: Book;
  onClose: () => void;
  onCreate: (book: Book) => void;
}

const CreateForumModal: React.FC<CreateForumModalProps> = ({ book, onClose, onCreate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium leading-6 text-white text-center mb-2">살롱을 만드시겠습니까?</h3>
          <p className="text-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">이 책에 대한 살롱이 없습니다. 새로운 살롱을 만드세요.</p>
          <BookInfo book={book} />
        </div>
        <div className="bg-gray-800 px-3 sm:px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-cyan-600 text-sm sm:text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto transition-colors duration-200"
            onClick={() => onCreate(book)}
          >
            만들기
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-3 sm:px-4 py-2 bg-gray-700 text-sm sm:text-base font-medium text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 sm:mt-0 sm:w-auto transition-colors duration-200"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForumModal;
