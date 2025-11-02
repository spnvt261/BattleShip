import type { Ship } from "../types/game";

export const ListShip : Ship[] = [
    { 
        id: "1", 
        type: "carrier", 
        size: 2, 
        coordinates: [], 
        sunk: false,
        image:"/images/ships/carrier.png"
    },
    { 
        id: "2", 
        type: "battleship", 
        size: 3, 
        coordinates: [], 
        sunk: false ,
        image:"/images/ships/battleship.png"
    },
    { 
        id: "3", 
        type: "cruiser", 
        size: 3, 
        coordinates: [], 
        sunk: false ,
        image:"/images/ships/cruiser.png"
    },
    { 
        id: "4", 
        type: "submarine", 
        size: 4, 
        coordinates: [], 
        sunk: false ,
        image:"/images/ships/submarine.png"
    },
    { 
        id: "5", 
        type: "destroyer", 
        size: 5, 
        coordinates: [], 
        sunk: false ,
        image:"/images/ships/destroyer.png"
    },
]
