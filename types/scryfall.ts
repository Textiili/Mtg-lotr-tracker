export type ScryfallCard = {
  name: string;
  type_line: string;
  prices: {
    eur?: string;
    eur_foil?: string;
    usd?: string;
    usd_foil?: string;
  };
  image_uris?: {
    normal?: string;
    large?: string;
  };
  rulings_uri?: string;
};

export type ScryfallRuling = {
  published_at: string;
  comment: string;
};