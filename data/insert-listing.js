import { clientDB } from "../config/database.js";

export async function insertListing(listing) {
  const { error: deleteError } = await clientDB
    .from("listings")
    .delete()
    .eq("agency", "casa_imoveis");

  if (deleteError) {
    return console.error("Error delete all listings:", deleteError);
  }

  const { error } = await clientDB.from("listings").insert(listing);

  if (error) {
    console.error("Error inserting:", error);
  }
}
