module 'jschardet' {
  interface Options {
    minimumThreshold: number;
  }

  interface Result {
    encoding: string | null;
    confidence: number;
  }

  export const detect = (str: string, options?: Options): Result => {};
}
