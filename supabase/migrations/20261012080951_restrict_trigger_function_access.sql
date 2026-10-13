/*
# Restrict trigger function access

1. Revoke EXECUTE on handle_new_user() from anon and authenticated — it's a trigger
   function that should only fire via the database trigger, not via the API.
2. Keep is_admin() executable by authenticated and anon — it returns only a boolean
   and is needed by the frontend to determine admin status.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
