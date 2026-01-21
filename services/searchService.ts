import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import type { Forum } from '../types';

export interface CommunitySearchResult {
  forums: Forum[];
  posts: any[];
  comments: any[];
}

// 간단한 전역 검색 MVP: 각 포럼을 순회하면서 게시물과 댓글 검색
export class SearchService {
  static async searchAll(term: string): Promise<CommunitySearchResult> {
    const normalized = term.toLowerCase();

    // 포럼 검색
    const forumsSnap = await getDocs(collection(db, 'forums'));
    const forums = forumsSnap.docs
      .map(doc => ({ isbn: doc.id, ...doc.data() } as Forum))
      .filter(forum => {
        const title = forum.book.title.toLowerCase();
        const authors = forum.book.authors.join(' ').toLowerCase();
        const publisher = forum.book.publisher.toLowerCase();
        const tags = (forum.tags || []).join(' ').toLowerCase();
        return (
          title.includes(normalized) ||
          authors.includes(normalized) ||
          publisher.includes(normalized) ||
          tags.includes(normalized)
        );
      });

    // 각 포럼의 게시물과 댓글 검색 (최대 10개 포럼만 검색 - 성능 고려)
    const posts: any[] = [];
    const comments: any[] = [];
    const forumsToSearch = forumsSnap.docs.slice(0, 10); // 성능을 위해 제한

    const commentPromises: Promise<void>[] = [];

    for (const forumDoc of forumsToSearch) {
      const forumId = forumDoc.id;
      
      try {
        // 게시물 검색
        const postsSnap = await getDocs(
          query(collection(db, 'forums', forumId, 'posts'), limit(30))
        );
        
        for (const postDoc of postsSnap.docs) {
          const postData = postDoc.data();
          const title = (postData.title || '').toString().toLowerCase();
          const content = (postData.content || '').toString().toLowerCase();
          
          if (title.includes(normalized) || content.includes(normalized)) {
            if (posts.length < 50) {
              posts.push({
                id: postDoc.id,
                ...postData,
                forumId, // 어느 포럼의 게시물인지 표시
              });
            }
          }

          // 댓글 검색 (각 게시물의 댓글) - 비동기로 수집
          if (comments.length < 50) {
            const commentsRef = collection(db, 'forums', forumId, 'posts', postDoc.id, 'comments');
            commentPromises.push(
              getDocs(query(commentsRef, limit(10))).then(commentsSnap => {
                commentsSnap.docs.forEach(commentDoc => {
                  const commentData = commentDoc.data();
                  const content = (commentData.content || '').toString().toLowerCase();
                  
                  if (content.includes(normalized) && comments.length < 50) {
                    comments.push({
                      id: commentDoc.id,
                      ...commentData,
                      forumId,
                      postId: postDoc.id,
                    });
                  }
                });
              }).catch(err => {
                console.error(`댓글 검색 실패 (포럼: ${forumId}, 게시물: ${postDoc.id}):`, err);
              })
            );
          }
        }
      } catch (err) {
        console.error(`게시물 검색 실패 (포럼: ${forumId}):`, err);
      }
    }

    // 모든 댓글 검색이 완료될 때까지 대기
    await Promise.all(commentPromises);

    return { 
      forums, 
      posts: posts.slice(0, 50), // 최대 50개
      comments: comments.slice(0, 50) // 최대 50개
    };
  }
}
