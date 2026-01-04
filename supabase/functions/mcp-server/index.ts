import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_NAME = "lovable-showcase-mcp";
const SERVER_VERSION = "1.0.0";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// MCP Server capabilities (read-only)
const serverCapabilities = {
  resources: {
    subscribe: false,
    listChanged: false,
  },
  tools: {},
};

// Resource definitions
const resourceTemplates = [
  {
    uriTemplate: "project://{id}",
    name: "Project Details",
    description: "Get details of a specific project by ID",
    mimeType: "application/json",
  },
  {
    uriTemplate: "profile://{id}",
    name: "Profile Details",
    description: "Get details of a specific user profile by ID",
    mimeType: "application/json",
  },
];

// Tool definitions (read-only operations)
const tools = [
  {
    name: "list_projects",
    description: "List all projects in the showcase with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of projects to return (default: 50, max: 100)",
        },
        offset: {
          type: "number",
          description: "Number of projects to skip for pagination",
        },
        tag: {
          type: "string",
          description: "Filter projects by tag",
        },
        looking_for_contributors: {
          type: "boolean",
          description: "Filter projects looking for contributors",
        },
      },
    },
  },
  {
    name: "get_project",
    description: "Get detailed information about a specific project",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The project ID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "search_projects",
    description: "Search projects by title or description",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to match against project titles and descriptions",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 20)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_project_stats",
    description: "Get statistics about projects in the showcase",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_profile",
    description: "Get detailed information about a user profile",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The profile/user ID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_profiles",
    description: "List user profiles with optional pagination",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of profiles to return (default: 50, max: 100)",
        },
        offset: {
          type: "number",
          description: "Number of profiles to skip for pagination",
        },
      },
    },
  },
  {
    name: "get_profile_projects",
    description: "Get all project IDs created by a specific profile/user",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: {
          type: "string",
          description: "The profile/user ID",
        },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "get_project_profile",
    description: "Get the profile ID of the user who created a specific project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "The project ID",
        },
      },
      required: ["project_id"],
    },
  },
];

// Handle MCP initialize
function handleInitialize(id: string | number | undefined): JsonRpcResponse {
  console.log("Handling initialize request");
  return {
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: serverCapabilities,
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
    },
  };
}

// Handle tools/list
function handleToolsList(id: string | number | undefined): JsonRpcResponse {
  console.log("Handling tools/list request");
  return {
    jsonrpc: "2.0",
    id,
    result: {
      tools,
    },
  };
}

// Handle resources/list
async function handleResourcesList(id: string | number | undefined): Promise<JsonRpcResponse> {
  console.log("Handling resources/list request");
  
  // Return a list of available project and profile resources
  const [projectsResult, profilesResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("id, username")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (projectsResult.error || profilesResult.error) {
    console.error("Error fetching resources:", projectsResult.error || profilesResult.error);
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: "Internal error fetching resources",
      },
    };
  }

  const projectResources = projectsResult.data?.map((p) => ({
    uri: `project://${p.id}`,
    name: p.title,
    description: `Project: ${p.title}`,
    mimeType: "application/json",
  })) || [];

  const profileResources = profilesResult.data?.map((p) => ({
    uri: `profile://${p.id}`,
    name: p.username || "Anonymous",
    description: `Profile: ${p.username || "Anonymous"}`,
    mimeType: "application/json",
  })) || [];

  return {
    jsonrpc: "2.0",
    id,
    result: {
      resources: [...projectResources, ...profileResources],
    },
  };
}

// Handle resources/templates/list
function handleResourceTemplatesList(id: string | number | undefined): JsonRpcResponse {
  console.log("Handling resources/templates/list request");
  return {
    jsonrpc: "2.0",
    id,
    result: {
      resourceTemplates,
    },
  };
}

