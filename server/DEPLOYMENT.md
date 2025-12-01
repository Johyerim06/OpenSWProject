# Python YOLO 서버 배포 가이드

## 배포 옵션

### 1. Railway (추천) ⭐
- **무료 플랜**: $5 크레딧/월
- **장점**: 간단한 설정, 자동 배포, 무료 SSL
- **URL**: https://railway.app

**배포 방법:**
1. Railway에 GitHub 계정 연결
2. 새 프로젝트 생성 → GitHub 리포지토리 연결
3. `server/` 폴더를 루트로 설정
4. 환경 변수 설정:
   - `PORT` (자동 설정됨)
5. 배포 완료 후 URL 복사 (예: `https://your-app.railway.app`)

### 2. Render
- **무료 플랜**: 750시간/월
- **장점**: 무료 플랜 제공, 쉬운 설정
- **URL**: https://render.com

**배포 방법:**
1. Render에 GitHub 계정 연결
2. 새 Web Service 생성
3. 설정:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python yolo_server.py`
   - Environment: `Python 3`
4. 배포 완료 후 URL 복사

### 3. Fly.io
- **무료 플랜**: 3개 VM, 3GB 스토리지
- **장점**: 전 세계 CDN, 빠른 속도
- **URL**: https://fly.io

### 4. AWS EC2 / Lightsail
- **유료**: 시간당 과금
- **장점**: 완전한 제어권
- **단점**: 설정 복잡, 비용 발생

## Vercel 환경 변수 설정

배포된 Python 서버 URL을 Vercel 환경 변수로 설정:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 추가:
   - **Key**: `YOLO_API_URL`
   - **Value**: `https://your-python-server.railway.app/api/yolo/detect`
   - **Environment**: Production, Preview, Development 모두 선택

## 로컬 개발

로컬에서는 `.env.local` 파일 사용:

```env
YOLO_API_URL=http://localhost:8000/api/yolo/detect
```

## Railway 배포 예시 (상세)

### 1. Railway 프로젝트 생성
```bash
# Railway CLI 설치 (선택사항)
npm i -g @railway/cli

# 또는 웹에서 직접 생성
```

### 2. `server/Procfile` 생성 (Railway용)
```
web: python yolo_server.py
```

### 3. `server/railway.json` 생성 (선택사항)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python yolo_server.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. 포트 설정 수정
Railway는 동적 포트를 사용하므로 `yolo_server.py` 수정 필요:

```python
import os

PORT = int(os.environ.get('PORT', 8000))
app.run(host='0.0.0.0', port=PORT, debug=False)
```

## 모니터링

배포 후 확인:
- Health Check: `https://your-server.railway.app/health`
- 로그 확인: Railway/Render 대시보드에서 실시간 로그 확인

