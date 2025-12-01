import os
from typing import Any
import cog
from ultralytics import YOLO
from PIL import Image
import numpy as np
import cv2

class Predictor(cog.Predictor):
    def setup(self):
        """모델 로드 (한 번만 실행됨)"""
        model_path = os.path.join(os.path.dirname(__file__), "models", "best.pt")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {model_path}")
        
        print(f"모델 로딩 중: {model_path}")
        self.model = YOLO(model_path)
        print("모델 로딩 완료!")

    @cog.input("image", type=cog.Path, help="입력 이미지")
    @cog.input("conf", type=float, default=0.13, help="신뢰도 임계값")
    @cog.input("iou", type=float, default=0.4, help="IoU 임계값")
    def predict(self, image: str, conf: float = 0.13, iou: float = 0.4) -> Any:
        """
        YOLO 객체 탐지 수행 (팀원 코드 스타일)
        
        Args:
            image: 입력 이미지 경로
            conf: 신뢰도 임계값 (기본값: 0.13)
            iou: IoU 임계값 (기본값: 0.4)
        
        Returns:
            탐지된 객체 개수와 상세 정보, 결과 이미지 경로
        """
        # 이미지 읽기 (팀원 코드 스타일: cv2.imread 사용)
        img_cv = cv2.imread(image)
        if img_cv is None:
            # PIL로 읽어서 cv2 형식으로 변환
            pil_image = Image.open(image)
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            img_array = np.array(pil_image)
            img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # YOLO 예측 실행 (팀원 코드 스타일)
        results = self.model.predict(
            source=img_cv,
            conf=conf,
            iou=iou,
            agnostic_nms=True,
            augment=True,
            verbose=False
        )
        
        # 결과 처리 (팀원 코드 스타일)
        boxes = results[0].boxes
        count = len(boxes)  # 탐지된 개수
        
        # 박스 그려진 이미지 (팀원 코드 스타일)
        res_plotted = results[0].plot(line_width=3)
        
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
        
        # 결과 이미지 저장
        output_path = "/tmp/result.jpg"
        cv2.imwrite(output_path, res_plotted)
        
        # 각 박스 정보 추출
        detected_objects = []
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            label = results[0].names[class_id] if hasattr(results[0], 'names') else f'class_{class_id}'
            
            detected_objects.append({
                'label': label,
                'confidence': confidence,
                'bbox': [x1, y1, x2, y2]
            })
        
        # 결과 반환 (이미지 경로 포함)
        return {
            'success': True,
            'count': count,
            'objects': detected_objects,
            'result_image': output_path
        }