// Handle resources/read
async function handleResourcesRead(
  id: string | number | undefined,
  params: { uri: string }
): Promise<JsonRpcResponse> {
  console.log("Handling resources/read request for:", params.uri);

  // Check for project URI
  const projectMatch = params.uri.match(/^project:\/\/(.+)$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id,
        title,
        description,
        screenshot_url,
        repo_url,
        live_url,
        looking_for_contributors,
        tags,
        created_at,
        updated_at,
        user_id,
        profiles!projects_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq("id", projectId)
      .maybeSingle();

    if (error || !project) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32602,
          message: "Project not found",
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      result: {
        contents: [
          {
            uri: params.uri,
            mimeType: "application/json",
            text: JSON.stringify({
              ...project,
              profile_id: project.user_id,
            }, null, 2),
          },
        ],
      },
    };
  }

  // Check for profile URI
  const profileMatch = params.uri.match(/^profile:\/\/(.+)$/);
  if (profileMatch) {
    const profileId = profileMatch[1];
    
    const [profileResult, projectsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url,
          bio,
          github_url,
          twitter_url,
          linkedin_url,
          facebook_url,
          substack_url,
          website_url,
          created_at
        `)
        .eq("id", profileId)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("id")
        .eq("user_id", profileId),
    ]);

    if (profileResult.error || !profileResult.data) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32602,
          message: "Profile not found",
        },
      };
    }

    const projectIds = projectsResult.data?.map((p) => p.id) || [];

    return {
      jsonrpc: "2.0",
      id,
      result: {
        contents: [
          {
            uri: params.uri,
            mimeType: "application/json",
            text: JSON.stringify({
              ...profileResult.data,
              project_ids: projectIds,
            }, null, 2),
          },
        ],
      },
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32602,
      message: "Invalid resource URI format. Use project://{id} or profile://{id}",
    },
  };
}

// Handle tools/call
async function handleToolsCall(
  id: string | number | undefined,
  params: { name: string; arguments?: Record<string, unknown> }
): Promise<JsonRpcResponse> {
  console.log("Handling tools/call request:", params.name);
  const args = params.arguments || {};

  switch (params.name) {
    case "list_projects": {
      const limit = Math.min(Number(args.limit) || 50, 100);
      const offset = Number(args.offset) || 0;

      let query = supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          screenshot_url,
          repo_url,
          live_url,
          looking_for_contributors,
          tags,
          created_at,
          profiles!projects_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (args.tag) {
        query = query.contains("tags", [args.tag]);
      }

      if (args.looking_for_contributors !== undefined) {
        query = query.eq("looking_for_contributors", args.looking_for_contributors);
      }

      const { data: projects, error } = await query;

      if (error) {
        console.error("Error in list_projects:", error);
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: "Failed to fetch projects",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({ projects, count: projects?.length || 0 }, null, 2),
            },
          ],
        },
      };
    }

    case "get_project": {
      if (!args.id) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Missing required parameter: id",
          },
        };
      }

      const { data: project, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          screenshot_url,
          repo_url,
          live_url,
          looking_for_contributors,
          tags,
          created_at,
          updated_at,
          profiles!projects_user_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            github_url,
            twitter_url,
            linkedin_url,
            website_url
          )
        `)
        .eq("id", args.id)
        .single();

      if (error || !project) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Project not found",
          },
        };
      }

      // Also fetch like count
      const { count: likeCount } = await supabase
        .from("project_likes")
        .select("*", { count: "exact", head: true })
        .eq("project_id", args.id);

      // Fetch comment count
      const { count: commentCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("project_id", args.id);

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...project,
                  likes: likeCount || 0,
                  comments: commentCount || 0,
                },
                null,
                2
              ),
            },
          ],
        },
      };
    }

    case "search_projects": {
      if (!args.query) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Missing required parameter: query",
          },
        };
      }

      const limit = Math.min(Number(args.limit) || 20, 50);
      const searchTerm = `%${String(args.query).toLowerCase()}%`;

      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          tags,
          looking_for_contributors,
          created_at,
          profiles!projects_user_id_fkey (
            username
          )
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error in search_projects:", error);
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: "Search failed",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({ results: projects, count: projects?.length || 0 }, null, 2),
            },
          ],
        },
      };
    }

    case "get_project_stats": {
      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      const { count: contributorProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("looking_for_contributors", true);

      const { data: allTags } = await supabase
        .from("projects")
        .select("tags");

      const tagCounts: Record<string, number> = {};
      allTags?.forEach((p) => {
        p.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalProjects: totalProjects || 0,
                  projectsLookingForContributors: contributorProjects || 0,
                  topTags,
                },
                null,
                2
              ),
            },
          ],
        },
      };
    }

    case "get_profile": {
      if (!args.id) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Missing required parameter: id",
          },
        };
      }

      const [profileResult, projectsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            username,
            avatar_url,
            bio,
            github_url,
            twitter_url,
            linkedin_url,
            facebook_url,
            substack_url,
            website_url,
            created_at
          `)
          .eq("id", args.id)
          .maybeSingle(),
        supabase
          .from("projects")
          .select("id, title")
          .eq("user_id", args.id),
      ]);

      if (profileResult.error || !profileResult.data) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Profile not found",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...profileResult.data,
                  projects: projectsResult.data || [],
                  project_count: projectsResult.data?.length || 0,
                },
                null,
                2
              ),
            },
          ],
        },
      };
    }

    case "list_profiles": {
      const limit = Math.min(Number(args.limit) || 50, 100);
      const offset = Number(args.offset) || 0;

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url,
          bio,
          created_at
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error in list_profiles:", error);
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: "Failed to fetch profiles",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({ profiles, count: profiles?.length || 0 }, null, 2),
            },
          ],
        },
      };
    }

    case "get_profile_projects": {
      if (!args.profile_id) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Missing required parameter: profile_id",
          },
        };
      }

      const { data: projects, error } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", args.profile_id);

      if (error) {
        console.error("Error in get_profile_projects:", error);
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: "Failed to fetch projects",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                profile_id: args.profile_id,
                project_ids: projects?.map((p) => p.id) || [],
              }, null, 2),
            },
          ],
        },
      };
    }

    case "get_project_profile": {
      if (!args.project_id) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Missing required parameter: project_id",
          },
        };
      }

      const { data: project, error } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", args.project_id)
        .maybeSingle();

      if (error || !project) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Project not found",
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                project_id: args.project_id,
                profile_id: project.user_id,
              }, null, 2),
            },
          ],
        },
      };
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Unknown tool: ${params.name}`,
        },
      };
  }
}

