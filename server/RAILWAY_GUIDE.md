# Railway 배포 가이드 (단계별)

## 방법 1: Railway 웹 대시보드 사용 (추천) ⭐

### 1단계: Railway 계정 생성
1. https://railway.app 접속
2. "Start a New Project" 클릭
3. GitHub 계정으로 로그인

### 2단계: 프로젝트 연결
1. "Deploy from GitHub repo" 선택
2. `openSWProject` 리포지토리 선택
3. "Deploy Now" 클릭

### 3단계: 서버 폴더 설정
1. Railway 대시보드에서 프로젝트 클릭
2. Settings → Root Directory 설정
3. Root Directory를 `server`로 변경
4. Save 클릭

### 4단계: 환경 변수 설정 (선택사항)
- Railway는 자동으로 `PORT` 환경 변수를 설정합니다
- 추가 환경 변수가 필요하면 Settings → Variables에서 설정

### 5단계: 배포 확인
1. Deployments 탭에서 배포 상태 확인
2. 배포 완료 후 "View Logs"에서 로그 확인
3. "Generate Domain" 클릭하여 URL 생성 (예: `https://yolo-server.railway.app`)

### 6단계: Vercel 환경 변수 설정
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 새 환경 변수 추가:
   - **Key**: `YOLO_API_URL`
   - **Value**: `https://your-railway-url.railway.app/api/yolo/detect`
   - **Environment**: Production, Preview, Development 모두 선택
3. Save 후 재배포

---

## 방법 2: Railway CLI 사용

### 1단계: Railway CLI 설치
```bash
npm install -g @railway/cli
```

### 2단계: 로그인
```bash
railway login
```

### 3단계: 프로젝트 초기화
```bash
cd server
railway init
```

### 4단계: 배포
```bash
railway up
```

### 5단계: 도메인 생성
```bash
railway domain
```

---

## 배포 후 확인

### Health Check
브라우저에서 접속:
```
https://your-railway-url.railway.app/health
```

예상 응답:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### 로그 확인
Railway 대시보드 → Deployments → View Logs에서 실시간 로그 확인

---

## 문제 해결

### 모델 파일이 없다는 오류
- `server/models/best.pt` 파일이 Git에 포함되어 있는지 확인
- `.gitignore`에서 `*.pt`가 제외되어 있지 않은지 확인

### 포트 오류
- Railway는 자동으로 `PORT` 환경 변수를 설정합니다
- 코드에서 `os.environ.get('PORT', 8000)` 사용 확인

### 메모리 부족
- Railway 무료 플랜: 512MB RAM
- 모델이 크면 유료 플랜 필요할 수 있음

---

## 비용
- **무료 플랜**: $5 크레딧/월 (충분함)
- **유료 플랜**: 필요시 업그레이드

