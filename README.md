# 북살롱 (Book Salon)

> 책을 중심으로 한 지식 공유 및 토론 커뮤니티 플랫폼

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-orange.svg)](https://firebase.google.com/)

**배포 URL**: [https://booksalon-nine.vercel.app](https://booksalon-nine.vercel.app)

## 서비스 소개

북살롱은 특정 도서에 대해 깊이 있는 대화를 나눌 수 있는 커뮤니티 플랫폼입니다. ISBN 기반으로 도서별 토론 공간(살롱)을 제공하며, 독자들이 독서 경험을 공유하고 다양한 관점을 교환할 수 있습니다.

## 주요 기능

- **도서 검색**: 카카오 도서 검색 API를 통한 ISBN/제목 검색
- **살롱 생성 및 참여**: 도서별 독서 토론 공간
- **게시물 및 댓글**: 독서 후기 작성과 토론
- **소셜 기능**: 좋아요, 팔로우, 활동 피드
- **북마크**: 관심 살롱 저장 및 관리
- **사용자 프로필**: 닉네임, 프로필 이미지, 독서 목표 설정
- **사용자 검색**: 다른 독자 검색 및 팔로우
- **메시징**: 1:1 메시지 기능
- **알림**: 활동 알림
- **관리자 대시보드**: 콘텐츠 관리

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Firebase (Firestore, Authentication, Storage) |
| 모니터링 | Sentry |
| 배포 | Vercel |
| 외부 API | 카카오 도서 검색 API |

## 시작하기

### 필수 조건

- Node.js 18+
- Firebase 프로젝트
- 카카오 API 키

### 설치 및 실행

```bash
git clone https://github.com/namseokyoo/booksalon.git
cd booksalon
npm install
cp .env.example .env.local
# .env.local에 실제 값 입력 후:
npm run dev
```

### 환경변수 (.env.local)

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# 카카오 API
VITE_KAKAO_API_KEY=
VITE_KAKAO_JS_KEY=

# Sentry (선택)
VITE_SENTRY_DSN=
```

## 프로젝트 구조

```
booksalon/
├── components/       # React 컴포넌트
├── services/         # Firebase 및 API 서비스 레이어
├── contexts/         # React Context (인증 등)
├── hooks/            # 커스텀 훅
├── public/           # 정적 파일
├── App.tsx           # 라우팅 및 레이아웃
├── index.html        # HTML 엔트리
├── index.tsx         # React 엔트리
├── types.ts          # TypeScript 타입 정의
└── vite.config.ts    # Vite 설정
```

## 라이선스

MIT License
