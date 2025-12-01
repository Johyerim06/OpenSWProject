# Replicate 배포 가이드

## 1. Cog 설치

```bash
pip install cog
```

## 2. Replicate 계정 설정

```bash
# Replicate CLI 설치
pip install replicate

# 로그인
replicate login
```

## 3. 모델 파일 확인

모델 파일이 `models/best.pt`에 있는지 확인하세요.

## 4. 로컬에서 테스트

```bash
# Cog로 로컬 빌드 및 테스트
cog predict -i image=@test_image.jpg
```

## 5. Replicate에 배포

```bash
# 모델 푸시
cog push
```

또는 Replicate 웹사이트에서:
1. https://replicate.com 접속
2. "Create a model" 클릭
3. GitHub 리포지토리 연결
4. 자동으로 빌드 및 배포

## 6. API 사용

배포 후 Replicate API URL을 받게 됩니다:
```
https://api.replicate.com/v1/models/your-username/your-model-name
```

### Next.js에서 사용

`app/api/yolo/route.ts`를 수정하여 Replicate API 사용:

```typescript
const REPLICATE_API_URL = process.env.REPLICATE_API_URL || 'https://api.replicate.com/v1/models/your-username/your-model-name/predictions'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    // 이미지를 base64로 변환
    const imageBuffer = await image.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    
    // Replicate API 호출
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          image: `data:image/jpeg;base64,${imageBase64}`,
          conf: 0.18,
          iou: 0.65,
        }
      }),
    })
    
    const result = await response.json()
    
    // Replicate는 비동기 처리이므로 polling 필요
    // ...
  } catch (error) {
    // 에러 처리
  }
}
```

## 환경 변수 설정

Vercel에서:
- `REPLICATE_API_URL`: Replicate 모델 URL
- `REPLICATE_API_TOKEN`: Replicate API 토큰

## 참고사항

- Replicate는 GPU를 사용하므로 빠른 추론이 가능합니다
- 무료 플랜: 제한적 사용 가능
- 유료 플랜: 더 많은 요청 처리 가능

