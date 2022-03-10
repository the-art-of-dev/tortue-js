export interface Component {
  name: string;
  html: string;
  css?: string;
  js?: string;
  doc?: string;
  dependecies: string[];
}
