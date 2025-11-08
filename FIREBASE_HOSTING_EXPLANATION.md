# Firebase 호스팅 방식 설명

## 🔍 Firebase의 두 가지 호스팅 옵션

### 1. Firebase Hosting (전통적인 방식) ✅ **현재 사용 중**
- **방식**: 로컬에서 빌드한 파일을 직접 업로드
- **명령어**: `firebase deploy --only hosting`
- **빌드**: 로컬에서 `npm run build` 실행 후 `dist/` 폴더 업로드
- **배포 URL**: https://booksalon-2301f.web.app
- **설정 파일**: `firebase.json`의 `hosting` 섹션

**제가 배포한 것**: 이 방식입니다!

### 2. Firebase App Hosting (새로운 방식) ❌ **사용 안 함**
- **방식**: GitHub 저장소와 연동하여 자동 빌드/배포
- **설정**: Firebase 콘솔에서 GitHub 저장소 연결
- **특징**: 
  - GitHub에 푸시하면 자동으로 빌드 및 배포
  - CI/CD 파이프라인 제공
  - 별도의 빌드 환경 제공

**사용자가 본 것**: 이 설정 페이지입니다 (현재 사용하지 않음)

---

## 📊 현재 배포 상태

### 배포된 항목
- ✅ **Firebase Hosting** (전통 방식)
  - 배포 시간: 2025-01-27
  - 배포 URL: https://booksalon-2301f.web.app
  - 배포 방법: `firebase deploy --only hosting`
  - 빌드 결과물: `dist/` 폴더 (로컬에서 빌드)

### 배포되지 않은 항목
- ❌ **Firebase App Hosting** (GitHub 연동 방식)
  - 현재 설정되지 않음
  - GitHub 저장소 연동 없음

---

## 🤔 왜 App Hosting 설정이 보이나요?

Firebase 콘솔에서 "App Hosting" 메뉴를 클릭하면 GitHub 연동 설정 페이지가 보입니다. 하지만 이것은 **새로운 서비스를 설정하는 페이지**이고, 현재 프로젝트는 **Firebase Hosting (전통 방식)**을 사용하고 있습니다.

### 확인 방법
1. Firebase 콘솔 → **Hosting** 메뉴 클릭 (App Hosting이 아님)
2. 또는 터미널에서 확인:
   ```bash
   firebase hosting:sites:list
   ```

---

## 📝 현재 배포 방식 요약

**제가 배포한 것**:
- ✅ Firebase Hosting (전통 방식)
- ✅ 로컬에서 `npm run build` 실행
- ✅ `dist/` 폴더를 Firebase에 업로드
- ✅ 배포 URL: https://booksalon-2301f.web.app

**배포 명령어**:
```bash
npm run build
firebase deploy --only hosting
```

---

## 🔄 App Hosting으로 전환하고 싶다면?

GitHub 연동을 원한다면:
1. GitHub 저장소에 코드 푸시
2. Firebase 콘솔 → App Hosting → GitHub 저장소 연결
3. 자동 빌드/배포 설정

하지만 현재는 **Firebase Hosting (전통 방식)**으로 정상적으로 배포되어 있습니다!

---

**결론**: 제가 배포한 것은 **Firebase Hosting (전통 방식)**이고, App Hosting은 설정하지 않았습니다. App Hosting 설정 페이지가 보이는 것은 Firebase가 새로운 서비스를 제공하는 것이지, 현재 사용 중인 것은 아닙니다.

