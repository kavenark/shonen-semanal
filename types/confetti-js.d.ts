declare module 'confetti-js' {
    interface ConfettiSettings {
      target?: string;
      max?: number;
      size?: number;
      animate?: boolean;
      props?: Array<string | { type: string; src: string; size: number; weight: number }>;
      rotate?: boolean;
      spread?: number;
      respawn?: boolean;
      clock?: number;
      start_from_edge?: boolean;
      width?: number;
      height?: number;
      colors?: string[][];
    }
  
    class ConfettiGenerator {
      constructor(settings: ConfettiSettings);
      render(): void;
      clear(): void;
    }
  
    export default ConfettiGenerator;
  }