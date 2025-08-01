import React, { useState, useEffect, useRef } from 'react';

const VideoFondo = ({ src, opacity = 0.5, overlayOpacity = 0.3, playbackRate = 1.0 }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ opacity }}
        onCanPlay={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` 
        }}
      />
    </div>
  );
};

export default VideoFondo;