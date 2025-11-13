// WebRTC 유틸리티 함수 (웹용 - 수신자)

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export async function createWebRTCPeerConnection(
  deviceId: string,
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({
    iceServers: STUN_SERVERS,
    iceCandidatePoolSize: 10, // ICE candidate 풀 크기 증가 (빠른 연결)
  })

  // 원격 스트림 수신 이벤트 처리
  pc.ontrack = (event) => {
    console.log('원격 트랙 수신:', event.track.kind)
    if (event.streams && event.streams[0]) {
      onTrack(event.streams[0])
    }
  }

  // ICE Candidate 이벤트 처리
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('ICE Candidate 생성:', event.candidate)
      onIceCandidate(event.candidate.toJSON())
    } else {
      console.log('ICE Candidate 수집 완료')
    }
  }

  pc.oniceconnectionstatechange = () => {
    console.log('ICE 연결 상태:', pc.iceConnectionState)
  }

  pc.onconnectionstatechange = () => {
    console.log('연결 상태:', pc.connectionState)
  }

  return pc
}

export async function createOffer(
  deviceId: string,
  pc: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: false,
    iceRestart: false, // ICE 재시작 방지 (빠른 연결)
  })
  await pc.setLocalDescription(offer)
  
  console.log('Offer 생성 완료:', offer.type)
  return offer
}

export async function sendOfferToServer(
  deviceId: string,
  offer: RTCSessionDescriptionInit
): Promise<void> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const response = await fetch(`${baseUrl}/api/webrtc/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, offer }),
  })

  if (!response.ok) {
    throw new Error('Offer 전송 실패')
  }
}

export async function sendIceCandidateToServer(
  deviceId: string,
  candidate: RTCIceCandidateInit
): Promise<void> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const response = await fetch(`${baseUrl}/api/webrtc/ice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: `${deviceId}-web`,
      candidate,
      type: 'add',
    }),
  })

  if (!response.ok) {
    console.error('ICE Candidate 전송 실패:', response.status)
  }
}

export async function pollForAnswer(
  deviceId: string,
  pc: RTCPeerConnection,
  onAnswerReceived: (answer: RTCSessionDescriptionInit) => void
): Promise<() => void> {
  let isPolling = true
  let timeoutId: NodeJS.Timeout | null = null

  const poll = async () => {
    if (!isPolling) return

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/webrtc/answer?deviceId=${deviceId}`)
      const result = await response.json()

      if (result.success && result.answer) {
        console.log('Answer 수신:', result.answer.type)
        await pc.setRemoteDescription(new RTCSessionDescription(result.answer))
        onAnswerReceived(result.answer)
        isPolling = false
        if (timeoutId) clearTimeout(timeoutId)
        return
      }
    } catch (error) {
      console.error('Answer 폴링 오류:', error)
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, 200) // 200ms마다 확인 (빠른 응답)
    }
  }

  // 즉시 첫 폴링 실행
  poll()

  return () => {
    isPolling = false
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function pollForIceCandidates(
  deviceId: string,
  pc: RTCPeerConnection,
  type: 'phone' = 'phone'
): Promise<() => void> {
  let isPolling = true
  const processedCandidates = new Set<string>()
  let timeoutId: NodeJS.Timeout | null = null

  const poll = async () => {
    if (!isPolling) return

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/webrtc/ice?deviceId=${deviceId}&type=${type}`)
      const result = await response.json()

      if (result.success && result.candidates) {
        for (const candidate of result.candidates) {
          const candidateKey = JSON.stringify(candidate)
          if (!processedCandidates.has(candidateKey)) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate))
              processedCandidates.add(candidateKey)
              console.log('ICE Candidate 추가:', candidate)
            } catch (error) {
              console.error('ICE Candidate 추가 실패:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('ICE Candidate 폴링 오류:', error)
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, 150) // 150ms마다 확인 (빠른 응답)
    }
  }

  // 즉시 첫 폴링 실행
  poll()

  return () => {
    isPolling = false
    if (timeoutId) clearTimeout(timeoutId)
  }
}

