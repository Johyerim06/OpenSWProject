# Hugging Face Spaces 503 에러 해결 가이드

## 에러 의미

```
503 Service Unavailable
'Your space is in error, check its status on hf.co'
```

이 에러는 **Hugging Face Spaces가 실행 중이 아니거나 에러 상태**라는 의미입니다.

## 가능한 원인

### 1. Spaces 코드에 오류가 있음
- `app.py` 파일에 문법 오류나 런타임 오류
- 의존성 설치 실패
- 모델 파일을 찾을 수 없음

### 2. Spaces가 시작되지 않음
- Spaces가 자동으로 재시작되지 않음
- 리소스 부족 (메모리, 디스크 등)

### 3. 모델 파일 문제
- `best.pt` 파일이 없거나 손상됨
- 파일 경로가 잘못됨

## 해결 방법

### 1. Spaces 상태 확인
1. https://huggingface.co/spaces/koro277/yolo-api 접속
2. Spaces 상태 확인:
   - "Running" (정상)
   - "Error" (에러 상태)
   - "Building" (빌드 중)
   - "Paused" (일시정지)

### 2. Spaces 로그 확인
1. Spaces 페이지에서 "Logs" 탭 클릭
2. 에러 메시지 확인:
   - 모델 파일을 찾을 수 없다는 오류?
   - 의존성 설치 실패?
   - 코드 문법 오류?

### 3. Spaces 재시작
1. Spaces 페이지에서 "Restart" 버튼 클릭
2. 빌드가 완료될 때까지 대기 (몇 분 소요)

### 4. 코드 확인
`app.py` 파일이 올바른지 확인:
- FastAPI 코드가 올바른지
- 모델 파일 경로가 맞는지
- 의존성이 `requirements.txt`에 모두 포함되어 있는지

## 일반적인 문제

### 문제 1: 모델 파일을 찾을 수 없음
```
FileNotFoundError: best.pt
```
**해결**: `best.pt` 파일이 Spaces에 업로드되어 있는지 확인

### 문제 2: 의존성 설치 실패
```
ModuleNotFoundError: No module named 'ultralytics'
```
**해결**: `requirements.txt`에 모든 의존성이 포함되어 있는지 확인

### 문제 3: FastAPI 코드 오류
**해결**: `app.py` 파일의 문법과 로직 확인

## 확인 체크리스트

- [ ] Spaces가 "Running" 상태인가?
- [ ] `best.pt` 파일이 Spaces에 업로드되어 있는가?
- [ ] `requirements.txt`에 모든 의존성이 있는가?
- [ ] `app.py` 코드에 문법 오류가 없는가?
- [ ] Spaces 로그에 에러 메시지가 있는가?

## 다음 단계

1. Spaces 페이지에서 로그 확인
2. 에러 메시지에 따라 코드 수정
3. Spaces 재시작
4. 다시 테스트

