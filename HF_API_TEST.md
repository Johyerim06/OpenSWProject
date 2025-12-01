# Hugging Face API 테스트 가이드

## 현재 설정

- **엔드포인트**: `https://koro277-yolo-api.hf.space/run/predict`
- **요청 필드**: `img` (FormData)
- **응답 구조**: `json.data[0]` (base64 이미지), `json.data[1]` (count)

## 404 오류 해결 방법

### 1. Spaces 상태 확인
브라우저에서 직접 접속:
```
https://koro277-yolo-api.hf.space
```
- 웹 인터페이스가 작동하는지 확인
- 작동하지 않으면 Spaces가 실행 중이 아님

### 2. 올바른 엔드포인트 확인
Spaces 페이지에서:
1. "API" 탭 클릭
2. 실제 API 엔드포인트 확인
3. 예시 코드에서 정확한 URL 확인

### 3. curl로 직접 테스트
```bash
curl -X POST https://koro277-yolo-api.hf.space/run/predict \
  -F "img=@test_image.jpg"
```

### 4. 다른 엔드포인트 시도
환경 변수로 다른 엔드포인트 시도:
```env
HF_YOLO_API_URL=https://koro277-yolo-api.hf.space/api/predict/
```
또는
```env
HF_YOLO_API_URL=https://koro277-yolo-api.hf.space/api/
```

## 가능한 문제

1. **Spaces 이름이 잘못됨**
   - 실제 Spaces 이름 확인: `koro277/yolo-api` 또는 다른 이름?
   
2. **Spaces가 Private**
   - Private Spaces는 토큰이 필요할 수 있음
   - 토큰을 헤더에 추가해야 할 수도 있음

3. **엔드포인트 경로가 다름**
   - Gradio 버전에 따라 엔드포인트가 다를 수 있음
   - `/run/predict`, `/api/predict/`, `/api/` 등

## 다음 단계

1. Spaces 웹 인터페이스가 작동하는지 확인
2. Spaces의 실제 API 문서 확인
3. 올바른 엔드포인트로 수정
4. 필요시 토큰 추가

