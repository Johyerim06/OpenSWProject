import requests

API_KEY = "f2797176abec4d40b13c"
SERVICE_ID = "C005"
BASE_URL = f"http://openapi.foodsafetykorea.go.kr/api/{API_KEY}/{SERVICE_ID}/json"

url = f"{BASE_URL}/1/5"
print("요청 URL:", url)

response = requests.get(url, timeout=10)
print("HTTP 상태 코드:", response.status_code)

print("\n===== 응답 내용 전체 출력 =====")
print(response.text)
print("================================\n")

# JSON 테스트
try:
    data = response.json()
    print("JSON 파싱 성공!")
    print(data)
except Exception as e:
    print("JSON 파싱 실패:", e)
