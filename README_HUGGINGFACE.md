# Hugging Face Spaces 배포 가이드

## 파일 구조

Hugging Face Spaces에 배포할 때 필요한 파일들:

```
.
├── app.py              # Gradio 앱 메인 파일
├── best.pt            # YOLO 모델 파일
├── requirements.txt   # Python 의존성
└── README.md          # Spaces 설명 (선택사항)
```

## requirements.txt 예시

```
ultralytics>=8.0.0
gradio>=4.31.4
pillow>=10.0.0
opencv-python-headless>=4.8.0
numpy>=1.24.0
```

## 배포 방법

### 1. Hugging Face Spaces 생성

1. https://huggingface.co/spaces 접속
2. "Create new Space" 클릭
3. 설정:
   - **SDK**: Gradio
   - **SDK version**: 4.31.4
   - **Hardware**: CPU (무료) 또는 GPU (유료)
   - **Visibility**: Public 또는 Private

### 2. 파일 업로드

다음 파일들을 업로드:
- `app.py`
- `best.pt` (모델 파일)
- `requirements.txt`

### 3. 자동 배포

Hugging Face가 자동으로:
- 의존성 설치
- 앱 빌드
- 배포

## 팀원 코드 스타일 반영

현재 `app.py`는 팀원 코드의 다음 설정을 반영했습니다:
- `conf=0.13` (신뢰도 임계값)
- `iou=0.4` (IoU 임계값)
- `agnostic_nms=True`
- `augment=True`
- Count 텍스트를 이미지에 추가

## 로컬 테스트

```bash
# 의존성 설치
pip install -r requirements.txt

# 앱 실행
python app.py
```

## 참고사항

- **CPU 사용**: 무료 플랜은 CPU만 사용 가능 (느릴 수 있음)
- **GPU 사용**: 유료 플랜 필요 (더 빠른 추론)
- **모델 크기**: `best.pt` 파일이 크면 업로드 시간이 걸릴 수 있음

