# 관리자 대시보드 Phase 2: 데이터 집계 최적화

## 📋 문서 정보
- **작성일**: 2025-01-27
- **프로젝트**: 북살롱 (Book Salon)
- **단계**: Phase 2 - 데이터 집계 최적화
- **상태**: 계획 중

---

## 🎯 Phase 2 목표

현재는 클라이언트에서 실시간으로 데이터를 집계하고 있어 성능 문제가 있습니다. Phase 2에서는 Firebase Cloud Functions를 사용하여 서버 측에서 데이터를 사전 집계하고, Firestore에 저장하여 클라이언트는 집계된 데이터만 조회하도록 최적화합니다.

---

## 📊 현재 문제점

### 1. 성능 문제
- **활동 추이 조회**: 모든 포럼을 순회하며 게시글/댓글 조회 (매우 느림)
- **인기 콘텐츠 조회**: 모든 포럼을 순회하며 게시글 조회 (매우 느림)
- **실시간 집계**: 클라이언트에서 매번 집계하여 Firestore 읽기 비용 증가

### 2. 확장성 문제
- 데이터가 많아질수록 쿼리 시간이 선형적으로 증가
- 동시 사용자가 많을 경우 Firestore 읽기 한도 초과 가능

### 3. 정확성 문제
- 샘플링으로 인한 데이터 부정확성 (현재 최대 20개 포럼만 처리)

---

## 🔧 해결 방안

### 1. Cloud Functions로 일별 통계 집계
- **Scheduled Function**: 매일 자정에 전날 통계 집계
- **저장 위치**: `analytics/daily_metrics/{date}` 컬렉션
- **집계 데이터**:
  - 총 사용자 수
  - 활성 사용자 수 (DAU)
  - 신규 가입자 수
  - 포럼 생성 수
  - 게시글 작성 수
  - 댓글 작성 수
  - 좋아요 수
  - 신고 수

### 2. Cloud Functions로 인기 콘텐츠 업데이트
- **Scheduled Function**: 매시간마다 인기 콘텐츠 업데이트
- **저장 위치**: `analytics/popular_forums`, `analytics/popular_posts`
- **업데이트 주기**: 1시간마다

### 3. 실시간 업데이트 (Trigger Functions)
- **포럼 생성 시**: 일별 통계 업데이트
- **게시글 작성 시**: 일별 통계 + 인기 콘텐츠 업데이트
- **댓글 작성 시**: 일별 통계 + 인기 게시글 업데이트
- **좋아요 시**: 인기 게시글 업데이트

---

## 📐 데이터 모델 설계

### 일별 통계 (daily_metrics)
```typescript
interface DailyMetrics {
  date: string; // YYYY-MM-DD
  totalUsers: number;
  activeUsers: number; // DAU
  newUsers: number;
  totalForums: number;
  newForums: number;
  totalPosts: number;
  newPosts: number;
  totalComments: number;
  newComments: number;
  totalLikes: number;
  newLikes: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 인기 포럼 (popular_forums)
```typescript
interface PopularForum {
  isbn: string;
  title: string;
  thumbnail: string;
  authors: string[];
  postCount: number;
  commentCount: number;
  likeCount: number;
  popularityScore: number;
  lastActivityAt: Timestamp;
  rank: number;
  updatedAt: Timestamp;
}
```

### 인기 게시글 (popular_posts)
```typescript
interface PopularPost {
  postId: string;
  forumIsbn: string;
  forumTitle: string;
  title: string;
  authorId: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
  popularityScore: number;
  createdAt: Timestamp;
  rank: number;
  updatedAt: Timestamp;
}
```

---

## 🏗️ 구현 계획

### Step 1: Cloud Functions 프로젝트 설정
1. Firebase 프로젝트에 Functions 추가
2. TypeScript 설정
3. 필요한 패키지 설치

### Step 2: 일별 통계 집계 함수 구현
1. `aggregateDailyMetrics`: 매일 자정 실행
2. 전날 데이터 집계
3. `analytics/daily_metrics/{date}`에 저장

### Step 3: 인기 콘텐츠 업데이트 함수 구현
1. `updatePopularForums`: 매시간 실행
2. 모든 포럼 조회 및 인기도 점수 계산
3. TOP 10 저장

### Step 4: 실시간 업데이트 함수 구현
1. `onForumCreate`: 포럼 생성 시 통계 업데이트
2. `onPostCreate`: 게시글 작성 시 통계 업데이트
3. `onCommentCreate`: 댓글 작성 시 통계 업데이트
4. `onLikeUpdate`: 좋아요 시 인기 게시글 업데이트

### Step 5: AdminService 업데이트
1. 집계된 데이터 조회 메서드로 변경
2. 활동 추이: `daily_metrics` 컬렉션에서 조회
3. 인기 콘텐츠: `popular_forums`, `popular_posts`에서 조회

### Step 6: AdminDashboard 업데이트
1. 새로운 데이터 구조에 맞게 컴포넌트 수정
2. 로딩 상태 개선

---

## 📅 일정

- **Step 1**: Cloud Functions 설정 (0.5일)
- **Step 2**: 일별 통계 집계 함수 (1일)
- **Step 3**: 인기 콘텐츠 업데이트 함수 (1일)
- **Step 4**: 실시간 업데이트 함수 (1일)
- **Step 5**: AdminService 업데이트 (0.5일)
- **Step 6**: AdminDashboard 업데이트 (0.5일)

**총 예상 시간**: 4.5일

---

## ✅ 성공 지표

### 성능
- 활동 추이 조회 시간: 수십 초 → 1초 이하
- 인기 콘텐츠 조회 시간: 수십 초 → 1초 이하
- Firestore 읽기 비용: 90% 감소

### 정확성
- 모든 데이터 집계 (샘플링 없음)
- 실시간 업데이트 (최대 1시간 지연)

### 확장성
- 데이터가 많아져도 성능 유지
- 동시 사용자 증가에도 안정적

---

## 🔒 보안 고려사항

1. **Cloud Functions 권한**: Admin SDK 사용
2. **Firestore Rules**: `analytics` 컬렉션은 읽기 전용
3. **에러 처리**: 집계 실패 시 로깅 및 알림

---

## 📝 다음 단계

Phase 2 완료 후:
- Phase 3: 고급 분석 기능 (사용자 분석, 콘텐츠 분석)
- Phase 4: 추가 기능 (리텐션율, 데이터 내보내기)

---

**작성자**: AI Assistant  
**검토 필요**: 프로젝트 관리자, 개발팀 리더

