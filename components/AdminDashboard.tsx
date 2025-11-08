import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminUser, Report, UserProfile, Forum, Post } from '../types';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const AdminDashboard: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'forums' | 'reports'>('dashboard');
    const [stats, setStats] = useState<any>(null);
    const [extendedStats, setExtendedStats] = useState<any>(null);
    const [activityTrends, setActivityTrends] = useState<any[]>([]);
    const [popularForums, setPopularForums] = useState<Array<Forum & { popularityScore: number }>>([]);
    const [popularPosts, setPopularPosts] = useState<Array<Post & { forumIsbn: string; forumTitle: string; popularityScore: number }>>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [forums, setForums] = useState<Forum[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [period, setPeriod] = useState<7 | 30 | 90>(7);
    
    // 페이지네이션 상태
    const [usersLastDoc, setUsersLastDoc] = useState<any>(null);
    const [usersHasMore, setUsersHasMore] = useState(false);
    const [forumsLastDoc, setForumsLastDoc] = useState<any>(null);
    const [forumsHasMore, setForumsHasMore] = useState(false);
    const [reportsLastDoc, setReportsLastDoc] = useState<any>(null);
    const [reportsHasMore, setReportsHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const checkAdminStatus = async () => {
            try {
                const adminStatus = await AdminService.isAdmin(currentUser.uid);
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    setIsLoadingData(true);
                    setError(null);

                    try {
                        // 기본 통계 로드
                        const statsData = await AdminService.getStats();
                        setStats(statsData);

                        // 확장 통계 로드
                        const [activeUsers30, activeUsers7, newUsers] = await Promise.all([
                            AdminService.getActiveUsers(30),
                            AdminService.getActiveUsers(7),
                            AdminService.getNewUsers(period)
                        ]);

                        setExtendedStats({
                            activeUsers30,
                            activeUsers7,
                            newUsers
                        });

                        // 활동 추이 로드
                        const trends = await AdminService.getActivityTrends(period);
                        setActivityTrends(trends);

                        // 인기 콘텐츠 로드
                        const [forums, posts] = await Promise.all([
                            AdminService.getPopularForums(10),
                            AdminService.getPopularPosts(10)
                        ]);
                        setPopularForums(forums);
                        setPopularPosts(posts);
                    } catch (err: any) {
                        console.error('데이터 로드 실패:', err);
                        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
                    } finally {
                        setIsLoadingData(false);
                    }

                    // 실시간 통계 리스너
                    const unsubscribeStats = AdminService.subscribeToStats((newStats) => {
                        setStats(newStats);
                    });

                    return () => unsubscribeStats();
                }
            } catch (error) {
                console.error('관리자 상태 확인 실패:', error);
                setError('관리자 권한을 확인하는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [currentUser, period]);

    useEffect(() => {
        if (!isAdmin) return;

        const loadData = async (loadMore: boolean = false) => {
            try {
                setIsLoadingMore(true);
                if (activeTab === 'users') {
                    const result = await AdminService.getUsers(20, loadMore ? usersLastDoc : undefined);
                    if (loadMore) {
                        setUsers(prev => [...prev, ...result.users]);
                    } else {
                        setUsers(result.users);
                    }
                    setUsersLastDoc(result.lastDoc);
                    setUsersHasMore(result.hasMore);
                } else if (activeTab === 'forums') {
                    const result = await AdminService.getForums(20, loadMore ? forumsLastDoc : undefined);
                    if (loadMore) {
                        setForums(prev => [...prev, ...result.forums]);
                    } else {
                        setForums(result.forums);
                    }
                    setForumsLastDoc(result.lastDoc);
                    setForumsHasMore(result.hasMore);
                } else if (activeTab === 'reports') {
                    const result = await AdminService.getReports(undefined, 20, loadMore ? reportsLastDoc : undefined);
                    if (loadMore) {
                        setReports(prev => [...prev, ...result.reports]);
                    } else {
                        setReports(result.reports);
                    }
                    setReportsLastDoc(result.lastDoc);
                    setReportsHasMore(result.hasMore);
                }
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            } finally {
                setIsLoadingMore(false);
            }
        };

        loadData();
    }, [isAdmin, activeTab]);

    const handleDeactivateUser = async (userId: string) => {
        try {
            await AdminService.deactivateUser(userId);
            // 현재 페이지 새로고침
            const result = await AdminService.getUsers(20, undefined);
            setUsers(result.users);
            setUsersLastDoc(result.lastDoc);
            setUsersHasMore(result.hasMore);
        } catch (error) {
            console.error('사용자 비활성화 실패:', error);
        }
    };

    const handleActivateUser = async (userId: string) => {
        try {
            await AdminService.activateUser(userId);
            // 현재 페이지 새로고침
            const result = await AdminService.getUsers(20, undefined);
            setUsers(result.users);
            setUsersLastDoc(result.lastDoc);
            setUsersHasMore(result.hasMore);
        } catch (error) {
            console.error('사용자 활성화 실패:', error);
        }
    };

    const handleDeleteForum = async (isbn: string) => {
        try {
            await AdminService.deleteForum(isbn);
            // 현재 페이지 새로고침
            const result = await AdminService.getForums(20, undefined);
            setForums(result.forums);
            setForumsLastDoc(result.lastDoc);
            setForumsHasMore(result.hasMore);
        } catch (error) {
            console.error('포럼 삭제 실패:', error);
        }
    };

    const handleResolveReport = async (reportId: string) => {
        try {
            await AdminService.updateReportStatus(reportId, 'resolved', currentUser?.uid || '');
            // 현재 페이지 새로고침
            const result = await AdminService.getReports(undefined, 20, undefined);
            setReports(result.reports);
            setReportsLastDoc(result.lastDoc);
            setReportsHasMore(result.hasMore);
        } catch (error) {
            console.error('신고 해결 실패:', error);
        }
    };

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        
        if (activeTab === 'users' && usersHasMore) {
            const result = await AdminService.getUsers(20, usersLastDoc);
            setUsers(prev => [...prev, ...result.users]);
            setUsersLastDoc(result.lastDoc);
            setUsersHasMore(result.hasMore);
        } else if (activeTab === 'forums' && forumsHasMore) {
            const result = await AdminService.getForums(20, forumsLastDoc);
            setForums(prev => [...prev, ...result.forums]);
            setForumsLastDoc(result.lastDoc);
            setForumsHasMore(result.hasMore);
        } else if (activeTab === 'reports' && reportsHasMore) {
            const result = await AdminService.getReports(undefined, 20, reportsLastDoc);
            setReports(prev => [...prev, ...result.reports]);
            setReportsLastDoc(result.lastDoc);
            setReportsHasMore(result.hasMore);
        }
    };

    // 트렌드 계산 (이전 기간 대비)
    const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
        if (previous === 0) return { value: 0, isPositive: true };
        const change = ((current - previous) / previous) * 100;
        return { value: Math.abs(change), isPositive: change >= 0 };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center text-gray-400 py-8">
                        <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">접근 권한이 없습니다</h3>
                        <p>관리자 권한이 필요한 페이지입니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">🛡️ 관리자 대시보드</h1>
                    <p className="text-gray-400">북살롱 서비스 관리 및 모니터링</p>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex space-x-2 mb-6">
                    {[
                        { id: 'dashboard', label: '대시보드', icon: '📊' },
                        { id: 'users', label: '사용자 관리', icon: '👥' },
                        { id: 'forums', label: '포럼 관리', icon: '📚' },
                        { id: 'reports', label: '신고 관리', icon: '⚠️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* 탭 내용 */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* 에러 메시지 */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-400">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 기간 선택 */}
                        <div className="mb-6 flex items-center space-x-4">
                            <span className="text-gray-400 text-sm">기간:</span>
                            <div className="flex space-x-2">
                                {[7, 30, 90].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setPeriod(days as 7 | 30 | 90)}
                                        disabled={isLoadingData}
                                        className={`px-3 py-1 rounded text-sm transition-colors ${period === days
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            } ${isLoadingData ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {days}일
                                    </button>
                                ))}
                            </div>
                            {isLoadingData && (
                                <div className="flex items-center text-gray-400 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 mr-2"></div>
                                    데이터 로딩 중...
                                </div>
                            )}
                        </div>

                        {stats && (
                            <>

                        {/* KPI 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">총 사용자</p>
                                <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
                                {extendedStats && (
                                    <p className="text-xs text-gray-500">
                                        활성 사용자 (30일): {extendedStats.activeUsers30}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">총 포럼</p>
                                <p className="text-3xl font-bold text-white mb-1">{stats.totalForums}</p>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-yellow-500 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">총 게시물</p>
                                <p className="text-3xl font-bold text-white mb-1">{stats.totalPosts}</p>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-red-500 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">대기 중인 신고</p>
                                <p className="text-3xl font-bold text-white mb-1">{stats.pendingReports}</p>
                            </div>
                        </div>

                        {/* 활동 추이 차트 */}
                        {isLoadingData ? (
                            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-bold text-white mb-4">📈 활동 추이</h2>
                                <div className="flex items-center justify-center h-[300px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                                </div>
                            </div>
                        ) : activityTrends.length > 0 ? (
                            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-bold text-white mb-4">📈 활동 추이</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={activityTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            tick={{ fill: '#9ca3af' }}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                        />
                                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="forums" stroke="#22d3ee" name="포럼" strokeWidth={2} />
                                        <Line type="monotone" dataKey="posts" stroke="#10b981" name="게시글" strokeWidth={2} />
                                        <Line type="monotone" dataKey="comments" stroke="#f59e0b" name="댓글" strokeWidth={2} />
                                        <Line type="monotone" dataKey="likes" stroke="#ef4444" name="좋아요" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-bold text-white mb-4">📈 활동 추이</h2>
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <p>활동 데이터가 없습니다.</p>
                                </div>
                            </div>
                        )}

                        {/* 인기 콘텐츠 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* 인기 포럼 TOP 10 */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-white mb-4">🔥 인기 포럼 TOP 10</h2>
                                <div className="space-y-3">
                                    {popularForums.length > 0 ? (
                                        popularForums.map((forum, index) => (
                                            <div key={forum.isbn} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <span className="text-cyan-400 font-bold w-6">{index + 1}</span>
                                                    <img
                                                        src={forum.book.thumbnail}
                                                        alt={forum.book.title}
                                                        className="w-10 h-14 object-cover rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-semibold truncate">{forum.book.title}</h3>
                                                        <p className="text-gray-400 text-xs truncate">{forum.book.authors.join(', ')}</p>
                                                        <p className="text-gray-500 text-xs">게시글: {forum.postCount}개</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">데이터가 없습니다</p>
                                    )}
                                </div>
                            </div>

                            {/* 인기 게시글 TOP 10 */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-white mb-4">🔥 인기 게시글 TOP 10</h2>
                                <div className="space-y-3">
                                    {popularPosts.length > 0 ? (
                                        popularPosts.map((post, index) => (
                                            <div key={post.id} className="p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-cyan-400 font-bold">{index + 1}</span>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                        <span>👍 {post.likeCount || 0}</span>
                                                        <span>💬 {post.commentCount || 0}</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-white font-semibold mb-1 truncate">{post.title}</h3>
                                                <p className="text-gray-400 text-xs truncate">{post.forumTitle}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">데이터가 없습니다</p>
                                    )}
                                </div>
                            </div>
                        </div>
                            </>
                        )}

                        {!stats && !isLoadingData && (
                            <div className="text-center text-gray-400 py-8">
                                <p>데이터를 불러올 수 없습니다.</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">사용자 관리 ({users.length}명)</h2>
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div key={user.uid} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {user.nickname?.charAt(0) || user.displayName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">
                                                {user.nickname || user.displayName}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {user.isActive !== false ? (
                                            <button
                                                onClick={() => handleDeactivateUser(user.uid)}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                            >
                                                비활성화
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleActivateUser(user.uid)}
                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                            >
                                                활성화
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {usersHasMore && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            로딩 중...
                                        </>
                                    ) : (
                                        '더 보기'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'forums' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">포럼 관리 ({forums.length}개)</h2>
                        <div className="space-y-3">
                            {forums.map((forum) => (
                                <div key={forum.isbn} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={forum.book.thumbnail}
                                            alt={forum.book.title}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <h3 className="text-white font-semibold">{forum.book.title}</h3>
                                            <p className="text-gray-400 text-sm">{forum.book.authors.join(', ')}</p>
                                            <p className="text-gray-400 text-sm">게시물: {forum.postCount}개</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteForum(forum.isbn)}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                        {forumsHasMore && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            로딩 중...
                                        </>
                                    ) : (
                                        '더 보기'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">신고 관리 ({reports.length}개)</h2>
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <div key={report.id} className="p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${report.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                                                    report.status === 'resolved' ? 'bg-green-600 text-green-100' :
                                                        'bg-gray-600 text-gray-100'
                                                }`}>
                                                {report.status === 'pending' ? '대기중' :
                                                    report.status === 'resolved' ? '해결됨' : '검토중'}
                                            </span>
                                            <span className="text-gray-400 text-sm">
                                                {report.type === 'spam' ? '스팸' :
                                                    report.type === 'harassment' ? '괴롭힘' :
                                                        report.type === 'inappropriate_content' ? '부적절한 내용' :
                                                            report.type === 'fake_news' ? '가짜 뉴스' : '기타'}
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-sm">
                                            {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-white font-semibold mb-1">{report.reason}</p>
                                    <p className="text-gray-300 text-sm mb-3">{report.description}</p>
                                    {report.status === 'pending' && (
                                        <button
                                            onClick={() => handleResolveReport(report.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                        >
                                            해결 처리
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {reportsHasMore && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            로딩 중...
                                        </>
                                    ) : (
                                        '더 보기'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
