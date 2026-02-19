export const AUSTEN_QUOTES_ASSETS = {
  it_is_a_truth: {
    grid: '/custom_logos/drawings/images_grid/austen/quotes/it-is-a-truth-b-grid.webp',
    stripe: '/custom_logos/drawings/images_stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp',
    original: '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp',
    match: ['truth', 'it-is-a-truth'],
  },
  you_must_allow_me: {
    grid: '/custom_logos/drawings/images_grid/austen/quotes/you-must-allow-me-b-grid.webp',
    stripe: '/custom_logos/drawings/images_stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp',
    original: '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp',
    match: ['allow me', 'you-must-allow-me'],
  },
  body_and_soul: {
    grid: '/custom_logos/drawings/images_grid/austen/quotes/body-and-soul-b-grid.webp',
    stripe: '/custom_logos/drawings/images_stripe/austen/quotes/black/body-and-soul-b-stripe.webp',
    original: '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/body-and-soul-b-stripe.webp',
    match: ['body and soul', 'body-and-soul'],
  },
  unsociable_and_taciturn: {
    grid: '/custom_logos/drawings/images_grid/austen/quotes/unsociable-and-taciturn-b-grid.webp',
    stripe: '/custom_logos/drawings/images_stripe/austen/quotes/black/unsociable-and-taciturn-b-stripe.webp',
    original: '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/unsociable-and-taciturn-b-stripe.webp',
    match: ['prefer', 'presfer', 'unsociable', 'unsociable-and-taciturn', 'i-presfer-to-be'],
  },
  half_agony_half_hope: {
    grid: '/custom_logos/drawings/images_grid/austen/quotes/half-agony-half-hope-b-grid.webp',
    stripe: '/custom_logos/drawings/images_stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp',
    original: '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp',
    match: ['half agony', 'half hope', 'half-agony-half-hope'],
  },
};

export function resolveAustenQuoteAssetId(input) {
  if (!input) return null;
  const s = input.toString().toLowerCase();

  for (const [id, entry] of Object.entries(AUSTEN_QUOTES_ASSETS)) {
    if (entry.match?.some((m) => s.includes(m))) return id;
  }

  return null;
}

export function resolveAustenQuoteThumbFromPath(pathLike, kind) {
  if (!pathLike) return null;
  const file = pathLike.toString().split('/').pop()?.toLowerCase() || '';

  const map = {
    'you-must-allow-me.webp': 'you_must_allow_me',
    'you-must-allow-me-b.webp': 'you_must_allow_me',
    'half-agony-half-hope.webp': 'half_agony_half_hope',
    'half-agony-half-hope-b.webp': 'half_agony_half_hope',
    'it-is-a-truth.webp': 'it_is_a_truth',
    'it-is-a-truth-b.webp': 'it_is_a_truth',
    'body-and-soul.webp': 'body_and_soul',
    'body-and-soul-b.webp': 'body_and_soul',
    'i-presfer-to-be.webp': 'unsociable_and_taciturn',
    'unsociable-and-taciturn-b.webp': 'unsociable_and_taciturn',
  };

  const id = map[file];
  if (!id) return null;

  const entry = AUSTEN_QUOTES_ASSETS[id];
  if (!entry) return null;

  return kind === 'stripe' ? entry.stripe : entry.grid;
}

export function resolveAustenQuoteOriginalFromPath(pathLike) {
  if (!pathLike) return null;
  const file = pathLike.toString().split('/').pop()?.toLowerCase() || '';

  const map = {
    'you-must-allow-me.webp': 'you_must_allow_me',
    'you-must-allow-me-b.webp': 'you_must_allow_me',
    'half-agony-half-hope.webp': 'half_agony_half_hope',
    'half-agony-half-hope-b.webp': 'half_agony_half_hope',
    'it-is-a-truth.webp': 'it_is_a_truth',
    'it-is-a-truth-b.webp': 'it_is_a_truth',
    'body-and-soul.webp': 'body_and_soul',
    'body-and-soul-b.webp': 'body_and_soul',
    'i-presfer-to-be.webp': 'unsociable_and_taciturn',
    'unsociable-and-taciturn-b.webp': 'unsociable_and_taciturn',
  };

  const id = map[file];
  if (!id) return null;

  const entry = AUSTEN_QUOTES_ASSETS[id];
  return entry?.original || null;
}
