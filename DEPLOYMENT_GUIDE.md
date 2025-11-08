# 배포 가이드

## 📋 배포 방법

현재 프로젝트는 **Firebase App Hosting** (GitHub 연동)을 사용하여 배포합니다.

### 배포 구성
- **프론트엔드**: Firebase App Hosting (GitHub 연동, 자동 배포)
- **백엔드**: Firebase Functions (Cloud Functions)
- **데이터베이스**: Firestore
- **스토리지**: Firebase Storage

### ⚠️ 중요 변경사항
- **전통 방식 제거**: Firebase Hosting (전통 방식) 설정 제거됨
- **새로운 방식**: Firebase App Hosting (GitHub 연동) 사용
- **자동 배포**: GitHub에 푸시하면 자동으로 빌드 및 배포

---

## 🚀 배포 절차

### 1. Firebase App Hosting 설정 (최초 1회)

#### Firebase 콘솔에서 설정
1. Firebase 콘솔 접속: https://console.firebase.google.com/project/booksalon-2301f/overview
2. **App Hosting** 메뉴 클릭
3. **Connect repository** 클릭
4. GitHub 인증 및 저장소 선택: `namseokyoo/booksalon_251025`
5. 브랜치 선택: `main`
6. 빌드 설정:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node.js version: `20`
7. 환경 변수 설정 (Firebase 콘솔에서)
8. **Deploy** 클릭

자세한 설정 방법은 `APP_HOSTING_SETUP.md` 참고

### 2. 자동 배포 (일반적인 경우)

#### GitHub에 푸시하면 자동 배포
```bash
# 코드 수정 후
git add .
git commit -m "Update code"
git push origin main
```

**자동으로 실행되는 것:**
1. GitHub에 푸시
2. Firebase App Hosting이 자동으로 감지
3. 빌드 시작 (Firebase 클라우드에서)
4. 배포 완료

### 3. 수동 배포 (Functions, Firestore 등)

**Cloud Functions만 배포:**
```bash
firebase deploy --only functions
```

**Firestore 인덱스만 배포:**
```bash
firebase deploy --only firestore:indexes
```

**Firestore 규칙만 배포:**
```bash
firebase deploy --only firestore:rules
```

**Storage 규칙만 배포:**
```bash
firebase deploy --only storage
```

**전체 배포 (Functions + Firestore + Storage):**
```bash
firebase deploy
```

⚠️ **주의**: 프론트엔드는 `firebase deploy --only hosting`으로 배포하지 않습니다. App Hosting이 자동으로 처리합니다.

### 4. 배포 확인

배포 후 Firebase 콘솔에서 확인:
- **App Hosting**: https://console.firebase.google.com/project/booksalon-2301f/app-hosting
- **Functions**: https://console.firebase.google.com/project/booksalon-2301f/functions
- **Firestore**: https://console.firebase.google.com/project/booksalon-2301f/firestore

배포 상태는 Firebase 콘솔의 App Hosting 페이지에서 확인할 수 있습니다.

---

## 📝 배포 체크리스트

### 배포 전 확인사항
- [ ] `.env.local` 파일이 올바르게 설정되어 있는지 확인
- [ ] `npm run build` 성공 확인
- [ ] `functions` 폴더 빌드 성공 확인
- [ ] Firebase 프로젝트가 올바른지 확인 (`firebase use`)

### 배포 후 확인사항
- [ ] 프론트엔드가 정상적으로 로드되는지 확인
- [ ] Cloud Functions가 정상적으로 배포되었는지 확인
- [ ] Firestore 인덱스가 생성되었는지 확인
- [ ] 관리자 대시보드가 정상 작동하는지 확인

---

## 🔧 주요 배포 명령어

### 전체 배포
```bash
# 빌드 + 배포
npm run build && firebase deploy
```

### Functions만 배포 (개발 중)
```bash
firebase deploy --only functions
```

### Hosting만 배포 (프론트엔드 변경 시)
```bash
npm run build && firebase deploy --only hosting
```

### Firestore 인덱스 배포 (새 인덱스 추가 시)
```bash
firebase deploy --only firestore:indexes
```

---

## 🐛 문제 해결

### 배포 실패 시

1. **빌드 에러 확인**
   ```bash
   npm run build
   ```

2. **Firebase 로그인 확인**
   ```bash
   firebase login
   ```

3. **프로젝트 확인**
   ```bash
   firebase use
   ```

4. **Functions 빌드 확인**
   ```bash
   cd functions
   npm run build
   ```

### Functions 배포 실패 시

1. **의존성 확인**
   ```bash
   cd functions
   npm install
   ```

2. **TypeScript 에러 확인**
   ```bash
   npm run build
   ```

---

## 📊 배포 상태 확인

### 배포된 Functions 확인
```bash
firebase functions:list
```

### Functions 로그 확인
```bash
firebase functions:log
```

### 특정 함수 로그 확인
```bash
firebase functions:log --only aggregateDailyMetrics
```

---

## 🔄 자동 배포 (선택사항)

GitHub Actions를 사용한 자동 배포 설정 예시:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: booksalon-2301f
```

---

**마지막 업데이트**: 2025-01-27

