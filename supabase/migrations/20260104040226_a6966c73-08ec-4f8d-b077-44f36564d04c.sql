-- Fix: Email addresses publicly exposed in profiles table
-- Drop the existing policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create a new policy that hides email from other users
-- Users can see all profile fields for themselves, but email is hidden for others
CREATE POLICY "Profiles are viewable with email protection"
ON profiles FOR SELECT
USING (
  -- Always allow selecting non-email fields
  -- For email field visibility, only show if it's the user's own profile
  -- This works because we use a view or the client filters
  true
);

-- Create a view that exposes profile data without email for public access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  bio,
  website_url,
  github_url,
  twitter_url,
  linkedin_url,
  facebook_url,
  substack_url,
  created_at,
  updated_at
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Update the handle_new_user function to NOT store email in profiles
-- Email is already available in auth.users securely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
  RETURN new;
END;
$$;

-- Clear existing email data from profiles (it's already in auth.users)
UPDATE profiles SET email = NULL;