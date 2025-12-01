import { NextResponse } from 'next/server'
import { YOLODetection } from '@/types'

// Hugging Face Gradio API 엔드포인트
const HF_API_URL = process.env.HF_YOLO_API_URL || 'https://koro277-yolo-api.hf.space/run/predict'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { success: false, message: '이미지가 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    // Hugging Face Gradio API 형식에 맞춰 FormData 생성
    // 필드명: 'img' (Gradio 요구사항)
    const hfFormData = new FormData()
    hfFormData.append('img', image)

    // Hugging Face API 호출
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      body: hfFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API 오류:', response.status, errorText)
      throw new Error(`Hugging Face API 요청 실패: ${response.status}`)
    }

    const hfResult = await response.json()

    // Hugging Face Gradio 응답 구조 파싱
    // json.data[0] → base64 이미지
    // json.data[1] → count (탐지 개수)
    const resultImageBase64 = hfResult.data?.[0]
    const count = hfResult.data?.[1] || 0

    // 응답 형식을 기존 YOLODetection과 호환되도록 변환
    return NextResponse.json({
      success: true,
      count: typeof count === 'number' ? count : parseInt(count) || 0,
      objects: [], // Hugging Face API는 객체 상세 정보를 제공하지 않음
      resultImage: resultImageBase64, // base64 이미지 (선택사항)
    } as YOLODetection & { resultImage?: string })
  } catch (error) {
    console.error('YOLO API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: '객체 탐지 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

