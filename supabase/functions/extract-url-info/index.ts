import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting info from URL:', url);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch the URL content
    let pageContent = '';
    let pageTitle = '';
    let ogImage = '';
    
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProjectBot/1.0)',
        },
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          pageTitle = titleMatch[1].trim();
        }
        
        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        if (descMatch) {
          pageContent = descMatch[1].trim();
        }
        
        // Extract og:image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        if (ogImageMatch) {
          ogImage = ogImageMatch[1].trim();
        }
        
        // Get first 2000 chars of visible text for AI context
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000);
        
        if (textContent) {
          pageContent = textContent;
        }
      }
    } catch (fetchError) {
      console.log('Could not fetch URL directly, will use AI to infer:', fetchError);
    }

    // Check if it's a GitHub URL
    const isGithub = url.includes('github.com');
    let repoInfo = null;
    
    if (isGithub) {
      const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (repoMatch) {
        const [, owner, repo] = repoMatch;
        try {
          const apiResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'ProjectBot/1.0',
            },
          });
          if (apiResponse.ok) {
            repoInfo = await apiResponse.json();
            console.log('GitHub repo info fetched:', repoInfo.name);
          }
        } catch (e) {
          console.log('Could not fetch GitHub API:', e);
        }
      }
    }

    // Build context for AI
    let context = `URL: ${url}\n`;
    if (repoInfo) {
      context += `GitHub Repository: ${repoInfo.full_name}\n`;
      context += `GitHub Description: ${repoInfo.description || 'No description'}\n`;
      context += `Stars: ${repoInfo.stargazers_count}, Forks: ${repoInfo.forks_count}\n`;
      context += `Language: ${repoInfo.language || 'Unknown'}\n`;
      context += `Topics: ${repoInfo.topics?.join(', ') || 'None'}\n`;
    }
    if (pageTitle) {
      context += `Page Title: ${pageTitle}\n`;
    }
    if (pageContent) {
      context += `Page Content: ${pageContent}\n`;
    }

    // Use AI to extract/generate project info
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You extract project information from URLs. Return a JSON object with these fields:
- title: A clear, concise project title (max 60 chars)
- description: A compelling 1-2 sentence description of what the project does (max 200 chars)
- tags: An array of 2-5 relevant tags (like "AI", "React", "Python", etc.)

Be concise and focus on what makes the project interesting. If you can't determine something, make a reasonable inference from the URL or leave it minimal.`
          },
          {
            role: 'user',
            content: `Extract project info from this:\n\n${context}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try manual entry.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI extraction failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content);

    // Parse AI response
    let extracted = { title: '', description: '', tags: [] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('Could not parse AI response as JSON, using fallbacks');
      // Fallback to scraped data
      extracted.title = pageTitle || url.split('/').pop() || 'Untitled Project';
      extracted.description = pageContent?.substring(0, 200) || '';
    }

    // Determine screenshot URL
    let screenshotUrl = ogImage;
    if (!screenshotUrl && isGithub && repoInfo) {
      // Use GitHub's social preview
      screenshotUrl = `https://opengraph.githubassets.com/1/${repoInfo.full_name}`;
    }

    const result = {
      title: extracted.title || pageTitle || 'Untitled Project',
      description: extracted.description || '',
      screenshot: screenshotUrl || '',
      tags: extracted.tags || [],
      repoUrl: isGithub ? url : '',
      liveUrl: !isGithub ? url : '',
    };

    console.log('Extraction result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-url-info:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Extraction failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
