# Firebase App Hosting 설정 가이드

## 📋 Firebase App Hosting으로 전환

### ✅ 완료된 작업
1. ✅ Firebase Hosting (전통 방식) 설정 제거
   - `firebase.json`에서 `hosting` 섹션 제거 완료
2. ✅ GitHub Actions 워크플로우 생성
   - `.github/workflows/deploy.yml` 생성
   - 자동 빌드 및 배포 설정

---

## 🚀 Firebase App Hosting 설정 방법

### 1. Firebase 콘솔에서 설정

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/project/booksalon-2301f/overview

2. **App Hosting 메뉴 클릭**
   - 왼쪽 메뉴에서 "App Hosting" 선택

3. **GitHub 저장소 연결**
   - "Connect repository" 클릭
   - GitHub 인증 및 저장소 선택: `namseokyoo/booksalon_251025`
   - 브랜치 선택: `main`

4. **빌드 설정**
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node.js version**: `20`
   - **Root directory**: `/` (프로젝트 루트)

5. **환경 변수 설정**
   Firebase 콘솔에서 다음 환경 변수 추가:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=booksalon-2301f.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=booksalon-2301f
   VITE_FIREBASE_STORAGE_BUCKET=booksalon-2301f.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_KAKAO_API_KEY=your_kakao_api_key
   ```

6. **배포 설정**
   - **Auto-deploy**: 활성화 (main 브랜치에 푸시 시 자동 배포)
   - **Preview channels**: 활성화 (PR 생성 시 미리보기 배포)

7. **배포 시작**
   - "Deploy" 또는 "Save" 클릭
   - 첫 배포가 자동으로 시작됩니다

---

## 🔧 GitHub Actions 설정 (선택사항)

GitHub Actions를 사용하여 추가 자동화를 원한다면:

### GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 Secrets 추가:
   - `FIREBASE_TOKEN`: Firebase CLI 토큰
   - `VITE_FIREBASE_API_KEY`: Firebase API 키
   - `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth 도메인
   - `VITE_FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
   - `VITE_FIREBASE_STORAGE_BUCKET`: Firebase Storage 버킷
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID
   - `VITE_FIREBASE_APP_ID`: Firebase App ID
   - `VITE_FIREBASE_MEASUREMENT_ID`: Firebase Measurement ID
   - `VITE_KAKAO_API_KEY`: 카카오 API 키

### Firebase Token 생성
```bash
firebase login:ci
```
생성된 토큰을 GitHub Secrets에 `FIREBASE_TOKEN`으로 추가

---

## 📊 배포 방식 비교

### 전통 방식 (제거됨) ❌
- 로컬에서 빌드 후 수동 배포
- 명령어: `firebase deploy --only hosting`
- 장점: 간단함
- 단점: 수동 작업 필요

### App Hosting (새로운 방식) ✅
- GitHub에 푸시하면 자동 배포
- CI/CD 파이프라인 제공
- Preview 배포 지원 (PR별)
- 장점: 자동화, 협업 용이
- 단점: 초기 설정 필요

---

## 🔄 배포 프로세스

### App Hosting 사용 시
1. 코드 수정
2. GitHub에 푸시: `git push origin main`
3. 자동으로 빌드 및 배포 시작
4. Firebase 콘솔에서 배포 상태 확인

### Preview 배포 (PR 생성 시)
- Pull Request 생성 시 자동으로 Preview URL 생성
- PR별로 독립적인 배포 환경 제공
- PR 머지 시 Production에 자동 배포

---

## 📝 주의사항

### 1. 환경 변수
- Firebase 콘솔에서 환경 변수를 설정해야 합니다
- GitHub Secrets와는 별개입니다 (App Hosting은 Firebase 콘솔에서 관리)

### 2. 빌드 설정
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node.js version**: `20`

### 3. Functions 배포
- App Hosting은 프론트엔드만 배포합니다
- Cloud Functions는 여전히 `firebase deploy --only functions`로 배포해야 합니다

---

## ✅ 설정 완료 체크리스트

- [x] Firebase Hosting (전통 방식) 제거
- [x] GitHub Actions 워크플로우 생성
- [ ] Firebase 콘솔에서 App Hosting 설정
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 완료
- [ ] 환경 변수 설정
- [ ] 첫 배포 완료

---

## 🔗 참고 링크

- **Firebase App Hosting 문서**: https://firebase.google.com/docs/app-hosting
- **프로젝트 콘솔**: https://console.firebase.google.com/project/booksalon-2301f/overview
- **GitHub 저장소**: https://github.com/namseokyoo/booksalon_251025

---

**작성일**: 2025-01-27  
**상태**: 전통 방식 제거 완료, App Hosting 설정 대기

