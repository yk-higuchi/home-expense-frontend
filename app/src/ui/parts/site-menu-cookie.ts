export const MENU_COOKIE = "site-menu";
export const MENU_COLLAPSED = "collapsed";

export const isMenuCollapsed = (value: string | undefined): boolean =>
  value === MENU_COLLAPSED;
