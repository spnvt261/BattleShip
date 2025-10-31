import { useState } from "react";
import { CustomSelectTab } from "../CustomSelectTab";
import CustomButton from "../customButton";
import { useAppSettings } from "../../context/appSetting";
import CustomTextField from "../CustomTextField";

interface Props {
    onClose?: () => void;
}

const SettingModal: React.FC<Props> = ({ onClose }) => {
    const { theme, language, setTheme, setLanguage, playerName, setPlayerName } = useAppSettings();
    const { t } = useAppSettings();
    const languageOptions = [
        { label: "Tiếng Việt", value: "vi" },
        { label: "English", value: "en" },
    ];
    const themeOptions = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
    ];
    // state tạm cho UI (chưa lưu)
    const [tempLanguage, setTempLanguage] = useState(language);
    const [tempTheme, setTempTheme] = useState(theme);
    const [tempName, setTempName] = useState(playerName);
    const [nameError, setNameError] = useState("");

    const validateName = (name: string) => {
        if (name.trim().length < 3) return t("nameTooShort") || "Tên phải có ít nhất 3 ký tự.";
        if (name.trim().length > 30) return t("nameTooLong") || "Tên không được quá 30 ký tự.";
        return "";
    };

    const handleSave = () => {
        const errorMsg = validateName(tempName);
        setNameError(errorMsg);
        if (errorMsg) return; // Dừng nếu lỗi

        setLanguage(tempLanguage);
        setTheme(tempTheme);
        setPlayerName(tempName.trim());
        onClose?.();
    };

    const handleCancel = () => {
        setTempLanguage(language);
        setTempTheme(theme);

        //rollback
        setTheme(theme);
        setLanguage(language);
        onClose?.();
    };


    return (
        <div className="flex flex-col gap-4">
            <CustomTextField
                name="name"
                label={t("displayName")}
                onChange={(e) => {setTempName(e.target.value) 

                }}
                value={tempName}
                error={!!nameError}
                helperText={nameError || ""}
            />

            <CustomSelectTab
                label={t("language")}
                options={languageOptions.map(o => o.value)}
                value={tempLanguage}
                onChange={val => {
                    setTempLanguage(val as "vi" | "en")
                }}
                renderLabel={(val) => (val === "vi" ? "Tiếng Việt" : "English")}
                className="mb-3"
            />

            <CustomSelectTab
                label={t("theme")}
                options={themeOptions.map(o => o.value)}
                value={tempTheme}
                onChange={(val) => {
                    setTempTheme(val as "light" | "dark");
                    document.documentElement.setAttribute("data-theme", val);
                }}
                renderLabel={(val) => (val === "light" ? t("light") : t("dark"))}
            />

            <div className="flex justify-end gap-2 mt-6">
                <CustomButton
                    label={t("cancel")}
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleCancel}
                />
                <CustomButton
                    label={t("save")}
                    className=""
                    onClick={handleSave}
                />
            </div>
        </div>
    );
};

export default SettingModal;
