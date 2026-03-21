export interface AppDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  imageSeed: string;
  status: 'active' | 'archived' | 'alert';
  createdAt: string; // ISO date string
  type?: 'Web App' | 'PWA' | 'Mobile App' | 'Game';
}

export interface DashboardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: 'active' | 'alert';
  type: 'link' | 'page';
  target: string;
}
