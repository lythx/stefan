'use strict'

class Model extends THREE.Group {

    static models = []
    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    tween
    static p1Targets = [
        [   //wejście na most
            { x: -100, z: 130 }, //lewy most
            { x: 15, z: 15 }, //środkowy most
            { x: 130, z: -100 } //prawy most
        ],
        [   //wyjście z mostu 
            { x: -130, z: 100 }, //lewy most
            { x: -15, z: -15 }, //środkowy most
            { x: 100, z: -130 } //prawy most
        ],
        [{ x: -125, z: -125 }] //baza
    ]
    static p2Targets = [
        [   //wejście na most
            { x: -130, z: 100 }, //lewy most
            { x: -15, z: -15 }, //środkowy most
            { x: 100, z: -130 } //prawy most
        ],
        [   //wyjście z mostu 
            { x: -95, z: 130 }, //lewy most
            { x: 15, z: 15 }, //środkowy most
            { x: 130, z: -100 } //prawy most
        ],
        [{ x: 125, z: 125 }] //baza
    ]
    static milestones = [31, -29]

    static materials

    //geometry każdego modelu jest ładowane od razu żeby nie trzeba było go ładować potem
    //material nie może być tak ładowany bo wtedy kolory sie psują
    static loadMaterials(data) {
        const arr = []
        for (const e of data) {
            const obj = {}
            obj.name = e.name
            obj.hp = e.hp
            obj.attack = e.attack
            obj.cost = e.cost
            //model
            obj.modelMap = e.modelMap //zapisywanie patha do tekstury
            this.loader.load(e.model, (geometry) => { //ładowanie geometrii
                obj.modelGeometry = geometry
            });
            //broń
            obj.weaponMap = e.weaponMap //zapisywanie patha do tekstury
            this.loader.load(e.weapon, (geometry) => { //ładowanie geometrii
                obj.weaponGeometry = geometry
            });
            arr.push(obj)
        }
        this.materials = arr
    }

    /**
     * Tworzy mesh danego modelu
     */
    async _load(name) {
        const obj = Model.materials.find(a => a.name === name)
        //model
        let modelMaterial
        await new Promise((resolve) => { //ładowanie tekstur jest asynchroniczne wiec trzeba dać Promise
            modelMaterial = new THREE.MeshBasicMaterial(
                {
                    map: this.textureLoader.load(obj.modelMap, () => { resolve() }),
                    morphTargets: true //to jest potrzebne do animacji
                });
        })
        //broń
        let weaponMaterial
        await new Promise((resolve) => {
            weaponMaterial = new THREE.MeshBasicMaterial(
                {
                    map: this.textureLoader.load(obj.weaponMap, () => { resolve() }),
                    morphTargets: true //to jest potrzebne do animacji
                });
        })
        const model = new THREE.Mesh(obj.modelGeometry, modelMaterial)
        const weapon = new THREE.Mesh(obj.weaponGeometry, weaponMaterial)
        return { model, weapon, attack: obj.attack, hp: obj.hp, cost: obj.cost }
    }

    /**
     * Obraca model w kierunku podanej lokacji
     */
    async _rotate(location) {
        //kąt obrotu
        let targetAngle = Math.atan2(location.z - this.position.z, -(location.x - this.position.x)) + (2 * Math.PI)
        if (targetAngle >= 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
            targetAngle -= 2 * Math.PI
        this.rotation.y = targetAngle
    }

    /**
     * Obraca i przesuwa model do danej lokacji
     */
    async _go(location) {
        this._rotate(location)
        //długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) +
            (location.z - this.position.z) * (location.z - this.position.z)))
        this.tween?.stop() //zatrzymanie poprzednich animacji
        this.tween = new TWEEN.Tween(this.position) //animacja
            .to(location, distance * 75)
            .start()
    }
}