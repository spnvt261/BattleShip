import { AiOutlineDrag } from "react-icons/ai";
import BoardSetup, { type BoardSetupRef } from "../components/gameEntity/BoardSetup"
import { useAppSettings } from "../context/appSetting"
import { FaRotateLeft } from "react-icons/fa6";
import { FaRandom } from "react-icons/fa";
import { useEffect, useMemo, useRef } from "react";
import { useRoom } from "../hooks/useRoom";
import { useNotification } from "../context/NotifycationContext";
const SetupPage = () => {
    const { t, playerId } = useAppSettings();
    const {player1,player2} = useRoom();
    const {notify} = useNotification();
    const boardRef = useRef<BoardSetupRef>(null);
    const handleReady = () => {
        if (!boardRef.current) return;
        console.log("Ships:", boardRef.current?.getShips())
    };
    const gridSize = useMemo(() => {
        if (typeof window === "undefined") return 40; 
        return window.innerWidth <= 512 ? 30 : 40; 
    }, []);
    // const handleShipsChange = (ships: Record<string, { x: number; y: number; isVertical: boolean }>) => {
    //    
    //     // console.log("Ships updated:", ships);
    // };
    useEffect(() => {
        if(!player1 && !player2){
            return
        }
        if (playerId!== player1?.id && playerId!==player2?.id) {
            notify(t('error'),'error')
            return;
        }
    }, [])
    return (
        <div className="flex justify-center items-center px-2 py-10 [@media(max-width:512px)]:flex-col">
            <div className="flex flex-col gap-4">
                <div className="flex justify-center w-full p-2 border-2 border-border">
                    <p>{t("deployFleet")}</p>
                </div>
                <BoardSetup
                    ref={boardRef}
                    // onSetupChange={handleShipsChange}
                    gridCount={10}
                    className="mt-10"
                    gridSize={gridSize}

                />
                <div className="w-full flex justify-center items-center mt-4">
                    <button
                        onClick={handleReady}
                        className="px-8 py-2 bg-btn-bg2 text-btn-text clip-hexagon hover:bg-gray-100 hover:bg-red-400">
                        {t("ready")}
                    </button>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-4 items-center mt-10 w-[200px] [@media(max-width:512px)]:w-full ">
                <div className="border-2 border-border mx-10 text-text">
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("dragToMove")}</p>
                        <AiOutlineDrag size={40} />
                    </div>
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("clickToRotate")}</p>
                        <FaRotateLeft size={40} />
                    </div>
                </div>
                <div className=" flex items-center justify-center mx-10 w-[60px] h-[60px] mt-4 bg-btn-bg2 text-btn-text rounded-full hover:bg-btn-hover">
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
