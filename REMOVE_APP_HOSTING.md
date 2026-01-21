# Firebase App Hosting 삭제 가이드

## ⚠️ 문제 상황

현재 Firebase App Hosting이 활성화되어 있어서 GitHub에 푸시할 때마다 App Hosting이 배포를 시도하고 있습니다.

**오류 원인**: App Hosting은 서버 애플리케이션(포트 8080에서 실행)을 기대하지만, 현재 프로젝트는 정적 사이트입니다.

---

## 🔧 해결 방법: App Hosting 삭제

### 1. Firebase 콘솔 접속
https://console.firebase.google.com/project/booksalon-2301f/app-hosting

### 2. App Hosting 설정 삭제

#### 방법 1: App Hosting 메뉴에서 삭제
1. Firebase 콘솔 → **App Hosting** 메뉴 클릭
2. 설정된 App Hosting 서비스 확인
3. **Settings** 또는 **⚙️** 아이콘 클릭
4. **Delete** 또는 **삭제** 버튼 클릭
5. 확인 대화상자에서 삭제 확인

#### 방법 2: 프로젝트 설정에서 확인
1. Firebase 콘솔 → **프로젝트 설정** (⚙️ 아이콘)
2. **통합** 탭 확인
3. App Hosting 관련 설정이 있다면 제거

---

## ✅ 삭제 후 확인

### 1. GitHub Actions 확인
- GitHub 저장소 → **Actions** 탭
- 최근 워크플로우 실행 확인
- App Hosting 관련 오류가 더 이상 발생하지 않는지 확인

### 2. Firebase Hosting 사용
- App Hosting 삭제 후에는 **Firebase Hosting (전통 방식)**만 사용됩니다
- 배포는 `firebase deploy --only hosting` 명령어 또는 GitHub Actions로 진행됩니다

---

## 📋 현재 배포 방식

### ✅ 사용 중: Firebase Hosting (전통 방식)
- **용도**: 정적 사이트 (React SPA)
- **배포 방법**: 
  - 로컬: `firebase deploy --only hosting`
  - 자동: GitHub Actions (`.github/workflows/deploy.yml`)

### ❌ 사용 안 함: Firebase App Hosting
- **용도**: 서버 애플리케이션 (Node.js Express 등)
- **상태**: 삭제 필요

---

## 🔍 확인 방법

### App Hosting이 여전히 활성화되어 있는지 확인:
1. Firebase 콘솔 → **App Hosting** 메뉴
2. 서비스 목록 확인
3. 있다면 삭제

### GitHub Actions 로그 확인:
1. GitHub 저장소 → **Actions** 탭
2. 최근 워크플로우 실행 확인
3. 오류 메시지 확인

---

## 📝 참고

- **App Hosting**: 서버 애플리케이션용 (Next.js, Express 등)
- **Firebase Hosting**: 정적 사이트용 (React SPA, Vue SPA 등)

현재 프로젝트는 정적 사이트이므로 **Firebase Hosting**만 사용해야 합니다.

---

**작성일**: 2025-01-27  
**상태**: App Hosting 삭제 필요

