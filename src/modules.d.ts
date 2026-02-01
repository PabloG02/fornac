declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.svg' {
  const url: string;
  export default url;
}

declare module 'd3' {
  const d3: any;
  export default d3;
}
