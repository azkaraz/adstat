declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
            language_code?: string
          }
          chat?: {
            id: number
            type: string
            title?: string
            username?: string
            photo_url?: string
          }
          chat_type?: string
          chat_instance?: string
          start_param?: string
          can_send_after?: number
          auth_date?: number
          hash?: string
        }
        ready: () => void
        expand: () => void
        close: () => void
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        colorScheme: 'light' | 'dark'
        isClosingConfirmationEnabled: boolean
        BackButton: {
          isVisible: boolean
          text: string
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isProgressVisible: boolean
          isActive: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        CloudStorage: {
          getItem: (key: string) => Promise<string | null>
          setItem: (key: string, value: string) => Promise<void>
          getItems: (keys: string[]) => Promise<Record<string, string | null>>
          removeItem: (key: string) => Promise<void>
          removeItems: (keys: string[]) => Promise<void>
        }
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        showPopup: (params: {
          title?: string
          message: string
          buttons?: Array<{
            id?: string
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
            text: string
          }>
        }, callback?: (buttonId: string) => void) => void
        showScanQrPopup: (params: {
          text?: string
        }, callback?: (data: string) => void) => void
        closeScanQrPopup: () => void
        readTextFromClipboard: (callback?: (data: string | null) => void) => void
        requestWriteAccess: (callback?: (access: boolean) => void) => void
        requestContact: (callback?: (contact: {
          phone_number: string
          first_name: string
          last_name?: string
          user_id?: number
          vcard?: string
        } | null) => void) => void
        invokeCustomMethod: (method: string, params?: any) => void
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
        openLink: (url: string, options?: {
          try_instant_view?: boolean
        }) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        onEvent: (eventType: string, eventHandler: (event: any) => void) => void
        offEvent: (eventType: string, eventHandler: (event: any) => void) => void
        sendData: (data: string) => void
        isVersionAtLeast: (version: string) => boolean
        platform: string
        version: string
        initData: string
        initDataUnsafe: any
      }
    }
  }
}

export {} 