export interface Layout {
  name: string;
  html: string;
}

export function findPageLayout(pageName: string, layouts: Layout[]): Layout {
  for (const layout of layouts) {
    if (pageName.startsWith(layout.name)) return layout;
  }

  return null;
}
