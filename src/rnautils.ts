const numberSort = (a: number, b: number): number => {
  return a - b;
};

export function arraysEqual<T>(a: T[], b: T[]): boolean {
  // courtesy of
  // http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export class RNAUtilities {
  // the brackets to use when constructing dotbracket strings
  // with pseudoknots
  bracketLeft: string[] = '([{<ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  bracketRight: string[] = ')]}>abcdefghijklmnopqrstuvwxyz'.split('');

  inverseBrackets(bracket: string[]): Record<string, number> {
    const res: Record<string, number> = {};
    for (let i = 0; i < bracket.length; i++) {
      res[bracket[i]] = i;
    }
    return res;
  }

  maximumMatching(pt: number[]): number[][] {
    // Courtesy of the great Ronny Lorenz

    const n = pt[0];
    const TURN = 0; //minimal number of nucleotides in the hairpin

    /* array init */
    const mm: number[][] = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      mm[i] = new Array(n + 1);
      for (let j = i; j <= n; j++) mm[i][j] = 0;
    }
    let maximum = 0;

    /* actual computation */
    for (let i = n - TURN - 1; i > 0; i--)
      for (let j = i + TURN + 1; j <= n; j++) {
        maximum = mm[i][j - 1];

        for (let l = j - TURN - 1; l >= i; l--) {
          if (pt[l] === j) {
            // we have a base pair here
            maximum = Math.max(
              maximum,
              (l > i ? mm[i][l - 1] : 0) + 1 + (j - l - 1 > 0 ? mm[l + 1][j - 1] : 0),
            );
          }
        }

        mm[i][j] = maximum;
      }

    maximum = mm[1][n];

    return mm;
  }

  backtrackMaximumMatching(mm: number[][], oldPt: number[]): number[] {
    //create an array containing zeros
    const pt = new Array(mm.length).fill(0);

    this.mmBt(mm, pt, oldPt, 1, mm.length - 1);
    return pt;
  }

  mmBt(mm: number[][], pt: number[], oldPt: number[], i: number, j: number): void {
    // Create a pairtable from the backtracking
    const maximum = mm[i][j];
    const TURN = 0;

    if (j - i - 1 < TURN) return; /* no more pairs */

    if (mm[i][j - 1] === maximum) {
      /* j is unpaired */
      this.mmBt(mm, pt, oldPt, i, j - 1);
      return;
    }

    for (let q = j - TURN - 1; q >= i; q--) {
      /* j is paired with some q */
      if (oldPt[j] !== q) continue;

      const leftPart = q > i ? mm[i][q - 1] : 0;
      const enclosedPart = j - q - 1 > 0 ? mm[q + 1][j - 1] : 0;

      if (leftPart + enclosedPart + 1 === maximum) {
        // there's a base pair between j and q
        pt[q] = j;
        pt[j] = q;

        if (i < q) this.mmBt(mm, pt, oldPt, i, q - 1);

        this.mmBt(mm, pt, oldPt, q + 1, j - 1);
        return;
      }
    }

    //alert(i + "," + j + ": backtracking failed!");
    console.log('FAILED!!!' + i + ',' + j + ': backtracking failed!');
  }

  dotbracketToPairtable(dotbracket: string): number[] {
    // create an array and initialize it to 0
    const pt = new Array(dotbracket.length + 1).fill(0);

    //  the first element is always the length of the RNA molecule
    pt[0] = dotbracket.length;

    // store the pairing partners for each symbol
    const stack: Record<number, number[]> = {};
    for (let i = 0; i < this.bracketLeft.length; i++) {
      stack[i] = [];
    }

    // lookup the index of each symbol in the bracket array
    const inverseBracketLeft = this.inverseBrackets(this.bracketLeft);
    const inverseBracketRight = this.inverseBrackets(this.bracketRight);

    for (let i = 0; i < dotbracket.length; i++) {
      const a = dotbracket[i];
      const ni = i + 1;

      if (a === '.' || a === 'o') {
        // unpaired
        pt[ni] = 0;
      } else {
        if (a in inverseBracketLeft) {
          // open pair?
          stack[inverseBracketLeft[a]].push(ni);
        } else if (a in inverseBracketRight) {
          // close pair?
          const j = stack[inverseBracketRight[a]].pop()!;

          pt[ni] = j;
          pt[j] = ni;
        } else {
          throw new Error('Unknown symbol in dotbracket string');
        }
      }
    }

    for (const key in stack) {
      if (stack[key].length > 0) {
        throw new Error('Unmatched base at position ' + stack[key][0]);
      }
    }

    return pt;
  }

  insertIntoStack(stack: Record<number, number[]>, i: number, j: number): number {
    let k = 0;
    while (stack[k].length > 0 && stack[k][stack[k].length - 1] < j) {
      k += 1;
    }

    stack[k].push(j);
    return k;
  }

  deleteFromStack(stack: Record<number, number[]>, j: number): number {
    let k = 0;
    while (stack[k].length === 0 || stack[k][stack[k].length - 1] !== j) {
      k += 1;
    }
    stack[k].pop();
    return k;
  }

  pairtableToDotbracket(pt: number[]): string {
    // store the pairing partners for each symbol
    const stack: Record<number, number[]> = {};
    for (let i = 0; i < pt[0]; i++) {
      stack[i] = [];
    }

    const seen: Record<number, boolean> = {};
    let res = '';
    for (let i = 1; i < pt[0] + 1; i++) {
      if (pt[i] !== 0 && pt[i] in seen) {
        throw new Error('Invalid pairtable contains duplicate entries');
      }
      seen[pt[i]] = true;

      if (pt[i] === 0) {
        res += '.';
      } else {
        if (pt[i] > i) {
          res += this.bracketLeft[this.insertIntoStack(stack, i, pt[i])];
        } else {
          res += this.bracketRight[this.deleteFromStack(stack, i)];
        }
      }
    }

    return res;
  }

  findUnmatched(pt: number[], from: number, to: number): number[][][] {
    /*
     * Find unmatched nucleotides in this molecule.
     */
    let toRemove: number[][][] = [];
    const unmatched: number[][] = [];

    const origFrom = from;
    const origTo = to;

    for (let i = from; i <= to; i++) {
      if (pt[i] !== 0 && (pt[i] < from || pt[i] > to)) unmatched.push([i, pt[i]]);
    }

    for (let i = origFrom; i <= origTo; i++) {
      while (pt[i] === 0 && i <= origTo) i++;

      to = pt[i];

      while (pt[i] === to) {
        i++;
        to--;
      }

      toRemove = toRemove.concat(this.findUnmatched(pt, i, to));
    }

    if (unmatched.length > 0) toRemove.push(unmatched);

    return toRemove;
  }

  removePseudoknotsFromPairtable(pt: number[]): number[][] {
    /* Remove the pseudoknots from this structure in such a fashion
     * that the least amount of base-pairs need to be broken
     *
     * The pairtable is manipulated in place and a list of tuples
     * indicating the broken base pairs is returned.
     */

    const mm = this.maximumMatching(pt);
    const newPt = this.backtrackMaximumMatching(mm, pt);
    const removed: number[][] = [];

    for (let i = 1; i < pt.length; i++) {
      if (pt[i] < i) continue;

      if (newPt[i] !== pt[i]) {
        removed.push([i, pt[i]]);
        pt[pt[i]] = 0;
        pt[i] = 0;
      }
    }

    return removed;
  }

  ptToElements(
    pt: number[],
    level: number,
    i: number,
    j: number,
    dotBracketBreaks: number[] = []
  ): Array<[string, number, number[]]> {
    /* Convert a pair table to a list of secondary structure
     * elements:
     *
     * [['s',1,[2,3]]
     *
     * The 's' indicates that an element can be a stem. It can also be
     * an interior loop ('i'), a hairpin loop ('h') or a multiloop ('m')
     *
     * The second number (1 in this case) indicates the depth or
     * how many base pairs have to be broken to get to this element.
     *
     * Finally, there is the list of nucleotides which are part of
     * of this element.
     */
    let elements: Array<[string, number, number[]]> = [];
    let u5 = [i - 1];
    let u3 = [j + 1];

    if (i > j) return [];

    // iterate over the unpaired regions on either side
    // this is either 5' and 3' unpaired if level == 0
    // or an interior loop or a multiloop
    for (; pt[i] === 0; i++) {
      u5.push(i);
    }
    for (; pt[j] === 0; j--) {
      u3.push(j);
    }

    if (i > j) {
      // hairpin loop or one large unpaired molecule
      u5.push(i);
      if (level === 0) return [['e', level, u5.sort(numberSort)]];
      else {
        // check to see if we have chain breaks due
        // to multiple strands in the input
        let external = false;
        const left: number[] = [];
        const right: number[] = [];
        for (let k = 0; k < u5.length; k++) {
          if (external) right.push(u5[k]);
          else left.push(u5[k]);

          if (dotBracketBreaks.indexOf(u5[k]) >= 0) external = true;
        }

        if (external) {
          return [['h', level, u5.sort(numberSort)]];
        } else
          // if not, this is a simple hairpin loop
          return [['h', level, u5.sort(numberSort)]];
      }
    }

    if (pt[i] !== j) {
      //multiloop
      let m = u5;
      let k = i;

      // the nucleotide before and the starting nucleotide
      m.push(k);
      while (k <= j) {
        // recurse into a stem
        elements = elements.concat(this.ptToElements(pt, level, k, pt[k], dotBracketBreaks));

        // add the nucleotides between stems
        m.push(pt[k]);
        k = pt[k] + 1;
        for (; pt[k] === 0 && k <= j; k++) {
          m.push(k);
        }
        m.push(k);
      }
      m.pop();
      m = m.concat(u3);

      if (m.length > 0) {
        if (level === 0) elements.push(['e', level, m.sort(numberSort)]);
        else elements.push(['m', level, m.sort(numberSort)]);
      }

      return elements;
    }

    if (pt[i] === j) {
      //interior loop
      u5.push(i);
      u3.push(j);

      const combined = u5.concat(u3);
      if (combined.length > 4) {
        if (level === 0) elements.push(['e', level, u5.concat(u3).sort(numberSort)]);
        else elements.push(['i', level, u5.concat(u3).sort(numberSort)]);
      }
    }

    const s: number[] = [];
    //go through the stem
    while (pt[i] === j && i < j) {
      //one stem
      s.push(i);
      s.push(j);

      i += 1;
      j -= 1;

      level += 1;
    }

    u5 = [i - 1];
    u3 = [j + 1];
    elements.push(['s', level, s.sort(numberSort)]);

    return elements.concat(this.ptToElements(pt, level, i, j, dotBracketBreaks));
  }
}

