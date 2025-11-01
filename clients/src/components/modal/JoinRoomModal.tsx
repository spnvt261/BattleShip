import { useAppSettings } from "../../context/appSetting"
import CustomButton from "../customButton"
import CustomKeyField6 from "../CustomKeyField"

interface Props {

}
const JoinRoomModal = ({ }: Props) => {
    const { t } = useAppSettings()
    return (
        <div>
            <CustomKeyField6
                className="mx-auto"
            />

            <div className="flex justify-end">
                <CustomButton
                    label={t("confirm")}
                    className="mt-6"
                />
            </div>
        </div>
    )
}

export default JoinRoomModal