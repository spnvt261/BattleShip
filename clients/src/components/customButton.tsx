interface Props{
    label:string;
    onClick?: ()=>void;
    padding?:string;
    className?:string
    width?:string
    disabled?:boolean
}

const CustomButton = ({
    label, 
    onClick,
    padding,
    className,
    width,
    disabled
}:Props) =>{
    return(
        <button 
            className={`px-3 py-2 rounded-[.5rem] bg-btn-bg text-btn-text hover:bg-btn-hover active:bg-btn-active shadow-[0_0_10px_var(--color-btn-shadow)] ${className} ${disabled?"cursor-not-allowed":""}`}
            onClick={onClick}
            style={{padding,width}}
            disabled={disabled}
        >
            {label}
        </button>
    )
}

export default CustomButton
