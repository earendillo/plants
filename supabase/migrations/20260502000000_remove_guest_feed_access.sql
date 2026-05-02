-- Remove anonymous access to feed_plant_guest RPC.
-- Anonymous share links should only allow watering, not feeding.
REVOKE EXECUTE ON FUNCTION feed_plant_guest(uuid, text) FROM anon;
