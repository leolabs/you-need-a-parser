export const readToBuffer = (file: File): Promise<Buffer> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result === null) {
        rej('Result is null.');
      }

      const result = reader.result! as string;

      if (result.length === 0) {
        return res(Buffer.from(''));
      }

      return res(Buffer.from(result, 'binary'));
    });
    reader.readAsBinaryString(file);
  });
};