export const rnaUtilities = new RNAUtilities();

interface ColorsJson {
  colorValues: Record<string, Record<number, string | number>>;
  range: [string, string];
  domain?: [number, number];
}

export class ColorScheme {
  colorsText: string;
  colorsJson: ColorsJson;

  constructor(colorsText: string) {
    this.colorsText = colorsText;
    this.colorsJson = this.parseColorText(this.colorsText);
  }

  parseRange(rangeText: string): number[] {
    //parse a number range such as 1-10 or 3,7,9 or just 7
    const parts = rangeText.split(',');
    const nums: number[] = [];

    for (let i = 0; i < parts.length; i++) {
      //could be 1 or 10-11  or something like that
      const parts1 = parts[i].split('-');

      if (parts1.length === 1) {
        nums.push(parseInt(parts1[0]));
      } else if (parts1.length === 2) {
        const from = parseInt(parts1[0]);
        const to = parseInt(parts1[1]);

        // add each number in this range
        for (let j = from; j <= to; j++) nums.push(j);
      } else {
        console.log('Malformed range (too many dashes):', rangeText);
      }
    }

    return nums;
  }

  parseColorText(colorText: string): ColorsJson {
    /* Parse the text of an RNA color string. Instructions and description
     * of the format are given below.
     *
     * The return is a JSON double dictionary indexed first by the
     * molecule name, then by the nucleotide. This is then applied
     * by force.js to the RNAs it is displaying. When no molecule
     * name is specified, the color is applied to all molecules
     */
    const lines = colorText.split('\n');
    let currMolecule = '';
    let counter = 1;
    const colorsJson: ColorsJson = { colorValues: { '': {} }, range: ['white', 'steelblue'] };
    const domainValues: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i][0] === '>') {
        // new molecule
        currMolecule = lines[i].trim().slice(1);
        counter = 1;

        colorsJson.colorValues[currMolecule] = {};
        continue;
      }

      const words = lines[i].trim().split(/\s+/);

      for (let j = 0; j < words.length; j++) {
        if (isNaN(Number(words[j]))) {
          if (words[j].search('range') === 0) {
            //there's a color scale in this entry
            const parts = words[j].split('=');
            const partsRight = parts[1].split(':');
            colorsJson.range = [partsRight[0], partsRight[1]];
            continue;
          }

          if (words[j].search('domain') === 0) {
            //there's a color scale in this entry
            const parts = words[j].split('=');
            const partsRight = parts[1].split(':');
            colorsJson.domain = [Number(partsRight[0]), Number(partsRight[1])];
            continue;
          }

          // it's not a number, should be a combination
          // of a number (nucleotide #) and a color
          const parts = words[j].split(':');
          const nums = this.parseRange(parts[0]);
          const color = parts[1];

          for (let k = 0; k < nums.length; k++) {
            if (isNaN(Number(color))) {
              colorsJson.colorValues[currMolecule][nums[k]] = color;
            } else {
              colorsJson.colorValues[currMolecule][nums[k]] = +color;
              domainValues.push(Number(color));
            }
          }
        } else {
          //it's a number, so we add it to the list of values
          //seen for this molecule
          colorsJson.colorValues[currMolecule][counter] = Number(words[j]);
          counter += 1;

          domainValues.push(Number(words[j]));
        }
      }
    }

    if (!colorsJson.domain) {
      colorsJson.domain = [Math.min(...domainValues), Math.max(...domainValues)];
    }

    return colorsJson;
  }

  normalizeColors(): this {
    /*
     * Normalize the passed in values so that they range from
     * 0 to 1
     */
    let value: string | number;

    for (const moleculeName in this.colorsJson) {
      let minNum = Number.MAX_VALUE;
      let maxNum = Number.MIN_VALUE;

      // iterate once to find the min and max values;
      for (const resnum in this.colorsJson.colorValues[moleculeName]) {
        value = this.colorsJson.colorValues[moleculeName][resnum];
        if (typeof value === 'number') {
          if (value < minNum) minNum = value;
          if (value > maxNum) maxNum = value;
        }
      }

      // iterate again to normalize
      for (const resnum in this.colorsJson.colorValues[moleculeName]) {
        value = this.colorsJson.colorValues[moleculeName][resnum];
        if (typeof value === 'number') {
          this.colorsJson.colorValues[moleculeName][resnum] = (value - minNum) / (maxNum - minNum);
        }
      }
    }

    return this;
  }
}
