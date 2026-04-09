import React, { useEffect, useRef, useState } from 'react';

const JitsiMeetingContainer = ({ roomId, userName, onReady, onEnd }) => {
  const jitsiContainerRef = useRef(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    // Load Jitsi Script
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-833984be19ea45dfb15a510524458f38/external_api.js';
    script.async = true;
    script.onload = () => {
      if (jitsiContainerRef.current) {
        const domain = '8x8.vc';
        const options = {
          roomName: `vpaas-magic-cookie-833984be19ea45dfb15a510524458f38/${roomId}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: false,
            startScreenSharing: false,
            enableEmailInStats: false
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          }
        };

        const newApi = new window.JitsiMeetExternalAPI(domain, options);
        
        newApi.addEventListeners({
          readyToClose: () => {
            if (onEnd) onEnd();
          },
          videoConferenceTerminated: () => {
            if (onEnd) onEnd();
          }
        });

        setApi(newApi);
        if (onReady) onReady();
      }
    };

    document.body.appendChild(script);

    return () => {
      if (api) api.dispose();
      document.body.removeChild(script);
    };
  }, [roomId]);

  return (
    <div 
      ref={jitsiContainerRef} 
      className="w-full h-full rounded-3xl overflow-hidden bg-[#16161a] border border-[#2d2d34] shadow-2xl"
      style={{ height: 'calc(100vh - 120px)' }}
    />
  );
};

export default JitsiMeetingContainer;
