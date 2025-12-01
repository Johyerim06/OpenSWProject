# Hugging Face Gradio API 연동 가이드

## API 정보

- **엔드포인트**: `POST https://koro277-yolo-api.hf.space/run/predict`
- **요청 필드**: `img` (FormData)
- **응답 구조**:
  ```json
  {
    "data": [
      "base64_image_string",  // data[0]: 결과 이미지 (base64)
      5                       // data[1]: 탐지된 개수
    ]
  }
  ```

## 환경 변수 설정

Vercel에서 환경 변수 설정 (선택사항):

- **Key**: `HF_YOLO_API_URL`
- **Value**: `https://koro277-yolo-api.hf.space/run/predict`
- **Environment**: Production, Preview, Development

기본값으로 이미 설정되어 있으므로 환경 변수 없이도 작동합니다.

## 코드 변경 사항

### `app/api/yolo/route.ts`
- Hugging Face Gradio API 호출로 변경
- FormData 필드명: `image` → `img`
- 응답 파싱: `json.data[0]` (이미지), `json.data[1]` (count)

## 테스트

1. `/yolo-scan` 페이지 접속
2. 카메라로 사진 촬영
3. 객체 탐지 결과 확인
4. 콘솔에서 API 응답 확인

## 문제 해결

### API 응답 구조 확인
브라우저 콘솔에서 `YOLO API 응답:` 로그 확인

### 에러 발생 시
- Hugging Face Spaces가 실행 중인지 확인
- API URL이 정확한지 확인
- CORS 문제가 있는지 확인 (Hugging Face는 일반적으로 허용)

