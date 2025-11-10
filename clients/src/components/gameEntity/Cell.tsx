import { motion, AnimatePresence } from "framer-motion";
import React from "react";
// import { FaWater } from "react-icons/fa";
import { MdCircle } from "react-icons/md";
import { TbBoom } from "react-icons/tb";

interface Props {
    x: number;
    y: number;
    hasShip?: boolean;
    hit?: boolean;
    shot?: (x: number, y: number) => void;
    className?: string;
    isFocus?: boolean;
    disabled?: boolean;
    small?: boolean
    gridSize:number;
    hasMyShip?:boolean;
    isNewHit?: boolean;
    isNewHitToShip?: boolean;
}

const Cell = ({
    x,
    y,
    hasShip,
    hit,
    className,
    shot,
    isFocus,
    disabled,
    small,
    gridSize,
    hasMyShip,
    isNewHit = false, isNewHitToShip=false
}: Props) => {
    // console.log('cell');
    
    const handleClick = () => {
        if (!hit) {
            shot?.(x, y);
        }
    };
    return (
        <div
            onClick={handleClick}
            className={`
                relative flex items-center justify-center cell-in-board ${hit || disabled?'cell-disabled':''}
                ${className}
                ${(hit || isNewHit) ? ((hasShip || isNewHitToShip) ? "bg-ship-hit opacity-[0.6]" : "bg-water-miss") : `bg-water ${hasMyShip?"!bg-btn-bg":""}`}
                ${isFocus ? "ring-2 ring-accent border-accent z-10" : "border-border-cell"}
                border transition-all duration-200 cursor-pointer select-none
            `}
            style={!small ? { width: gridSize, height: gridSize } : {width:gridSize*0.6,height:gridSize*0.6}}
        >
            <AnimatePresence>
                {(hit || isNewHit) &&(
                    <>
                        <motion.div
                            key={`effect-${x}-${y}`}
                            className={`absolute w-8 h-8 rounded-full ${(hasShip || isNewHitToShip) ? "bg-red-400" : "bg-blue-300"
                                }`}
                            initial={{ scale: 0, opacity: isNewHit?1:0 }}
                            animate={{ scale: isNewHit?3:0, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            onAnimationComplete={() => {
                                const el = document.querySelector(
                                    `[data-effect="${x}-${y}"]`
                                ) as HTMLElement;
                                if (el) {
                                    el.style.zIndex = "-11";
                                    el.style.display = 'none';
                                } 
                            }}
                            data-effect={`${x}-${y}`}
                        />

                        {/* Icon: nß╗ò bom hoß║╖c s├│ng n╞░ß╗¢c */}
                        <motion.div
                            key={`icon-${x}-${y}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="flex justify-center items-center w-full h-full"
                        >
                            {(hasShip || isNewHitToShip) ? (
                                <TbBoom className="text-red-700 w-[90%] h-[90%]" stroke="currentColor"   />
                            ) : (
                                // <FaWater className="text-blue-700 w-[80%] h-[80%]" />
                                <MdCircle 
                                    className="text-gray-700 w-[80%] h-[80%]"  // m├áu lavender
                                    stroke="currentColor"                        // ─æß║úm bß║úo lß║Ñy m├áu tß╗½ text color
                                />
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(Cell) ;
