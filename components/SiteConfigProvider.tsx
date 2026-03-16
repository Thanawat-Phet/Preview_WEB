'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getPublicSiteConfig } from '@/lib/actions';

interface SiteConfigContextType {
  siteName: string;
  branding: {
    siteTitle: string;
    logoUrl: string;
    themeColor: string;
    accentColor: string;
  };
  social: {
    discordUrl: string;
    facebookUrl: string;
    facebookPageId: string;
    facebookWidgetEnabled: boolean;
  };
  contact: {
    email: string;
    line: string;
    phone: string;
  };
  isLoaded: boolean;
}

const defaultConfig: SiteConfigContextType = {
  siteName: 'XDNZ Store',
  branding: {
    siteTitle: 'XDNZ Store - Digital Goods Shop',
    logoUrl: '',
    themeColor: '#7c3aed',
    accentColor: '#a855f7',
  },
  social: {
    discordUrl: '',
    facebookUrl: '',
    facebookPageId: '',
    facebookWidgetEnabled: false,
  },
  contact: {
    email: '',
    line: '',
    phone: '',
  },
  isLoaded: false,
};

const SiteConfigContext = createContext<SiteConfigContextType>(defaultConfig);

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfigContextType>(defaultConfig);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const data = await getPublicSiteConfig();
      setConfig({
        ...data,
        isLoaded: true,
      });
      
      // Apply CSS variables for theme colors
      document.documentElement.style.setProperty('--theme-color', data.branding.themeColor);
      document.documentElement.style.setProperty('--accent-color', data.branding.accentColor);
      
      // Update document title
      document.title = data.branding.siteTitle;
    } catch (error) {
      console.error('Failed to load site config:', error);
      setConfig({ ...defaultConfig, isLoaded: true });
    }
  }

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}
