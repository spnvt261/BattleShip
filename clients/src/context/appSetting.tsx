import { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

type Theme = "light" | "dark";
type Language = "vi" | "en";

interface AppSettingsContextType {
    theme: Theme;
    language: Language;
    playerName: string;
    playerId: string;
    setPlayerName: (name: string) => void;
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: Language) => void;
    t: (key: string, variables?: Record<string, string>) => string;
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

    const [playerId] = useState<string>(() => {
        const storedId = localStorage.getItem("player_id");
        if (storedId && storedId !== "") return storedId.trim();
        const randomId = `${Math.floor(Math.random() * 9000000) + 1000000}`;
        localStorage.setItem("player_id", randomId);
        return randomId;
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

    const t = (key: string, variables?: Record<string, string>) => {
        let text = translations[key as keyof typeof translations] || key;

        if (variables) {
            Object.keys(variables).forEach((k) => {
                const regex = new RegExp(`{{${k}}}`, "g");
                text = text.replace(regex, variables[k]);
            });
        }

        return text;
    };
    return (
        <AppSettingsContext.Provider value={{ theme, language, playerName, setTheme, setLanguage, t, setPlayerName, playerId }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
    return ctx;
};
