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
  url: string;
  banner?: string; // CSS-bakgrund för kortets bild (fallback om bannerImage saknas)
  bannerEmoji?: string;
  bannerImage?: string; // riktig bild från bilddatabasen (Directus assets-URL)
}

export interface MobileAppDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  banner: string;
  bannerEmoji: string;
  tags: string[];
  kind: 'APK' | 'PWA';
  status: 'active' | 'coming-soon';
  url?: string; // nedladdningslänk (APK) eller appens adress (PWA)
  fileSize?: string;
  bannerImage?: string; // riktig bild från bilddatabasen (Directus assets-URL)
}

export interface DashboardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: 'active' | 'alert';
  type: 'link' | 'page';
  target: string;
  banner?: string;
  bannerEmoji?: string;
}
