'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function YOLOScanPage() {
  const router = useRouter()
  const { 
    setYOLOCount
  } = useStore()
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)
  const [failureCount, setFailureCount] = useState(0)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCount, setManualCount] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 비디오 준비 대기 함수
  const waitForVideoReady = (video: HTMLVideoElement, timeout = 3000) => {
    return new Promise<void>((resolve, reject) => {
      let resolved = false

      const onReady = () => {
        if (resolved) return

        // 실제로 프레임이 들어왔고 사이즈가 있으면 준비된 것
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolved = true
          cleanup()
          resolve()
        }
      }

      const onLoaded = () => onReady()
      const onTimeUpdate = () => onReady()

      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoaded)
        video.removeEventListener('timeupdate', onTimeUpdate)
        video.removeEventListener('playing', onReady)
        if (timer) clearTimeout(timer)
      }

      // 이벤트들로 준비 여부 확인
      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('timeupdate', onTimeUpdate)
      video.addEventListener('playing', onReady)

      // 타임아웃: 준비 안 되면 reject
      const timer = setTimeout(() => {
        if (resolved) return
        cleanup()
        reject(new Error('video ready timeout'))
      }, timeout)

      // 혹시 이미 준비된 상태면 바로 resolve
      onReady()
    })
  }

  // 비디오 재생 시도 함수 (여러 번 재시도)
  const tryPlayVideo = async (video: HTMLVideoElement, tries = 3, delayMs = 200) => {
    for (let i = 0; i < tries; i++) {
      try {
        await video.play()
        return true
      } catch (e) {
        // 재시도: 일부 브라우저는 유저 제스처가 필요하거나 시간이 필요
        await new Promise(r => setTimeout(r, delayMs))
      }
    }
    return false
  }

  // 카메라 중지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      try { videoRef.current.pause() } catch (e) {}
      try { videoRef.current.srcObject = null } catch (e) {}
    }
    setIsCapturing(false)
  }

  // 카메라 시작
  const startCamera = async () => {
    try {
      // 이미 스트림 있을 때는 멈추기 (중복 호출 방지)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
        if (videoRef.current) videoRef.current.srcObject = null
      }

      // 짧은 대기: 이전 정리 안정화
      await new Promise(r => setTimeout(r, 200))

      // 카메라 제약을 너무 빡세게 주면 장치가 못찾을 수 있음 -> 간단히 유지
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      streamRef.current = stream

      // videoRef가 준비될 때까지 대기 (안전장치)
      if (!videoRef.current) {
        // 최대 1초 동안 대기해서 ref가 설정되길 기다림
        const waitForRef = async (timeout = 1000) => {
          const start = Date.now()
          while (!videoRef.current && Date.now() - start < timeout) {
            await new Promise(r => setTimeout(r, 50))
          }
          return !!videoRef.current
        }
        const ok = await waitForRef(1000)
        if (!ok) {
          console.warn('videoRef가 1초 동안 준비되지 않았습니다. 계속 진행합니다.')
        }
      }

      if (!videoRef.current) {
        console.warn('videoRef 없음')
        setIsCapturing(false)
        return
      }

      const video = videoRef.current

      // 디버그 로그
      console.log('videoRef.current:', videoRef.current)
      if (video) {
        console.log('video size:', video.videoWidth, video.videoHeight)
      }
      console.log('streamRef:', streamRef.current)

      // autoplay 정책 회피용 설정
      video.muted = true
      video.playsInline = true
      video.setAttribute('playsinline', 'true') // iOS 필요
      video.srcObject = stream

      // onloadedmetadata로 메타데이터 로딩을 기다렸다가 play 시도
      try {
        await waitForVideoReady(video, 3500) // 3.5초 기다림
      } catch (e) {
        console.warn('waitForVideoReady 실패:', e)
      }

      const played = await tryPlayVideo(video, 5, 250) // 최대 5회 재시도

      if (!played) {
        console.warn('video.play() 여러번 시도했지만 실패')
        // 그래도 UI는 카메라가 켜짐으로 표시하거나 안내문 띄우기
      }

      // 안전 장치: video width/height 확인. 0이면 로그 출력
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('video 크기 0: video.videoWidth/Height', video.videoWidth, video.videoHeight)
      }

      setIsCapturing(true)
    } catch (err: any) {
      console.error('startCamera 실패:', err)
      // 에러 종류별 안내
      if (err && err.name === 'NotAllowedError') {
        alert('카메라 권한이 거부되었습니다. 브라우저 설정에서 권한 허용 후 다시 시도하세요.')
      } else if (err && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')) {
        alert('카메라를 찾을 수 없습니다. 다른 카메라를 연결하거나 제약을 완화해 보세요.')
      } else {
        alert('카메라 실행 중 오류가 발생했습니다. 콘솔을 확인하세요.')
      }
      setIsCapturing(false)
    }
  }

  // 사진 촬영
  const capturePhoto = async () => {
    let imageData: string | null = null

    // 로컬 카메라 사용
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        imageData = canvas.toDataURL('image/jpeg', 0.9)
      }

      // 로컬 카메라 중지
      stopCamera()
    }

    if (imageData) {
      setCapturedImage(imageData)
      // 사진 촬영 후 자동으로 YOLO API로 전송
      await processImageWithData(imageData)
    }
  }

  // 이미지 데이터로 YOLO 처리
  const processImageWithData = async (imageData: string) => {
    setIsProcessing(true)
    try {
      // base64 이미지를 Blob으로 변환
      const response = await fetch(imageData)
      const blob = await response.blob()

      // FormData 생성
      const formData = new FormData()
      formData.append('image', blob, 'cart-image.jpg')

      console.log('📤 YOLO API로 이미지 전송 중...', {
        blobSize: `${(blob.size / 1024).toFixed(2)} KB`,
        blobType: blob.type,
      })

      // YOLO API 호출
      const apiResponse = await fetch('/api/yolo', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 API 응답 상태:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        ok: apiResponse.ok,
      })

      const result = await apiResponse.json()

      console.log('📋 YOLO API 응답 데이터:', {
        success: result.success,
        count: result.count,
        hasResultImage: !!result.resultImage,
        error: result.error,
        message: result.message,
        fullResponse: result,
      })

      if (result.success) {
        // 0개 탐지 시 수동 입력 팝업 표시
        if (result.count === 0) {
          setDetectedCount(0)
          setIsProcessing(false)
          setShowManualInput(true)
          return
        }
        
        setDetectedCount(result.count)
        setYOLOCount(result.count)
        setFailureCount(0) // 성공 시 실패 횟수 리셋
        console.log(`YOLO 탐지 완료: ${result.count}개 상품 발견`)
        // 다음 페이지로 이동
        setTimeout(() => {
          router.push('/barcode-scan')
        }, 1500)
      } else {
        console.error('YOLO 탐지 실패:', result.message)
        const newFailureCount = failureCount + 1
        setFailureCount(newFailureCount)
        
        if (newFailureCount >= 3) {
          // 3번 실패 시 수동 입력 팝업 표시
          setIsProcessing(false)
          setShowManualInput(true)
        } else {
          alert(`상품 탐지 중 오류가 발생했습니다 (${newFailureCount}/3): ${result.message || '알 수 없는 오류'}`)
        setIsProcessing(false)
          // 오류 발생 시 촬영된 이미지 리셋하고 카메라 다시 시작
          setCapturedImage(null)
          setDetectedCount(null)
          await startCamera()
        }
      }
    } catch (error) {
      console.error('YOLO API 오류:', error)
      const newFailureCount = failureCount + 1
      setFailureCount(newFailureCount)
      
      if (newFailureCount >= 3) {
        // 3번 실패 시 수동 입력 팝업 표시
        setIsProcessing(false)
        setShowManualInput(true)
      } else {
        alert(`상품 탐지 중 오류가 발생했습니다 (${newFailureCount}/3)`)
      setIsProcessing(false)
        // 오류 발생 시 촬영된 이미지 리셋하고 카메라 다시 시작
        setCapturedImage(null)
        setDetectedCount(null)
        await startCamera()
      }
    }
  }

  // YOLO API로 이미지 전송
  const processImage = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    try {
      // base64 이미지를 Blob으로 변환
      const response = await fetch(capturedImage)
      const blob = await response.blob()

      // FormData 생성
      const formData = new FormData()
      formData.append('image', blob, 'cart-image.jpg')

      // YOLO API 호출
      const apiResponse = await fetch('/api/yolo', {
        method: 'POST',
        body: formData,
      })

      const result = await apiResponse.json()

      if (result.success) {
        // 0개 탐지 시 수동 입력 팝업 표시
        if (result.count === 0) {
          setDetectedCount(0)
          setIsProcessing(false)
          setShowManualInput(true)
          return
        }
        
        setDetectedCount(result.count)
        setYOLOCount(result.count)
        setFailureCount(0) // 성공 시 실패 횟수 리셋
        // 다음 페이지로 이동
        setTimeout(() => {
          router.push('/barcode-scan')
        }, 1500)
      } else {
        const newFailureCount = failureCount + 1
        setFailureCount(newFailureCount)
        
        if (newFailureCount >= 3) {
          // 3번 실패 시 수동 입력 팝업 표시
          setIsProcessing(false)
          setShowManualInput(true)
        } else {
          alert(`상품 탐지 중 오류가 발생했습니다 (${newFailureCount}/3): ${result.message || '알 수 없는 오류'}`)
          setIsProcessing(false)
          // 오류 발생 시 촬영된 이미지 리셋하고 카메라 다시 시작
          setCapturedImage(null)
          setDetectedCount(null)
          await startCamera()
        }
      }
    } catch (error) {
      console.error('YOLO 처리 오류:', error)
      const newFailureCount = failureCount + 1
      setFailureCount(newFailureCount)
      
      if (newFailureCount >= 3) {
        // 3번 실패 시 수동 입력 팝업 표시
      setIsProcessing(false)
        setShowManualInput(true)
        } else {
        alert('상품 탐지 중 오류가 발생했습니다.')
        setIsProcessing(false)
        // 오류 발생 시 촬영된 이미지 리셋하고 카메라 다시 시작
        setCapturedImage(null)
        setDetectedCount(null)
        await startCamera()
      }
    }
  }


  // 다시 촬영
  const retakePhoto = async () => {
    // 상태 먼저 리셋
    setCapturedImage(null)
    setDetectedCount(null)
    setIsProcessing(false)
    
    // 상태 업데이트 안정화 위해 짧게 지연
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 카메라 재시작 대기
    await startCamera()
  }

  // 수동 입력 확인
  const handleManualInput = () => {
    const count = parseInt(manualCount)
    if (isNaN(count) || count < 0) {
      alert('올바른 숫자를 입력해주세요.')
      return
    }

    setDetectedCount(count)
    setYOLOCount(count)
    setShowManualInput(false)
    setFailureCount(0)
    setManualCount('')
        
    // 다음 페이지로 이동
        setTimeout(() => {
      router.push('/barcode-scan')
    }, 1500)
  }

  // 수동 입력 취소
  const handleCancelManualInput = () => {
    setShowManualInput(false)
    setManualCount('')
    // 다시 촬영 화면으로
    retakePhoto()
      }
      
  // 컴포넌트 마운트 시 카메라 자동 시작
  useEffect(() => {
    startCamera()
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
    }
  }, [])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 md:px-7 py-6 sm:py-10 md:py-16 lg:py-20">
        {/* 헤더 영역 */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-[1420px] mb-4 sm:mb-6 md:mb-8 gap-4 sm:gap-0">
          {/* 타이틀 */}
          <h1 
            className="text-3xl sm:text-4xl md:text-[52px] font-semibold leading-tight sm:leading-[62px] tracking-[-2px] text-center flex-1 font-[var(--font-poppins)]"
            style={{ 
              color: '#090914'
            }}
          >
            결제를 시작합니다.
          </h1>

          {/* 사진 촬영하기 버튼 */}
          {!capturedImage && (
            <button
              onClick={capturePhoto}
              disabled={isProcessing || !isCapturing}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-[10px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg"
              style={{ 
                backgroundColor: '#18181b',
                color: '#ffffff'
              }}
            >
              <span 
                className="font-bold leading-6 font-[var(--font-plus-jakarta-sans)]"
              >
                사진 촬영하기
              </span>
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
              >
                <path 
                  d="M9 1.5L10.5 3L9 4.5M3 9L1.5 10.5L3 12M15 9L16.5 10.5L15 12M9 16.5L10.5 15L9 13.5M4.5 3L3 1.5L1.5 3M16.5 3L15 1.5L13.5 3M4.5 15L3 16.5L1.5 15M16.5 15L15 16.5L13.5 15" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Form 영역 (카메라/이미지 표시) */}
        <div 
          className="w-full max-w-[1364px] rounded-[20px] overflow-hidden mx-auto"
          style={{ 
            backgroundColor: '#ffffff',
            aspectRatio: '1364/600'
          }}
        >
          {!capturedImage ? (
            // 카메라 미리보기 - video를 항상 렌더하여 ref가 항상 존재하도록
            <div className="relative w-full h-full bg-black flex items-center justify-center" style={{ aspectRatio: '1364/600' }}>
                  <video
                ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                className="w-full h-full object-cover"
                    style={{ 
                  opacity: isCapturing ? 1 : 0,
                  transition: 'opacity 160ms ease'
                }}
              />
              {/* isCapturing이 false일 때 보여줄 플레이스홀더 */}
              {!isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-medium">카메라 준비중...</div>
                </div>
              )}
            </div>
          ) : (
            // 촬영된 이미지 표시
            <div className="relative w-full h-full bg-black flex items-center justify-center" style={{ aspectRatio: '1364/600' }}>
              <img
                src={capturedImage}
                alt="촬영된 장바구니"
                className="w-full h-full object-contain"
              />
              
              {/* 처리 중 오버레이 */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-xl font-semibold">
                    상품 탐지 중...
                  </div>
                </div>
              )}

              {/* 탐지 결과 표시 */}
              {detectedCount !== null && !isProcessing && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                  탐지된 상품: {detectedCount}개
                </div>
              )}
            </div>
          )}
        </div>

        {/* 숨겨진 canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 수동 입력 팝업 */}
      {showManualInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">상품 개수 직접 입력</h2>
            <p className="text-gray-600 mb-6 text-center">
              {detectedCount === 0 || detectedCount === null ? (
                <>
                  탐지된 상품이 없습니다.<br />
                  결제하실 상품 개수를 입력해주세요.
                </>
              ) : (
                <>
                  자동 탐지가 3번 실패했습니다.<br />
                  상품 개수를 직접 입력해주세요.
                </>
              )}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">상품 개수</label>
              <input
                type="number"
                min="0"
                value={manualCount}
                onChange={(e) => setManualCount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-black focus:outline-none focus:ring-2 focus:ring-[#18181b]"
                placeholder="숫자를 입력하세요"
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCancelManualInput}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleManualInput}
                className="flex-1 px-6 py-3 bg-[#18181b] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

