
export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  thumbnail: string;
  contents: string;
}

export interface Author {
  uid: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: any; // Firestore Timestamp
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: any; // Firestore Timestamp
  commentCount: number;
}

export interface Forum {
  isbn: string;
  book: Book;
  postCount: number;
}
