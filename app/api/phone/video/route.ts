import { NextResponse } from 'next/server'

// 핸드폰에서 전송한 비디오 프레임을 저장하는 메모리 스토어
const videoFrames = new Map<string, { imageData: string; timestamp: number }>()

export async function POST(request: Request) {
  try {
    const { deviceId, imageData } = await request.json()

    console.log('비디오 프레임 POST 요청 수신:', { deviceId, imageDataLength: imageData?.length })

    if (!deviceId || !imageData) {
      console.error('비디오 프레임 POST 요청 실패: 필수 파라미터 누락', { deviceId: !!deviceId, imageData: !!imageData })
      return NextResponse.json(
        { success: false, message: 'deviceId와 imageData가 필요합니다.' },
        { status: 400 }
      )
    }

    // 비디오 프레임 저장 (최신 프레임만 유지)
    videoFrames.set(deviceId, {
      imageData,
      timestamp: Date.now(),
    })

    console.log('비디오 프레임 저장 완료:', { deviceId, frameCount: videoFrames.size })

    return NextResponse.json({
      success: true,
      message: '비디오 프레임이 저장되었습니다.',
    })
  } catch (error) {
    console.error('비디오 프레임 저장 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: '비디오 프레임 저장 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get('deviceId')

  console.log('비디오 프레임 GET 요청:', { deviceId, frameCount: videoFrames.size })

  if (!deviceId) {
    console.error('비디오 프레임 GET 요청 실패: deviceId 누락')
    return NextResponse.json(
      { success: false, message: 'deviceId가 필요합니다.' },
      { status: 400 }
    )
  }

  const frameData = videoFrames.get(deviceId)

  if (!frameData) {
    console.warn('비디오 프레임을 찾을 수 없음:', { deviceId, availableDevices: Array.from(videoFrames.keys()) })
    return NextResponse.json(
      { success: false, message: '비디오 프레임을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  // 5초 이상 지난 프레임은 삭제
  const age = Date.now() - frameData.timestamp
  if (age > 5 * 1000) {
    console.warn('비디오 프레임 만료:', { deviceId, age })
    videoFrames.delete(deviceId)
    return NextResponse.json(
      { success: false, message: '비디오 프레임이 만료되었습니다.' },
      { status: 404 }
    )
  }

  console.log('비디오 프레임 반환:', { deviceId, age })
  return NextResponse.json({
    success: true,
    imageData: frameData.imageData,
  })
}

