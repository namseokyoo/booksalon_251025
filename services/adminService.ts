import { db } from './firebase';
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    serverTimestamp,
    increment,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import type { AdminUser, Report, UserProfile, Forum, Post, Comment } from '../types';

export class AdminService {
    // 관리자 권한 확인
    static async isAdmin(userId: string): Promise<boolean> {
        try {
            const adminRef = doc(db, 'admins', userId);
            const adminDoc = await getDoc(adminRef);
            return adminDoc.exists() && adminDoc.data()?.role === 'admin';
        } catch (error) {
            console.error('관리자 권한 확인 실패:', error);
            return false;
        }
    }

    // 관리자 권한 확인 (moderator 포함)
    static async isModerator(userId: string): Promise<boolean> {
        try {
            const adminRef = doc(db, 'admins', userId);
            const adminDoc = await getDoc(adminRef);
            const data = adminDoc.data();
            return adminDoc.exists() && (data?.role === 'admin' || data?.role === 'moderator');
        } catch (error) {
            console.error('관리자 권한 확인 실패:', error);
            return false;
        }
    }

    // 관리자로 설정
    static async setAdmin(userId: string, role: 'admin' | 'moderator'): Promise<void> {
        const adminRef = doc(db, 'admins', userId);
        await updateDoc(adminRef, {
            role,
            updatedAt: serverTimestamp()
        });
    }

