
export interface ScreenComponent {
  id: string;
  type: 'button' | 'text' | 'input' | 'image' | 'card' | 'list' | 'header';
  props: {
    label?: string;
    placeholder?: string;
    content?: string;
    src?: string;
    color?: string;
    style?: string;
  };
}

export interface AppScreen {
  id: string;
  name: string;
  components: ScreenComponent[];
  navigation?: {
    onBack?: string; // id of screen
  };
}

export interface DatabaseTable {
  name: string;
  columns: {
    name: string;
    type: string;
    isNullable: boolean;
  }[];
}

export interface Prototype {
  id: string;
  name: string;
  description: string;
  screens: AppScreen[];
  databaseSchema?: DatabaseTable[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    isDark: boolean;
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  type: 'video' | 'folder' | 'image';
  size: string;
  data?: string; // base64 for images/video thumbnails
}

export enum GenerationStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  GENERATING_UI = 'generating_ui',
  GENERATING_ASSETS = 'generating_assets',
  COMPILING = 'compiling',
  PUSHING_GITHUB = 'pushing_github',
  ANALYZING_CONTEXT = 'analyzing_context',
  SUCCESS = 'success',
  ERROR = 'error'
}
