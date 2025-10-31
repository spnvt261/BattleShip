interface Props{
    label:string;
    onClick?: ()=>void;
    padding?:string;
    className?:string
    width?:string
}

const CustomButton = ({
    label, 
    onClick,
    padding,
    className,
    width
}:Props) =>{
    return(
        <button 
            className={`px-3 py-2 rounded-[.5rem] bg-btn-bg text-btn-text hover:bg-btn-hover active:bg-btn-active shadow-[0_0_10px_var(--color-btn-shadow)] ${className}`}
            onClick={onClick}
            style={{padding,width}}
        >
            {label}
        </button>
    )
}

export default CustomButton