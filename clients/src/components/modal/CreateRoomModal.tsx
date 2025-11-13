
import { useState } from "react";
import { useAppSettings } from "../../context/appSetting";
import { useSocket } from "../../hooks/useSocket";
import CustomButton from "../customButton";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotifycationContext";
import { CustomSelectTab } from "../CustomSelectTab";
import type { RoomPlayerNumber, RoomType } from "../../types/game";

interface Props {
    label?: string;
    onCancel?: () => void;
    onClose?: () => void
}

const CreateRoomModal = ({ label, onCancel, onClose }: Props) => {
    const { t, playerName, playerId } = useAppSettings();
    const [loading, setLoading] = useState<boolean>(false)
    const [roomType, setRoomType] = useState<RoomType>("classic")
    const [boardSize, setBoardSize] = useState<number>(16)
    const [roomPlayerNumber, setRoomPlayerNumber] = useState<RoomPlayerNumber>(2)
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
        const boardSizeTemp = roomType==="classic"? 10 : boardSize;
        const RoomPlayerNumberTemp = roomType==="classic"?2:roomPlayerNumber;
        createRoom(playerName, playerId, roomType, boardSizeTemp, RoomPlayerNumberTemp, (res) => {
            clearTimeout(timeout)
            if (!res.room) {
                setLoading(false)
                notify(`${t("createRoomFail") + res?.error}`, 'error');
                return;
            }
            nagigate(`/room/${res.room.id}`)
            notify(t("createRoomSuccess"), 'success');
        })
        // console.log(roomType,roomPlayerNumber,boardSize);
    }
    return (
        <div>
            <div>
                {label}
            </div>
            <div className="mb-4">
                <CustomSelectTab
                    label={t("room_type")}
                    options={["classic", "one_board"]}
                    value={roomType}
                    onChange={val => {
                        setRoomType(val as RoomType)
                    }}
                    renderLabel={(val) => (val === "classic" ? "Classic" : "Một Board")}
                    className="mb-1"
                />
                <p className="text-[.9rem] text-text">
                    <span className="font-bold">{t("description_type").toUpperCase()}:</span> 
                    <span className="italic ml-2 text-btn-bg">
                        {roomType==="classic"? t("type_classic_info"):t("type_one_board_info")}
                    </span>
                    
                </p>
            </div>


            {
                roomType === "one_board" && <>
                    <CustomSelectTab
                        label={t("board_size")}
                        options={[12, 16, 20]}
                        value={boardSize}
                        onChange={val => {
                            setBoardSize(val as number)
                        }}
                        renderLabel={(val) => {
                            switch (val) {
                                case 12: return "12x12";
                                case 16: return "16x16";
                                case 20: return "20x20";
                            }
                        }}
                        className="mb-4"
                    />
                    <CustomSelectTab
                        label={t("room_player_number")}
                        options={[2, 3, 4]}
                        value={roomPlayerNumber}
                        onChange={val => {
                            setRoomPlayerNumber(val as RoomPlayerNumber)
                        }}
                        renderLabel={(val) => {
                            switch (val) {
                                case 2: return "2";
                                case 3: return "3";
                                case 4: return "4";
                            }
                        }}
                        className="mb-4"
                    />
                </>
            }

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