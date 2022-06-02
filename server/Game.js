const Fighter = require('./Fighter.js')
const BillGates = require('./fighters/BillGates.js')

class Game {

    player1Socket
    player2Socket
    fighters = []
    buildings = []
    time
    lastSendDataTimestamp = 0
    static modelTypes = { BillGates }

    constructor(player1Socket, player2Socket, time) {
        this.player1Socket = player1Socket
        this.player2Socket = player2Socket
        this.time = time

        setImmediate(() => this.render())
    }

    render() {
        setImmediate(() => this.render())
        const gameData = []
        const buildingsLength = this.buildings.length
        for (let i = 0; i < buildingsLength; i++) {
            gameData.push(this.buildings[i].data)
        }
        const fightersLength = this.fighters.length
        for (let i = 0; i < fightersLength; i++) {
            this.fighters[i].calculateTarget(this.fighters.filter(a => a.player !== this.fighters[i].player))
            gameData.push(this.fighters[i].data)
        }
        if (this.lastSendDataTimestamp + 200 < Date.now()) {
            console.log(gameData[0]?.position.x, gameData[0]?.position.z)
            this.lastSendDataTimestamp = Date.now()
            this.player1Socket.send(JSON.stringify({ event: 'GameData', body: gameData }))
            this.player2Socket.send(JSON.stringify({ event: 'GameData', body: gameData }))
        }
    }

    addModel(modelType, player, x, z, rotation) {
        const model = new Game.modelTypes[modelType](player, x, z, rotation)
        if (model instanceof Fighter)
            this.fighters.push(model)
        else
            this.buildings.push(model)
    }

}


module.exports = Game