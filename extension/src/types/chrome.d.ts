// Additional Chrome extension type definitions
// This file extends the @types/chrome package with any missing definitions

declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>
      set(items: { [key: string]: any }): Promise<void>
      remove(keys: string | string[]): Promise<void>
      clear(): Promise<void>
    }
  }

  namespace tabs {
    interface Tab {
      id?: number
      url?: string
      title?: string
      active?: boolean
      windowId?: number
    }

    function query(queryInfo: {
      active?: boolean
      currentWindow?: boolean
      url?: string | string[]
    }): Promise<Tab[]>

    function create(createProperties: {
      url?: string
      active?: boolean
      windowId?: number
    }): Promise<Tab>

    function sendMessage(
      tabId: number,
      message: any,
      options?: { frameId?: number }
    ): Promise<any>
  }

  namespace scripting {
    interface InjectionTarget {
      tabId: number
      frameIds?: number[]
      documentIds?: string[]
      allFrames?: boolean
    }

    interface ScriptInjection {
      target: InjectionTarget
      files?: string[]
      func?: Function
      args?: any[]
      world?: 'ISOLATED' | 'MAIN'
    }

    interface CSSInjection {
      target: InjectionTarget
      files?: string[]
      css?: string
      origin?: 'AUTHOR' | 'USER'
    }

    function executeScript(injection: ScriptInjection): Promise<any[]>
    function insertCSS(injection: CSSInjection): Promise<void>
    function removeCSS(injection: CSSInjection): Promise<void>
  }

  namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab
      frameId?: number
      id?: string
      url?: string
      tlsChannelId?: string
    }

    function sendMessage(
      extensionId: string | undefined,
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<any>

    function getURL(path: string): string

    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void
      removeListener(callback: Function): void
    }

    const onInstalled: {
      addListener(
        callback: (details: {
          reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update'
          previousVersion?: string
          id?: string
        }) => void
      ): void
    }
  }
}

// Global Chrome API
declare const chrome: typeof chrome

// Web Speech API types (in case they're missing)
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  serviceURI: string
  grammars: SpeechGrammarList

  start(): void
  stop(): void
  abort(): void

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechGrammarList {
  readonly length: number
  item(index: number): SpeechGrammar
  [index: number]: SpeechGrammar
  addFromURI(src: string, weight?: number): void
  addFromString(string: string, weight?: number): void
}

interface SpeechGrammar {
  src: string
  weight: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

// Speech Synthesis API
interface SpeechSynthesis {
  readonly paused: boolean
  readonly pending: boolean
  readonly speaking: boolean
  
  cancel(): void
  getVoices(): SpeechSynthesisVoice[]
  pause(): void
  resume(): void
  speak(utterance: SpeechSynthesisUtterance): void
  
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null
}

interface SpeechSynthesisUtterance extends EventTarget {
  lang: string
  pitch: number
  rate: number
  text: string
  voice: SpeechSynthesisVoice | null
  volume: number
  
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
}

interface SpeechSynthesisEvent extends Event {
  readonly charIndex: number
  readonly charLength: number
  readonly elapsedTime: number
  readonly name: string
  readonly utterance: SpeechSynthesisUtterance
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  readonly error: string
}

interface SpeechSynthesisVoice {
  readonly default: boolean
  readonly lang: string
  readonly localService: boolean
  readonly name: string
  readonly voiceURI: string
}

declare var SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance
  new (text?: string): SpeechSynthesisUtterance
}

declare var speechSynthesis: SpeechSynthesis
