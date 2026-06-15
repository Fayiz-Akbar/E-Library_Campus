export const BREAKPOINTS = {
  small: 480,
  tablet: 768,
  desktop: 1024,
};

export const getScreenSize = (width) => ({
  isSmall: width < BREAKPOINTS.small,
  isTablet: width >= BREAKPOINTS.tablet,
  isDesktop: width >= BREAKPOINTS.desktop,
});

export const getContentMaxWidth = (width, fallback = 960) => {
  if (width >= 1200) return fallback;
  if (width >= BREAKPOINTS.desktop) return 900;
  if (width >= BREAKPOINTS.tablet) return 720;
  return '100%';
};

export const getHorizontalPadding = (width) => {
  if (width >= BREAKPOINTS.desktop) return 32;
  if (width >= BREAKPOINTS.tablet) return 28;
  if (width < BREAKPOINTS.small) return 18;
  return 22;
};

export const getCatalogColumns = (width) => {
  if (width >= 1280) return 5;
  if (width >= BREAKPOINTS.desktop) return 4;
  if (width >= BREAKPOINTS.tablet) return 3;
  return 2;
};

export const getGridItemWidth = ({ width, columns, horizontalPadding, gap, maxWidth }) => {
  const usableWidth = typeof maxWidth === 'number'
    ? Math.min(width, maxWidth)
    : width;

  return (usableWidth - horizontalPadding * 2 - gap * (columns - 1)) / columns;
};

export const getResponsiveContentStyle = (width, maxWidth = 960) => ({
  width: '100%',
  maxWidth: getContentMaxWidth(width, maxWidth),
  alignSelf: 'center',
});
