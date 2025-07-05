declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
    VKID?: any;
    VK?: {
      init: (config: { apiId: number }) => void;
      Auth: {
        login: (params: any) => void;
      };
    };
  }
}

export {}; 