// Handle ping
function handlePing(id: string | number | undefined): JsonRpcResponse {
  console.log("Handling ping request");
  return {
    jsonrpc: "2.0",
    id,
    result: {},
  };
}

// Main request handler
async function handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { method, id, params } = request;

  console.log(`Processing MCP method: ${method}`);

  switch (method) {
    case "initialize":
      return handleInitialize(id);
    case "initialized":
      // Notification, no response needed
      return null;
    case "ping":
      return handlePing(id);
    case "tools/list":
      return handleToolsList(id);
    case "tools/call":
      return await handleToolsCall(id, params as { name: string; arguments?: Record<string, unknown> });
    case "resources/list":
      return await handleResourcesList(id);
    case "resources/templates/list":
      return handleResourceTemplatesList(id);
    case "resources/read":
      return await handleResourcesRead(id, params as { uri: string });
    default:
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET request for server info
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocolVersion: PROTOCOL_VERSION,
        description: "Read-only MCP server for Lovable Showcase projects",
        capabilities: serverCapabilities,
        tools: tools.map((t) => ({ name: t.name, description: t.description })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = await req.json();
    console.log("Received MCP request:", JSON.stringify(body));

    // Handle batch requests
    if (Array.isArray(body)) {
      const responses: JsonRpcResponse[] = [];
      for (const request of body) {
        const response = await handleRequest(request);
        if (response !== null) {
          responses.push(response);
        }
      }
      return new Response(JSON.stringify(responses), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle single request
    const response = await handleRequest(body);
    if (response === null) {
      // Notification, return empty success
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing MCP request:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : "Unknown error",
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
