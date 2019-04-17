export interface ParserConfig {
  filenamePattern: string;
  headerRows: number;
  footerRows: number;
  inputColumns: string[];
  dateFormat?: string;
  name: string;
  link: string;
  country: string;
}
