-- Fix the security definer view issue by dropping it
-- The email protection is already handled by clearing the email data
DROP VIEW IF EXISTS public.public_profiles;