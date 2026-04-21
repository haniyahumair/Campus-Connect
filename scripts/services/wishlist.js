import { supabase } from "../config/supabase.js";

async function getWishlist(user) {
  if (!user) {
    console.error("User is not logged in.");
    return [];
  }

  const { data: saved, error } = await supabase
    .from("wishlist")
    .select("*, events(*)")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }

  return saved;
}

async function toggleWishlist(user, eventId, heartIcon) {
  if (!user) {
    alert("Please log in to save events to your wishlist.");
    return;
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking wishlist:", fetchError);
      alert("Failed to update wishlist. Please try again.");
      return;
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("Error removing event from wishlist:", deleteError);
        alert("Failed to remove event. Please try again.");
        return;
      }

      heartIcon.src = "/assets/Icons/Heart outline peach.svg";
    } else {
      const { error: insertError } = await supabase
        .from("wishlist")
        .insert({ user_id: user.id, event_id: eventId });

      if (insertError) {
        console.error("Error saving event to wishlist:", insertError);
        alert("Failed to save event. Please try again.");
        return;
      }

      heartIcon.src = "/assets/Icons/Heart filled peach.svg";
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred. Please try again.");
  }
}

export { getWishlist, toggleWishlist };
