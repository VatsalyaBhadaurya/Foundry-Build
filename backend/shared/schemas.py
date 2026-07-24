from __future__ import annotations

from pydantic import BaseModel, Field


class ProjectRequirements(BaseModel):
    project_id: str
    idea: str
    goal: str = ""
    budget_usd: float | None = None
    timeline_months: int | None = None
    experience_level: str = "intermediate"  # beginner | intermediate | senior
    team_size: int = 1
    country: str | None = None
    deployment_target: str = "cloud"  # cloud | edge | on-prem | embedded | mobile
    performance_needs: str | None = None
    offline_required: bool = False
    constraints: list[str] = Field(default_factory=list)
    project_type: str = "software"  # software | hardware | robotics | ai | embedded | web | mobile | research


class InterviewTurn(BaseModel):
    question: str
    answer: str


class InterviewState(BaseModel):
    project_id: str
    idea: str
    turns: list[InterviewTurn] = Field(default_factory=list)
    requirements: ProjectRequirements | None = None
    complete: bool = False


class GitHubRepo(BaseModel):
    name: str
    url: str
    description: str
    stars: int = 0
    language: str = ""
    relevance: str = ""


class ResearchPaper(BaseModel):
    title: str
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    abstract: str = ""
    url: str = ""
    relevance: str = ""


class BOMItem(BaseModel):
    component: str
    quantity: int = 1
    unit_cost_usd: float = 0.0
    total_cost_usd: float = 0.0
    alternatives: list[str] = Field(default_factory=list)
    notes: str = ""


class Risk(BaseModel):
    category: str  # technical | financial | manufacturing | deployment | scalability | security | maintenance
    description: str
    likelihood: str  # low | medium | high
    impact: str  # low | medium | high
    mitigation: str


class SkillRequirement(BaseModel):
    skill: str
    level_required: str  # beginner | intermediate | senior
    currently_have: bool = False
    learning_time_weeks: int = 0
    resources: list[str] = Field(default_factory=list)


class Milestone(BaseModel):
    phase: int
    title: str
    objectives: list[str]
    deliverables: list[str]
    duration_weeks: int
    dependencies: list[str] = Field(default_factory=list)
    success_criteria: list[str] = Field(default_factory=list)


class DesignVariant(BaseModel):
    label: str  # Budget | Balanced | Premium
    estimated_cost_usd: float
    performance: str
    complexity: str  # low | medium | high
    advantages: list[str]
    disadvantages: list[str]
    tech_stack: list[str]
    hardware: list[str] = Field(default_factory=list)


class FeasibilityExplanations(BaseModel):
    technical_feasibility: str = ""
    commercial_potential: str = ""
    innovation: str = ""
    complexity: str = ""
    scalability: str = ""
    maintainability: str = ""


class FeasibilityScores(BaseModel):
    technical_feasibility: int = Field(ge=0, le=100)
    commercial_potential: int = Field(ge=0, le=100)
    innovation: int = Field(ge=0, le=100)
    complexity: int = Field(ge=0, le=100)
    scalability: int = Field(ge=0, le=100)
    maintainability: int = Field(ge=0, le=100)
    overall_recommendation: str
    explanations: FeasibilityExplanations = Field(default_factory=FeasibilityExplanations)


class PersonProfile(BaseModel):
    name: str = ""
    role: str = ""
    platform: str = ""
    profile_url: str = ""
    expertise: list[str] = Field(default_factory=list)
    relevance: str = ""


class Community(BaseModel):
    name: str = ""
    platform: str = ""
    url: str = ""
    description: str = ""
    why_relevant: str = ""


class TalentFinderOutput(BaseModel):
    key_roles_needed: list[str] = Field(default_factory=list)
    notable_people: list[PersonProfile] = Field(default_factory=list)
    communities: list[Community] = Field(default_factory=list)
    github_search_queries: list[str] = Field(default_factory=list)
    hiring_platforms: list[str] = Field(default_factory=list)
    outreach_tips: str = ""


class DevilCritique(BaseModel):
    wrong_assumptions: list[str]
    failure_points: list[str]
    over_engineered: list[str]
    under_engineered: list[str]
    hidden_costs: list[str]
    simplifications: list[str]
    senior_challenges: list[str]


class Blueprint(BaseModel):
    project_id: str
    executive_summary: str
    problem_statement: str
    objectives: list[str]
    assumptions: list[str]
    constraints: list[str]
    system_architecture: str
    tech_stack: list[str]
    hardware: list[str]
    software_components: list[str]
    apis: list[str]
    libraries: list[str]
    models: list[str]
    datasets: list[str]
    roadmap: list[Milestone]
    bom: list[BOMItem]
    estimated_cost: dict[str, float]  # budget | balanced | premium total
    risks: list[Risk]
    skill_requirements: list[SkillRequirement]
    github_repos: list[GitHubRepo]
    research_papers: list[ResearchPaper]
    future_work: list[str]
    three_designs: list[DesignVariant]
    devil_critique: DevilCritique
    feasibility: FeasibilityScores
    architecture_diagram: str = ""
    talent: TalentFinderOutput | None = None
    markdown: str
    created_at: str


class Project(BaseModel):
    project_id: str
    idea: str
    status: str  # interview | orchestrating | complete | error
    interview: InterviewState | None = None
    blueprint: Blueprint | None = None
    created_at: str
    updated_at: str
