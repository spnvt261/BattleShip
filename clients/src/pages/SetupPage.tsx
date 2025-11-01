import { AiOutlineDrag } from "react-icons/ai";
import BoardSetup, { type BoardSetupRef } from "../components/gameEntity/BoardSetup"
import { useAppSettings } from "../context/appSetting"
import { FaRotateLeft } from "react-icons/fa6";
import { FaRandom } from "react-icons/fa";
import { useRef } from "react";
const SetupPage = () => {
    const { t } = useAppSettings();
    const boardRef = useRef<BoardSetupRef>(null);
    const handleReady = () => {
        if (!boardRef.current) return;
        console.log("Ships:", boardRef.current?.getShips())
    };
    const handleShipsChange = (ships: Record<string, { x: number; y: number; isVertical: boolean }>) => {
        // Cập nhật state tạm thời hoặc chỉ log
        console.log("Ships updated:", ships);
    };
    return (
        <div className="flex justify-center px-2 py-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-center w-full p-2 border ">
                    <p>{t("deployFleet")}</p>
                </div>
                <BoardSetup
                    ref={boardRef}
                    onSetupChange={handleShipsChange}
                    gridCount={10}
                    className="mt-10"

                />
                <div className="w-full flex justify-center items-center">
                    <button
                        onClick={handleReady}
                        className="px-8 py-2 bg-btn-bg2 text-black clip-hexagon hover:bg-gray-100 hover:bg-red-400">
                        {t("ready")}
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-center px-4 mt-16 py-10 min-h-full ml-10 w-[160px]">
                <div className="border-2 border-border">
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("dragToMove")}</p>
                        <AiOutlineDrag size={40} />
                    </div>
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("clickToRotate")}</p>
                        <FaRotateLeft size={40} />
                    </div>
                </div>
                <div className=" flex items-center justify-center w-[60px] h-[60px] mt-4 bg-btn-bg2 text-black rounded-full hover:bg-btn-hover">
                    <button onClick={() => {
                        boardRef.current?.randomizeShips()
                    }}>
                        <FaRandom size={30} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SetupPage