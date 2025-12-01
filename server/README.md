# YOLO Python 서버

## 설치 방법

1. Python 가상환경 생성 (권장)
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# 또는
source venv/bin/activate  # Mac/Linux
```

2. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

## 모델 파일 위치

`.pt` 파일을 다음 경로에 복사하세요:
```
server/models/best.pt
```

## 서버 실행

```bash
python yolo_server.py
```

서버가 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

- `POST /api/yolo/detect`: 이미지를 받아서 객체 탐지 수행
- `GET /health`: 서버 상태 확인

## 테스트

```bash
curl -X POST http://localhost:8000/api/yolo/detect \
  -F "image=@test_image.jpg"
```

