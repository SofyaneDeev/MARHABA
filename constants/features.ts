/**
 * In-app booking requests to local guides (Book tab → "Request to book").
 *
 * Off until real, licensed guides join and someone receives each request
 * (an email alert or the guide's WhatsApp). While off, the Book tab shows
 * only the partner sites, and the request page says it isn't available.
 * The Supabase tables (`experiences`, `booking_requests`) are kept as they are.
 */
export const GUIDE_REQUESTS_ENABLED = false;
