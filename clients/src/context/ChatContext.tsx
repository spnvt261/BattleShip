import { createContext, useCallback, useContext, useEffect, useState, type FC, type ReactNode } from "react"
import type { Message } from "../types/game"
import { useSocket } from "../hooks/useSocket"

type chatState = {
    listMessages: Message[];
    sendMessage: (roomId:string,name:string, msg: string,playerId:string) => void;
    setListMessages:(msg:Message[])=>void
}
const ChatContext = createContext<chatState | undefined>(undefined)

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const {sendChat,onChat} = useSocket()
    const [listMessages,setListMessages] = useState<Message[]>([])
    const sendMessage = useCallback((roomId:string,name:string, msg: string,playerId:string)=>{
        sendChat(roomId,name,msg,playerId)
    },[sendChat])
    useEffect (()=>{
        const unsubcrible=onChat(res=>{
            setListMessages(prevList=>[...prevList,res])
        })
        return ()=>{
            unsubcrible?.();
        }
    },[])
    return (
        <ChatContext.Provider value={{sendMessage, listMessages,setListMessages}}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat =()=>{
    const ctx= useContext(ChatContext)
    if(!ctx) throw new Error("useChat must be used within ChatProvider");
    return ctx
}