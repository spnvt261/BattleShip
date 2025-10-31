import { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

type Theme = "light" | "dark";
type Language = "vi" | "en";

interface AppSettingsContextType {
    theme: Theme;
    language: Language;
    playerName: string;
    setPlayerName: (name: string) => void;
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        return (localStorage.getItem("theme") as Theme) || "dark";
    });
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem("language") as Language) || "vi";
    });
    const [playerName, setPlayerNameState] = useState<string>(() => {
        const storedName = localStorage.getItem("player_name");
        if (storedName && storedName !== "") return storedName.trim();
        const randomName = `user${Math.floor(Math.random() * 9000) + 1000}`;
        localStorage.setItem("player_name", randomName);
        return randomName;
    });

    const setPlayerName = (name: string) => {
        if (name == "" || !name) {
            const randomName = `user${Math.floor(Math.random() * 9000) + 1000}`;
            localStorage.setItem("player_name", randomName);
            setPlayerNameState(randomName)
            return;
        }
        setPlayerNameState(name);
        localStorage.setItem("player_name", name);
    }
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const setLanguage = (newLang: Language) => {
        setLanguageState(newLang);
        localStorage.setItem("language", newLang);
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const translations = language === "en" ? en : vi;

    const t = (key: string) => translations[key as keyof typeof translations] || key;
    return (
        <AppSettingsContext.Provider value={{ theme, language, playerName, setTheme, setLanguage, t, setPlayerName }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
    return ctx;
};
