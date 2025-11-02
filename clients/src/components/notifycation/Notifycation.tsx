import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    AiOutlineCheckCircle,
    AiOutlineLoading3Quarters,
    AiOutlineCloseCircle,
    AiOutlineWarning,
} from "react-icons/ai";

export type NotificationType = "success" | "error" | "loading" | "warning";

interface NotificationData {
    id: number;
    message: string;
    type: NotificationType;
    duration: number;
}

let idCounter = 0;

const getIcon = (type: NotificationType) => {
    switch (type) {
        case "success": return <AiOutlineCheckCircle className="w-6 h-6 text-green-300" />;
        case "error": return <AiOutlineCloseCircle className="w-6 h-6 text-red-300" />;
        case "loading": return <AiOutlineLoading3Quarters className="w-6 h-6 text-blue-300 animate-spin" />;
        case "warning": return <AiOutlineWarning className="w-6 h-6 text-yellow-300" />;
    }
};

const NotificationItem: React.FC<{ data: NotificationData; onRemove?: (id: number) => void }> = ({
    data,
    onRemove,
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (data.type !== "loading") {
            const timer = setTimeout(() => setVisible(false), data.duration);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const handleExitComplete = () => {
        onRemove?.(data.id);
    };

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 text-white px-4 py-3 rounded-md shadow-md flex items-center gap-3 min-w-[280px]"
                >
                    {getIcon(data.type)}
                    <span className="flex-1">{data.message}</span>
                    <button
                        onClick={() => setVisible(false)}
                        className="text-gray-300 hover:text-white"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const NotificationContainer: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType, duration = 3000) => {
        setNotifications((prev) => {
            // Nếu có loading, xóa nó trước
            const filtered = prev.filter((n) => n.type !== "loading");
            const id = ++idCounter;
            return [...filtered, { id, message, type, duration }];
        });
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // nghe event notify
    useEffect(() => {
        const listener = (e: any) => {
            const { message, type, duration } = e.detail;
            addNotification(message, type, duration);
        };
        window.addEventListener("ADD_NOTIFICATION", listener);
        return () => window.removeEventListener("ADD_NOTIFICATION", listener);
    }, [addNotification]);

    return createPortal(
        <div className="fixed top-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 space-y-3">
            {notifications.map((n) => (
                <NotificationItem key={n.id} data={n} onRemove={removeNotification} />
            ))}
        </div>,
        document.body
    );
};

export default NotificationContainer;
