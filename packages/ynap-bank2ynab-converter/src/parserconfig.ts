export interface ParserConfig {
  filenamePattern: string;
  filenameExtension: string;
  headerRows: number;
  footerRows: number;
  inputColumns: string[];
  inflowOutflowFlag?: [string, string, string];
  dateFormat?: string;
  name: string;
  link: string;
  country: string;
}
