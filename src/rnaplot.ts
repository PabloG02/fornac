import * as d3 from 'd3';

import { RNAGraph } from './rnagraph.js';

import { simpleXyCoordinates } from './simplernaplot.js';
import { NAView } from './naview/naview.js';

import fstyle from './fornac.module.css';

type RnaLayout = 'simple' | 'naview';

interface RnaPlotOptions {
  width: number;
  height: number;
  nucleotideRadius: number;
  rnaEdgePadding: number; // how far the leftmost, rightmost, topmost and bottomost
  // nucleotides are from the edge of the plot
  labelInterval: number;
  showNucleotideLabels: boolean;
  startNucleotideNumber: number;
  bundleExternalLinks: boolean;
  rnaLayout: RnaLayout; // simple or naview
  namePosition: string; // for x and y either 0, 0.5 or 1
}

export function rnaPlot(passedOptions: Partial<RnaPlotOptions> = {}) {
  let options: RnaPlotOptions = {
    width: 300,
    height: 300,
    nucleotideRadius: 5,
    rnaEdgePadding: 1,
    labelInterval: 10,
    showNucleotideLabels: true,
    startNucleotideNumber: 1,
    bundleExternalLinks: false,
    rnaLayout: 'simple',
    namePosition: '0 0', // for x and y either 0, 0.5 or 1
  };
  options = Object.assign(options, passedOptions);

  let xScale: any;
  let yScale: any;

  function createTransformToFillViewport(xValues: number[], yValues: number[]) {
    // create transform that will scale the x and y values so that
    // they fill the available viewport
    const xExtent = d3.extent(xValues) as [number, number];
    const yExtent = d3.extent(yValues) as [number, number];

    // add the radius of the nucleotides
    xExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;
    yExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;

    xExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;
    yExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;

    // find out how wide and height the molecule
    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];

    // how much wider / taller is it than the available viewport
    const xExtra = xRange - options.width;
    const yExtra = yRange - options.height;

    // once we have a scale for one dimension, we can create the scale for the other
    // keeping the same expansion / shrinking ratio
    function createOtherScale(firstScale: any, newDomain: number[], newRange: number[]) {
      const scaleFactor =
        (firstScale.range()[1] - firstScale.range()[0]) /
        (firstScale.domain()[1] - firstScale.domain()[0]);
      const newWidth = (newDomain[1] - newDomain[0]) * scaleFactor;
      const newMargin = (newRange[1] - newRange[0] - newWidth) / 2;

      return {
        scaleFactor: scaleFactor,
        scale: d3
          .scaleLinear()
          .domain(newDomain)
          .range([newRange[0] + newMargin, newRange[1] - newMargin]),
      };
    }

    let ret: { scaleFactor: number; scale: any };

    if (xExtra > yExtra) {
      // we have to shrink more in the x-dimension than the y
      xScale = d3.scaleLinear().domain(xExtent).range([0, options.width]);

      ret = createOtherScale(xScale, yExtent, [0, options.height]);
      yScale = ret.scale;
    } else {
      // we have to shrink more in the x-dimension than the y
      yScale = d3.scaleLinear().domain(yExtent).range([0, options.height]);

      ret = createOtherScale(yScale, xExtent, [0, options.width]);
      xScale = ret.scale;
    }

    const translateX = -(xScale.domain()[0] * ret.scaleFactor - xScale.range()[0]);
    const translateY = -(yScale.domain()[0] * ret.scaleFactor - yScale.range()[0]);
    return `translate(${translateX},${translateY})scale(${ret.scaleFactor})`;
  }

  function createNucleotides(selection: any, nucleotideNodes: any[]) {
    // create groupings for each nucleotide and label
    const gs = selection
      .selectAll('.gnode')
      .data(nucleotideNodes)
      .enter()
      .append('svg:g')
      .classed('gnode', true)
      .attr('transform', function (d: any) {
        return `translate(${d.x},${d.y})`;
      });

    gs.append('svg:circle')
      .classed(fstyle.node, true)
      .attr('node_type', 'nucleotide')
      .attr('base_type', (d: any) => {
        if (d.name) {
          return d.name.toLowerCase();
        }
      })
      .attr('r', options.nucleotideRadius);

    if (options.showNucleotideLabels) {
      gs.append('svg:text')
        .text(function (d: any) {
          return d.name;
        })
        .classed(fstyle.nodeLabel, true)
        .append('svg:title')
        .text(function (d: any) {
          return d.struct_name + ':' + d.num;
        });
    }
  }

  function createLabels(selection: any, labelNodes: any[]) {
    // create groupings for each nucleotide and label

    const gs = selection
      .selectAll()
      .data(labelNodes)
      .enter()
      .append('svg:g')
      .classed('gnode', true)
      .attr('transform', function (d: any) {
        return `translate(${d.x},${d.y})`;
      });

    gs.append('svg:circle')
      .classed(fstyle.node, true)
      .attr('node_type', 'label')
      .attr('r', options.nucleotideRadius);

    gs.append('svg:text')
      .classed(fstyle.nodeLabel, true)
      .text(function (d: any) {
        return d.name;
      });
  }

  function createName(selection: any, name: string) {
    const nameLabel = selection
      .append('svg:text')
      //.attr('dy', -10)
      .classed(fstyle.plotLabel, true)
      .text(name);

    const xyPos = options.namePosition.split(' ', 2); // 0 0.5 1
    const xy: number[] = [];
    const textBBox = nameLabel.node().getBBox();
    const textSize = [textBBox.width, textBBox.height];
    const plotSize = [options.width, options.height];

    for (let p = 0; p < 2; p++) {
      switch (xyPos[p]) {
        case '0':
          xy[p] = textSize[p] / 2;
          break;
        case '1':
          xy[p] = plotSize[p] - textSize[p] / 2;
          break;
        case '0.5':
          xy[p] = plotSize[p] / 2;
          break;
      }
    }
    nameLabel.attr('x', xy[0]).attr('y', xy[1]);
  }

  function makeExternalLinksBundle(selection: any, links: any[]) {
    const nodesDict: Record<string, any> = {};
    const linksList: any[] = [];
    links = links.filter(function (d: any) {
      return d.linkType == 'correct' || d.linkType == 'incorrect' || d.linkType == 'extra';
    });

    selection.selectAll('[link-type=extra]').remove();

    for (let i = 0; i < links.length; i++) {
      if (links[i].source === null || links[i].target === null) continue;

      nodesDict[links[i].source.uid] = links[i].source;
      nodesDict[links[i].target.uid] = links[i].target;

      linksList.push({
        source: links[i].source.uid,
        target: links[i].target.uid,
        linkType: links[i].linkType,
        extraLinkType: links[i].extraLinkType,
      });
    }

    const fbundling = (d3 as any)
      .ForceEdgeBundling()
      .nodes(nodesDict)
      .edges(linksList)
      .compatibility_threshold(0.8)
      .step_size(0.2);
    const results = fbundling();

    const d3line = d3
      .line()
      .x(function (d: any) {
        return d.x;
      })
      .y(function (d: any) {
        return d.y;
      })
      .curve(d3.curveLinear);

    for (let i = 0; i < results.length; i++) {
      const edge_subpoint_data = results[i];
      // for each of the arrays in the results
      // draw a line between the subdivions points for that edge

      selection
        .append('path')
        .attr('d', d3line(edge_subpoint_data))
        .style('fill', 'none')
        .attr('link-type', function () {
          return linksList[i].linkType;
        })
        .attr('extra-link-type', function () {
          return linksList[i].extraLinkType;
        })
        .style('stroke-opacity', 0.4); //use opacity as blending
    }
  }

  function createLinks(selection: any, links: any[]) {
    links = links.filter(function (d: any) {
      return d.source !== null && d.target !== null;
    });
    selection
      .selectAll('.link')
      .data(links)
      .enter()
      .append('svg:line')
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      })
      .attr('link-type', function (d: any) {
        return d.linkType;
      })
      .attr('extra-link-type', function (d: any) {
        return d.extraLinkType;
      })
      .classed('link', true)
      .classed(fstyle.link, true);
  }

  function chart(selection: any) {
    selection.each(function (this: Element, data: any) {
      const plot = d3.select(this).append('g').classed(fstyle.plot, true);

      // data should be a dictionary containing at least a structure
      // and possibly a sequence
      const rg = new RNAGraph(data.sequence, data.structure, data.name, options.startNucleotideNumber)
        .recalculateElements()
        .elementsToJson()
        .addName(data.name);

      data.rnaGraph = rg;
      // calculate the position of each nucleotide
      // the positions of the labels will be calculated in
      // the addLabels function
      let positions: number[][] = [];

      if (options.rnaLayout === 'naview') {
        const naview = new NAView();
        const naViewPositions = naview.naview_xy_coordinates(rg.pairtable);

        if (naViewPositions !== 0) {
          for (let i = 0; i < naViewPositions.nbase; i++) {
            positions.push([naViewPositions.x[i], naViewPositions.y[i]]);
          }
        }
      } else {
        positions = simpleXyCoordinates(rg.pairtable);
      }

      rg.addPositions('nucleotide', positions)
        //.reinforceStems()
        //.reinforceLoops()
        //.addExtraLinks(data.extraLinks)
        .addLabels(options.startNucleotideNumber, options.labelInterval);

      // create a transform that will fit the molecule to the
      // size of the viewport (canvas, svg, whatever)
      const fillViewportTransform = createTransformToFillViewport(
        rg.nodes.map(function (d: any) {
          return d.x;
        }),
        rg.nodes.map(function (d: any) {
          return d.y;
        }),
      );
      plot.attr('transform', fillViewportTransform);

      const nucleotideNodes = rg.nodes.filter(function (d: any) {
        return d.nodeType == 'nucleotide';
      });

      const labelNodes = rg.nodes.filter(function (d: any) {
        return d.nodeType == 'label';
      });

      const links = rg.links;

      createLinks(plot, links);
      createNucleotides(plot, nucleotideNodes);
      createLabels(plot, labelNodes);
      createName(d3.select(this), data.name);

      if (options.bundleExternalLinks) {
        makeExternalLinksBundle(plot, links);
      }
    });
  }

  chart.width = function (_: number) {
    if (!arguments.length) return options.width;
    options.width = _;
    return chart;
  };

  chart.height = function (_: number) {
    if (!arguments.length) return options.height;
    options.height = _;
    return chart;
  };

  chart.showNucleotideLabels = function (_: boolean) {
    if (!arguments.length) return options.showNucleotideLabels;
    options.showNucleotideLabels = _;
    return chart;
  };

  chart.rnaEdgePadding = function (_: number) {
    if (!arguments.length) return options.rnaEdgePadding;
    options.rnaEdgePadding = _;
    return chart;
  };

  chart.nucleotideRadius = function (_: number) {
    if (!arguments.length) return options.nucleotideRadius;
    options.nucleotideRadius = _;
    return chart;
  };

  chart.labelInterval = function (_: number) {
    if (!arguments.length) return options.labelInterval;
    options.labelInterval = _;
    return chart;
  };

  chart.showNucleotideLabels = function (_: boolean) {
    if (!arguments.length) return options.showNucleotideLabels;
    options.showNucleotideLabels = _;
    return chart;
  };

  chart.startNucleotideNumber = function (_: number) {
    if (!arguments.length) return options.startNucleotideNumber;
    options.startNucleotideNumber = _;
    return chart;
  };

  chart.bundleExternalLinks = function (_: boolean) {
    if (!arguments.length) return options.bundleExternalLinks;
    options.bundleExternalLinks = _;
    return chart;
  };

  chart.rnaLayout = function (_: RnaLayout) {
    if (!arguments.length) return options.rnaLayout;
    options.rnaLayout = _;
    return chart;
  };

  chart.namePosition = function (_: string) {
    if (!arguments.length) return options.namePosition;
    options.namePosition = _;
    return chart;
  };

  return chart;
}
