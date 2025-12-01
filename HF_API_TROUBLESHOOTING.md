# Hugging Face API 404 오류 해결 가이드

## 문제
```
❌ Hugging Face API 오류: {
  status: 404,
  statusText: 'Not Found',
  error: '{"detail":"Not Found"}'
}
```

## 가능한 원인

### 1. Spaces가 실행 중이 아님
- Hugging Face Spaces 대시보드에서 Spaces가 "Running" 상태인지 확인
- Spaces가 슬립 모드에 있을 수 있음 (첫 요청 시 깨어나는 데 시간 소요)

### 2. 엔드포인트 경로가 잘못됨
Gradio API 엔드포인트는 버전에 따라 다를 수 있습니다:
- `/api/predict/` (Gradio API v1)
- `/run/predict` (Gradio API v2)
- `/api/` (일부 버전)

### 3. Spaces 이름이 잘못됨
- Spaces URL이 정확한지 확인: `https://koro277-yolo-api.hf.space`
- Hugging Face 대시보드에서 실제 Spaces URL 확인

## 해결 방법

### 방법 1: Spaces 상태 확인
1. https://huggingface.co/spaces 접속
2. `koro277-yolo-api` Spaces 확인
3. "Running" 상태인지 확인
4. 실행 중이 아니면 "Restart" 클릭

### 방법 2: 올바른 엔드포인트 확인
Spaces 페이지에서 "API" 탭 확인:
- 예시: `https://koro277-yolo-api.hf.space/api/predict/`
- 또는: `https://koro277-yolo-api.hf.space/run/predict`

### 방법 3: 직접 테스트
브라우저에서 Spaces 페이지 접속:
```
https://koro277-yolo-api.hf.space
```
- 웹 인터페이스가 작동하는지 확인
- 작동하면 API도 작동해야 함

### 방법 4: 환경 변수로 다른 엔드포인트 시도
`.env.local` 파일 생성:
```env
HF_YOLO_API_URL=https://koro277-yolo-api.hf.space/api/predict/
```
또는
```env
HF_YOLO_API_URL=https://koro277-yolo-api.hf.space/run/predict
```

## 코드 수정

현재 코드는 `/api/predict/` 엔드포인트를 사용하도록 수정되었습니다.
다른 엔드포인트가 필요하면 `HF_YOLO_API_URL` 환경 변수로 변경 가능합니다.

