// @flow

export type DeviceConnectionStatus = 'notConnected' | 'connecting' | 'connected';

export type EditorMode = 'text' | 'block';

export type Program = Array<string>;

export interface RobotDriver {
    connect(onDisconnected: () => void): Promise<void>;
    forward(): Promise<void>;
    left(): Promise<void>;
    right(): Promise<void>;
};

// Flow lacks its own types for the Speech Recognition API, so we define our own
// TODO: remove when https://github.com/facebook/flow/issues/7361 is resolved.

export type ArrayLike<T> = {
    length: number,
    item: (number:number) => T
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechGrammar
export type SpeechGrammar = {
    src: string,
    weight: number
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechGrammarList
export type SpeechGrammarList = ArrayLike<SpeechGrammar> & {
    addFromURI: (string:string) => null,
    addFromString: (string:string) => null
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionAlternative
export type SpeechRecognitionAlternative = {
    transcript: string,
    confidence: number
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResult
export type SpeechRecognitionResult = ArrayLike<SpeechRecognitionAlternative> & {
    isFinal: boolean
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList
export type SpeechRecognitionResultsList = ArrayLike<SpeechRecognitionResult>;

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionEvent
export type SpeechRecognitionEvent = {
    emma?: string,
    interpretation?: string,
    resultIndex: number,
    results: SpeechRecognitionResultsList
};

// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
export type SpeechRecognition = {
    // props
    grammars: SpeechGrammarList,
    lang: string,
    continuous: boolean,
    interimResults: boolean,
    maxAlternatives: number,
    serviceURI: string,

    // methods
    // TODO: SpeechRecognition also inherits methods from its parent interface, EventTarget.
    abort: () => null,
    start: () => null,
    stop: () => SpeechRecognitionResult,

    // Event handling methods
    onresult: (SpeechRecognitionEvent) => null
    // TODO: Add the rest from here https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#Events
};