    // 사용자 목록 조회 (페이지네이션 지원)
    static async getUsers(
        limitCount: number = 20,
        lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ users: UserProfile[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
        const usersRef = collection(db, 'users');
        let q = query(
            usersRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount + 1) // 한 개 더 가져와서 hasMore 확인
        );

        if (lastDoc) {
            q = query(
                usersRef,
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(limitCount + 1)
            );
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > limitCount;
        const users = docs.slice(0, limitCount).map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
        const newLastDoc = docs.length > 0 ? docs[limitCount - 1] || null : null;

        return {
            users,
            lastDoc: newLastDoc,
            hasMore
        };
    }

    // 사용자 검색
    static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('displayName', '>=', searchTerm),
            where('displayName', '<=', searchTerm + '\uf8ff'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
    }

    // 사용자 계정 비활성화
    static async deactivateUser(userId: string): Promise<void> {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isActive: false,
            deactivatedAt: serverTimestamp(),
            deactivatedBy: 'admin'
        });
    }

    // 사용자 계정 활성화
    static async activateUser(userId: string): Promise<void> {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isActive: true,
            deactivatedAt: null,
            deactivatedBy: null
        });
    }

    // 포럼 목록 조회 (페이지네이션 지원)
    static async getForums(
        limitCount: number = 20,
        lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ forums: Forum[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
        const forumsRef = collection(db, 'forums');
        let q = query(
            forumsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount + 1) // 한 개 더 가져와서 hasMore 확인
        );

        if (lastDoc) {
            q = query(
                forumsRef,
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(limitCount + 1)
            );
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > limitCount;
        const forums = docs.slice(0, limitCount).map(doc => ({ isbn: doc.id, ...doc.data() })) as Forum[];
        const newLastDoc = docs.length > 0 ? docs[limitCount - 1] || null : null;

        return {
            forums,
            lastDoc: newLastDoc,
            hasMore
        };
    }

    // 포럼 삭제
    static async deleteForum(isbn: string): Promise<void> {
        const forumRef = doc(db, 'forums', isbn);
        await deleteDoc(forumRef);
    }

    // 신고 생성
    static async createReport(
        reporterId: string,
        type: Report['type'],
        reason: string,
        description: string,
        metadata?: {
            reportedUserId?: string;
            reportedPostId?: string;
            reportedCommentId?: string;
            reportedForumId?: string;
        }
    ): Promise<string> {
        const reportsRef = collection(db, 'reports');

        const report = {
            reporterId,
            type,
            reason,
            description,
            status: 'pending',
            createdAt: serverTimestamp(),
            ...metadata
        };

        const docRef = await addDoc(reportsRef, report);
        return docRef.id;
    }

    // 신고 목록 조회 (페이지네이션 지원)
    static async getReports(
        status?: Report['status'],
        limitCount: number = 20,
        lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ reports: Report[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
        const reportsRef = collection(db, 'reports');
        let q;

        if (status) {
            q = query(
                reportsRef,
                where('status', '==', status),
                orderBy('createdAt', 'desc'),
                limit(limitCount + 1)
            );
        } else {
            q = query(
                reportsRef,
                orderBy('createdAt', 'desc'),
                limit(limitCount + 1)
            );
        }

        if (lastDoc) {
            if (status) {
                q = query(
                    reportsRef,
                    where('status', '==', status),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(limitCount + 1)
                );
            } else {
                q = query(
                    reportsRef,
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(limitCount + 1)
                );
            }
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > limitCount;
        const reports = docs.slice(0, limitCount).map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
        const newLastDoc = docs.length > 0 ? docs[limitCount - 1] || null : null;

        return {
            reports,
            lastDoc: newLastDoc,
            hasMore
        };
    }

    // 신고 상태 업데이트
    static async updateReportStatus(
        reportId: string,
        status: Report['status'],
        resolvedBy: string,
        resolution?: string
    ): Promise<void> {
        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, {
            status,
            resolvedBy,
            resolvedAt: serverTimestamp(),
            resolution
        });
    }

    // 통계 조회
    static async getStats(): Promise<{
        totalUsers: number;
        totalForums: number;
        totalPosts: number;
        totalReports: number;
        pendingReports: number;
    }> {
        const [usersSnapshot, forumsSnapshot, reportsSnapshot] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'forums')),
            getDocs(collection(db, 'reports'))
        ]);

        const pendingReports = reportsSnapshot.docs.filter(
            doc => doc.data().status === 'pending'
        ).length;

        // 포스트 수는 각 포럼의 포스트를 합산
        let totalPosts = 0;
        for (const forumDoc of forumsSnapshot.docs) {
            const postsSnapshot = await getDocs(
                collection(db, 'forums', forumDoc.id, 'posts')
            );
            totalPosts += postsSnapshot.size;
        }

        return {
            totalUsers: usersSnapshot.size,
            totalForums: forumsSnapshot.size,
            totalPosts,
            totalReports: reportsSnapshot.size,
            pendingReports
        };
    }

    // 실시간 통계 리스너
    static subscribeToStats(callback: (stats: any) => void): () => void {
        const usersRef = collection(db, 'users');
        const forumsRef = collection(db, 'forums');
        const reportsRef = collection(db, 'reports');

        const unsubscribeUsers = onSnapshot(usersRef, () => {
            this.getStats().then(callback);
        });

        const unsubscribeForums = onSnapshot(forumsRef, () => {
            this.getStats().then(callback);
        });

        const unsubscribeReports = onSnapshot(reportsRef, () => {
            this.getStats().then(callback);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeForums();
            unsubscribeReports();
        };
    }

    // 활성 사용자 수 조회 (DAU/MAU)
    static async getActiveUsers(days: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('lastLoginAt', '>=', cutoffTimestamp)
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('활성 사용자 조회 실패:', error);
            return 0;
        }
    }

    // 신규 가입자 수 조회 (기간별)
    static async getNewUsers(days: number = 7): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('createdAt', '>=', cutoffTimestamp)
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('신규 가입자 조회 실패:', error);
            return 0;
        }
    }

    // 활동 추이 데이터 조회 (일별) - 집계된 데이터 사용
    static async getActivityTrends(days: number = 7): Promise<Array<{
        date: string;
        forums: number;
        posts: number;
        comments: number;
        likes: number;
    }>> {
        try {
            const trends: Array<{
                date: string;
                forums: number;
                posts: number;
                comments: number;
                likes: number;
            }> = [];

            // 집계된 일별 통계 조회
            const metricsRef = collection(db, 'analytics', 'daily_metrics', 'metrics');
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

            // 날짜 범위의 통계 조회
            const metricsQuery = query(
                metricsRef,
                where('date', '>=', cutoffDateStr),
                orderBy('date', 'asc')
            );
            const metricsSnapshot = await getDocs(metricsQuery);

            // 날짜별로 그룹화
            const dateMap = new Map<string, { forums: number; posts: number; comments: number; likes: number }>();

            // 초기화 (빈 날짜도 포함)
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                const dateStr = date.toISOString().split('T')[0];
                dateMap.set(dateStr, { forums: 0, posts: 0, comments: 0, likes: 0 });
            }

            // 집계된 데이터 사용
            metricsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const dateStr = data.date;
                const existing = dateMap.get(dateStr);
                if (existing) {
                    existing.forums = data.newForums || 0;
                    existing.posts = data.newPosts || 0;
                    existing.comments = data.newComments || 0;
                    existing.likes = data.newLikes || 0;
                }
            });

            // Map을 배열로 변환
            Array.from(dateMap.entries()).forEach(([date, data]) => {
                trends.push({ date, ...data });
            });

            return trends.sort((a, b) => a.date.localeCompare(b.date));
        } catch (error) {
            console.error('활동 추이 조회 실패:', error);
            // 폴백: 빈 배열 반환
            return [];
        }
    }

    // 인기 포럼 TOP 10 조회 - 집계된 데이터 사용
    static async getPopularForums(limitCount: number = 10): Promise<Array<Forum & { popularityScore: number }>> {
        try {
            // 집계된 인기 포럼 조회
            const popularForumsRef = doc(db, 'analytics', 'popular_forums');
            const popularForumsDoc = await getDoc(popularForumsRef);

            if (popularForumsDoc.exists()) {
                const data = popularForumsDoc.data();
                const forums = (data.forums || []).slice(0, limitCount).map((forum: any) => ({
                    isbn: forum.isbn,
                    book: {
                        title: forum.title,
                        thumbnail: forum.thumbnail,
                        authors: forum.authors
                    },
                    postCount: forum.postCount,
                    popularityScore: forum.popularityScore
                })) as Array<Forum & { popularityScore: number }>;

                return forums;
            }

            // 폴백: 직접 조회 (집계 데이터가 없는 경우)
            const forumsRef = collection(db, 'forums');
            const q = query(
                forumsRef,
                orderBy('postCount', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const forums = snapshot.docs.map(doc => {
                const data = doc.data() as Forum;
                const popularityScore = (data.postCount || 0) * 2;
                return { isbn: doc.id, ...data, popularityScore };
            });

            return forums.sort((a, b) => b.popularityScore - a.popularityScore);
        } catch (error) {
            console.error('인기 포럼 조회 실패:', error);
            return [];
        }
    }

    // 인기 게시글 TOP 10 조회 - 집계된 데이터 사용
    static async getPopularPosts(limitCount: number = 10): Promise<Array<Post & { forumIsbn: string; forumTitle: string; popularityScore: number }>> {
        try {
            // 집계된 인기 게시글 조회
            const popularPostsRef = doc(db, 'analytics', 'popular_posts');
            const popularPostsDoc = await getDoc(popularPostsRef);

            if (popularPostsDoc.exists()) {
                const data = popularPostsDoc.data();
                const posts = (data.posts || []).slice(0, limitCount).map((post: any) => ({
                    id: post.postId,
                    title: post.title,
                    content: '', // 집계 데이터에는 내용이 없음
                    author: {
                        uid: post.authorId,
                        displayName: post.authorName,
                        email: ''
                    },
                    likeCount: post.likeCount,
                    commentCount: post.commentCount,
                    createdAt: post.createdAt,
                    forumIsbn: post.forumIsbn,
                    forumTitle: post.forumTitle,
                    popularityScore: post.popularityScore
                })) as Array<Post & { forumIsbn: string; forumTitle: string; popularityScore: number }>;

                return posts;
            }

            // 폴백: 직접 조회 (집계 데이터가 없는 경우)
            const forumsRef = collection(db, 'forums');
            const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
            const forumsQuery = query(
                forumsRef,
                where('lastActivityAt', '>=', thirtyDaysAgo),
                orderBy('lastActivityAt', 'desc'),
                limit(20)
            );
            const forumsSnapshot = await getDocs(forumsQuery);
            const popularPosts: Array<Post & { forumIsbn: string; forumTitle: string; popularityScore: number }> = [];

            for (const forumDoc of forumsSnapshot.docs) {
                try {
                    const forumData = forumDoc.data() as Forum;
                    const postsRef = collection(db, 'forums', forumDoc.id, 'posts');
                    const postsQuery = query(
                        postsRef,
                        orderBy('likeCount', 'desc'),
                        limit(5)
                    );
                    const postsSnapshot = await getDocs(postsQuery);

                    postsSnapshot.docs.forEach(postDoc => {
                        const postData = postDoc.data() as Post;
                        const likeCount = postData.likeCount || 0;
                        const commentCount = postData.commentCount || 0;
                        const popularityScore = likeCount * 2 + commentCount;

                        popularPosts.push({
                            id: postDoc.id,
                            ...postData,
                            forumIsbn: forumDoc.id,
                            forumTitle: forumData.book.title,
                            popularityScore
                        });
                    });
                } catch (error) {
                    console.error(`포럼 게시글 조회 실패 (${forumDoc.id}):`, error);
                }
            }

            return popularPosts
                .sort((a, b) => b.popularityScore - a.popularityScore)
                .slice(0, limitCount);
        } catch (error) {
            console.error('인기 게시글 조회 실패:', error);
            return [];
        }
    }
}
