import { NextResponse } from 'next/server'
import { YOLODetection } from '@/types'

// Hugging Face FastAPI 엔드포인트
// 실제 엔드포인트: POST https://koro277-yolo-fastapi.hf.space/predict
const HF_API_URL = process.env.HF_YOLO_API_URL || 'https://koro277-yolo-fastapi.hf.space/predict'
// Hugging Face API 토큰 (환경 변수에서만 가져옴)
const HF_API_TOKEN = process.env.HF_API_TOKEN

export async function POST(request: Request) {
  try {
    console.log('=== YOLO API 요청 시작 ===')
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      console.error('❌ 이미지 파일이 없습니다')
      return NextResponse.json(
        { success: false, message: '이미지가 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    // 이미지 정보 로그
    console.log('📸 이미지 정보:', {
      name: image.name,
      size: `${(image.size / 1024).toFixed(2)} KB`,
      type: image.type,
    })

    // Hugging Face FastAPI 형식에 맞춰 FormData 생성
    // 필드명: 'file' (FastAPI UploadFile 요구사항)
    const hfFormData = new FormData()
    hfFormData.append('file', image)

    console.log('🚀 Hugging Face API 호출 시작:', HF_API_URL)
    const requestStartTime = Date.now()

    // Hugging Face API 호출
    // Gradio API는 일반적으로 토큰이 필요하지 않지만, 필요시 추가 가능
    const headers: HeadersInit = {}
    // 일부 Gradio API는 토큰을 쿼리 파라미터로 받을 수 있음
    // 또는 헤더에 포함할 수도 있음
    
    // 먼저 토큰 없이 시도
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      body: hfFormData,
    })

    const requestDuration = Date.now() - requestStartTime
    console.log(`⏱️ API 응답 시간: ${requestDuration}ms`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Hugging Face API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        {
          success: false,
          message: `Hugging Face API 오류 (${response.status}): ${errorText.substring(0, 200)}`,
          error: errorText,
        },
        { status: response.status }
      )
    }

    const hfResult = await response.json()
    console.log('✅ Hugging Face API 응답:', {
      fullResponse: JSON.stringify(hfResult).substring(0, 500), // 처음 500자만
      keys: Object.keys(hfResult),
    })

    // FastAPI 응답 구조 파싱
    // 응답 형식에 따라 다를 수 있음
    // 일반적으로: { "count": number, "image": base64 또는 URL, ... }
    // 또는: { "data": [base64_image, count] } 형식일 수도 있음
    
    // 다양한 응답 형식 대응
    let resultImageBase64 = null
    let count = 0
    
    if (hfResult.data && Array.isArray(hfResult.data)) {
      // Gradio 형식: { "data": [image, count] }
      resultImageBase64 = hfResult.data[0]
      count = hfResult.data[1] ?? 0
    } else if (hfResult.count !== undefined) {
      // FastAPI 직접 형식: { "count": number, "image": ... }
      count = hfResult.count
      resultImageBase64 = hfResult.image || hfResult.result_image || hfResult.image_url
    } else {
      // 기타 형식 시도
      count = hfResult.count || hfResult.detected_count || 0
      resultImageBase64 = hfResult.image || hfResult.result_image || hfResult.image_url
    }

    console.log('📊 파싱된 결과:', {
      hasImage: !!resultImageBase64,
      imageLength: resultImageBase64?.length || 0,
      count: count,
      countType: typeof count,
    })

    // count 파싱 (다양한 형식 대응)
    let parsedCount = 0
    if (typeof count === 'number') {
      parsedCount = count
    } else if (typeof count === 'string') {
      parsedCount = parseInt(count) || 0
    }

    console.log('✅ 최종 결과:', {
      success: true,
      count: parsedCount,
    })

    // 응답 형식을 기존 YOLODetection과 호환되도록 변환
    return NextResponse.json({
      success: true,
      count: parsedCount,
      objects: [], // Hugging Face API는 객체 상세 정보를 제공하지 않음
      resultImage: resultImageBase64, // base64 이미지 (선택사항)
    } as YOLODetection & { resultImage?: string })
  } catch (error) {
    console.error('❌ YOLO API 예외 발생:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
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

