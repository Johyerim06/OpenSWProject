FROM python:3.11-slim

WORKDIR /app

# requirements 먼저 복사
COPY requirements.txt .

# pip 업그레이드 (torch 설치에 필요)
RUN pip install --upgrade pip

# requirements 설치
RUN pip install --no-cache-dir -r requirements.txt

# 전체 코드 복사
COPY . .

# 포트 설정
EXPOSE 8000

# 서버 실행
CMD ["python", "yolo_server.py"]
