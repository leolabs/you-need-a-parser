export interface ParserConfig {
  filenamePattern: string;
  filenameExctension: string;
  headerRows: number;
  footerRows: number;
  inputColumns: string[];
  dateFormat?: string;
  name: string;
  link: string;
  country: string;
}
