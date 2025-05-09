import { insertListing } from "./data/insert-listing.js";

import * as scrappingCasaImoveis from "./scrappers/casa-imoveis.js";

async function main() {
  const listings = await scrappingCasaImoveis.execute(
    "https://casaimoveisimb.com.br/imoveis"
  );

  const { error: deleteError } = await clientDB
    .from("listings")
    .delete()
    .eq("agency", "casa_imoveis");

  if (deleteError) {
    return console.error("Error delete all listings:", deleteError);
  }

  for (const listing of listings) {
    await insertListing(listing);
  }

  console.log("Scrapping completed");
}

main();
