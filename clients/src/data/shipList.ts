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

export const ListShipTest : Ship[] =[
    {
        "id": "1",
        "type": "carrier",
        "size": 2,
        "coordinates": [
            {
                "x": 9,
                "y": 5
            },
            {
                "x": 9,
                "y": 6
            }
        ],
        "sunk": false,
        "image": "/images/ships/carrier.png"
    },
    {
        "id": "2",
        "type": "battleship",
        "size": 3,
        "coordinates": [
            {
                "x": 5,
                "y": 6
            },
            {
                "x": 6,
                "y": 6
            },
            {
                "x": 7,
                "y": 6
            }
        ],
        "sunk": false,
        "image": "/images/ships/battleship.png"
    },
    {
        "id": "3",
        "type": "cruiser",
        "size": 3,
        "coordinates": [
            {
                "x": 6,
                "y": 1
            },
            {
                "x": 6,
                "y": 2
            },
            {
                "x": 6,
                "y": 3
            }
        ],
        "sunk": false,
        "image": "/images/ships/cruiser.png"
    },
    {
        "id": "4",
        "type": "submarine",
        "size": 4,
        "coordinates": [
            {
                "x": 3,
                "y": 8
            },
            {
                "x": 4,
                "y": 8
            },
            {
                "x": 5,
                "y": 8
            },
            {
                "x": 6,
                "y": 8
            }
        ],
        "sunk": false,
        "image": "/images/ships/submarine.png"
    },
    {
        "id": "5",
        "type": "destroyer",
        "size": 5,
        "coordinates": [
            {
                "x": 2,
                "y": 0
            },
            {
                "x": 3,
                "y": 0
            },
            {
                "x": 4,
                "y": 0
            },
            {
                "x": 5,
                "y": 0
            },
            {
                "x": 6,
                "y": 0
            }
        ],
        "sunk": false,
        "image": "/images/ships/destroyer.png"
    }
]
