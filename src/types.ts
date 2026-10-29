export interface WorkspaceFile {
  id: string;
  name: string;
  language: 'python' | 'javascript' | 'html' | 'dockerfile' | 'yaml' | 'json' | 'markdown' | 'shell';
  content: string;
  readonly?: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
  timestamp: string;
}

export interface RenderBlueprint {
  id: string;
  title: string;
  category: 'Рекомендуется' | 'Ультра-легкий' | 'Полный GUI' | 'AI Workspace';
  ramUsage: string;
  description: string;
  recommendedFor: string;
  dockerfile: string;
  renderYaml: string;
  startScript?: string;
  envVars: { key: string; value: string; desc: string }[];
  pros: string[];
  cons: string[];
  tipsForRenderFree: string[];
}

export interface AlternativeSolution {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  ram: string;
  storage: string;
  offlineSupport: boolean;
  setupTime: string;
  description: string;
  steps: string[];
  bestFor: string;
  link?: string;
}
