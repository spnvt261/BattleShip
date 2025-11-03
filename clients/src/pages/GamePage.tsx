import BoardBattle from "../components/gameEntity/BoardBattle"


interface Props{

}
const GamePage = ({
    
}:Props) =>{
    return(
        <div>
            <BoardBattle 
                type="canShot"
                showAxisLabels
            />
        </div>
    )
}

export default GamePage