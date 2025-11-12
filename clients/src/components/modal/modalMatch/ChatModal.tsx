import { IoChatboxEllipsesOutline } from "react-icons/io5";
import CustomButton from "../../customButton";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineClose } from "react-icons/ai";
import CustomTextField from "../../CustomTextField";
import { useAppSettings } from "../../../context/appSetting";
import { useChat } from "../../../context/ChatContext";
import type { Message } from "../../../types/game";
import { useGame } from "../../../context/GameContext";
interface Props {
    className?: string
    roomId: string
}
const ChatModal = ({
    className = "",
    roomId

}: Props) => {
    const { t, playerId, playerName } = useAppSettings();
    const { player1, player2 } = useGame();
    const { sendMessage, listMessages } = useChat()
    const [showChatModal, setShowChatModal] = useState<boolean>(false)
    const [inputValue, setInputalue] = useState<string>("")
    const [newMessage, setNewMessage] = useState<Message | null>(null);
    const fisrtRender = useRef<boolean>(true)
    useEffect(() => {
        if (fisrtRender.current) {
            fisrtRender.current = false;
            return
        }
        setNewMessage(listMessages[listMessages.length - 1])
        const timer = setTimeout(() => {
            setNewMessage(null)
        }, 3000)
        return () => {
            clearTimeout(timer)
        }
    }, [listMessages.length])
    return (
        <div className={`${className}`}>
            <div className="relative z-50">
                <CustomButton
                    label=""
                    Icon={<IoChatboxEllipsesOutline className="text-text" size={24} />}
                    onClick={() => setShowChatModal(true)}
                    className="pr-2 pl-2 pt-1 pb-1 bg-transparent border border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-scale duration-200"
                />
                {
                    newMessage && !showChatModal &&
                    <div className={`w-fit absolute top-0 -left-1 -translate-x-full bg-water border-2 rounded-[.5rem] overflow-hidden shadow-[0_0_10px_var(--color-btn-shadow)]
                            ${newMessage?.senderId === player1?.id ? 'border-blue-500' : ''}
                            ${newMessage?.senderId === player2?.id ? 'border-red-500' : ''}
                        `}
                    >
                        <div className="flex items-center w-fit">
                            <span className="max-w-[80px] truncate flex bg-panel px-1 py-1">
                                {newMessage?.senderName}
                            </span>
                            <p className="border-l-2 min-w-[100px] px-2 py-1 w-fit overflow-hidden">{newMessage?.text}</p>
                        </div>
                    </div>
                }

            </div>

            {
                showChatModal && createPortal(<>
                    <div
                        className="fixed inset-0 backdrop-blur-sm z-40 bg-black/10"
                        onClick={() => setShowChatModal(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-[90%] max-w-md">
                            <div
                                className="absolute -inset-[2px] bg-transparent pointer-events-none"
                                style={{
                                    clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                    background: "var(--color-border)",
                                }}
                            />

                            <div
                                className="relative bg-panel shadow-[0_15px_40px_rgba(0,0,0,0.6)] px-3 py-6"
                                style={{
                                    clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                                }}
                            >
                                <button
                                    onClick={() => setShowChatModal(false)}
                                    className="absolute top-3 right-3 text-text rounded-[.75rem] p-1 hover:bg-btn-hover z-10"
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                                <div className="relative h-[400px] max-h-[400px] pb-[4rem]">
                                    <div className="flex flex-col justify-end border border-border overflow-y-auto rounded-[1rem] h-full w-full p-2 text-text text-[0.9rem]">

                                        {
                                            listMessages.map((item, _index) => {
                                                return (
                                                    <div className={`w-full mt-2 flex`}
                                                        key={item.id}
                                                        style={item.senderId === playerId ? { justifyContent: 'end' } : { justifyContent: 'start' }}
                                                    >
                                                        <div className="max-w-[90%] flex items-center w-fit">
                                                            {
                                                                item.senderId !== playerId &&
                                                                <span className={`max-w-[80px] truncate flex bg-water px-1 py-1 mr-1 rounded-[.5rem] border
                                                                     ${item.senderId === player1?.id ? "border-blue-500" : ""}
                                                                    ${item.senderId === player2?.id ? "border-red-500" : ""}
                                                                `}>
                                                                    {item.senderName}
                                                                </span>
                                                            }

                                                            <p className="px-2 py-1 w-fit border rounded-[.5rem] overflow-hidden">{item.text}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className="absolute left-0 bottom-0 flex gap-2 w-full">
                                        <CustomTextField
                                            label={t("send_message")}
                                            name="message"
                                            value={inputValue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputalue(e.target.value)}
                                        />
                                        <CustomButton
                                            label={t("send")}
                                            onClick={() => {
                                                sendMessage(roomId, playerName, inputValue, playerId)
                                                setInputalue('')
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>, document.body)
            }
        </div>
    )
}

export default ChatModal