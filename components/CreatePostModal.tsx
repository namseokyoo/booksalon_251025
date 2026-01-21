
import React, { useState } from 'react';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-lg">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4">새로운 글 작성</h3>
          <div>
            <label htmlFor="post-title" className="sr-only">
              Title
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 text-sm"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mt-3 sm:mt-4">
            <label htmlFor="post-content" className="sr-only">
              Content
            </label>
            <textarea
              id="post-content"
              name="content"
              rows={6}
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 text-sm resize-none"
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-50 px-3 sm:px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl border-t border-gray-200">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-cyan-600 text-sm sm:text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto transition-colors duration-200"
          >
            작성
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto transition-colors duration-200"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostModal;
