# 디버깅 가이드

## 브라우저 콘솔에서 확인할 로그

### 1. 이미지 전송 단계
```
📤 YOLO API로 이미지 전송 중...
  - blobSize: 이미지 크기 (KB)
  - blobType: 이미지 타입
```

### 2. API 응답 단계
```
📥 API 응답 상태:
  - status: HTTP 상태 코드
  - statusText: 상태 텍스트
  - ok: 성공 여부
```

### 3. 응답 데이터
```
📋 YOLO API 응답 데이터:
  - success: 성공 여부
  - count: 탐지된 개수
  - hasResultImage: 결과 이미지 존재 여부
  - error: 에러 메시지 (있는 경우)
```

## 서버 로그 (Vercel Functions)

Vercel 대시보드 → Functions → `/api/yolo` → Logs에서 확인:

### 정상 흐름
```
=== YOLO API 요청 시작 ===
📸 이미지 정보: { name, size, type }
🚀 Hugging Face API 호출 시작: [URL]
⏱️ API 응답 시간: [ms]
✅ Hugging Face API 응답: { hasData, dataLength, ... }
📊 파싱된 결과: { count, ... }
✅ 최종 결과: { success: true, count: [숫자] }
```

### 에러 발생 시
```
❌ Hugging Face API 오류: { status, statusText, error }
또는
❌ YOLO API 예외 발생: { error, stack }
```

## 문제 해결

### 1. 이미지가 전송되지 않는 경우
- `blobSize`가 0이거나 매우 작은지 확인
- `blobType`이 올바른 이미지 타입인지 확인

### 2. Hugging Face API 오류
- `status` 코드 확인 (404, 500 등)
- `error` 메시지 확인
- Hugging Face Spaces가 실행 중인지 확인

### 3. 응답 파싱 오류
- `dataLength` 확인 (2개여야 함)
- `dataTypes` 확인 (첫 번째는 string, 두 번째는 number)
- `count` 값이 올바르게 파싱되는지 확인

### 4. count가 0이거나 잘못된 경우
- Hugging Face API 응답의 `data[1]` 값 확인
- 이미지에 객체가 실제로 있는지 확인

## 테스트 방법

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 선택
3. `/yolo-scan` 페이지에서 사진 촬영
4. 콘솔 로그 확인
5. 문제가 있으면 로그 내용을 공유

