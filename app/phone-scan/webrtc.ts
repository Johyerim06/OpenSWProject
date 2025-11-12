// WebRTC 유틸리티 함수 (핸드폰용 - 송신자)

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export async function createWebRTCPeerConnection(
  deviceId: string,
  localStream: MediaStream,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({
    iceServers: STUN_SERVERS,
  })

  // 로컬 스트림의 모든 트랙을 PeerConnection에 추가
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream)
    console.log('트랙 추가:', track.kind, track.label)
  })

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

export async function createAnswer(
  deviceId: string,
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  await pc.setRemoteDescription(new RTCSessionDescription(offer))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  
  console.log('Answer 생성 완료:', answer.type)
  return answer
}

export async function sendAnswerToServer(
  deviceId: string,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const response = await fetch(`${baseUrl}/api/webrtc/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, answer }),
  })

  if (!response.ok) {
    throw new Error('Answer 전송 실패')
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
      deviceId: `${deviceId}-phone`,
      candidate,
      type: 'add',
    }),
  })

  if (!response.ok) {
    console.error('ICE Candidate 전송 실패:', response.status)
  }
}

export async function pollForOffer(
  deviceId: string,
  onOfferReceived: (offer: RTCSessionDescriptionInit) => void
): Promise<() => void> {
  let isPolling = true

  const poll = async () => {
    if (!isPolling) return

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/webrtc/offer?deviceId=${deviceId}`)
      const result = await response.json()

      if (result.success && result.offer) {
        console.log('Offer 수신:', result.offer.type)
        onOfferReceived(result.offer)
        isPolling = false
        return
      }
    } catch (error) {
      console.error('Offer 폴링 오류:', error)
    }

    if (isPolling) {
      setTimeout(poll, 1000) // 1초마다 확인
    }
  }

  poll()

  return () => {
    isPolling = false
  }
}

