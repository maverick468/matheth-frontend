import { useState, useEffect, useRef } from 'react';

export function useGestureDetection(onGestureDetected) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeGesture, setActiveGesture] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    if (isTracking) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam for gesture detection:", err);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTracking]);

  const startTracking = () => setIsTracking(true);
  const stopTracking = () => {
    setIsTracking(false);
    setActiveGesture(null);
  };

  return {
    videoRef,
    isTracking,
    activeGesture,
    startTracking,
    stopTracking
  };
}