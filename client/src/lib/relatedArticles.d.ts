export declare const RELATED_ARTICLES_LIMIT: number

export declare const articleCategoryHubs: Array<{ match: RegExp; href: string; label: string }>

export declare function pickRelatedArticles<T extends { slug: string; category?: string | null; tags?: string | null }>(
  article: { slug: string; category?: string | null; tags?: string | null },
  articles: T[],
  limit?: number,
): T[]
