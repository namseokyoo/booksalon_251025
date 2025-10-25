# 📚 북살롱 (Book Salon)

> ISBN 기반 독서 커뮤니티 플랫폼

북살롱은 특정 도서를 중심으로 한 독서 커뮤니티 플랫폼입니다. 사용자들이 ISBN을 통해 책을 검색하고, 해당 책에 대한 토론 포럼을 생성하거나 참여할 수 있는 서비스입니다.

## ✨ 주요 기능

- 🔍 **ISBN 기반 도서 검색**: 카카오 API를 통한 정확한 도서 정보 검색
- 🏛️ **살롱(포럼) 시스템**: 특정 도서에 대한 토론 공간 생성 및 참여
- 📝 **게시물 작성**: 포럼 내에서 자유로운 글 작성
- 💬 **실시간 댓글**: Firestore를 통한 실시간 댓글 시스템
- 👤 **사용자 인증**: Firebase Auth를 통한 안전한 회원가입/로그인
- 📱 **모바일 최적화**: 완전한 반응형 디자인

## 🛠️ 기술 스택

- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Backend**: Firebase (Firestore + Authentication)
- **API**: 카카오 도서 검색 API
- **스타일링**: Tailwind CSS (다크 모드 중심)
- **상태관리**: React Context API

## 🚀 시작하기

### 필수 요구사항

- Node.js (LTS 버전)
- Git
- 카카오 개발자 계정 (API 키 발급용)

### 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone https://github.com/namseokyoo/booksalon_251025.git
cd booksalon_251025

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (선택사항)
cp env.example .env.local
# .env.local 파일에서 KAKAO_API_KEY 설정

# 4. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 프로젝트를 확인할 수 있습니다.

## 📋 환경 설정

### 카카오 API 키 설정

1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 및 REST API 키 발급
3. `env.example` 파일을 `.env.local`로 복사
4. `KAKAO_API_KEY`에 발급받은 키 입력

### Firebase 설정

Firebase 프로젝트가 이미 설정되어 있습니다. 필요시 `services/firebase.ts` 파일에서 설정을 변경할 수 있습니다.

## 📱 모바일 반응형

- **모바일 우선 디자인**: 모든 컴포넌트가 모바일에서 최적화
- **터치 친화적**: 적절한 버튼 크기 및 간격
- **반응형 레이아웃**: 모바일/태블릿/데스크톱 지원
- **다크 모드**: 눈에 편한 어두운 테마

## 🎯 개발 로드맵

### ✅ 완료된 기능
- [x] 모바일 반응형 디자인 전면 개선
- [x] 살롱(포럼) 기능 정상화
- [x] 카카오 API 연동
- [x] 사용자 인증 시스템

### 🔄 진행 중인 기능
- [ ] 사용자 프로필 시스템
- [ ] 북마크 및 관심 포럼 기능
- [ ] 검색 및 필터링 개선

### 📅 예정된 기능
- [ ] 소셜 기능 (팔로우, 좋아요)
- [ ] 알림 시스템
- [ ] AI 기반 독서 추천
- [ ] 모바일 앱 개발

## 📖 사용 방법

1. **도서 검색**: ISBN 번호를 입력하여 원하는 책을 검색
2. **살롱 생성**: 검색된 책으로 새로운 토론 포럼 생성
3. **살롱 참여**: 기존 포럼에 참여하여 토론
4. **글 작성**: 로그인 후 게시물 작성
5. **댓글 달기**: 다른 사용자의 글에 댓글 작성

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 GitHub Issues를 통해 연락해주세요.

## 🙏 감사의 말

- [React](https://reactjs.org/) - UI 라이브러리
- [Firebase](https://firebase.google.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [카카오 API](https://developers.kakao.com/) - 도서 검색 서비스

---

**북살롱**으로 더 나은 독서 경험을 만들어보세요! 📚✨
