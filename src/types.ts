export interface AppDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  imageSeed: string;
  status: 'active' | 'archived' | 'alert';
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
