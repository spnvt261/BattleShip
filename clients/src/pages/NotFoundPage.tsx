
import { HiHome, HiRefresh, HiExclamation } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();
    const onGoHome = () => {
        navigate("/"); 
    };

    const onRetry = () => {
        window.location.reload(); 
    };

    const onReport = () => {

    }
    return (
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">

            <div className="w-full max-w-xl text-center bg-white shadow-lg rounded-2xl p-8 mx-2">
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-6">
                    <HiExclamation className="w-12 h-12 text-gray-500" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Page not found</h1>
                <p className="text-gray-500 mb-6">
                    Không tìm thấy trang bạn yêu cầu. Có thể đường dẫn sai hoặc trang đã được di chuyển.
                </p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button
                        onClick={onGoHome}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <HiHome className="w-4 h-4" />
                        Về trang chủ
                    </button>

                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        <HiRefresh className="w-4 h-4" />
                        Thử lại
                    </button>

                    <button
                        onClick={onReport}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:underline focus:outline-none"
                    >
                        <HiExclamation className="w-4 h-4" />
                        Báo lỗi / Gửi phản hồi
                    </button>
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    URL: <span className="text-gray-500 break-all">{location.href}</span>
                </p>
            </div>
        </div>
    );
};

export default NotFoundPage;
