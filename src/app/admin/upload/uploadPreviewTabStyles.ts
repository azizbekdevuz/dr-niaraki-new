/** CV upload preview tab strip — active vs idle states. */
export const CV_PREVIEW_TAB_BASE = 'px-6 py-3 text-sm font-medium transition-colors';

export const cvPreviewTabClasses = (active: boolean) =>
  active
    ? `${CV_PREVIEW_TAB_BASE} border-b-2 border-accent-primary bg-surface-secondary text-accent-primary`
    : `${CV_PREVIEW_TAB_BASE} text-muted hover:text-foreground`;
