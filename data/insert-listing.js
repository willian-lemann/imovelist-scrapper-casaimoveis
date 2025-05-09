import { clientDB } from "../config/database.js";

export async function insertListing(listing) {
  const { error } = await clientDB.from("listings").insert(listing);

  if (error) {
    console.error("Error inserting:", error);
  }
}
