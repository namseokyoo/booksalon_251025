
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

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  nickname?: string; // 사용자 닉네임
  bio?: string;
  profileImageUrl?: string; // 프로필 사진 URL
  profileImageFile?: File; // 업로드용 파일 객체
  createdAt: any; // Firestore Timestamp
  lastLoginAt: any; // Firestore Timestamp
  postCount: number;
  commentCount: number;
  forumCount: number;
  bookmarkedForums?: string[]; // 북마크한 포럼 ISBN 목록
  following?: string[]; // 팔로우하는 사용자 UID 목록
  followers?: string[]; // 팔로워 UID 목록
  favoriteGenres?: string[]; // 선호 장르
  readingGoal?: number; // 연간 독서 목표
  location?: string; // 지역
  website?: string; // 개인 웹사이트
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    blog?: string;
  };
  notificationSettings?: {
    newPosts: boolean;
    newComments: boolean;
    forumUpdates: boolean;
    follows: boolean;
    likes: boolean;
    emailNotifications: boolean;
  };
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: any; // Firestore Timestamp
  likes?: string[]; // 좋아요한 사용자 UID 목록
  likeCount?: number; // 좋아요 수
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: any; // Firestore Timestamp
  commentCount: number;
  likes?: string[]; // 좋아요한 사용자 UID 목록
  likeCount?: number; // 좋아요 수
}

export interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'follow' | 'bookmark';
  userId: string;
  userName: string;
  userEmail: string;
  targetId: string; // 게시물/댓글 ID 또는 사용자 UID
  targetTitle?: string; // 게시물 제목 또는 사용자명
  forumIsbn?: string; // 관련 포럼 ISBN
  forumTitle?: string; // 관련 포럼 제목
  createdAt: any; // Firestore Timestamp
  metadata?: any; // 추가 메타데이터
}

export interface Forum {
  isbn: string;
  book: Book;
  postCount: number;
  lastActivityAt?: any; // Firestore Timestamp
  category?: string; // 카테고리 (문학, SF, 자기계발, 역사 등)
  tags?: string[]; // 태그 목록
  popularity?: number; // 인기도 점수
}
