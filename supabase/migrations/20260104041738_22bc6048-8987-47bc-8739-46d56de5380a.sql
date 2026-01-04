-- Drop the unused email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;