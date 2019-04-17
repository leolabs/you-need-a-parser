import chardet from 'jschardet';
import { decode } from 'iconv-lite';

export const readEncodedFile = (file: File): Promise<string> => {
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

      const charset = chardet.detect(result);
      const decoded = decode(
        Buffer.from(result, 'binary'),
        charset.encoding || 'utf-8',
      );
      return res(decoded);
    });
    reader.readAsBinaryString(file);
  });
};
