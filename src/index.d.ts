// Type definitions for fornac

export interface FornaContainerOptions {
  editable?: boolean;
  zoomable?: boolean;
  animation?: boolean;
  displayAllLinks?: boolean;
  labelInterval?: number;
  chargeDistance?: number;
  friction?: number;
  middleCharge?: number;
  otherCharge?: number;
  linkDistanceMultiplier?: number;
  initialSize?: [number, number] | null;
  layout?: 'standard-polygonal' | 'naview';
  transitionDuration?: number;
  maxNodeRadius?: number;
  circularizeExternal?: boolean;
}

export interface AddRNAOptions {
  sequence?: string;
  name?: string;
  positions?: Array<[number, number]>;
  labelInterval?: number;
  avoidOthers?: boolean;
  uids?: string[];
  circularizeExternal?: boolean;
  extraLinks?: Array<[number | number[], number | number[]]>;
  centerPos?: [number, number];
  centerView?: boolean;
}

export interface RNANode {
  name: string;
  num: number;
  radius: number;
  rna: any;
  nodeType: 'nucleotide' | 'label' | 'middle' | 'protein';
  structName: string;
  elemType: string;
  uid: string;
  x?: number;
  y?: number;
  px?: number;
  py?: number;
  linked?: boolean;
  prevNode?: RNANode | null;
  nextNode?: RNANode | null;
}

export interface RNALink {
  source: RNANode;
  target: RNANode;
  linkType: 'basepair' | 'backbone' | 'pseudoknot' | 'fake' | 'label_link' | 'intermolecule' | 'external' | 'protein_chain' | 'chain_chain' | 'fake_fake';
  value: number;
  uid: string;
  extraLinkType?: string;
}

export interface ColorSchemeConfig {
  colorValues: {
    [moleculeName: string]: {
      [residueNumber: number]: string | number;
    };
  };
  domain?: [number, number];
  range?: [string, string];
}

export class FornaContainer {
  constructor(element: string | HTMLElement, options?: FornaContainerOptions);

  // RNA manipulation methods
  addRNA(structure: string, options?: AddRNAOptions): any;
  clearNodes(): void;
  transitionRNA(newStructure: string, nextFunction?: () => void): void;

  // Display control methods
  update(): void;
  centerView(duration?: number): void;
  setSize(svgW?: number, svgH?: number): void;

  // Animation control
  startAnimation(): void;
  stopAnimation(): void;
  resumeForce(): void;

  // Force-directed layout parameters
  setFriction(value: number): void;
  setCharge(value: number): void;
  setGravity(value: number): void;
  setPseudoknotStrength(value: number): void;

  // Display toggles
  displayNumbering(value: boolean): void;
  displayNodeOutline(value: boolean): void;
  displayNodeLabel(value: boolean): void;
  displayLinks(value: boolean): void;
  displayPseudoknotLinks(value: boolean): void;
  displayProteinLinks(value: boolean): void;
  displayDirectionArrows(value: boolean): void;

  // Color schemes
  changeColorScheme(scheme: 'sequence' | 'structure' | 'positions' | 'custom'): void;
  addCustomColors(json: ColorSchemeConfig): void;
  addCustomColorsText(customColorsText: string): void;
  setOutlineColor(color: string): void;

  // Data export
  getStructuresDotBracket(): [string, string];
  toJSON(): string;
  fromJSON(jsonString: string): void;

  // Properties
  graph: {
    nodes: RNANode[];
    links: RNALink[];
  };
  rnas: { [uid: string]: any };
  extraLinks: RNALink[];
  options: FornaContainerOptions;
  displayParameters: {
    displayNumbering: boolean;
    displayNodeOutline: boolean;
    displayNodeLabel: boolean;
    displayLinks: boolean;
    displayPseudoknotLinks: boolean;
    displayProteinLinks: boolean;
    displayDirectionArrows: boolean;
  };
  colorScheme: string;
  customColors: ColorSchemeConfig;
}

export interface RNAPlotOptions {
  width?: number;
  height?: number;
  nucleotideRadius?: number;
  rnaEdgePadding?: number;
  labelInterval?: number;
  showNucleotideLabels?: boolean;
  startNucleotideNumber?: number;
  bundleExternalLinks?: boolean;
  rnaLayout?: 'simple' | 'naview';
  namePosition?: string;
}

export interface RNAPlotData {
  structure: string;
  sequence?: string;
  name?: string;
  extraLinks?: Array<[number | number[], number | number[]]>;
}

export interface RNAPlotChart {
  (selection: any): void;
  width(value?: number): number | RNAPlotChart;
  height(value?: number): number | RNAPlotChart;
  showNucleotideLabels(value?: boolean): boolean | RNAPlotChart;
  rnaEdgePadding(value?: number): number | RNAPlotChart;
  nucleotideRadius(value?: number): number | RNAPlotChart;
  labelInterval(value?: number): number | RNAPlotChart;
  startNucleotideNumber(value?: number): number | RNAPlotChart;
  bundleExternalLinks(value?: boolean): boolean | RNAPlotChart;
  rnaLayout(value?: 'simple' | 'naview'): string | RNAPlotChart;
  namePosition(value?: string): string | RNAPlotChart;
}

export function rnaPlot(options?: RNAPlotOptions): RNAPlotChart;

export interface RNATreemapOptions extends RNAPlotOptions {
  zoom?: boolean;
}

export interface RNATreemapChart extends RNAPlotChart {
  zoom(value?: boolean): boolean | RNATreemapChart;
}

export function rnaTreemap(options?: RNATreemapOptions): RNATreemapChart;

export class RNAUtilities {
  bracketLeft: string[];
  bracketRight: string[];

  inverseBrackets(bracket: string[]): { [key: string]: number };
  maximumMatching(pt: number[]): number[][];
  backtrackMaximumMatching(mm: number[][], oldPt: number[]): number[];
  dotbracketToPairtable(dotbracket: string): number[];
  pairtableToDotbracket(pt: number[]): string;
  findUnmatched(pt: number[], from: number, to: number): Array<Array<[number, number]>>;
  removePseudoknotsFromPairtable(pt: number[]): Array<[number, number]>;
  ptToElements(
    pt: number[],
    level: number,
    i: number,
    j: number,
    dotBracketBreaks?: number[]
  ): Array<[string, number, number[]]>;
}

export class ColorScheme {
  constructor(colorsText: string);
  colorsText: string;
  colorsJson: ColorSchemeConfig;

  parseRange(rangeText: string): number[];
  parseColorText(colorText: string): ColorScheme;
  normalizeColors(): ColorScheme;
}
