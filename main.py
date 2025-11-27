import requests
import csv
import time

# --- 설정 부분 ---
API_KEY = "f2797176abec4d40b13c"
SERVICE_ID = "C005"
DATA_TYPE = "json"
CSV_FILE = "barcode_product.csv"

START_IDX = 1
END_IDX = 100  # 페이지당 요청 개수 조절 가능

BASE_URL = f"http://openapi.foodsafetykorea.go.kr/api/{API_KEY}/{SERVICE_ID}/{DATA_TYPE}"

# --- CSV 헤더 생성 ---
with open(CSV_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["BAR_CD", "PRDLST_NM", "BSSH_NM", "PRDLST_DCNM", "POG_DAYCNT"])

# --- 요청 + CSV 저장 함수 ---
def fetch_and_save(start, end, retries=3):
    url = f"{BASE_URL}/{start}/{end}"
    print(f"요청 URL: {url}")

    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=10)
            print(f"HTTP 상태 코드: {response.status_code}")

            # 응답 내용 미리 보기
            print("응답 내용 (앞 300자):")
            print(response.text[:300])
            print("-" * 50)

            # 빈 응답인지 확인
            if not response.text.strip():
                print("빈 응답 → 재시도")
                time.sleep(3)
                continue

            # HTML 응답인지 확인
            if response.text.strip().startswith("<"):
                print("HTML 응답 감지 → API 서버 에러 또는 점검 중")
                time.sleep(3)
                continue

            # JSON 파싱
            try:
                data = response.json()
            except ValueError:
                print("JSON 변환 실패 → 재시도")
                time.sleep(3)
                continue

            # API 에러 메시지 확인
            if "RESULT" in data:
                print("API 오류:", data["RESULT"])
                return False

            # 정상 데이터 추출
            items = data.get(SERVICE_ID, {}).get("row", [])
            if not items:
                print("데이터 없음 (종료)")
                return False

            # CSV 저장
            with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                for item in items:
                    writer.writerow([
                        item.get("BAR_CD", ""),
                        item.get("PRDLST_NM", ""),
                        item.get("BSSH_NM", ""),
                        item.get("PRDLST_DCNM", ""),
                        item.get("POG_DAYCNT", "")
                    ])

            print(f"{len(items)}개 저장 완료!")
            return True

        except requests.exceptions.RequestException as e:
            print(f"요청 오류 발생: {e} → 재시도")
            time.sleep(3)

    print("모든 재시도 실패 → 다음 범위로 이동")
    return False


# --- 메인 루프 ---
current_start = START_IDX
current_end = END_IDX

while True:
    print(f"\n데이터 요청 범위: {current_start} ~ {current_end}")
    success = fetch_and_save(current_start, current_end)

    if not success:
        print("수집 종료")
        break

    # 다음 구간으로 이동
    step = END_IDX - START_IDX + 1
    current_start += step
    current_end += step

    time.sleep(1)
