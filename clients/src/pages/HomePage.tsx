
import ConfirmModal from "../components/modal/ConfirmModal";
import JoinRoomModal from "../components/modal/JoinRoomModal";
import ModalToggle from "../components/modal/ModalToggle";
import SettingModal from "../components/modal/SettingModal";
import { useAppSettings } from "../context/appSetting";

interface Props { }

const HomePage = ({ }: Props) => {
    const { t } = useAppSettings();
    const handleCreateRoom = () => {

    }
    return (
        <div className="w-full h-screen overflow-hidden bg-bg">
            <div className="flex flex-col items-center justify-center h-full">
                <div
                    style={{
                        textShadow: `
                        0 0 5px #00aaff,
                        0 0 10px #00aaff,
                        0 0 20px #00aaff,
                        0 0 40px #00aaff
                        `
                    }}
                >
                    <h1 className="text-4xl md:text-6xl mb-10 font-battle tracking-widest text-text  animate-pulse"
                        // style={{
                        //     textShadow: `
                        //     2px 2px 4px rgba(0, 0, 0, 0.2),
                        //     -2px -2px 4px rgba(255, 255, 255, 0.4)
                        //     `
                        // }}
                    >
                        BATTLE SHIP
                    </h1>
                </div>

                <div className="mx-auto">
                    <ModalToggle
                        btnLabel={t("create")}
                        formTitle={t("createLabel")}
                        children={<ConfirmModal
                            onConfirm={handleCreateRoom}
                        />}
                    />
                    <ModalToggle
                        btnLabel={t("join")}
                        formTitle={t("joinLabel")}
                        children={<JoinRoomModal />}
                    />
                    <ModalToggle
                        btnLabel={t("settings")}
                        formTitle={t("settings")}
                        children={<SettingModal />}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;