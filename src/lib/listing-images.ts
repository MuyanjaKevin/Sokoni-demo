/** Curated Unsplash photos that match common listing titles/categories. */
const KEYWORD_IMAGES: { pattern: RegExp; url: string }[] = [
  {
    pattern: /iphone|ipad|apple\s*(phone|device)/i,
    url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /macbook|mac\s*book|apple\s*laptop/i,
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /samsung|galaxy|android\s*phone|pixel/i,
    url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /xbox|playstation|ps5|ps4|dualsense|controller|nintendo/i,
    url: "https://images.unsplash.com/photo-1606144042614-bcaef788c793?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /jordan|sneaker|trainer|nike\s*air|yeezy|shoe/i,
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /cargo|pants|trouser|corteiz/i,
    url: "https://images.unsplash.com/photo-1624378515194-6db755653051?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /hoodie|fleece|sweatshirt/i,
    url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /levi|jeans|denim/i,
    url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /laptop|notebook|computer|pc\b/i,
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /watch|smartwatch|rolex/i,
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&q=80",
  },
  {
    pattern: /bag|handbag|backpack|purse/i,
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop&q=80",
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop&q=80",
  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop&q=80",
  gaming:
    "https://images.unsplash.com/photo-1612287230202-1ff1d85c1e7f?w=800&h=600&fit=crop&q=80",
};

const GENERIC_URL_PATTERNS = [
  /picsum\.photos/i,
  /placeholder-listing/i,
  /placehold\.co/i,
  /via\.placeholder/i,
];

export function isGenericListingPhoto(url: string): boolean {
  return GENERIC_URL_PATTERNS.some((pattern) => pattern.test(url));
}

/** Pick a relevant stock photo from title keywords, then category, then electronics default. */
export function getSmartListingPhoto(title: string, category: string): string {
  const haystack = `${title} ${category}`;

  for (const { pattern, url } of KEYWORD_IMAGES) {
    if (pattern.test(haystack)) {
      return url;
    }
  }

  return (
    CATEGORY_IMAGES[category.toLowerCase()] ??
    CATEGORY_IMAGES.electronics
  );
}

/** Use real uploads when present; replace placeholder/picsum URLs with smart matches. */
export function resolveListingPhotoUrls(
  title: string,
  category: string,
  photoUrls: string[],
): string[] {
  const smartPhoto = getSmartListingPhoto(title, category);

  if (photoUrls.length === 0) {
    return [smartPhoto];
  }

  if (photoUrls.every(isGenericListingPhoto)) {
    return [smartPhoto];
  }

  return photoUrls.map((url) =>
    isGenericListingPhoto(url) ? smartPhoto : url,
  );
}

export function getListingPrimaryPhoto(
  title: string,
  category: string,
  photoUrls: string[],
): string {
  return resolveListingPhotoUrls(title, category, photoUrls)[0];
}
