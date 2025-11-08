
import { useState } from "react";
import { useAppSettings } from "../../context/appSetting";
import { useSocket } from "../../hooks/useSocket";
import CustomButton from "../customButton";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotifycationContext";

interface Props {
    label?: string;
    onCancel?: () => void;
    onClose?: () => void
}

const CreateRoomModal = ({ label, onCancel, onClose }: Props) => {
    const { t, playerName, playerId } = useAppSettings();
    const [loading, setLoading] = useState<boolean>(false)
    const { createRoom } = useSocket();

    // const {loadRoom} = useGame();
    const nagigate = useNavigate()
    const { notify } = useNotification()
    const handleCreateRoom = () => {
        setLoading(true)
        const timeout = setTimeout(() => {
            notify(t("connect_error"), "error");
            setLoading(false)
        }, 3000)
        notify(t("creatingRoom"), 'loading');
        createRoom(playerName, playerId, (res) => {
            clearTimeout(timeout)
            if (!res.room) {
                setLoading(false)
                notify(`${t("createRoomFail") + res?.error}`, 'error');
                return;
            }
            nagigate(`/room/${res.room.id}`)
            notify(t("createRoomSuccess"), 'success');
        })
    }
    return (
        <div>
            <div>
                {label}
            </div>
            <div className="flex gap-2 justify-end mt-10">
                <CustomButton
                    label={t("cancel")}
                    onClick={onCancel ? onCancel : onClose}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={loading}
                />
                <CustomButton
                    label={t("confirm")}
                    onClick={handleCreateRoom}
                    disabled={loading}
                />

            </div>

        </div>
    )
}

export default CreateRoomModal