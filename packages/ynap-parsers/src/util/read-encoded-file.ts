import chardet from 'jschardet';
import { decode } from 'iconv-lite';

export const readEncodedFile = (file: File, charset?: string): Promise<string> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result === null) {
        rej('Result is null.');
      }

      const result = reader.result! as string;

      if (result.length === 0) {
        return res('');
      }

      if (!charset) {
        const detectedCharset = chardet.detect(result);
        charset = detectedCharset ? detectedCharset.encoding : 'utf-8';
      }

      const decoded = decode(Buffer.from(result, 'binary'), charset);
      return res(decoded);
    });
    reader.readAsBinaryString(file);
  });
};
