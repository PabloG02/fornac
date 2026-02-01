/**
 * Calculates simple XY coordinates for RNA structure visualization.
 * @param pair_table - Array where pair_table[0] is the length and pair_table[i] is the pairing partner of position i
 * @returns Array of [x, y] coordinate tuples for each nucleotide position
 */
export function simpleXyCoordinates(pair_table: number[]): [number, number][] {
  // Initial bending angle
  const INIT_ANGLE = 0;
  // Coordinate of first digit
  const INIT_X = 100;
  const INIT_Y = 100;
  const RADIUS = 15;

  const x: number[] = [];
  const y: number[] = [];

  let i: number;
  let alpha: number;

  const len = pair_table[0];
  const angle: number[] = new Array(len + 5).fill(0);
  const loop_size: number[] = new Array(16 + Math.floor(len / 5)).fill(0);
  const stack_size: number[] = new Array(16 + Math.floor(len / 5)).fill(0);

  let lp = 0;
  let stk = 0;
  const PIHALF = Math.PI / 2;

  /**
   * Recursive function to process loop regions.
   * @param i - Position AFTER the last pair of a stack (i.e. i-1 is paired with j+1)
   * @param j - Position AFTER the last pair of a stack
   * @param pair_table - The pairing table
   */
  const loop = function (i: number, j: number, pair_table: number[]) {
    // Counts the VERTICES of a loop polygon; that's NOT necessarily the number of unpaired bases!
    // Upon entry the loop has already 2 vertices, namely the pair i-1/j+1.
    let count = 2;

    let r = 0;
    // bubble counts the unpaired digits in loops
    let bubble = 0;

    let i_old: number,
      partner: number,
      k: number,
      l: number,
      start_k: number,
      start_l: number,
      fill: number,
      ladder: number;
    let begin: number,
      v: number,
      diff: number;
    let polygon: number;

    const remember: number[] = new Array(3 + Math.floor((j - i) / 5) * 2).fill(0);

    // j has now been set to the partner of the previous pair for correct while-loop termination.
    i_old = i - 1;
    j++;

    while (i != j) {
      partner = pair_table[i];
      if (!partner || i == 0) {
        i++;
        count++;
        bubble++;
      } else {
        count += 2;
        // Beginning of stack
        k = i;
        l = partner;

        remember[++r] = k;
        remember[++r] = l;
        // Next i for the current loop
        i = partner + 1;

        start_k = k;
        start_l = l;

        ladder = 0;
        do {
          // Go along the stack region
          k++;
          l--;
          ladder++;
        } while (pair_table[k] == l && pair_table[k] > k);

        fill = ladder - 2;
        if (ladder >= 2) {
          // Loop entries and exits get an additional PI/2. Why? (exercise)
          angle[start_k + 1 + fill] += PIHALF;
          angle[start_l - 1 - fill] += PIHALF;
          angle[start_k] += PIHALF;
          angle[start_l] += PIHALF;
          if (ladder > 2) {
            // Fill in the angles for the backbone
            for (; fill >= 1; fill--) {
              angle[start_k + fill] = Math.PI;
              angle[start_l - fill] = Math.PI;
            }
          }
        }
        stack_size[++stk] = ladder;
        if (k <= l) loop(k, l, pair_table);
      }
    }

    // Bending angle in loop polygon
    polygon = (Math.PI * (count - 2)) / count;
    remember[++r] = j;
    begin = i_old < 0 ? 0 : i_old;
    for (v = 1; v <= r; v++) {
      diff = remember[v] - begin;
      for (fill = 0; fill <= diff; fill++) angle[begin + fill] += polygon;
      if (v > r) break;
      begin = remember[++v];
    }
    loop_size[++lp] = bubble;
  };

  loop(0, len + 1, pair_table);
  // Correct for cheating with function loop
  loop_size[lp] -= 2;

  alpha = INIT_ANGLE;
  x[0] = INIT_X;
  y[0] = INIT_Y;

  const poss: [number, number][] = [];

  poss.push([x[0], y[0]]);
  for (i = 1; i < len; i++) {
    x[i] = x[i - 1] + RADIUS * Math.cos(alpha);
    y[i] = y[i - 1] + RADIUS * Math.sin(alpha);

    poss.push([x[i], y[i]]);
    alpha += Math.PI - angle[i + 1];
  }

  return poss;
}
