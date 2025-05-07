import { insertListing } from "./data/insert-listing.js";

import * as scrappingCasaImoveis from "./scrappers/casa-imoveis.js";

async function main() {
  const listings = await scrappingCasaImoveis.execute(
    "https://casaimoveisimb.com.br/imoveis"
  );

  for (const listing of listings) {
    await insertListing(listing);
  }
}

main();
