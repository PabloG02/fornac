import './d3-context-menu.css';
import ArrowIcon from './img/play.svg';

import d3 from './d3-shim.js';

type ContextMenuTitle = string | ((data: any) => string);
type ContextMenuAction = (elm: Element, d: any, i: number, mousePos: [number, number] | null) => void;

interface ContextMenuItem {
  title?: ContextMenuTitle;
  action?: ContextMenuAction;
  children?: ContextMenuItem[];
  disabled?: boolean;
  divider?: boolean;
  childUid?: string;
}

type ContextMenuSource = ContextMenuItem[] | ((data: any) => ContextMenuItem[]);

interface ContextMenuOptions {
  onOpen?: (data: any, index: number) => boolean | void;
  onClose?: () => void;
  rootElement?: Element | null;
  pos?: [number, number];
  orientation?: 'left' | 'right';
  parentStart?: [number, number] | null;
}

export function contextMenu(
  menu: ContextMenuSource,
  opts?: ContextMenuOptions | ((data: any, index: number) => boolean | void),
) {
  let previouslyMouseUp = false;
  let clickAway = () => {};
  const uid = crypto.randomUUID();
  let rootElement: Element | null = null;
  let orientation: 'left' | 'right' = 'right'; // display the menu to the right of the mouse click
  // or parent elemement
  let initialPos: [number, number] | null = null;
  let parentStart: [number, number] | null = null;

  let openCallback: ContextMenuOptions['onOpen'];
  let closeCallback: ContextMenuOptions['onClose'];

  if (typeof opts === 'function') {
    openCallback = opts;
  } else {
    opts = opts || {};
    openCallback = opts.onOpen;
    closeCallback = opts.onClose;
  }

  if (opts && 'rootElement' in opts) rootElement = opts.rootElement ?? null;

  if (opts && 'pos' in opts) {
    // do we want to place this menu somewhere specific?
    initialPos = opts.pos ?? null;
  }

  if (opts && 'orientation' in opts && opts.orientation) {
    orientation = opts.orientation;
  }

  if (opts && 'parentStart' in opts) {
    parentStart = opts.parentStart ?? null;
  }

  const menuClass = `d3-context-menu-${uid}`;

  // create the div element that will hold the context menu
  d3.selectAll(`.${menuClass}`)
    .data([1])
    .enter()
    .append('div')
    .classed('d3-context-menu', true)
    .classed(menuClass, true);

  // close menu
  d3.select('body').on(`click.d3-context-menu-${uid}`, function () {
    if (previouslyMouseUp) {
      previouslyMouseUp = false;
      return;
    }
    console.log('body click close');

    d3.select(`.${menuClass}`).style('display', 'none');
    orientation = 'right';

    if (closeCallback) {
      closeCallback();
    }
  });

  // this gets executed when a contextmenu event occurs
  return function (
    this: Element,
    data: any,
    index: number,
    pMouseUp = false,
    clickAwayFunc: () => void = () => {},
  ) {
    const elm = this;
    let mousePos: [number, number] | null = null;
    const currentThis = this;

    if (rootElement == null) mousePos = d3.mouse(this) as [number, number];
    else mousePos = d3.mouse(rootElement) as [number, number]; // for recursive menus, we need the mouse
    // position relative to another element

    clickAway = clickAwayFunc;
    let openChildMenuUid: string | null = null;

    previouslyMouseUp = pMouseUp;

    d3.selectAll(`.${menuClass}`).html('');
    const list = d3
      .selectAll(`.${menuClass}`)
      .on('contextmenu', function () {
        console.log('context-menu close');
        d3.select(`.${menuClass}`).style('display', 'none');
        orientation = 'right';

        const event = d3.event as any;
        event.preventDefault();
        event.stopPropagation();
      })
      .append('ul');

    const items = typeof menu === 'function' ? menu(data) : menu;

    list
      .selectAll('li')
      .data(items)
      .enter()
      .append('li')
      .attr('class', function (d: ContextMenuItem) {
        console.log('d:', d);
        let ret = '';
        if (d.divider) {
          ret += ' is-divider';
        }
        if (d.disabled) {
          ret += ' is-disabled';
        }
        if (!d.action) {
          ret += ' is-header';
        }
        if ('children' in d) {
          ret += ' d3-context-menu-recursive';
        }
        return ret;
      })
      .html(function (d: ContextMenuItem) {
        if (d.divider) {
          return '<hr>';
        }
        if (!d.title) {
          console.error('No title attribute set. Check the spelling of your options.');
        }
        return typeof d.title === 'string' ? d.title : d.title ? d.title(data) : '';
      })
      .on('click', function (d: ContextMenuItem) {
        if (d.disabled) return; // do nothing if disabled
        if (!d.action) return; // headers have no "action"
        d.action(elm, data, index, mousePos);
        console.log('click close');

        // close all context menus
        d3.selectAll('.d3-context-menu').style('display', 'none');
        orientation = 'right';

        if (closeCallback) {
          closeCallback();
        }
      })
      .on('mouseenter', function (this: HTMLElement, d: ContextMenuItem, i: number) {
        d3.select(this).classed('d3-context-menu-selected', true);

        if (openChildMenuUid != null) {
          // there's a child menu open

          // unselect all items
          d3.select(`.${menuClass}`)
            .selectAll('li')
            .classed('d3-context-menu-selected', false);

          if (typeof d.children == 'undefined') {
            console.log('no children close');
            // no children, so hide any open child menus
            d3.select(`.${openChildMenuUid}`).style('display', 'none');

            openChildMenuUid = null;
            return;
          }

          if (d.childUid == openChildMenuUid) {
            // the correct child menu is already open
            return;
          } else {
            // need to open a different child menu
            console.log('open different child menu close');

            // close the already open one
            d3.select(`.${openChildMenuUid}`).style('display', 'none');

            openChildMenuUid = null;
          }
        }

        // there should be no menu open right now
        if (typeof d.children != 'undefined') {
          const boundingRect = (this as Element).getBoundingClientRect();

          let childrenContextMenu;
          if (orientation == 'left') {
            childrenContextMenu = contextMenu(d.children, {
              rootElement: currentThis,
              pos: [
                boundingRect.left + window.pageXOffset,
                boundingRect.top - 2 + window.pageYOffset,
              ],
              orientation: 'left',
            });
          } else {
            childrenContextMenu = contextMenu(d.children, {
              pos: [
                boundingRect.left + boundingRect.width + window.pageXOffset,
                boundingRect.top - 2 + window.pageYOffset,
              ],
              rootElement: currentThis,
              parentStart: [
                boundingRect.left + window.pageXOffset,
                boundingRect.top - 2 + window.pageYOffset,
              ],
            });
          }

          d.childUid = childrenContextMenu.apply(this, [data, i, true, function () {}]);
          openChildMenuUid = d.childUid ?? null;
        }

        d3.select(this).classed('d3-context-menu-selected', true);
      })
      .on('mouseleave', function (this: HTMLElement) {
        if (openChildMenuUid == null) {
          d3.select(this).classed('d3-context-menu-selected', false);
        }
      });

    list
      .selectAll('.d3-context-menu-recursive')
      .append('img')
      .attr('src', ArrowIcon)
      .attr('width', '14px')
      .attr('height', '14px')
      .style('position', 'absolute')
      .style('right', '5px');

    // the openCallback allows an action to fire before the menu is displayed
    // an example usage would be closing a tooltip
    if (openCallback) {
      if (openCallback(data, index) === false) {
        return uid;
      }
    }

    const contextMenuSelection = d3.select(`.${menuClass}`).style('display', 'block');

    if (initialPos == null) {
      const event = d3.event as any;
      d3.select(`.${menuClass}`)
        .style('left', event.pageX - 2 + 'px')
        .style('top', event.pageY - 2 + 'px');
    } else {
      d3.select(`.${menuClass}`)
        .style('left', `${initialPos[0]}px`)
        .style('top', `${initialPos[1]}px`);
    }

    // check if the menu disappears off the side of the window
    const boundingRect = (contextMenuSelection.node() as Element).getBoundingClientRect();

    if (boundingRect.left + boundingRect.width > window.innerWidth || orientation == 'left') {
      orientation = 'left';

      // menu goes of the end of the window, position it the other way
      if (initialPos == null) {
        // place the menu where the user clicked
        const event = d3.event as any;
        d3.select(`.${menuClass}`)
          .style('left', event.pageX - 2 - boundingRect.width + 'px')
          .style('top', event.pageY - 2 + 'px');
      } else {
        if (parentStart != null) {
          d3.select(`.${menuClass}`)
            .style('left', parentStart[0] - boundingRect.width + 'px')
            .style('top', parentStart[1] + 'px');
        } else {
          d3.select(`.${menuClass}`)
            .style('left', `${initialPos[0] - boundingRect.width}px`)
            .style('top', `${initialPos[1]}px`);
        }
      }
    }

    // display context menu

    if (previouslyMouseUp) return uid;

    const event = d3.event as any;
    event.preventDefault();
    event.stopPropagation();
    //d3.event.stopImmediatePropagation();
    //
    return uid;
  };
}
