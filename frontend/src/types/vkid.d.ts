declare global {
  interface Window {
    VKID: {
      Config: {
        init: (config: VKIDConfig) => void;
        ResponseMode: {
          Callback: string;
        };
        Source: {
          LOWCODE: string;
        };
      };
      Auth: {
        login: () => Promise<VKIDAuthResult>;
      };
      OneTap: new () => VKIDOneTap;
      WidgetEvents: {
        ERROR: string;
      };
      OneTapInternalEvents: {
        LOGIN_SUCCESS: string;
      };
    };
  }
}

interface VKIDConfig {
  app: number;
  redirectUrl: string;
  responseMode: string;
  source: string;
  scope: string;
}

interface VKIDAuthResult {
  code: string;
  device_id?: string;
}

interface VKIDOneTap {
  render: (options: VKIDOneTapOptions) => VKIDOneTap;
  on: (event: string, callback: (data: any) => void) => VKIDOneTap;
}

interface VKIDOneTapOptions {
  container: HTMLElement;
  showAlternativeLogin: boolean;
}

export {}; 