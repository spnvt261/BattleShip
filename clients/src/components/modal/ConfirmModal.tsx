import { useAppSettings } from "../../context/appSetting";
import CustomButton from "../customButton";

interface Props {
    label?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onClose?:()=>void
}

const ConfirmModal = ({ label, onConfirm, onCancel,onClose }: Props) => {
    const { t } = useAppSettings()
    return (
        <div>
            <div>
                {label}
            </div>
            <div className="flex gap-2 justify-end mt-10">
                <CustomButton
                    label={t("cancel")}
                    onClick={onCancel?onCancel:onClose}
                    className="bg-red-500 hover:bg-red-600"
                />
                <CustomButton
                    label={t("confirm")}
                    onClick={onConfirm}
                />

            </div>

        </div>
    )
}

export default ConfirmModal