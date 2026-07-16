const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = {
  async startInterview(idea: string): Promise<{ project_id: string; question: string; complete: boolean; turn: number }> {
    const res = await fetch(`${BASE}/api/v1/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async answerQuestion(projectId: string, answer: string): Promise<{ project_id: string; question: string | null; complete: boolean; turn: number }> {
    const res = await fetch(`${BASE}/api/v1/interview/${projectId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async startOrchestration(projectId: string): Promise<void> {
    const res = await fetch(`${BASE}/api/v1/orchestrate/${projectId}`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
  },

  orchestrationStreamUrl(projectId: string): string {
    return `${BASE}/api/v1/orchestrate/${projectId}/stream`;
  },

  async getBlueprint(projectId: string): Promise<Blueprint> {
    const res = await fetch(`${BASE}/api/v1/projects/${projectId}/blueprint`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  exportUrl(projectId: string, format: "markdown" | "pdf" | "readme"): string {
    return `${BASE}/api/v1/export/${projectId}/${format}`;
  },
};

export interface Blueprint {
  project_id: string;
  executive_summary: string;
  problem_statement: string;
  objectives: string[];
  assumptions: string[];
  constraints: string[];
  system_architecture: string;
  tech_stack: string[];
  hardware: string[];
  software_components: string[];
  apis: string[];
  libraries: string[];
  models: string[];
  datasets: string[];
  roadmap: Milestone[];
  bom: BOMItem[];
  estimated_cost: { budget: number; balanced: number; premium: number };
  risks: Risk[];
  skill_requirements: SkillRequirement[];
  github_repos: GitHubRepo[];
  research_papers: ResearchPaper[];
  future_work: string[];
  three_designs: DesignVariant[];
  devil_critique: DevilCritique;
  feasibility: FeasibilityScores;
  architecture_diagram: string;
  talent?: TalentFinderOutput;
  markdown: string;
  created_at: string;
}

export interface PersonProfile {
  name: string;
  role: string;
  platform: string;
  profile_url: string;
  expertise: string[];
  relevance: string;
}

export interface Community {
  name: string;
  platform: string;
  url: string;
  description: string;
  why_relevant: string;
}

export interface TalentFinderOutput {
  key_roles_needed: string[];
  notable_people: PersonProfile[];
  communities: Community[];
  github_search_queries: string[];
  hiring_platforms: string[];
  outreach_tips: string;
}

export interface Milestone {
  phase: number;
  title: string;
  objectives: string[];
  deliverables: string[];
  duration_weeks: number;
  dependencies: string[];
  success_criteria: string[];
}

export interface BOMItem {
  component: string;
  quantity: number;
  unit_cost_usd: number;
  total_cost_usd: number;
  alternatives: string[];
  notes: string;
}

export interface Risk {
  category: string;
  description: string;
  likelihood: string;
  impact: string;
  mitigation: string;
}

export interface SkillRequirement {
  skill: string;
  level_required: string;
  currently_have: boolean;
  learning_time_weeks: number;
  resources: string[];
}

export interface GitHubRepo {
  name: string;
  url: string;
  description: string;
  stars: number;
  language: string;
  relevance: string;
}

export interface ResearchPaper {
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
  url: string;
  relevance: string;
}

export interface DesignVariant {
  label: string;
  estimated_cost_usd: number;
  performance: string;
  complexity: string;
  advantages: string[];
  disadvantages: string[];
  tech_stack: string[];
  hardware: string[];
}

export interface DevilCritique {
  wrong_assumptions: string[];
  failure_points: string[];
  over_engineered: string[];
  under_engineered: string[];
  hidden_costs: string[];
  simplifications: string[];
  senior_challenges: string[];
}

export interface FeasibilityScores {
  technical_feasibility: number;
  commercial_potential: number;
  innovation: number;
  complexity: number;
  scalability: number;
  maintainability: number;
  overall_recommendation: string;
  explanations: Record<string, string>;
}
