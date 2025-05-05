export async function fetchCardData(name: string) {
  const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
  const data = await response.json();
  if (data.object === 'error') throw new Error(data.details || 'Card not found');

  const rulingsRes = await fetch(data.rulings_uri);
  const rulingsData = await rulingsRes.json();

  return { card: data, rulings: rulingsData.data };
}
