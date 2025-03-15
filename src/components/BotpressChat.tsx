
import { useEffect } from 'react';

interface BotpressChatProps {
  botId: string;
  hostUrl?: string;
}

export const BotpressChat = ({ 
  botId,
  hostUrl = "https://cdn.botpress.cloud/webchat/v1"
}: BotpressChatProps) => {
  useEffect(() => {
    // Initialize Botpress webchat
    window.botpressWebChat = {
      init: {
        botId: botId,
        hostUrl: hostUrl,
        messagingUrl: 'https://messaging.botpress.cloud',
        clientId: botId,
        botName: 'Enloe Assistant',
        stylesheet: `${hostUrl}/themes/default.css`,
        frontendVersion: '2.3',
        theme: 'default',
        themeColor: '#0F4D5C', // Enloe green color
        useSessionStorage: true,
        showPoweredBy: false,
        disableAnimations: false,
        enableConversationDeletion: true
      }
    };

    // Load the Botpress script
    const script = document.createElement('script');
    script.src = `${hostUrl}/inject.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
      delete window.botpressWebChat;
    };
  }, [botId, hostUrl]);

  return null; // This component doesn't render anything itself
};

// Add TypeScript interface to window
declare global {
  interface Window {
    botpressWebChat: {
      init: {
        botId: string;
        hostUrl: string;
        messagingUrl: string;
        clientId: string;
        botName: string;
        stylesheet: string;
        frontendVersion: string;
        theme: string;
        themeColor: string;
        useSessionStorage: boolean;
        showPoweredBy: boolean;
        disableAnimations: boolean;
        enableConversationDeletion: boolean;
      }
    }
  }
}
