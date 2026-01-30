import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'es';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        "alert.critical": "CRITICAL BLOOD REQUEST",
        "alert.shortage": "Severe O- Shortage Detected",
        "btn.donate": "Donate Now",
        "status.stable": "Stable",
        "status.critical": "Critical",
        "dashboard.title": "Emergency Command Center",
        "crisis.active": "CRISIS MODE ACTIVE"
    },
    hi: {
        "alert.critical": "गंभीर रक्त अनुरोध",
        "alert.shortage": "गंभीर O- कमी का पता चला",
        "btn.donate": "अभी दान करें",
        "status.stable": "स्थिर",
        "status.critical": "नाज़ुक",
        "dashboard.title": "आपातकालीन कमांड सेंटर",
        "crisis.active": "संकट मोड सक्रिय"
    },
    es: {
        "alert.critical": "SOLICITUD CRÍTICA DE SANGRE",
        "alert.shortage": "Escasez severa de O- detectada",
        "btn.donate": "Donar Ahora",
        "status.stable": "Estable",
        "status.critical": "Crítico",
        "dashboard.title": "Centro de Comando de Emergencia",
        "crisis.active": "MODO CRISIS ACTIVO"
    }
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
