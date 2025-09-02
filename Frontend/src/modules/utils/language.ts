export class Language {
  private static instance: Language;

  private constructor() {}

  static getInstance(): Language {
    if (!Language.instance) {
      Language.instance = new Language();
    }
    return Language.instance;
  }

  static getLanguage(): 'es' | 'en' {
    return (localStorage.getItem('language') as 'es' | 'en') || 'es';
  }

  static setLanguage(lang: 'es' | 'en') {
    localStorage.setItem('language', lang);
    const langButton = document.getElementById('lang-toggle') as HTMLButtonElement;
    if (langButton) {
      langButton.textContent = lang.toUpperCase();
    }
  }

  static toggleLanguage(): 'es' | 'en' {
    const currentLang = this.getLanguage();
    const newLang = currentLang === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
    return newLang;
  }
}

export function getLanguage(): 'es' | 'en' {
  return Language.getLanguage();
}

export function setLanguage(lang: 'es' | 'en') {
  Language.setLanguage(lang);
}

export function toggleLanguage(): 'es' | 'en' {
  return Language.toggleLanguage();
}
