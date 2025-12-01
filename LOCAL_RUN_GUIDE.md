# 로컬 실행 가이드

## 1. 의존성 설치

```bash
npm install
```

## 2. 개발 서버 실행

### 방법 1: 모든 네트워크에서 접근 가능 (권장)
```bash
npm run dev
```
- URL: `http://localhost:3000`
- 다른 기기에서도 접근 가능 (같은 네트워크)

### 방법 2: 로컬호스트만 접근
```bash
npm run dev:local
```
- URL: `http://localhost:3000`
- 로컬 컴퓨터에서만 접근 가능

## 3. 브라우저에서 접속

개발 서버가 시작되면:
```
http://localhost:3000
```

## 4. 주요 페이지

- `/` - 메인 페이지
- `/yolo-scan` - YOLO 객체 탐지 페이지
- `/barcode-scan` - 바코드 스캔 페이지
- `/payment-success` - 결제 성공 페이지

## 5. 디버깅

브라우저 개발자 도구 (F12) → Console 탭에서 로그 확인:
- `📤 YOLO API로 이미지 전송 중...`
- `📥 API 응답 상태:`
- `📋 YOLO API 응답 데이터:`

## 6. 서버 종료

터미널에서 `Ctrl + C` 누르기

