export const readWindowsFile = (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result === null) {
        rej('Result is null.');
      }

      res(reader.result! as string);
    });
    reader.readAsText(file, 'WINDOWS-1252');
  });
};
