"""
Hugging Face Spaces용 Gradio 앱 (팀원 코드 스타일 반영)
"""
import gradio as gr
from ultralytics import YOLO
from PIL import Image
import cv2
import numpy as np
import os

# 모델 경로
MODEL_PATH = "best.pt"

# 모델 로드
print(f"모델 로딩 중: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print("모델 로딩 완료!")

def predict(img):
    """
    YOLO 객체 탐지 수행 (팀원 코드 스타일)
    
    Args:
        img: PIL Image 객체
    
    Returns:
        결과 이미지 (PIL Image)
    """
    # PIL Image를 numpy array로 변환
    img_array = np.array(img)
    
    # RGB를 BGR로 변환 (OpenCV 형식)
    img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # YOLO 예측 실행 (팀원 코드 스타일)
    results = model.predict(
        source=img_cv,
        conf=0.13,        # 팀원 코드 설정
        iou=0.4,         # 팀원 코드 설정
        agnostic_nms=True,
        augment=True,
        verbose=False
    )
    
    # 결과 처리 (팀원 코드 스타일)
    count = len(results[0].boxes)  # 탐지된 개수
    res_plotted = results[0].plot(line_width=3)  # 박스 그려진 이미지
    
    # 좌상단에 개수 텍스트 추가 (팀원 코드 스타일)
    cv2.rectangle(res_plotted, (10, 10), (300, 80), (0, 0, 255), -1)
    cv2.putText(
        res_plotted,
        f"Count: {count}",
        (20, 65),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.8,
        (255, 255, 255),
        3,
        cv2.LINE_AA
    )
    
    # BGR을 RGB로 변환하여 PIL Image로 변환
    res_rgb = cv2.cvtColor(res_plotted, cv2.COLOR_BGR2RGB)
    result_img = Image.fromarray(res_rgb)
    
    return result_img

# Gradio 인터페이스 생성
demo = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil"),
    outputs=gr.Image(type="pil"),
    title="YOLO Object Detection",
    description="객체 탐지 및 개수 카운팅"
)

# 앱 실행
if __name__ == "__main__":
    demo.launch()

