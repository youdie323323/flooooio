(() => {
    var cF = 10000;
    var cG = 29;
    var cH = {
        ...cU("loggedIn kicked update addToInventory joinedGame craftResult accountData gambleList playerList usernameTaken usernameClaimed userProfile accountNotFound reqFailed cantPerformAction glbData cantChat keyAlreadyUsed keyInvalid keyCheckFailed keyClaimed changeLobby"),
        ...cU("login iAngle iMood iJoinGame iSwapPetal iSwapPetalRow iDepositPetal iWithdrawPetal iReqGambleList iGamble iAbsorb iLeaveGame iPing iChat iCraft iReqAccountData iClaimUsername iReqUserProfile iReqGlb iCheckKey iWatchAd")
    };
    var cI = 2363;
    var cJ = 16;
    var cK = 60;
    var cL = 16;
    var cM = 3;
    var cN = /^[a-zA-Z0-9_]+$/;
    var cO = /[^a-zA-Z0-9_]/g;
    var cP = cU("userChat mobKilled mobDespawned craftResult wave");
    var cQ = cU("invalidProtocol tooManyConnections outdatedVersion connectionIdle adminAction loginFailed ipBanned accountBanned");
    var cR = cU("player dice petalDice petalRockEgg petalAvacado avacado pedox fossil dragonNest rock cactus hornet bee spider centipedeHead centipedeBody centipedeHeadPoison centipedeBodyPoison centipedeHeadDesert centipedeBodyDesert ladybug babyAnt workerAnt soldierAnt queenAnt babyAntFire workerAntFire soldierAntFire queenAntFire antHole antHoleFire beetle scorpion yoba jellyfish bubble darkLadybug bush sandstorm mobPetaler yellowLadybug starfish dandelion shell crab spiderYoba sponge m28 guardian dragon snail pacman ghost beehive turtle spiderCave statue tumbleweed furry nigersaurus sunflower stickbug mushroom petalBasic petalRock petalIris petalMissile petalRose petalStinger petalLightning petalSoil petalLight petalCotton petalMagnet petalPea petalBubble petalYinYang petalWeb petalSalt petalHeavy petalFaster petalPollen petalWing petalSwastika petalCactus petalLeaf petalShrinker petalExpander petalSand petalPowder petalEgg petalAntEgg petalYobaEgg petalStick petalLightsaber petalPoo petalStarfish petalDandelion petalShell petalRice petalPincer petalSponge petalDmca petalArrow petalDragonEgg petalFire petalCoffee petalBone petalGas petalSnail petalWave petalTaco petalBanana petalPacman petalHoney petalNitro petalAntidote petalSuspill petalTurtle petalCement petalSpiderEgg petalChromosome petalSunflower petalStickbug petalMushroom petalSkull petalSword web lightning petalDrop honeyTile portal");
    var cS = cU("none killsNeeded wave waveEnding waveStarting lobbyClosing");
    var cT = cU("ffa sandbox");
    function cU(r8) {
        const r9 = r8.split(" ");
        const ra = {};
        for (let rb = 0; rb < r9.length; rb++) {
            ra[r9[rb]] = rb;
        }
        return ra;
    }
    var cV = [0, 11.1, 17.6, 25, 33.3, 42.9, 100, 185.7, 300, 600];
    var cX = {
        neutral: 0,
        sad: 1,
        angry: 2
    };
    var cY = [[0, 0], [1, 9], [2, 34], [5, 64], [4, 99], [3, 199]];
    var cZ = 2000;
    var d0 = 1000;
    function d1(r8) {
        return Math.floor(r8 * 1.05 ** (r8 - 1)) * 20;
    }
    var d2 = [1, 5, 50, 500, 10000, 500000, 50000000, 5000000000, 1000000000000];
    function d3(r8) {
        let r9 = 0;
        let ra = 0;
        while (true) {
            const rb = d1(r9 + 1);
            if (r8 < ra + rb) {
                break;
            }
            ra += rb;
            r9++;
        }
        return [r9, ra];
    }
    function d4(r8) {
        let r9 = 5;
        let ra = 5;
        while (r8 >= ra) {
            r9++;
            ra += Math.min(30, ra);
        }
        return r9;
    }
    function d5(r8) {
        return Math.pow(243, Math.min(r8, 199) / 200);
    }
    function d6() {
        return d7(256);
    }
    function d7(r8) {
        const r9 = Array(r8);
        while (r8--) {
            r9[r8] = r8;
        }
        return r9;
    }
    var d8 = cU("Common Unusual Rare Epic Legendary Mythic Ultra Super Hyper");
    var d9 = Object.keys(d8);
    var da = d9.length - 1;
    var db = da;
    function dc(r8) {
        const r9 = [];
        for (let ra = 1; ra <= db; ra++) {
            r9.push(r8(ra));
        }
        return r9;
    }
    var de = {
        thirdEye: 0,
        antennae: 1,
        ears: 2,
        heart: 3,
        spiderLeg: 4,
        halo: 5,
        gem: 6,
        air: 7,
        wig: 8
    };
    function df(r8, r9) {
        return Math.pow(3, r8) * r9;
    }
    const dg = {
        type: cR.petalBasic,
        desc: "insert something here...",
        size: 10,
        tier: 0,
        healthF: 1,
        damageF: 1,
        respawnTime: 1000,
        useTime: 0,
        isPoison: false,
        poisonDamageF: 1,
        isProj: false,
        regenF: 0,
        uiAngle: 0,
        isLightning: false,
        lightningBounces: 0,
        lightningDmgF: 0,
        sizeIncreaseF: 0,
        healthIncreaseF: 0,
        fovFactor: 0,
        extraRange: 0,
        count: 1,
        uiCountGap: 12,
        countAngleOffset: 0,
        occupySlot: false,
        ability: undefined,
        absorbDamage: false,
        pickupRange: 0,
        isBooster: false,
        boostStrength: 0,
        breedPower: 0,
        flipDir: false,
        webSize: 0,
        reflect: 0,
        spinSpeed: 0,
        dontExpand: false,
        lieOnGroundTime: 0,
        isBoomerang: false,
        isSwastika: false,
        hpRegenPerSec: 0,
        mobSizeChange: 0,
        extraSpeed: 0,
        fixAngle: false,
        petCount: 1,
        uiX: 0,
        uiY: 0,
        flowerPoisonF: 0,
        flowerPoison: 0,
        curePoison: 0,
        curePoisonF: 0,
        petHeal: 0,
        petHealF: 0,
        hpRegenPerSecF: 0,
        shieldRegenPerSecF: 0,
        shieldRegenPerSec: 0,
        hpRegen75PerSecF: 0,
        angleOffset: 0,
        affectMobHealDur: 0,
        affectMobHeal: false,
        slowDuration: 0,
        damage: 0,
        armorF: 0
    };
    var dh = dg;
    const di = {
        name: "Basic",
        desc: "A default petal.",
        type: cR.petalBasic,
        size: 9,
        healthF: 10,
        damageF: 10,
        respawnTime: 2500
    };
    const dj = {
        name: "Missile",
        desc: "Shoots outward when you get angry.",
        type: cR.petalMissile,
        size: 13 / 1.1,
        healthF: 2,
        damageF: 55,
        respawnTime: 2500,
        useTime: 500,
        isProj: true,
        projSpeed: 40,
        uiAngle: Math.PI / 4
    };
    const dk = {
        name: "Rose",
        desc: "Regenerates health when consumed.",
        type: cR.petalRose,
        size: 8,
        healthF: 5,
        damageF: 5,
        respawnTime: 3500,
        useTime: 1000,
        regenF: 11,
        dontExpand: true
    };
    const dl = {
        name: "Iris",
        desc: "Poisons the enemy that touches it.",
        type: cR.petalIris,
        size: 6,
        healthF: 5,
        damageF: 5,
        respawnTime: 4000,
        isPoison: true,
        poisonDamageF: 50
    };
    const dm = {
        name: "Rock",
        desc: "Heavier than your mom.",
        type: cR.petalRock,
        size: 11,
        healthF: 200,
        damageF: 30,
        respawnTime: 5000
    };
    const dn = {
        name: "Stinger",
        desc: "Deals heavy damage but is very weak.",
        type: cR.petalStinger,
        size: 8,
        healthF: 2,
        damageF: 160,
        respawnTime: 10000,
        uiCountGap: 11,
        countAngleOffset: Math.PI,
        countTiers: [1, 1, 1, 3, 3, 5, 5, 7]
    };
    const dp = {
        name: "Third Eye",
        desc: "Increases your petal orbit radius.",
        ability: de.thirdEye,
        extraRange: 30,
        extraRangeTiers: [50, 70, 90, 120, 180, 360, 540, 720]
    };
    const dq = {
        name: "Antennae",
        desc: "Increases your vision.",
        ability: de.antennae
    };
    const dr = {
        name: "Lightning",
        desc: "Summons a lightning strike on nearby enemies",
        type: cR.petalLightning,
        size: 11,
        respawnTime: 2500,
        healthF: 20,
        damageF: 8,
        isLightning: true,
        lightningBounces: 2,
        lightningBouncesTiers: [3, 4, 5, 6, 7, 8, 9, 14],
        lightningDmgF: 20
    };
    const ds = {
        name: "Soil",
        desc: "Increases your health and body size.",
        type: cR.petalSoil,
        size: 11,
        healthF: 20,
        damageF: 20,
        respawnTime: 1500,
        healthIncreaseF: 100,
        sizeIncrease: 1
    };
    const du = {
        name: "Light",
        desc: "Much much lighter than your mom.",
        type: cR.petalLight,
        size: 7,
        healthF: 5,
        damageF: 10,
        respawnTime: 600,
        count: 1,
        occupySlot: true,
        countTiers: [2, 2, 3, 3, 5, 5, 5, 8]
    };
    const dv = {
        name: "Cotton",
        desc: "Cultivated in Africa. Aborbs damage & turns you into a nigerian.",
        type: cR.petalCotton,
        size: 11,
        healthF: 15,
        damageF: 1,
        respawnTime: 1000,
        absorbDamage: true,
        dontExpand: true
    };
    const dw = {
        name: "Magnet",
        desc: "Increases petal pickup range.",
        type: cR.petalMagnet,
        size: 11,
        healthF: 15,
        damageF: 5,
        respawnTime: 1500,
        pickupRange: 50,
        pickupRangeTiers: [150, 250, 350, 450, 550, 650, 750, 1000]
    };
    const dx = {
        name: "Peas",
        desc: "Shoots away when your flower goes >:(",
        type: cR.petalPea,
        size: 7,
        healthF: 25,
        damageF: 25,
        count: 4,
        respawnTime: 1000,
        useTime: 500,
        uiCountGap: 9,
        uiAngle: Math.PI / 8,
        isProj: true,
        projSpeed: 40
    };
    const dy = {
        name: "Bubble",
        desc: "Bursts & boosts you when your mood swings",
        type: cR.petalBubble,
        size: 16,
        healthF: 0,
        health: 1,
        damageF: 0,
        respawnTime: 5500,
        useTime: 500,
        respawnTimeTiers: [4500, 3500, 2500, 1500, 800, 500, 200, 100],
        useTimeTiers: [500, 500, 500, 500, 500, 100, 100, 50],
        boostStrength: 60,
        isBooster: true,
        dontExpand: true
    };
    const dz = {
        name: "Yin Yang",
        desc: "Flips your petal orbit direction.",
        type: cR.petalYinYang,
        respawnTime: 1500,
        flipDir: true,
        healthF: 10,
        damageF: 20,
        size: 13
    };
    const dA = {
        name: "Web",
        desc: "Lays spider poop that slows enemies down.",
        type: cR.petalWeb,
        respawnTime: 3500,
        useTime: 500,
        healthF: 5,
        damageF: 5,
        size: 10,
        webSize: 70,
        webSizeTiers: [80, 90, 100, 125, 150, 180, 250, 400]
    };
    var dB = [di, dj, dk, dl, dm, dn, dp, dq, dr, ds, du, dv, dw, dx, dy, {
        name: "Ears",
        desc: "Gives you telepathic powers that makes your petals orbit far from the flower.",
        ability: de.ears,
        orbitRange: 50,
        orbitRangeTiers: dc(r8 => 50 + r8 * 70)
    }, {
            name: "Heart",
            desc: "Allows you to breed mobs.",
            ability: de.heart,
            breedPower: 1,
            breedPowerTiers: [1.5, 2, 2.5, 3, 3, 3, 3, 6],
            breedRange: 100,
            breedRangeTiers: [150, 200, 250, 300, 350, 400, 500, 700]
        }, dz, dA, {
            name: "Salt",
            desc: "Reflects back some of the damage received.",
            type: cR.petalSalt,
            respawnTime: 2500,
            size: 10,
            healthF: 10,
            damageF: 10,
            reflect: 0.7200000000000001,
            reflectTiers: [0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.7].map(r8 => r8 * 0.8)
        }, {
            name: "Grapes",
            desc: "4 yummy poisonous balls.",
            type: cR.petalIris,
            size: 6,
            healthF: 20,
            damageF: 3,
            count: 4,
            respawnTime: 2000,
            useTime: 500,
            uiCountGap: 7,
            uiAngle: Math.PI / 8,
            isProj: true,
            projSpeed: 40,
            isPoison: true,
            poisonDamageF: 40
        }, {
            name: "Heavy",
            desc: "Much heavier than your mom.",
            type: cR.petalHeavy,
            size: 17,
            healthF: 600,
            damageF: 20,
            respawnTime: 10000,
            orbitSpeedFactor: 0.95,
            orbitSpeedFactorTiers: [0.94, 0.93, 0.92, 0.91, 0.9, 0.8, 0.7, 0.1]
        }, {
            name: "Faster",
            desc: "Increases petal spin speed.",
            type: cR.petalFaster,
            size: 9,
            healthF: 5,
            damageF: 8,
            respawnTime: 2500,
            spinSpeed: 0.3,
            spinSpeedTiers: [0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.4].map(r8 => r8 - 0.2)
        }, {
            name: "Pollen",
            desc: "Falls on the ground for 5s when you aren't neutral.",
            type: cR.petalPollen,
            size: 7,
            healthF: 5,
            damageF: 20,
            respawnTime: 1000,
            useTime: 500,
            lieOnGroundTime: 5000,
            count: 1,
            countTiers: [1, 2, 3, 3, 3, 3, 3, 4],
            occupySlot: true
        }, {
            name: "Wing",
            desc: "Boomerang.",
            type: cR.petalWing,
            size: 16,
            healthF: 10,
            damageF: 35,
            respawnTime: 2500,
            uiAngle: -Math.PI / 6,
            countTiers: [1, 1, 1, 1, 3, 3, 4, 6],
            isBoomerang: true
        }, {
            name: "Swastika",
            desc: "Makes you the commander of the third reich.",
            type: cR.petalSwastika,
            size: 12,
            healthF: 40,
            damageF: 50,
            respawnTime: 2500,
            isSwastika: true
        }, {
            name: "Cactus",
            desc: "Increases flower's health power.",
            type: cR.petalCactus,
            size: 15,
            healthF: 15,
            damageF: 10,
            respawnTime: 1000,
            healthIncreaseF: 25
        }, {
            name: "Leaf",
            desc: "Passively regenerates your health.",
            type: cR.petalLeaf,
            size: 12,
            healthF: 10,
            damageF: 10,
            respawnTime: 1000,
            hpRegenPerSecF: 1
        }, dC(false), dC(true), {
            name: "Sand",
            desc: "Imported from Dubai just for you.",
            type: cR.petalSand,
            size: 6,
            healthF: 5,
            damageF: 20,
            respawnTime: 1400,
            count: 4
        }, {
            name: "Powder",
            desc: "Increases movement speed. Definitely not cocaine.",
            type: cR.petalPowder,
            size: 10,
            healthF: 15,
            damageF: 20,
            respawnTime: 1500,
            extraSpeed: 2,
            extraSpeedTiers: [4, 6, 8, 10, 12, 14, 16, 24],
            turbulence: 20,
            turbulenceTiers: dc(r8 => 20 + r8 * 80)
        }, {
            name: "Dahlia",
            desc: "Low health regeneration but faster reload.",
            type: cR.petalRose,
            size: 6,
            healthF: 5,
            damageF: 5,
            respawnTime: 1500,
            useTime: 1000,
            regenF: 5,
            dontExpand: true,
            count: 3,
            uiCountGap: 11
        }, {
            name: "Beetle Egg",
            desc: "Stolen from a female Beetle's womb. GG",
            type: cR.petalEgg,
            size: 18,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            useTime: 15000,
            useTimeTiers: [19200, 23500, 32000, 1800, 7400, 16900, 100, 400],
            fixAngle: true,
            dontExpand: true,
            spawn: "Beetle",
            spawnTiers: ["Beetle_1", "Beetle_2", "Beetle_3", "Beetle_3", "Beetle_4", "Beetle_5", "Beetle_5", "Beetle_6"]
        }, {
            name: "Ant Egg",
            desc: "Purchased from a pregnant Queen Ant lol",
            type: cR.petalAntEgg,
            count: 4,
            size: 13,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            occupySlot: true,
            useTime: 30000,
            useTimeTiers: [38000, 2400, 3300, 5100, 15800, 33600, 2000, 1000],
            fixAngle: true,
            dontExpand: true,
            spawn: "Soldier Ant",
            spawnTiers: ["Soldier Ant_1", "Soldier Ant_1", "Soldier Ant_2", "Soldier Ant_3", "Soldier Ant_4", "Soldier Ant_5", "Soldier Ant_5", "Soldier Ant_6"]
        }, {
            name: "Hornet Egg",
            desc: "Mother Hornet accidentally fired her egg instead of her missile and we caught it. GG.",
            type: cR.petalEgg,
            occupySlot: true,
            count: 2,
            size: 16,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            useTime: 32000,
            useTimeTiers: [41000, 3700, 4700, 4800, 16500, 36300, 1300, 800],
            fixAngle: true,
            dontExpand: true,
            spawn: "Hornet",
            spawnTiers: ["Hornet_1", "Hornet_1", "Hornet_2", "Hornet_3", "Hornet_4", "Hornet_5", "Hornet_5", "Hornet_6"]
        }, {
            name: "Yoba Egg",
            desc: "We are not sure how it laid an egg.",
            type: cR.petalYobaEgg,
            size: 18,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            fixAngle: true,
            dontExpand: true,
            useTime: 45670,
            useTimeTiers: [3670, 4250, 4670, 8720, 14310, 26560, 1760, 11400],
            spawn: "Yoba",
            spawnTiers: ["Yoba", "Yoba_1", "Yoba_2", "Yoba_3", "Yoba_4", "Yoba_5", "Yoba_5", "Yoba_6"]
        }, {
            name: "Stick",
            desc: "Summons the power of wind.",
            type: cR.petalStick,
            size: 15,
            healthF: 10,
            damageF: 1,
            respawnTime: 3200,
            useTime: 20000,
            useTimeTiers: [25200, 30000, 2500, 3700, 10700, 22300, 1600, 800],
            spawn: "Sandstorm",
            spawnTiers: ["Sandstorm_1", "Sandstorm_2", "Sandstorm_2", "Sandstorm_3", "Sandstorm_4", "Sandstorm_5", "Sandstorm_5", "Sandstorm_6"],
            dontDieOnSpawn: true,
            uiAngle: -Math.PI / 6,
            petCount: 2,
            dontExpand: true
        }, {
            name: "Lightsaber",
            desc: "Borrowed from Darth Vader himself.",
            type: cR.petalLightsaber,
            size: 20,
            sizeTiers: [40, 60, 80, 100, 120, 140, 160, 280],
            healthF: 300,
            damageF: 10,
            isLightsaber: true,
            uiAngle: -Math.PI / 6,
            useTime: 1500,
            respawnTime: 2000,
            uiX: 8,
            uiY: -5
        }, {
            name: "Poo",
            desc: "'PLAY POOPOO.PRO AND WE STOP BOTTING!!' — Anonymous Skid",
            type: cR.petalPoo,
            size: 14,
            fixAngle: true,
            healthF: 5,
            damageF: 5,
            respawnTime: 2500,
            agroRangeDec: 5,
            agroRangeDecTiers: [10, 20, 30, 40, 50, 60, 70, 80, 95]
        }, {
            name: "Starfish",
            desc: "Regenerates health when it is lower than 50%",
            type: cR.petalStarfish,
            size: 14,
            healthF: 7,
            damageF: 10,
            respawnTime: 1500,
            hpRegen75PerSecF: 3
        }, {
            name: "Dandelion",
            desc: "Reduces enemy's ability to heal by 20%.",
            type: cR.petalDandelion,
            size: 12,
            healthF: 5,
            damageF: 5,
            respawnTime: 1000,
            count: 1,
            countTiers: [1, 1, 1, 1, 2, 3, 3, 5],
            occupySlot: true,
            affectHeal: true,
            affectHealDur: 2,
            affectHealDurTiers: [4, 8, 12, 16, 20, 24, 28, 32],
            useTime: 500,
            isProj: true,
            projSpeed: 40,
            uiAngle: -Math.PI * 3 / 4
        }, {
            name: "Shell",
            desc: "Gives you a shield.",
            type: cR.petalShell,
            size: 13,
            healthF: 25,
            damageF: 5,
            dontExpand: true,
            respawnTime: 3500,
            useTime: 1000,
            shield: 12,
            shieldTiers: [36, 108, 324, 972, 2916, 8748, 26244, 78732]
        }, {
            name: "Rice",
            desc: "Fast reload but weaker than a fetus. Known as Chawal in Indian.",
            type: cR.petalRice,
            size: 10,
            healthF: 1,
            damageF: 4,
            respawnTime: 50,
            uiAngle: -Math.PI / 4
        }, {
            name: "Pincer",
            desc: "Reduces enemy movement speed temporarily.",
            type: cR.petalPincer,
            size: 12,
            healthF: 5,
            damageF: 6,
            respawnTime: 1500,
            isPoison: true,
            poisonDamageF: 20,
            slowDuration: 1000,
            slowDurationTiers: [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800]
        }, {
            name: "Spider Legs",
            desc: "Spidey legs that increase movement speed.",
            ability: de.spiderLeg,
            extraSpeed: 3,
            extraSpeedTiers: [6, 9, 12, 15, 18, 21, 24, 34]
        }, {
            name: "Sponge",
            desc: "Soaks damage over time.",
            type: cR.petalSponge,
            size: 15,
            healthF: 500,
            damageF: 1,
            respawnTime: 2500,
            soakTime: 1,
            soakTimeTiers: [3.9, 5.4, 7.2, 9.6, 15, 30, 60, 100]
        }, {
            name: "DMCA",
            desc: "Takes down a mob. Only works on mobs of the same or lower tier. Despawned mobs don't drop any petal.",
            type: cR.petalDmca,
            size: 15,
            healthF: 120,
            damageF: 0,
            damage: 0,
            respawnTime: 10000,
            despawnTime: 2000,
            fixAngle: true
        }, {
            name: "Halo",
            desc: "Passively heals your pets through air.",
            ability: de.halo,
            petHealF: 40
        }, {
            name: "Gem",
            desc: "Generates a shield when you rage that enemies can't enter but depletes your health and prevents you from healing. Shield also reflect missiles.",
            ability: de.gem,
            shieldReload: 1,
            shieldReloadTiers: [1.5, 1.5, 2, 2, 2.5, 2.5, 2.5, 2],
            shieldHpLosePerSec: 0.5,
            shieldHpLosePerSecTiers: [0.5, 0.45, 0.4, 0.22, 0.17, 0.1, 0.05, 0.02],
            misReflectDmgFactor: 0.05,
            misReflectDmgFactorTiers: [0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.3, 0.6]
        }, {
            name: "Arrow",
            type: cR.petalArrow,
            desc: "Locks to a target and randomly through it while slowly damaging it. Big health, low damage.",
            size: 30,
            healthF: 500,
            damageF: 5,
            isLightsaber: true,
            uiAngle: -Math.PI / 6,
            respawnTime: 2000,
            uiX: -6.3,
            uiY: 3,
            lockOnTarget: true
        }, {
            name: "Dragon Egg",
            desc: "Mother Dragon was out looking for dinner for her babies and we stole her egg. GG",
            type: cR.petalDragonEgg,
            size: 20,
            healthF: 30,
            damageF: 0,
            respawnTime: 1000,
            useTime: 20000,
            useTimeTiers: [26000, 32000, 2700, 2700, 10200, 22300, 500, 500],
            spawn: "Dragon",
            spawnTiers: ["Dragon_1", "Dragon_2", "Dragon_2", "Dragon_3", "Dragon_4", "Dragon_5", "Dragon_5", "Dragon_6"],
            fixAngle: true,
            dontExpand: true
        }, {
            name: "Coffee",
            desc: "A coffee bean that gives you some extra speed boost for 1.5s. Stacks with duration & other petals.",
            type: cR.petalCoffee,
            size: 10,
            healthF: 5,
            damageF: 5,
            respawnTime: 2000,
            useTime: 500,
            dontExpand: true,
            extraSpeedTemp: 6 / 100,
            extraSpeedTempTiers: [12, 18, 24, 30, 36, 42, 48, 60].map(r8 => r8 / 100),
            uiAngle: -Math.PI / 6
        }, {
            name: "Bone",
            desc: "A human bone. If damage received is lower than its armor, its health isn't affected.",
            type: cR.petalBone,
            size: 15,
            healthF: 10,
            damageF: 15,
            respawnTime: 2000,
            fixAngle: true,
            uiAngle: -Math.PI / 6,
            armorF: 10
        }, {
            name: "Fire",
            desc: "It burns.",
            type: cR.petalFire,
            size: 20,
            sizeTiers: [40, 60, 80, 100, 120, 140, 160, 280],
            healthF: 120,
            damageF: 20,
            isLightsaber: true,
            isFire: true,
            uiAngle: -Math.PI / 6,
            useTime: 1500,
            respawnTime: 2000
        }, {
            name: "Gas",
            desc: "Poisonous gas.",
            type: cR.petalGas,
            healthF: 200,
            damageF: 0.5,
            isPoison: true,
            poisonDamageF: 40,
            size: 20,
            sizeTiers: [40, 60, 80, 100, 120, 140, 160, 280],
            isLightsaber: true,
            isFire: true,
            uiAngle: -Math.PI / 6,
            useTime: 2000,
            respawnTime: 2000
        }, {
            name: "Snail",
            desc: "Twirls your petal orbit like a snail shell  looks like.",
            type: cR.petalSnail,
            healthF: 50,
            damageF: 25,
            size: 15,
            respawnTime: 1500,
            twirl: 1,
            twirlTiers: [1.5, 2, 2.5, 3, 4, 5, 6, 10]
        }, {
            name: "Wave",
            desc: "Sussy waves that rotate passive mobs.",
            type: cR.petalWave,
            healthF: 150,
            damage: 0,
            damageF: 0,
            entRot: 0.1,
            entRotTiers: [0.13, 0.18, 0.24, 0.3, 0.4, 0.55, 0.7, 1],
            size: 55,
            sizeTiers: [65, 75, 80, 100, 120, 140, 800, 2000],
            isLightsaber: true,
            isFire: true,
            uiAngle: -Math.PI / 6,
            useTime: 500,
            respawnTime: 1000
        }, {
            name: "Taco",
            desc: "Heals but also makes you poop.",
            type: cR.petalTaco,
            size: 15,
            healthF: 5,
            damageF: 5,
            respawnTime: 2500,
            useTime: 1000,
            regenF: 10,
            dontExpand: true,
            uiAngle: -Math.PI / 4,
            consumeProj: true,
            consumeProjSpeed: 40,
            consumeProjType: cR.petalPoo,
            consumeProjAngle: -Math.PI / 2,
            consumeProjHealthF: 2,
            consumeProjDamageF: 25
        }, {
            name: "Banana",
            desc: "A healing petal with the mechanics of Arrow.",
            type: cR.petalBanana,
            size: 15,
            healthF: 400,
            damageF: 2,
            respawnTime: 1000,
            useTime: 2500,
            regenF: 8,
            lockOnTarget: true,
            fixAngle: true,
            count: 1,
            countTiers: [1, 2, 2, 3, 3, 4, 4, 6]
        }, {
            name: "Pacman",
            desc: "Summons spirits of sussy astronauts.",
            type: cR.petalPacman,
            size: 15,
            healthF: 15,
            damageF: 2,
            respawnTime: 1000,
            useTime: 3000,
            useTimeTiers: [3200, 3900, 4600, 5700, 2700, 2600, 4200, 1200],
            spawn: "Ghost",
            spawnTiers: ["Ghost_1", "Ghost_2", "Ghost_2", "Ghost_3", "Ghost_4", "Ghost_5", "Ghost_6", "Ghost_7"],
            dontDieOnSpawn: true,
            petCount: 4,
            dontExpand: true
        }, {
            name: "Air",
            desc: "Belle Delphine's tummy air.",
            ability: de.air
        }, {
            name: "Honey",
            desc: "Summons sharp hexagonal tiles around you.",
            type: cR.petalHoney,
            size: 12,
            healthF: 20,
            damageF: 10,
            respawnTime: 2000,
            isHoney: true,
            honeyRange: 70,
            honeyRangeTiers: [100, 130, 160, 180, 250, 300, 380, 700],
            honeyDmgF: 0.33
        }, {
            name: "Nitro",
            desc: "Gives you mild constant boost like a jetpack.",
            type: cR.petalNitro,
            healthF: 0.05,
            damage: 0,
            damageF: 0,
            dontElongate: true,
            passiveBoost: 0.1,
            respawnTime: 500,
            useTime: 5500,
            useTimeTiers: [5000, 4500, 4000, 3500, 3000, 2500, 1000, 100],
            size: 20,
            sizeTiers: [25, 30, 35, 40, 45, 50, 75, 100],
            isLightsaber: true,
            isFire: true,
            uiAngle: -Math.PI / 6
        }, {
            name: "Antidote",
            desc: "Reduces poison effect when consumed.",
            type: cR.petalAntidote,
            healthF: 30,
            damageF: 0,
            damage: 0,
            size: 12,
            respawnTime: 1000,
            useTime: 1000,
            curePoisonF: 3
        }, {
            name: "Pill",
            desc: "Elongates conic/rectangular petals like Lightsaber & Fire. Also makes your petal orbit sus.",
            type: cR.petalSuspill,
            healthF: 5,
            damageF: 2,
            size: 12,
            respawnTime: 500,
            elongation: 5,
            elongationTiers: [8, 11, 14, 17, 20, 23, 26, 30],
            shlong: 40,
            shlongTiers: [80, 120, 160, 200, 240, 280, 320, 360],
            fixAngle: true
        }, {
            name: "Turtle",
            desc: "Like Missile but increases its size over time.",
            type: cR.petalTurtle,
            size: 16,
            healthF: 1600,
            damageF: 0.1,
            respawnTime: 1500,
            bounce: true,
            useTime: 500,
            isProj: true,
            projSpeed: 16,
            projGrowth: 70
        }, {
            name: "Spider Egg",
            desc: "Mother Spider sold her eggs to us for a makeup kit gg",
            type: cR.petalSpiderEgg,
            count: 3,
            size: 10,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            occupySlot: true,
            uiCountGap: 9,
            fixAngle: true,
            dontExpand: true,
            useTime: 14100,
            useTimeTiers: [17900, 21900, 1600, 1600, 6900, 15800, 100, 1400],
            spawn: "Spider",
            spawnTiers: ["Spider_1", "Spider_2", "Spider_2", "Spider_3", "Spider_4", "Spider_5", "Spider_5", "Spider_6"]
        }, {
            name: "Cement",
            desc: "Does damage based on enemy's health percentage. Damage is max when mob has health>75%.",
            type: cR.petalCement,
            healthF: 100,
            damageF: 50,
            size: 12,
            respawnTime: 2500,
            hpBasedDamage: true
        }, {
            name: "Chromosome",
            desc: "69th chromosome that turns mobs of the same rarity into retards.",
            type: cR.petalChromosome,
            size: 15,
            healthF: 0,
            health: 1,
            damageF: 0,
            damage: 0,
            respawnTime: 2000,
            retardDuration: 1000,
            retardDurationTiers: [1400, 1800, 2400, 3000, 3600, 5000, 7500, 10000],
            makeRetard: true,
            fixAngle: true
        }, {
            name: "Sunflower",
            desc: "Passively regenerates shield.",
            type: cR.petalSunflower,
            size: 14,
            healthF: 10,
            damageF: 10,
            respawnTime: 1000,
            shieldRegenPerSecF: 2.5
        }, {
            name: "Stickbug",
            desc: "Makes your petal orbit dance.",
            type: cR.petalStickbug,
            healthF: 10,
            damageF: 18,
            size: 12,
            respawnTime: 1000,
            orbitDance: 10,
            orbitDanceTiers: dc(r8 => 10 + r8 * 40)
        }, {
            name: "Mushroom",
            desc: "Makes you poisonous.",
            type: cR.petalMushroom,
            size: 18,
            healthF: 5,
            damageF: 5,
            respawnTime: 800,
            flowerPoisonF: 60
        }, {
            name: "Skull",
            desc: "Extremely heavy petal that can push mobs.",
            type: cR.petalSkull,
            size: 23,
            healthF: 500,
            damageF: 0,
            damage: 0,
            respawnTime: 5000,
            weight: 2,
            weightTiers: dc(r8 => 2 + Math.round(1.7 ** r8))
        }, {
            name: "Sword",
            desc: "Is that called a Sword or a Super Word? Hmmmm",
            type: cR.petalSword,
            size: 30,
            healthF: 5,
            damageF: 21,
            isLightsaber: true,
            uiAngle: -Math.PI / 6,
            respawnTime: 1000,
            uiX: 8,
            uiY: -5
        }, {
            name: "Avacado",
            desc: "Makes your pets fat like NikocadoAvacado.",
            type: cR.petalAvacado,
            size: 18,
            healthF: 70,
            damageF: 1,
            fixAngle: true,
            petSizeIncrease: 0.02,
            petSizeIncreaseTiers: dc(r8 => 0.02 + r8 * 0.02),
            respawnTime: 2000
        }, {
            name: "Rock Egg",
            desc: "Don't ask us how it laid an egg.",
            type: cR.petalRockEgg,
            size: 18,
            healthF: 25,
            damageF: 0,
            respawnTime: 1000,
            fixAngle: true,
            dontExpand: true,
            useTime: 16000,
            useTimeTiers: [12500, 10800, 12600, 15200, 24500, 12500, 6100, 9600],
            spawn: "Rock",
            spawnTiers: ["Rock", "Rock_1", "Rock_2", "Rock_3", "Rock_4", "Rock_5", "Rock_5", "Rock_6"]
        }, {
            name: "Wig",
            desc: "Turns aggressive mobs into passive aggressive. They will not attack you unless you attack them. Works on mobs of rarity upto PetalRarity+1.",
            ability: de.wig
        }, {
            name: "Dice",
            desc: "When you hit a petal drop with it, it has 10% chance of duplicating it, 20% chance of deleting your drop & 70% chance of doing nothing. Works on petal drops with rarity lower or same as your petal.",
            type: cR.petalDice,
            size: 16,
            healthF: 20,
            damageF: 10,
            fixAngle: true,
            isDice: true,
            respawnTime: 1600
        }];
    function dC(r8) {
        const r9 = r8 ? 1 : -1;
        const ra = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.6].map(rb => rb * r9);
        return {
            name: r8 ? "Expander" : "Shrinker",
            desc: (r8 ? "Increases" : "Decreases") + " mob size when they are hit with it. Also known as" + (r8 ? " Blue" : "") + " Pym Particle.",
            type: cR[r8 ? "petalExpander" : "petalShrinker"],
            size: 16,
            healthF: r8 ? 10 : 150,
            damageF: 0,
            respawnTime: 6000,
            mobSizeChange: ra[0],
            mobSizeChangeTiers: ra.slice(1)
        };
    }
    var dD = [40, 30, 20, 10, 3, 2, 1, 0.51];
    var dE = {};
    var dF = dB.length;
    var dG = d9.length;
    var dH = eO();
    for (let r8 = 0, r9 = dB.length; r8 < r9; r8++) {
        const ra = dB[r8];
        ra.isPetal = true;
        ra.id = r8;
        if (!ra.uiName) {
            ra.uiName = ra.name;
        }
        dJ(ra);
        ra.childIndex = 0;
        ra.uniqueIndex = r8;
        let rb = ra;
        for (let rc = 1; rc < dG; rc++) {
            const rd = dN(ra);
            rd.tier = ra.tier + rc;
            rd.name = ra.name + "_" + rd.tier;
            rd.childIndex = rc;
            rb.next = rd;
            rb = rd;
            dI(ra, rd);
            dJ(rd);
            rd.id = dB.length;
            dB[rd.id] = rd;
        }
    }
    function dI(re, rf) {
        const rg = rf.tier - re.tier - 1;
        for (let rh in re) {
            const ri = re[rh + "Tiers"];
            if (Array.isArray(ri)) {
                rf[rh] = ri[rg];
            }
        }
    }
    function dJ(re) {
        dE[re.name] = re;
        for (let rf in dh) {
            if (re[rf] === undefined) {
                re[rf] = dh[rf];
            }
        }
        if (re.ability === de.antennae) {
            re.fovFactor = cV[re.tier + 1] / 100;
        }
        re.health = re.healthF > 0 ? df(re.tier, re.healthF) : re.health;
        re.damage = re.damageF > 0 ? df(re.tier, re.damageF) : re.damage;
        re.hpRegenPerSec = df(re.tier, re.hpRegenPerSecF);
        re.shieldRegenPerSec = df(re.tier, re.shieldRegenPerSecF);
        re.hpRegen75PerSec = df(re.tier, re.hpRegen75PerSecF);
        re.petHeal = df(re.tier, re.petHealF);
        re.armor = df(re.tier, re.armorF);
        re.honeyDmg = df(re.tier, re.honeyDmgF);
        re.flowerPoison = df(re.tier, re.flowerPoisonF);
        re.curePoison = df(re.tier, re.curePoisonF);
        if (re.consumeProj) {
            re.consumeProjHealth = df(re.tier, re.consumeProjHealthF);
            re.consumeProjDamage = df(re.tier, re.consumeProjDamageF);
        }
        if (re.regenF > 0) {
            re.hpRegen = df(re.tier, re.regenF);
        } else {
            re.hpRegen = 0;
        }
        re.poisonDamage = re.isPoison ? df(re.tier, re.poisonDamageF) : 0;
        re.lightningDmg = re.isLightning ? df(re.tier, re.lightningDmgF) : 0;
        re.healthIncrease = df(re.tier, re.healthIncreaseF);
        dH[re.tier].push(re);
    }
    var dK = [1, 1.25, 1.5, 2, 5, 10, 50, 200, 1000];
    var dL = [1, 1.2, 1.5, 1.9, 3, 5, 8, 12, 17];
    var dM = cU("static basic scorp hornet sandstorm shell");
    function dN(re) {
        return JSON.parse(JSON.stringify(re));
    }
    const dO = {
        name: "bruh",
        desc: "asdfadsf",
        type: "beetle",
        tier: 0,
        healthF: 100,
        damageF: 30,
        baseSize: 50,
        motionKind: dM.static,
        isAggressive: false,
        isPassiveAggressive: true,
        isPoison: false,
        poisonDamageF: 0,
        poisonDamage: 0,
        isStatic: false,
        dontPushTeam: false,
        moveFactor: 1,
        projType: cR.petalBasic,
        projHealthF: 0,
        projDamageF: 0,
        projSize: 0.5,
        projD: 0,
        projSpeed: 30,
        projPoisonDamageF: 0,
        shootLightning: false,
        lightningDmgF: 0,
        lightningBounces: 0,
        runSpeed: 11.5,
        moveSpeed: 4,
        stopWhileMoving: true,
        uiX: 0,
        uiY: 0,
        petRoamFactor: 1,
        projAngle: 0,
        regenAfterHp: 0,
        outlineCount: 0,
        projAffectHealDur: 0,
        petSizeChangeFactor: 1
    };
    var dP = dO;
    var dV = [{
        name: "Ant Hole",
        desc: "Luxurious mansion of ants.",
        type: "antHole",
        healthF: 750,
        damageF: 10,
        baseSize: 50,
        isStatic: true,
        dontPushTeam: true,
        moveFactor: 0.05,
        runSpeed: 5,
        isTanky: true,
        spawnOnHurt: [["Soldier Ant", 3]],
        spawnOnDie: [["Queen Ant", 1], ["Soldier Ant", 2], ["Worker Ant", 2], ["Baby Ant", 1]],
        drops: [["Soil", "f"]]
    }, {
        name: "Queen Ant",
        desc: "Master female ant that enslaves other ants.",
        type: "queenAnt",
        healthF: 500,
        damageF: 10,
        baseSize: 40,
        isTanky: true,
        isAggressive: true,
        drops: [["Wing", "E"], ["Expander", "G"], ["Ant Egg", "A"]]
    }, {
        name: "Soldier Ant",
        desc: "A borderline simp of Queen Ant.",
        type: "soldierAnt",
        healthF: 100,
        damageF: 10,
        baseSize: 28,
        isAggressive: true,
        drops: [["Wing", "I"]]
    }, {
        name: "Worker Ant",
        desc: "A normie slave among the ants. A disgrace to their race.",
        type: "workerAnt",
        healthF: 62.5,
        damageF: 10,
        baseSize: 28,
        drops: [["Leaf", "H"]]
    }, {
        name: "Baby Ant",
        desc: "By-product of ant's sexy time.",
        type: "babyAnt",
        healthF: 25,
        damageF: 10,
        baseSize: 25,
        isAggressive: false,
        isPassiveAggressive: false,
        drops: [["Light", "F"], ["Leaf", "F"], ["Shrinker", "G"], ["Rice", "F"]]
    }];
    function dW() {
        const re = dN(dV);
        for (let rf = 0; rf < re.length; rf++) {
            const rg = re[rf];
            rg.type += "Fire";
            if (rg.name === "Ant Hole") {
                rg.drops = [["Magnet", "D"], ["Lightsaber", "E"]];
            }
            rg.name = dX(rg.name);
            rg.desc = dX(rg.desc);
            rg.damageF *= 2;
            if (rg.spawnOnHurt) {
                rg.spawnOnHurt.forEach(rh => {
                    rh[0] = dX(rh[0]);
                    return rh;
                });
            }
            if (rg.spawnOnDie) {
                rg.spawnOnDie.forEach(rh => {
                    rh[0] = dX(rh[0]);
                    return rh;
                });
            }
        }
        return re;
    }
    function dX(re) {
        return re.replace(/Ant/g, "Fire Ant").replace(/ant/g, "fire ant");
    }
    const e1 = {
        name: "Hornet",
        desc: "Weirdos that shoot missiles from a region we generally use to poop.",
        type: "hornet",
        healthF: 62.5,
        damageF: 50,
        isAggressive: true,
        baseSize: 40,
        drops: [["Missile", "f"], ["Antennae", "I"], ["Hornet Egg", "K"]],
        projType: cR.petalMissile,
        projDamageF: 10,
        projHealthF: 5,
        projSpeed: 38,
        projSize: 0.375 / 1.1,
        projD: 0.75,
        motionKind: dM.hornet
    };
    const e5 = {
        name: "Scorpion",
        desc: "It shoots a poisonous triangle from its sussy structure.",
        type: "scorpion",
        healthF: 100,
        damageF: 15,
        isPoison: true,
        poisonDamageF: 10,
        baseSize: 47,
        isAggressive: true,
        drops: [["Iris", "F"], ["Pincer", "F"]],
        projType: cR.petalStinger,
        projDamageF: 3,
        projHealthF: 5,
        projPoisonDamageF: 7,
        projSpeed: 43,
        projSize: 0.21,
        projD: -0.31,
        motionKind: dM.scorp
    };
    const e9 = {
        name: "Centipede",
        desc: "It is very long (like my pp).",
        type: "centipedeHead",
        healthF: 25,
        damageF: 10,
        baseSize: 40,
        chain: cR.centipedeBody,
        drops: [["Leaf", "J"], ["Peas", "J"]]
    };
    const ea = {
        name: "Evil Centipede",
        desc: "It is very long and blue.",
        type: "centipedeHeadPoison",
        healthF: 25,
        damageF: 10,
        baseSize: 40,
        chain: cR.centipedeBodyPoison,
        isAggressive: true,
        drops: [["Iris", "J"], ["Grapes", "J"]]
    };
    const eb = {
        name: "Desert Centipede",
        desc: "It is very long and fast.",
        type: "centipedeHeadDesert",
        healthF: 25,
        damageF: 10,
        baseSize: 40,
        chain: cR.centipedeBodyDesert,
        isPassiveAggressive: false,
        drops: [["Sand", "J"], ["Salt", "H"], ["Powder", "J"]],
        moveSpeed: 23,
        runSpeed: 17.25
    };
    const ef = {
        name: "Sandstorm",
        desc: "Why does it look like a beehive?",
        type: "sandstorm",
        healthF: 125,
        damageF: 40,
        baseSize: 50,
        isAggressive: false,
        isPassiveAggressive: false,
        motionKind: dM.sandstorm,
        moveSpeed: 14,
        runSpeed: 11,
        petRoamFactor: 2.2,
        drops: [["Stick", "J"], ["Sand", "H"]]
    };
    const eg = {
        name: "Petaler",
        desc: "Pretends to be a petal to bait players. Former worker of an Indian call center.",
        type: "mobPetaler",
        healthF: 125,
        damageF: 40,
        baseSize: null,
        isAggressive: true,
        stayIdle: true,
        drops: [["Basic", "D"], ["Poo", "E"], ["Taco", "E"]],
        baseSize: 50,
        size: 50,
        fixedSize: true,
        projAngle: -Math.PI / 2,
        projType: cR.petalPoo,
        projDamageF: 3,
        projHealthF: 3,
        projSpeed: 33,
        projSize: 0.32,
        projD: 0.4,
        motionKind: dM.hornet
    };
    const ei = {
        name: "Dandelion",
        desc: "Another plant that is termed as a mob gg",
        type: "dandelion",
        healthF: 25,
        damageF: 15,
        moveFactor: 0.05,
        baseSize: 55,
        isStatic: true,
        drops: [["Dandelion", "h"]],
        projType: cR.petalDandelion,
        outlineCount: 9,
        projSpeed: 40,
        projDamageF: 15,
        projHealthF: 2.5,
        projSpeed: 33,
        projSize: 0.32,
        projD: 1.8,
        projAffectHealDur: 20
    };
    const ek = {
        name: "Crab",
        desc: "Featured in Crab Rave by Noisestorm.",
        type: "crab",
        healthF: 150,
        damageF: 25,
        baseSize: 47,
        isAggressive: true,
        drops: [["Sand", "J"]],
        projType: null,
        motionKind: dM.scorp
    };
    const et = {
        name: "Ghost",
        desc: "Spirit of a sussy astronaut that was sucked into a black hole. It will always be remembered.",
        type: "ghost",
        healthF: 150,
        damageF: 0.1,
        baseSize: 40,
        moveSpeed: 14,
        runSpeed: 11.6,
        isAggressive: true,
        dontUiRotate: true,
        sameTypeColResolveOnly: true,
        motionKind: dM.sandstorm,
        petDamageFactor: 10,
        drops: [["Air", "G"]],
        petSizeChangeFactor: 0.5
    };
    const ey = {
        name: "Tumbleweed",
        desc: "Goofy little wanderer.",
        type: "tumbleweed",
        healthF: 60,
        damageF: 40,
        baseSize: 50,
        isAggressive: false,
        isPassiveAggressive: false,
        motionKind: dM.sandstorm,
        moveSpeed: 14,
        runSpeed: 11,
        petRoamFactor: 2.2,
        drops: [["Pill", "E"], ["Sand", "J"]]
    };
    var eJ = [{
        name: "Bee",
        desc: "A cutie that stings too hard.",
        type: "bee",
        healthF: 37.5,
        damageF: 50,
        baseSize: 40,
        drops: [["Stinger", "F"], ["Pollen", "I"]],
        uiX: 4,
        uiY: 4
    }, {
        name: "Cactus",
        desc: "Why is this a mob? It is clearly a plant.",
        type: "cactus",
        healthF: 94,
        damageF: 5,
        moveFactor: 0.05,
        baseSize: 60,
        isStatic: true,
        drops: [["Cactus", "h"]]
    }, {
        name: "Rock",
        desc: "Son of Dwayne 'The Rock' Johnson.",
        type: "rock",
        healthF: 75,
        damageF: 10,
        moveFactor: 0.05,
        isStatic: true,
        petHealthFactor: 1.25,
        drops: [["Rock", "h"], ["Heavy", "J"], ["Rock Egg", "K"]]
    }, e1, {
        name: "Ladybug",
        desc: "Red ball.",
        type: "ladybug",
        healthF: 87.5,
        damageF: 10,
        drops: [["Light", "f"], ["Rose", "f"]],
        uiX: 5,
        uiY: 5
    }, ...dV, ...dW(), {
        name: "Beetle",
        desc: "Ugly & stinky.",
        type: "beetle",
        healthF: 100,
        damageF: 30,
        isAggressive: true,
        drops: [["Beetle Egg", "F"]],
        uiX: 5,
        uiY: 5
    }, {
        name: "Spider",
        desc: "Very beautiful and wholesome creature. Best pet to have!",
        type: "spider",
        healthF: 62.5,
        damageF: 15,
        isPoison: true,
        poisonDamageF: 15,
        baseSize: 35,
        isAggressive: true,
        drops: [["Faster", "F"], ["Web", "F"], ["Third Eye", "L"], ["Spider Legs", "G"]]
    }, e5, {
        name: "Yoba",
        desc: "An illegally smuggled green creature from Russia that is very fond of IO games.",
        type: "yoba",
        healthF: 350,
        damageF: 40,
        baseSize: 45,
        isAggressive: true,
        isTanky: true,
        drops: [["Heart", "F"], ["Ears", "G"], ["Swastika", "H"], ["Yoba Egg", "J"]]
    }, {
        name: "Jellyfish",
        desc: "Comes with the power of summoning lightning.",
        type: "jellyfish",
        healthF: 125,
        damageF: 25,
        isAggressive: true,
        shootLightning: true,
        lightningDmgF: 5,
        lightningBounces: 2,
        lightningBouncesTiers: [3, 4, 5, 6, 7, 8, 9, 10],
        moveSpeed: 4,
        runSpeed: 6,
        drops: [["Lightning", "F"]]
    }, {
        name: "Bubble",
        desc: "Bursts too quickly (like me)",
        type: "bubble",
        healthF: 0.5,
        damageF: 5,
        isAggressive: false,
        isPassiveAggressive: false,
        moveSpeed: 1,
        drops: [["Bubble", "F"]]
    }, e9, ea, eb, {
        name: "Dark Ladybug",
        desc: "Nigerian Ladybug.",
        type: "darkLadybug",
        healthF: 87.5,
        damageF: 10,
        drops: [["Dahlia", "F"], ["Yin Yang", "I"]],
        uiX: 5,
        uiY: 5
    }, {
        name: "Yellow Ladybug",
        desc: "Poop colored Ladybug.",
        type: "yellowLadybug",
        healthF: 87.5,
        damageF: 10,
        drops: [["Rose", "A"], ["Dahlia", "A"]],
        uiX: 5,
        uiY: 5
    }, {
        name: "Bush",
        desc: "Cotton bush.",
        type: "bush",
        healthF: 50,
        damageF: 10,
        moveFactor: 0.05,
        baseSize: 60,
        isStatic: true,
        drops: [["Cotton", "E"], ["Coffee", "F"], ["Banana", "F"]]
    }, ef, eg, {
        name: "Starfish",
        desc: "It can grow its arms back. Some real biology going on there.",
        type: "starfish",
        healthF: 150,
        damageF: 20,
        isAggressive: true,
        regenAfterHp: 0.5,
        drops: [["Starfish", "D"], ["Salt", "J"], ["Sand", "J"]]
    }, ei, {
        name: "Shell",
        desc: "It has sussy movement.",
        type: "shell",
        healthF: 225,
        damageF: 10,
        baseSize: 50,
        drops: [["Shell", "H"], ["Magnet", "L"]],
        stayIdle: true,
        stepPerSecMotion: true,
        runSpeed: 35
    }, ek, {
        name: "Spider Yoba",
        desc: "Former student of Yoda.",
        type: "spiderYoba",
        healthF: 100,
        damageF: 30,
        baseSize: 30,
        isAggressive: true,
        attachPetal: "Lightsaber",
        drops: [["Lightsaber", "F"], ["Spider Legs", "E"], ["Arrow", "D"], ["Wig", "E"]]
    }, {
        name: "Sponge",
        desc: "Favourite object of a woman.",
        type: "sponge",
        healthF: 100,
        damageF: 10,
        baseSize: 60,
        isStatic: true,
        moveFactor: 0.05,
        drops: [["Sponge", "D"]]
    }, {
        name: "M28",
        desc: "It likes to drop DMCA.",
        type: "m28",
        healthF: 100,
        damageF: 35,
        isAggressive: true,
        drops: [["DMCA", "E"], ["Pill", "D"]]
    }, {
        name: "Guardian",
        desc: "Comes to avenge mobs.",
        type: "guardian",
        healthF: 200,
        damageF: 35,
        baseSize: 35,
        isAggressive: true,
        uiY: 5,
        drops: [["Halo", "F"], ["Gem", "D"], ["Antidote", "E"]]
    }, {
        name: "Dragon",
        desc: "Breaths fire.",
        type: "dragon",
        healthF: 200,
        damageF: 20,
        baseSize: 40,
        isAggressive: true,
        drops: [["Dragon Egg", "E"], ["Bone", "D"], ["Fire", "F"], ["Gas", "F"]],
        fire: true,
        fireTime: 3000,
        fireDamageF: 0.3
    }, {
        name: "Snail",
        desc: "Extremely slow sussy mob.",
        type: "snail",
        healthF: 120,
        damageF: 30,
        stepPerSecMotion: true,
        runSpeed: 15,
        moveSpeed: 5,
        drops: [["Snail", "F"], ["Wave", "E"], ["Nitro", "D"]],
        uiY: 3
    }, {
        name: "Pacman",
        desc: "How did it come here and why did his foes turn into his allies? Too sus.",
        type: "pacman",
        healthF: 120,
        damageF: 35,
        baseSize: 50,
        isAggressive: true,
        dontUiRotate: true,
        drops: [["Pacman", "E"], ["Banana", "F"]],
        spawnOnHurt: [["Ghost", 1]],
        spawnOnDie: [["Ghost", 2]],
        dontResolveCol: true
    }, et, {
        name: "Beehive",
        desc: "Honey factory.",
        type: "beehive",
        healthF: 500,
        damageF: 40,
        moveFactor: 0.05,
        baseSize: 50,
        isStatic: true,
        runSpeed: 5,
        dontPushTeam: true,
        isTanky: true,
        drops: [["Honey", "F"], ["Hornet Egg", "C"]],
        spawnOnHurt: [["Bee", 2], ["Hornet", 1]],
        spawnOnDie: [["Bee", 4], ["Hornet", 2]]
    }, {
        name: "Turtle",
        desc: "Extremely slow sussy mob with a shell.",
        type: "turtle",
        healthF: 80,
        damageF: 40,
        moveSpeed: 2,
        runSpeed: 6,
        stayIdle: true,
        drops: [["Turtle", "F"]]
    }, {
        name: "Spider Cave",
        desc: "A caveman used to live here, but soon the spiders came and ate him.",
        type: "spiderCave",
        healthF: 500,
        damageF: 40,
        moveFactor: 0.05,
        baseSize: 70,
        runSpeed: 5,
        isStatic: true,
        dontPushTeam: true,
        isTanky: true,
        drops: [["Spider Egg", "A"], ["Web", "E"]],
        spawnOnHurt: [["Spider", 2]],
        spawnOnDie: [["Spider", 3], ["Spider Yoba", 2]]
    }, {
        name: "Statue",
        desc: "Statue of RuinedLiberty.",
        type: "statue",
        baseSize: 40,
        healthF: 100,
        damageF: 10,
        moveFactor: 0.05,
        isStatic: true,
        uiX: 1,
        uiY: 1,
        drops: [["Gem", "G"], ["Salt", "F"], ["Cement", "F"]]
    }, ey, {
        name: "Dragon Nest",
        desc: "Where the Dragons finally get laid.",
        type: "dragonNest",
        healthF: 600,
        damageF: 50,
        moveFactor: 0.05,
        baseSize: 60,
        runSpeed: 7,
        isTanky: true,
        isStatic: true,
        dontPushTeam: true,
        drops: [["Dragon Egg", "A"], ["Stick", "G"]],
        spawnOnHurt: [["Dragon", 1]],
        spawnOnDie: [["Dragon", 1]]
    }, {
        name: "Furry",
        desc: "Sussy Discord uwu",
        type: "furry",
        healthF: 200,
        damageF: 30,
        baseSize: 45,
        isAggressive: true,
        drops: [["Heart", "G"], ["Ears", "H"], ["Nitro", "E"]]
    }, {
        name: "Nigersaurus",
        desc: "Low IQ mob that moves like a retard.",
        type: "nigersaurus",
        healthF: 60,
        damageF: 100,
        baseSize: 40,
        isRetard: true,
        stopWhileMoving: false,
        isAggressive: true,
        drops: [["Bone", "F"], ["Leaf", "D"], ["Chromosome", "G"]]
    }, {
        name: "Sunflower",
        desc: "Ancester of flowers.",
        type: "sunflower",
        baseSize: 40,
        healthF: 90,
        damageF: 5,
        moveFactor: 0.05,
        isStatic: true,
        drops: [["Sunflower", "h"]]
    }, {
        name: "Stickbug",
        desc: "It likes to dance.",
        type: "stickbug",
        healthF: 50,
        damageF: 20,
        baseSize: 40,
        stayIdle: true,
        drops: [["Stickbug", "F"]]
    }, {
        name: "Mushroom",
        desc: "Has fungal infection gg",
        type: "mushroom",
        healthF: 50,
        damageF: 20,
        moveFactor: 0.05,
        isStatic: true,
        drops: [["Mushroom", "J"]]
    }, {
        name: "Fossil",
        desc: "Looks like the dinosaurs got extinct again.",
        type: "fossil",
        healthF: 100,
        damageF: 30,
        moveFactor: 0.05,
        baseSize: 50,
        isStatic: true,
        drops: [["Bone", "D"], ["Skull", "E"]]
    }, {
        name: "PedoX",
        desc: "Infamous minor enjoyer with a YouTube channel.",
        type: "pedox",
        healthF: 150,
        damageF: 20,
        baseSize: 40,
        drops: [["Sword", "D"], ["Wave", "F"]],
        spawnOnDie: [["Baby Ant", 1, 0.3]]
    }, {
        name: "Avacado",
        desc: "NikocadoAvacado's super yummy avacado.",
        type: "avacado",
        healthF: 50,
        damageF: 5,
        moveFactor: 0.05,
        isStatic: true,
        drops: [["Avacado", "h"], ["Leaf", "J"]]
    }, {
        name: "Dice",
        desc: "Favourite object of an average casino enjoyer.",
        type: "dice",
        healthF: 100,
        damageF: 5,
        moveFactor: 0.05,
        isStatic: true,
        drops: [["Dice", "h"]]
    }];
    var eK = eJ.length;
    var eL = {};
    var eM = [];
    var eN = eO();
    function eO() {
        const re = [];
        for (let rf = 0; rf < dG; rf++) {
            re[rf] = [];
        }
        return re;
    }
    for (let re = 0; re < eK; re++) {
        const rf = eJ[re];
        for (let rg in dP) {
            if (rf[rg] === undefined) {
                rf[rg] = dP[rg];
            }
        }
        eM[re] = [rf];
        rf.type = cR[rf.type];
        eQ(rf);
        if (rf.drops) {
            rf.drops.forEach(rh => {
                rh[1] = rh[1].toUpperCase().charCodeAt(0) - 65;
            });
        }
        rf.id = re;
        rf.uniqueIndex = re;
        if (!rf.uiName) {
            rf.uiName = rf.name;
        }
        for (let rh = 1; rh <= da; rh++) {
            const ri = JSON.parse(JSON.stringify(rf));
            ri.name = rf.name + "_" + rh;
            ri.tier = rh;
            eM[re][rh] = ri;
            dI(rf, ri);
            eQ(ri);
            ri.id = eJ.length;
            eJ.push(ri);
        }
    }
    for (let rj = 0; rj < eJ.length; rj++) {
        const rk = eJ[rj];
        if (rk.spawnOnHurt) {
            eP(rk, rk.spawnOnHurt);
        }
        if (rk.spawnOnDie) {
            eP(rk, rk.spawnOnDie);
        }
    }
    function eP(rl, rm) {
        rm.forEach(rn => {
            const ro = rn[0] + (rl.tier > 0 ? "_" + rl.tier : "");
            rn[0] = eL[ro];
        });
    }
    function eQ(rl) {
        rl.health = df(rl.tier, rl.healthF) * dK[rl.tier];
        rl.damage = df(rl.tier, rl.damageF);
        if (rl.fixedSize) {
            rl.size = rl.baseSize;
        } else {
            rl.size = rl.baseSize * dL[rl.tier];
        }
        rl.poisonDamage = df(rl.tier, rl.poisonDamageF);
        rl.projDamage = df(rl.tier, rl.projDamageF);
        rl.projHealth = df(rl.tier, rl.projHealthF) * dK[rl.tier];
        rl.projPoisonDamage = df(rl.tier, rl.projPoisonDamageF);
        if (rl.fireDamageF) {
            rl.fireDamage = df(rl.tier, rl.fireDamageF);
        }
        rl.lightningDmg = df(rl.tier, rl.lightningDmgF);
        eL[rl.name] = rl;
        eN[rl.tier].push(rl);
    }
    function eR(rl) {
        return rl / 255 * Math.PI * 2;
    }
    var eS = Math.PI * 2;
    function eT(rl) {
        rl %= eS;
        if (rl < 0) {
            rl += eS;
        }
        return Math.round(rl / eS * 255);
    }
    function eU(rl) {
        if (!rl || rl.length !== 36) {
            return false;
        }
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rl);
    }
    function eV(rl, rm) {
        return dE[rl + (rm > 0 ? "_" + rm : "")];
    }
    var eW = d9.map(rl => rl.toLowerCase() + "Kills");
    var eX = d9.map(rl => "total" + rl + "Petals");
    var eY = {};
    eW.forEach(rl => {
        eY[rl] = 0;
    });
    var eZ = {};
    eX.forEach(rl => {
        eZ[rl] = 0;
    });
    var f0 = 1 / 1000 / 60 / 60;
    function f1() {
        return {
            timePlayed: 0,
            gamesPlayed: 0,
            maxTimeAlive: 0,
            maxScore: 0,
            maxKills: 0,
            maxPetalsPicked: 0,
            totalKills: 0,
            totalPetals: 0,
            petalsPicked: 0,
            petalsAbsorbed: 0,
            petalsCrafted: 0,
            petalsDestroyed: 0,
            craftAttempts: 0,
            maxWave: 0,
            chatSent: 0,
            timeJoined: Date.now() * f0
        };
    }
    var f2 = "xp timePlayed maxScore totalKills maxKills maxTimeAlive".split(" ");
    function f3(rl) {
        const rm = {};
        for (let rn in rl) {
            rm[rl[rn]] = rn;
        }
        return rm;
    }
    var f4 = [[[[16, 0], [84, 1]], [[0.07, 0], [99.9, 1]], [[2.8, 1], [97.2, 2]], [[0.6, 2], [99.4, 3]], [[18.9, 3], [81.1, 4]], [[97.5, 4], [2.5, 5]], [[77.3, 4], [21.9, 5], [0.8, 6]], [[43.5, 5], [56.5, 6]]], [[[22.1, 0], [77.9, 1]], [[0.2, 0], [99.8, 1]], [[4.8, 1], [95.2, 2]], [[1.3, 2], [98.7, 3]], [[24.3, 3], [75.7, 4]], [[97.8, 4], [2.2, 5]], [[80.3, 4], [19, 5], [0.7, 6]], [[49.3, 5], [50.7, 6]]], [[[27.1, 0], [72.9, 1]], [[0.5, 0], [99.5, 1]], [[6.9, 1], [93.1, 2]], [[2.2, 2], [97.8, 3]], [[28.7, 3], [71.3, 4]], [[98.1, 4], [1.9, 5]], [[82.4, 4], [17, 5], [0.6, 6]], [[53.6, 5], [46.4, 6]]], [[[43.5, 0], [56.5, 1]], [[3.6, 0], [96.4, 1]], [[16.9, 1], [83.1, 2]], [[7.9, 2], [92.1, 3]], [[43.5, 3], [56.5, 4]], [[98.7, 4], [1.3, 5]], [[87.9, 4], [11.7, 5], [0.4, 6]], [[66, 5], [34, 6]]], [[[44.9, 0], [38.3, 1]], [[14.4, 0], [85.5, 1]], [[34.5, 1], [65.5, 2]], [[21.8, 2], [78.2, 3]], [[60.1, 3], [39.9, 4]], [[99.2, 4], [0.8, 5]], [[92.6, 4], [7.2, 5], [0.2, 6]], [[0.04, 4], [77.9, 5], [22.1, 6]]], [[[43.4, 0], [32.9, 1]], [[20, 0], [79.7, 1]], [[41.2, 1], [58.8, 2]], [[28.1, 2], [71.9, 3]], [[66, 3], [34, 4]], [[99.4, 4], [0.6, 5]], [[93.8, 4], [6, 5], [0.2, 6]], [[0.2, 4], [81.1, 5], [18.8, 6]]], [[[40.1, 0], [27.1, 1]], [[27, 0], [71.8, 1]], [[49.3, 1], [50.7, 2]], [[36.2, 2], [63.8, 3]], [[71.7, 3], [28.3, 4]], [[99.5, 4], [0.5, 5]], [[95, 4], [4.9, 5], [0.2, 6]], [[0.6, 4], [84.1, 5], [15.3, 6]]], [[[34.6, 0], [21, 1]], [[35.1, 0], [61, 1]], [[0.4, 0], [58.5, 1], [41.2, 2]], [[46.7, 2], [53.3, 3]], [[77.9, 3], [22.1, 4]], [[99.6, 4], [0.4, 5]], [[96.2, 4], [3.7, 5], [0.1, 6]], [[2.1, 4], [86.2, 5], [11.7, 6]]], [[[26.5, 0], [14.4, 1]], [[41.5, 0], [46.4, 1]], [[2.4, 0], [67.8, 1], [29.8, 2]], [[0.01, 1], [60.2, 2], [39.8, 3]], [[84.7, 3], [15.3, 4]], [[0.2, 3], [99.7, 4], [0.3, 5]], [[97.5, 4], [2.5, 5], [0.08, 6]], [[7.6, 4], [84.4, 5], [8, 6]]], [[[15.2, 0], [7.4, 1]], [[37.6, 0], [26.6, 1]], [[15.4, 0], [68.2, 1], [16.2, 2]], [[1.2, 1], [76.4, 2], [22.4, 3]], [[0.6, 2], [91.4, 3], [8, 4]], [[1.6, 3], [98.3, 4], [0.1, 5]], [[98.7, 4], [1.2, 5], [0.04, 6]], [[27.5, 4], [68.4, 5], [4.1, 6]]], [[[6.6, 0], [3, 1]], [[21.7, 0], [11.6, 1]], [[38.9, 0], [45.4, 1], [6.8, 2]], [[17.1, 1], [73.2, 2], [9.7, 3]], [[13.1, 2], [83.6, 3], [3.3, 4]], [[18.9, 3], [81, 4], [0.05, 5]], [[99.5, 4], [0.5, 5], [0.02, 6]], [[59.7, 4], [38.6, 5], [1.7, 6]]], [[[3.4, 0], [1.5, 1]], [[12.3, 0], [6, 1]], [[39.2, 0], [27.4, 1], [3.5, 2]], [[41.4, 1], [53.7, 2], [4.9, 3]], [[36.2, 2], [62.1, 3], [1.7, 4]], [[43.5, 3], [56.5, 4], [0.03, 5]], [[99.7, 4], [0.2, 5], [0.008, 6]], [[77.3, 4], [21.9, 5], [0.8, 6]]]];
    for (let rl = 0; rl < f4.length; rl++) {
        const rm = f4[rl];
        const rn = rm[rm.length - 1];
        const ro = dN(rn);
        for (let rp = 0; rp < ro.length; rp++) {
            const rq = ro[rp];
            if (rq[0] < 30) {
                let rr = rq[0];
                rr *= 1.5;
                if (rr < 1.5) {
                    rr *= 10;
                }
                rr = parseFloat(rr.toFixed(3));
                rq[0] = rr;
            }
            rq[1] = d8.Ultra;
        }
        ro.push([0.01, d8.Super]);
        rm.push(ro);
    }
    var f5 = [null, [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 1, 1, 1, 1, 0, 0, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 0, 0, 1, 1, 1, 1], [1, 1, 1, 1, 0, 0, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 1, 1, 1, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 0, 0, 0, 1, 1, 1, 1], [1, 0, 1, 0, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 1, 1, 1, 0, 0, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 0, 1, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 0, 1, 0, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 1, 1, 1, 0, 1], [1, 0, 1, 0, 1, 0, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 0, 1, 1, 1]], [[0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 0, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1, 1, 1], [1, 1, 1, 1, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 0, 1, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 1]], [[1, 1, 1, 1, 1, 1, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 0, 1]], [[1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 1, 1, 1, 0, 0, 1], [0, 0, 1, 1, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 1, 1, 0, 0], [1, 0, 0, 1, 1, 1, 1, 0, 0, 1], [1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], [[0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 0, 1, 1, 1, 0, 1, 1], [0, 1, 0, 1, 0, 1, 0, 1, 0], [1, 1, 0, 1, 1, 1, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 0, 1, 0, 0, 0]]];
    function f6(rs, rt) {
        var ru = Math.PI * 2;
        var rv = (rt - rs) % ru;
        return rv * 2 % ru - rv;
    }
    function f7(rs, rt, ru) {
        return rs + f6(rs, rt) * ru;
    }
    var f8 = {
        instagram: "\n\t<svg height=\"800px\" width=\"800px\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n\t\t viewBox=\"-271 273 256 256\" xml:space=\"preserve\">\n\t<path d=\"M-64.5,273h-157c-27.3,0-49.5,22.2-49.5,49.5v52.3v104.8c0,27.3,22.2,49.5,49.5,49.5h157c27.3,0,49.5-22.2,49.5-49.5V374.7\n\t\tv-52.3C-15.1,295.2-37.3,273-64.5,273z M-50.3,302.5h5.7v5.6v37.8l-43.3,0.1l-0.1-43.4L-50.3,302.5z M-179.6,374.7\n\t\tc8.2-11.3,21.5-18.8,36.5-18.8s28.3,7.4,36.5,18.8c5.4,7.4,8.5,16.5,8.5,26.3c0,24.8-20.2,45.1-45.1,45.1s-44.9-20.3-44.9-45.1\n\t\tC-188.1,391.2-184.9,382.1-179.6,374.7z M-40,479.5C-40,493-51,504-64.5,504h-157c-13.5,0-24.5-11-24.5-24.5V374.7h38.2\n\t\tc-3.3,8.1-5.2,17-5.2,26.3c0,38.6,31.4,70,70,70c38.6,0,70-31.4,70-70c0-9.3-1.9-18.2-5.2-26.3H-40V479.5z\"/>\n\t</svg>",
        discord: "\n\t<svg fill=\"#fff\" width=\"800px\" height=\"800px\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n\t<path d=\"M20.992 20.163c-1.511-0.099-2.699-1.349-2.699-2.877 0-0.051 0.001-0.102 0.004-0.153l-0 0.007c-0.003-0.048-0.005-0.104-0.005-0.161 0-1.525 1.19-2.771 2.692-2.862l0.008-0c1.509 0.082 2.701 1.325 2.701 2.847 0 0.062-0.002 0.123-0.006 0.184l0-0.008c0.003 0.050 0.005 0.109 0.005 0.168 0 1.523-1.191 2.768-2.693 2.854l-0.008 0zM11.026 20.163c-1.511-0.099-2.699-1.349-2.699-2.877 0-0.051 0.001-0.102 0.004-0.153l-0 0.007c-0.003-0.048-0.005-0.104-0.005-0.161 0-1.525 1.19-2.771 2.692-2.862l0.008-0c1.509 0.082 2.701 1.325 2.701 2.847 0 0.062-0.002 0.123-0.006 0.184l0-0.008c0.003 0.048 0.005 0.104 0.005 0.161 0 1.525-1.19 2.771-2.692 2.862l-0.008 0zM26.393 6.465c-1.763-0.832-3.811-1.49-5.955-1.871l-0.149-0.022c-0.005-0.001-0.011-0.002-0.017-0.002-0.035 0-0.065 0.019-0.081 0.047l-0 0c-0.234 0.411-0.488 0.924-0.717 1.45l-0.043 0.111c-1.030-0.165-2.218-0.259-3.428-0.259s-2.398 0.094-3.557 0.275l0.129-0.017c-0.27-0.63-0.528-1.142-0.813-1.638l0.041 0.077c-0.017-0.029-0.048-0.047-0.083-0.047-0.005 0-0.011 0-0.016 0.001l0.001-0c-2.293 0.403-4.342 1.060-6.256 1.957l0.151-0.064c-0.017 0.007-0.031 0.019-0.040 0.034l-0 0c-2.854 4.041-4.562 9.069-4.562 14.496 0 0.907 0.048 1.802 0.141 2.684l-0.009-0.11c0.003 0.029 0.018 0.053 0.039 0.070l0 0c2.14 1.601 4.628 2.891 7.313 3.738l0.176 0.048c0.008 0.003 0.018 0.004 0.028 0.004 0.032 0 0.060-0.015 0.077-0.038l0-0c0.535-0.72 1.044-1.536 1.485-2.392l0.047-0.1c0.006-0.012 0.010-0.027 0.010-0.043 0-0.041-0.026-0.075-0.062-0.089l-0.001-0c-0.912-0.352-1.683-0.727-2.417-1.157l0.077 0.042c-0.029-0.017-0.048-0.048-0.048-0.083 0-0.031 0.015-0.059 0.038-0.076l0-0c0.157-0.118 0.315-0.24 0.465-0.364 0.016-0.013 0.037-0.021 0.059-0.021 0.014 0 0.027 0.003 0.038 0.008l-0.001-0c2.208 1.061 4.8 1.681 7.536 1.681s5.329-0.62 7.643-1.727l-0.107 0.046c0.012-0.006 0.025-0.009 0.040-0.009 0.022 0 0.043 0.008 0.059 0.021l-0-0c0.15 0.124 0.307 0.248 0.466 0.365 0.023 0.018 0.038 0.046 0.038 0.077 0 0.035-0.019 0.065-0.046 0.082l-0 0c-0.661 0.395-1.432 0.769-2.235 1.078l-0.105 0.036c-0.036 0.014-0.062 0.049-0.062 0.089 0 0.016 0.004 0.031 0.011 0.044l-0-0.001c0.501 0.96 1.009 1.775 1.571 2.548l-0.040-0.057c0.017 0.024 0.046 0.040 0.077 0.040 0.010 0 0.020-0.002 0.029-0.004l-0.001 0c2.865-0.892 5.358-2.182 7.566-3.832l-0.065 0.047c0.022-0.016 0.036-0.041 0.039-0.069l0-0c0.087-0.784 0.136-1.694 0.136-2.615 0-5.415-1.712-10.43-4.623-14.534l0.052 0.078c-0.008-0.016-0.022-0.029-0.038-0.036l-0-0z\"></path>\n\t</svg>",
        paw: "\n\t<svg fill=\"#fff\" width=\"800px\" height=\"800px\" viewBox=\"0 0 256 256\" id=\"Flat\" xmlns=\"http://www.w3.org/2000/svg\">\n\t  <path d=\"M136,60a28,28,0,1,1,28,28A28.03146,28.03146,0,0,1,136,60ZM72,108a28,28,0,1,0-28,28A28.03146,28.03146,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28.03146,28.03146,0,0,0,92,88Zm95.0918,60.84473a35.3317,35.3317,0,0,1-16.8418-21.124,43.99839,43.99839,0,0,0-84.5-.00439,35.2806,35.2806,0,0,1-16.7998,21.105,40.00718,40.00718,0,0,0,34.57226,72.05176,64.08634,64.08634,0,0,1,48.86524-.03711,40.0067,40.0067,0,0,0,34.7041-71.99121ZM212,80a28,28,0,1,0,28,28A28.03146,28.03146,0,0,0,212,80Z\"/>\n\t</svg>",
        gear: "\n<svg width=\"800px\" height=\"800px\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.7848 0.449982C13.8239 0.449982 14.7167 1.16546 14.9122 2.15495L14.9991 2.59495C15.3408 4.32442 17.1859 5.35722 18.9016 4.7794L19.3383 4.63233C20.3199 4.30175 21.4054 4.69358 21.9249 5.56605L22.7097 6.88386C23.2293 7.75636 23.0365 8.86366 22.2504 9.52253L21.9008 9.81555C20.5267 10.9672 20.5267 13.0328 21.9008 14.1844L22.2504 14.4774C23.0365 15.1363 23.2293 16.2436 22.7097 17.1161L21.925 18.4339C21.4054 19.3064 20.3199 19.6982 19.3382 19.3676L18.9017 19.2205C17.1859 18.6426 15.3408 19.6754 14.9991 21.405L14.9122 21.845C14.7167 22.8345 13.8239 23.55 12.7848 23.55H11.2152C10.1761 23.55 9.28331 22.8345 9.08781 21.8451L9.00082 21.4048C8.65909 19.6754 6.81395 18.6426 5.09822 19.2205L4.66179 19.3675C3.68016 19.6982 2.59465 19.3063 2.07505 18.4338L1.2903 17.1161C0.770719 16.2436 0.963446 15.1363 1.74956 14.4774L2.09922 14.1844C3.47324 13.0327 3.47324 10.9672 2.09922 9.8156L1.74956 9.52254C0.963446 8.86366 0.77072 7.75638 1.2903 6.8839L2.07508 5.56608C2.59466 4.69359 3.68014 4.30176 4.66176 4.63236L5.09831 4.77939C6.81401 5.35722 8.65909 4.32449 9.00082 2.59506L9.0878 2.15487C9.28331 1.16542 10.176 0.449982 11.2152 0.449982H12.7848ZM12 15.3C13.8225 15.3 15.3 13.8225 15.3 12C15.3 10.1774 13.8225 8.69998 12 8.69998C10.1774 8.69998 8.69997 10.1774 8.69997 12C8.69997 13.8225 10.1774 15.3 12 15.3Z\"/>\n</svg>",
        scroll: "\n<svg fill=\"#000000\" width=\"800px\" height=\"800px\" viewBox=\"0 -64 640 640\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M48 0C21.53 0 0 21.53 0 48v64c0 8.84 7.16 16 16 16h80V48C96 21.53 74.47 0 48 0zm208 412.57V352h288V96c0-52.94-43.06-96-96-96H111.59C121.74 13.41 128 29.92 128 48v368c0 38.87 34.65 69.65 74.75 63.12C234.22 474 256 444.46 256 412.57zM288 384v32c0 52.93-43.06 96-96 96h336c61.86 0 112-50.14 112-112 0-8.84-7.16-16-16-16H288z\"/></svg>",
        bag: "\n<svg fill=\"#000000\" width=\"800px\" height=\"800px\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M17.891 9.805h-3.79c0 0-6.17 4.831-6.17 12.108s6.486 7.347 6.486 7.347 1.688 0.125 3.125 0c0 0.062 6.525-0.865 6.525-7.353 0.001-6.486-6.176-12.102-6.176-12.102zM14.101 9.33h3.797v-1.424h-3.797v1.424zM17.84 7.432l1.928-4.747c0 0-1.217 1.009-1.928 1.009-0.713 0-1.84-0.979-1.84-0.979s-1.216 0.979-1.928 0.979-1.869-0.949-1.869-0.949l1.958 4.688h3.679z\"></path>\n</svg>",
        food: "<svg version=\"1.1\" id=\"Uploaded to svgrepo.com\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n\t width=\"800px\" height=\"800px\" style=\"font-size: 0.9em\" viewBox=\"0 0 32 32\" xml:space=\"preserve\">\n<path d=\"M22,28.744V30c0,0.55-0.45,1-1,1H11c-0.55,0-1-0.45-1-1v-1.256C4.704,26.428,1,21.149,1,15\n\tc0-0.552,0.448-1,1-1h28c0.552,0,1,0.448,1,1C31,21.149,27.296,26.428,22,28.744z M29,12c0-3.756-2.961-6.812-6.675-6.984\n\tC21.204,2.645,18.797,1,16,1s-5.204,1.645-6.325,4.016C5.961,5.188,3,8.244,3,12v1h26V12z\"/>\n</svg>",
        graph: "<svg fill=\"#000000\" width=\"800px\" height=\"800px\" viewBox=\"0 0 32 32\" style=\"fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\" version=\"1.1\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:serif=\"http://www.serif.com/\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><path d=\"M29,10c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,18c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-18Zm-20,6c-0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,12c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-12Zm10,-12c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,24c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-24Z\"/><g id=\"Icon\"/></svg>",
        resize: "<svg fill=\"#000000\" style=\"opacity:0.6\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n\t width=\"800px\" height=\"800px\" viewBox=\"0 0 49.554 49.554\"\n\t xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<polygon points=\"8.454,29.07 0,20.614 0.005,49.549 28.942,49.554 20.485,41.105 41.105,20.487 49.554,28.942 49.55,0.004 \n\t\t\t20.612,0 29.065,8.454 \t\t\"/>\n\t</g>\n</g>\n</svg>",
        users: "<svg fill=\"#ffffff\" width=\"800px\" height=\"800px\" viewBox=\"0 -64 640 640\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z\"/></svg>",
        trophy: "<svg style=\"transform:scale(0.9)\" version=\"1.0\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n\t width=\"800px\" height=\"800px\" viewBox=\"0 0 64 64\" enable-background=\"new 0 0 64 64\" xml:space=\"preserve\">\n<path fill=\"#ffffff\" d=\"M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16\n\tc0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8\n\tV43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z\n\t M8,16v-4h8v12C11.582,24,8,20.414,8,16z M56,16c0,4.414-3.582,8-8,8V12h8V16z\"/>\n</svg>",
        shop: "<svg width=\"800px\" height=\"800px\" fill=\"#ffffff\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.62127 4.51493C4.80316 3.78737 4.8941 3.42359 5.16536 3.21179C5.43663 3 5.8116 3 6.56155 3H17.4384C18.1884 3 18.5634 3 18.8346 3.21179C19.1059 3.42359 19.1968 3.78737 19.3787 4.51493L20.5823 9.32938C20.6792 9.71675 20.7276 9.91044 20.7169 10.0678C20.6892 10.4757 20.416 10.8257 20.0269 10.9515C19.8769 11 19.6726 11 19.2641 11C18.7309 11 18.4644 11 18.2405 10.9478C17.6133 10.8017 17.0948 10.3625 16.8475 9.76782C16.7593 9.55555 16.7164 9.29856 16.6308 8.78457C16.6068 8.64076 16.5948 8.56886 16.5812 8.54994C16.5413 8.49439 16.4587 8.49439 16.4188 8.54994C16.4052 8.56886 16.3932 8.64076 16.3692 8.78457L16.2877 9.27381C16.2791 9.32568 16.2747 9.35161 16.2704 9.37433C16.0939 10.3005 15.2946 10.9777 14.352 10.9995C14.3289 11 14.3026 11 14.25 11C14.1974 11 14.1711 11 14.148 10.9995C13.2054 10.9777 12.4061 10.3005 12.2296 9.37433C12.2253 9.35161 12.2209 9.32568 12.2123 9.27381L12.1308 8.78457C12.1068 8.64076 12.0948 8.56886 12.0812 8.54994C12.0413 8.49439 11.9587 8.49439 11.9188 8.54994C11.9052 8.56886 11.8932 8.64076 11.8692 8.78457L11.7877 9.27381C11.7791 9.32568 11.7747 9.35161 11.7704 9.37433C11.5939 10.3005 10.7946 10.9777 9.85199 10.9995C9.82887 11 9.80258 11 9.75 11C9.69742 11 9.67113 11 9.64801 10.9995C8.70541 10.9777 7.90606 10.3005 7.7296 9.37433C7.72527 9.35161 7.72095 9.32568 7.7123 9.27381L7.63076 8.78457C7.60679 8.64076 7.59481 8.56886 7.58122 8.54994C7.54132 8.49439 7.45868 8.49439 7.41878 8.54994C7.40519 8.56886 7.39321 8.64076 7.36924 8.78457C7.28357 9.29856 7.24074 9.55555 7.15249 9.76782C6.90524 10.3625 6.38675 10.8017 5.75951 10.9478C5.53563 11 5.26905 11 4.73591 11C4.32737 11 4.12309 11 3.97306 10.9515C3.58403 10.8257 3.31078 10.4757 3.28307 10.0678C3.27239 9.91044 3.32081 9.71675 3.41765 9.32938L4.62127 4.51493Z\"/>\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.01747 12.5002C5 12.9211 5 13.4152 5 14V20C5 20.9428 5 21.4142 5.29289 21.7071C5.58579 22 6.05719 22 7 22H10V18C10 17.4477 10.4477 17 11 17H13C13.5523 17 14 17.4477 14 18V22H17C17.9428 22 18.4142 22 18.7071 21.7071C19 21.4142 19 20.9428 19 20V14C19 13.4152 19 12.9211 18.9825 12.5002C18.6177 12.4993 18.2446 12.4889 17.9002 12.4087C17.3808 12.2877 16.904 12.0519 16.5 11.7267C15.9159 12.1969 15.1803 12.4807 14.3867 12.499C14.3456 12.5 14.3022 12.5 14.2609 12.5H14.2608L14.25 12.5L14.2392 12.5H14.2391C14.1978 12.5 14.1544 12.5 14.1133 12.499C13.3197 12.4807 12.5841 12.1969 12 11.7267C11.4159 12.1969 10.6803 12.4807 9.88668 12.499C9.84555 12.5 9.80225 12.5 9.76086 12.5H9.76077L9.75 12.5L9.73923 12.5H9.73914C9.69775 12.5 9.65445 12.5 9.61332 12.499C8.8197 12.4807 8.08409 12.1969 7.5 11.7267C7.09596 12.0519 6.6192 12.2877 6.09984 12.4087C5.75542 12.4889 5.38227 12.4993 5.01747 12.5002Z\"/>\n</svg>",
        dice: "<svg width=\"800px\" height=\"800px\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M27.299 2.246h-22.65c-1.327 0-2.402 1.076-2.402 2.402v22.65c0 1.327 1.076 2.402 2.402 2.402h22.65c1.327 0 2.402-1.076 2.402-2.402v-22.65c0-1.327-1.076-2.402-2.402-2.402zM7.613 27.455c-1.723 0-3.12-1.397-3.12-3.12s1.397-3.12 3.12-3.12 3.12 1.397 3.12 3.12-1.397 3.12-3.12 3.12zM7.613 10.732c-1.723 0-3.12-1.397-3.12-3.12s1.397-3.12 3.12-3.12 3.12 1.397 3.12 3.12-1.397 3.12-3.12 3.12zM15.974 19.093c-1.723 0-3.12-1.397-3.12-3.12s1.397-3.12 3.12-3.12 3.12 1.397 3.12 3.12-1.397 3.12-3.12 3.12zM24.335 27.455c-1.723 0-3.12-1.397-3.12-3.12s1.397-3.12 3.12-3.12 3.12 1.397 3.12 3.12c-0 1.723-1.397 3.12-3.12 3.12zM24.335 10.732c-1.723 0-3.12-1.397-3.12-3.12s1.397-3.12 3.12-3.12 3.12 1.397 3.12 3.12c-0 1.723-1.397 3.12-3.12 3.12z\"></path>\n</svg>",
        data: "<svg width=\"800px\" height=\"800px\" viewBox=\"0 0 48 48\" xmlns=\"http://www.w3.org/2000/svg\">\n  <title>data-source-solid</title>\n  <g id=\"Layer_2\" data-name=\"Layer 2\">\n    <g id=\"invisible_box\" data-name=\"invisible box\">\n      <rect width=\"48\" height=\"48\" fill=\"none\"/>\n    </g>\n    <g id=\"icons_Q2\" data-name=\"icons Q2\">\n      <path d=\"M46,9c0-6.8-19.8-7-22-7S2,2.2,2,9v7c0,.3,1.1,1.8,5.2,3.4h.3a40.3,40.3,0,0,0,8.6,2A65.6,65.6,0,0,0,24,22a65.6,65.6,0,0,0,7.9-.5,40.3,40.3,0,0,0,8.6-2h.3C44.9,17.8,46,16.3,46,16V9.3h0ZM2,31.3V39c0,6.8,19.8,7,22,7s22-.2,22-7V31.3C41.4,34.1,33.3,36,24,36S6.6,34.1,2,31.3Zm43.7-9.8a22.5,22.5,0,0,1-4.9,2.1A54.8,54.8,0,0,1,24,26,54.8,54.8,0,0,1,7.2,23.6a22.5,22.5,0,0,1-4.9-2.1L2,21.3V26c0,.3,1.2,1.9,5.5,3.5A50.2,50.2,0,0,0,24,32a50.2,50.2,0,0,0,16.5-2.5C44.8,27.9,46,26.3,46,26V21.3Z\"/>\n    </g>\n  </g>\n</svg>",
        poopPath: new Path2D("M226.816,136.022c-3.952-1.33-5.514-6.099-3.233-9.59c3.35-5.131,5.299-11.259,5.299-17.845v-3.419  c0-16.581-12.343-30.27-28.341-32.403c-0.497-0.123-4.639-0.298-4.639-0.298c-20.382-1.287-20.69-15.378-20.69-15.378l-0.027,0.006  c-3.525-44.113-34.728-54.878-34.728-54.878s-0.494,29.283-21.14,49.011c-21.036,20.101-46.47,20.797-60.86,22.148  c-19.88,1.867-31.338,14.447-31.338,31.791v3.419c0,6.585,1.948,12.714,5.299,17.845c2.28,3.492,0.719,8.261-3.233,9.59  C13.382,141.337,2,156.265,2,173.859v0c0,22.049,17.874,39.924,39.924,39.924h172.153c22.049,0,39.924-17.874,39.924-39.924v0  C254,156.266,242.618,141.337,226.816,136.022z")
    };
    function f9(rs) {
        return rs.replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDE\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1087\u108D\u108E\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17-\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]+/g, "");
    }
    function fa(rs) {
        rs = f9(rs);
        rs = rs.replace(/[^\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}\p{Emoji}a-zA-Z0-9!@#$%^&*()-=_+[\]{}|;':",.<>/?`~\s]/gu, "").replace(/(.)\1{2,}/gi, "$1").replace(/\u200B|\u200C|\u200D/g, "").trim();
        if (!rs) {
            rs = "[censored]";
        }
        return rs;
    }
    var fb = 275;
    function fc(rs) {
        const rt = rs.split("\n").filter(ru => ru.trim().length > 0);
        return {
            title: rt.shift(),
            content: rt
        };
    }
    var h3 = [fc("\n26th August 2024\nPlay our new game: Triep.IO\n"), fc("\n15th August 2024\nLottery participants & winners are now logged in Discord server. Join now!\n"), fc("\n14th August 2024\nNew Discord server link: Hornexcord.\nA lot of updates done to Sandbox. Go try it out.\n"), fc("\n1st June 2024\nAdded Hornex Sandbox link.\n"), fc("\n22nd May 2024\nNew setting: Show Health. Press Y to toggle.\nNew setting: Fixed Flower Health Bar Size.\nNew setting: Fixed Mob Health Bar Size.\nNew setting: Change Font.\nHoney now also shows tile count & total damage casted by all tiles in 1 second. Do note the numbers are for most ideal case. Most of the time you won't get that much damage.\n"), fc("\n17th May 2024\nMore game stats are shown now:\n*Total Time Played\n*Total Games Played\n*Total Kills\n*Total Chat Sent\n*Total Accounts\nNumpad keys can also be used to swap petals now.\nPress K to toggle keyboard controls.\n"), fc("\n16th May 2024\nAdded Game Statistics:\n*Super Players\n*Hyper Players\n*Ultra Players (with more than 200 ultra petals)\n*All Petals\n*Data is updated every hour.\n*You can search game stats by username.\n"), fc("\n13th May 2024\nFixed a bug that didn't let flowers enter portals.\nBalances:\n*Sword damage: 17 → 21\n*Yin yang damage: 10 → 20\n*Yin yang reload: 2s → 1.5s\n"), fc("\n5th May 2024\nHeavy now slows down your petal orbit speed. More slowness for higher rarity. \nCotton doesn't expand like Rose when you are angry.\nPowder now adds turbulence to your petals when you are angry.\nFixed more player dupe bugs.\n"), fc("\n4th May 2024\nFixed a player dupe bug. \nBalances:\n*Taco healing: 9 → 10\n*Sunflower shield: 1 → 2.5\n*Shell shield: 8 → 12\n*Buffed Yoba Egg by 50%\n"), fc("\n5th April 2024\nTo fix pet laggers, pets below Mythic rarity now die when they touch wall. Pet Rock of any rarity also dies when it touches wall.\nRemoved Hyper bottom portal.\nBalances:\n*Mushroom flower poison: 30 → 60\n*Swastika damage: 40 → 50\n*Swastika health: 35 → 40\n*Halo pet healing: 25 → 40\n*Heavy damage: 10 → 20\n*Cactus damage: 5 → 10\n*Rock damage: 15 → 30\n*Soil damage: 10 → 20\n*Soil health: 10 → 20\n*Soil reload: 2.5s → 1.5s\n*Snail reload: 1s → 1.5s\n*Skull health: 250 → 500\n*Stickbug damage: 10 → 18\n*Turtle health: 900 → 1600\n*Stinger damage: 140 → 160\n*Sunflower damage: 8 → 10\n*Sunflower health: 8 → 10\n*Leaf damage: 12 → 10\n*Leaf health: 12 → 10\n*Leaf reload: 1.2s → 1s\n"), {
        title: "4th April 2024",
        content: ["Increased build saver limit from 20 to 50.", "New setting: Right Align Petals. Places the petals row at the right side of screen instead of center. Not for mobile users.", "New setting: Show Population. Toggles zone population visibility.", "New setting: Show Background Grid. Toggles background grid visibility.", "Minor changes to settings UI.", "Alerts are shown now when you toggle a setting using shortcut.", "Account import/export UI redesigned.", "Added username search in Global Leaderboard."]
    }, {
        title: "1st April 2024",
        content: ["𐐿𐐘𐐫𐑀𐐃"]
    }, {
        title: "2nd March 2024",
        content: ["New setting: Fixed Name Size. Makes your names & chats not get affected by zoom. Disabled by default. Press U to toggle.", "Added petal counter in inventory & user profile.", "Added some buttons to instant absorb/gamble a rarity.", "Added Clear button in absorb menu."]
    }, {
        title: "27th February 2024",
        content: ["New mob: Dice.", "New petal: Dice. When you hit a petal drop with it, it has:", "*10% chance of duplicating it.", "*20% chance of deleting it.", "*70% chance of doing nothing.", "*Works on petal drops with rarity lower or same as your Dice petal.", "Buffed pet Rock health by 25%.", "Fixed Wig not working correctly.", "Fixed arabic zalgo chat spam caused by DMCA-ing & crafting."]
    }, {
        title: "13th February 2024",
        content: ["New lottery win loot distribution:", "*You now only win upto max rarity you have gambled plus 1.", "*For example, if you gamble a common & an ultra, you will be allowed to win upto super petals.", "*The leftover loot is put back into next lottery cycle."]
    }, {
        title: "7th February 2024",
        content: ["Added Clear Build button build saver."]
    }, {
        title: "3rd February 2024",
        content: ["85% of the craft fails are now burned instead of going in lottery.", "Reduced lottery win rate cap: 50% → 25%"]
    }, {
        title: "1st February 2024",
        content: ["New petal: Wig.", "*Turns aggressive mobs into passive aggressive mob.", "*Works on mobs of rarity upto PetalRarity+1.", "*Dropped by Spider Yoba.", "Blocking ads now reduces your craft success rate by 10%", "Watching video ad now increases your petal damage by 5%", "Increased level needed for participating in lottery: 10 → 30", "Reduced Hyper petal price: $1000 → $500"]
    }, {
        title: "29th January 2024",
        content: ["New petal: Rock Egg. Dropped by Rock. Spawns a pet rock.", "Reworked DMCA in Waveroom. It now has 120 health & instantly despawns a mob in Waveroom.", "New setting: UI Scale.", "Increased mob count in waveroom duo (by around 2x).", "Avacado affects pet ghost 50% less now.", "Settings now also shows shortcut keys.", "Fixed Avacado rotation being wrong in waveroom.", "Added Instagram link. Follow me for better luck."]
    }, {
        title: "26th January 2024",
        content: ["Reduced lottery win rate cap: 85% → 50%"]
    }, {
        title: "25th January 2024",
        content: ["New mob: Avacado. Drops Leaf & Avacado.", "New petal: Avacado. Makes your pets fat like NikocadoAvacado.", "Lottery win rate is now capped to 85%. This is to prevent domination from extremely wealthy players.", "DMCA now does not work on Shiny mobs.", "DMCA now does not work on mobs with HP over 75%.", "Nerfed Skull weight by roughly 90%.", "Buffed Waveroom final loot keeping chance: 70% → 85%"]
    }, {
        title: "24th January 2024",
        content: ["Added win rate preview for gambling. Note that the preview isn't real-time. You have to open lottery to sync it with the current state. You also have to open lottery once for the previews to show up."]
    }, {
        title: "23rd January 2024",
        content: ["Added Build Saver. Use the UI or use these shortcuts:", "*Press L+NumberKey to load a build.", "*Press L+Shift+NumberKey to save a build.", "*You can save upto 20 builds."]
    }, {
        title: "22nd January 2024",
        content: ["Fixed game getting stuck for a while when you exited Waveroom with a lot of final loot.", "Fixed game getting stuck for a few seconds when you die collecting a lot of petals."]
    }, {
        title: "21st January 2024",
        content: ["Fixed game getting stuck for a few seconds when:", "*Opening user profiles with a lot of petals", "*Opening Inventory/Absorb with a lot of petals", "*Opening Lottery"]
    }, {
        title: "20th January 2024",
        content: ["Petals failed in crafting now get in Lottery. But this will NOT increase your win rate.", "Added a warning message when you try to participate in Lottery.", "Your name in Lottery is now shown goldish.", "Lottery now also shows petal rarity count."]
    }, {
        title: "19th January 2024",
        content: ["Added Lottery.", "*Players can poll their petals. Higher rarity petals give you better chance of winning.", "*The more higher rarity petals you poll, the higher win chance you get.", "*Every 3 hours, a lucky winner is selected and gets all the polled petals.", "*You have to be at least level 10 to participate.", "*Look in Absorb menu to find Gamble button."]
    }, {
        title: "5th January 2024",
        content: ["Buffed Hyper craft rate: 0.5% → 0.51%"]
    }, {
        title: "28th December 2023",
        content: ["Fixed Gem glitch.", "Fixed Arrow & Banana glitch."]
    }, {
        title: "12th November 2023",
        content: ["Changes to anti-lag system:", "If grid cell exceeds 150 objects, players & mobs are no longer teleported. Pets are now insta killed.", "Pollen & Web stop falling on ground if the server is experiencing lag."]
    }, {
        title: "6th November 2023",
        content: ["Some anti lag measures:", "*If server is possibly experiencing lags, server goes in 10s cooldown period & lightnings are auto disabled for some time.", "*During cooldown, if a grid cell exceeds 150 objects, all petals in it are auto killed and players & mobs are auto teleported around the zone.", "*These changes don't apply in waverooms.", "Lightning damage: 12 → 8"]
    }, {
        title: "7th October 2023",
        content: ["Buffed Sword damage: 16 → 17", "Fixed an exploit that let you clone your petals."]
    }, {
        title: "6th October 2023",
        content: ["Salt doesn't work while sleeping now.", "Salt doesn't work on Hypers now.", "Salt reflection reduction with Sponge: 80% → 90%"]
    }, {
        title: "2nd October 2023",
        content: ["New settings: Low quality."]
    }, {
        title: "26th September 2023",
        content: ["Fixed mobs spawned from shiny spawners having extremely high drop rate in Asian servers since AS was migrated from China to Singapore. The drop rates were around 100x to 10000x."]
    }, {
        title: "18th September 2023",
        content: ["The quicker your clicks on the petals, the greater the number of petals added to the crafting/absorbing board. Useful for mobile users mostly."]
    }, {
        title: "16th September 2023",
        content: ["Added Hyper key in Shop.", "Increased Ultra key price.", "Fixed crafting failure & wave winner chat message sometimes showing up late."]
    }, {
        title: "13th September 2023",
        content: ["Added maze in Waveroom:", "*Map changes every 5th wave. Map can sometimes be maze and sometimes not.", "*There are 18 different maze maps.", "*There is a 30% chance of the next map not being maze. Other 70% is distributed among the maze maps.", "*Mobs are smart enough to move through maze.", "*Very early stuff so maps which will make the waves too hard will be removed in the future.", "Fixed mob count not increasing much after wave 120 in Waveroom.", "Mobs have extremely low chance of spawning on players in Waveroom now.", "Nerfed Honey tile damage in Waveroom by 30%", "Pedox does not drop Skull now.", "Pedox only has 30% chance of spawning Baby Ant now.", "Fixed player not moving perfectly straight left using keyboard controls. Very minor issue.", "You can now hurt mobs while having immunity.", "Mobs do not spawn around you if you have spawn immunity in Waveroom now."]
    }, {
        title: "6th September 2023",
        content: ["Added special waves in Waveroom:", "*All mobs during special waves are shiny.", "*There is a 5% chance of getting a special wave.", "Increased shiny mob size.", "Shiny mobs can not be breeded now.", "Antidote has been reworked. It now reduces poison effect when consumed.", "Reduced Sword damage: 20 → 16", "Reduced Antidote health: 200 → 30"]
    }, {
        title: "5th September 2023",
        content: ["Nerfed Waveroom final loot. You get upto 70% chance of keeping a petal if you collect:", "*5 Common (14% chance if you collect 1 petal)", "*11 Unusual (6.36% chance if you collect 1 petal)", "*21 Rare (3.33% chance if you collect 1 petal)", "*34 Epic (2.06% chance if you collect 1 petal)", "*52 Legendary (1.35% chance if you collect 1 petal)", "*72 Mythic (0.97% chance if you collect 1 petal)", "*97 Ultra (0.72% chance if you collect 1 petal)", "*126 Super (0.56% chance if you collect 1 petal)", "*158 Hyper (0.44% chance if you collect 1 petal)", "Removed Pedox glow effect as it was making the client laggy for some users.", "Fixed crafting infinite spin glitch.", "Pedox now spawns Baby Ant when it dies.", "Increased Pedox health: 100 → 150"]
    }, {
        title: "4th September 2023",
        content: ["New mob: Pedox", "New petal: Sword. Dropped by Pedox.", "Shiny mobs now only spawn in Mythic+ zones.", "Buffed Skull weight by 10-20x for higher rarity petals.", "Removed 30% Lightning damage nerf from Waveroom.", "Fixed Waveroom actually giving you less petals if you collected more petals. This bug had been in the game since 25th August 💀. It also sometimes gave players more loot.", "Slightly increased waveroom drops."]
    }, {
        title: "28th August 2023",
        content: ["New mob: Fossil.", "New petal: Skull. Very heavy petal that can move mobs around. Dropped by Fossil.", "Added Shiny mobs:", "*They have 1% chance of spawning.", "*They give 10x score.", "*They have 10x drop rates.", "*Their size is comparatively smaller with a colorful appearance.", "*They do not spawn in any waves.", "*Killing a shiny mob gives you shiny skin.", "New profile stat: Max Wave.", "Square skin can now be taken into the Waveroom.", "Shrinker & Expander does not die after a single use in Waveroom now.", "Increased Shrinker health: 10 → 150", "Patched a small inspect element trick that gave users a bigger field of view."]
    }, {
        title: "26th August 2023",
        content: ["Shrinker now affects size 50x more in Waveroom.", "Pets now have 2x health in Waveroom.", "Fixed Shrinker sometimes growing spawned mobs from shrinked spawners.", "Shrinker now does not die when it is used on a mob that is already at its minimum size.", "Shrinker & Expander does not push mobs now.", "Fixed Dandelions from mob firing at wrong angle sometimes.", "Balancing:", "*Turtle health: 600 → 900", "*Heavy health: 500 → 600", "*Mushroom flower poison: 10 → 30", "*Chromosome reload: 5s → 2s", "*Grapes reload: 3s → 2s", "*Gas health: 250 → 200", "*Fire health: 80 → 120", "*Taco poop damage: 15 → 25"]
    }, {
        title: "25th August 2023",
        content: ["Re-added portals in Unusual zone.", "Craft rate in Waveroom is now 2x.", "All portals at bottom-right corner of zones now have 5 player cap. They are also slightly bigger.", "Increased start wave to upto 75.", "You can now join Waverooms upto wave 80 (if they are not full.)", "Slightly increased Waveroom final loot.", "Added some info about Waverooms in death screen cos some people were getting confused about drops & were too lazy to read changelog.", "Fixed sometimes players randomly getting kicked for invalidProtocal while switching lobbies.", "Fixed sometimes client crashing out while being in wave lobby.", "Fixed another bug that allowed ghost players to exist in Waveroom.", "Fixed low level player getting ejected from zone waves while being inside a Waveroom.", "Fixed mobs spawning and instantly despawning around sleeping players in Zonewaves.", "Fixed zone waves lasting till wave 70 instead of 50."]
    }, {
        title: "24th August 2023",
        content: ["Tanky mobs now have lower spawn rate in waves: Dragon Nest, Ant Holes, Beehive, Spider Cave, Yoba & Queen Ant", "Only 1 kind of tanky mob species can spawn in waves now.", "Fixed Centipedes body spawning out of border in Waveroom.", "Fixed Waveroom sometimes having disconnected ghost player.", "Fixed users sometimes continuously getting kicked.", "Fixed another server crash bug."]
    }, {
        title: "23rd August 2023",
        content: ["Removed too many players nearby warning from Waveroom.", "Removed Portals from Common & Unusual zones.", "Positional arrow is now shown on squad member.", "You can join Waverooms upto wave 75 (if it is not full).", "Waveroom death screen now shows Max Wave.", "Honey now disables if you are over a Portal.", "Breeding now also disables if you are over a Portal.", "Nerfed Lightning damage in Waveroom by 30%.", "Fixed a server crash bug."]
    }, {
        title: "23rd August 2023",
        content: ["Added Waveroom:", "*Each zone has 2 portals at top-left & bottom-right corners.", "*Stand over a Portal to enter a Waveroom.", "*Waveroom is a wave lobby of 4 players with final wave set to 250.", "*Wave at which you will start depends on both your level & the max wave you have reached.", "*Your account is not saved in Waveroom. You can craft or absorb all your petals and then get them all back when you leave the Waveroom.", "*Final loot you get to save is a fraction of all your loot. It is calculated when you leave Waveroom.", "*More number of petals collected equals higher chance of keeping it in the final loot.", "*Crafted petals do not affect the final loot in any way. You can craft petals & use them in the Waveroom.", "*Number of mobs in Waveroom depends on player count. But to make it not too easy for solo players, mob count is 2x for solo players.", "*You can not enter a Waveroom after it has reached wave 35.", "*Pets are allowed in Waveroom.", "Reduced Ant Hole, Spider Cave & Beehive move speed in waves by 30%.", "Hovering over mob icons in zone overview now shows their stats.", "Fixed issues with Pacman's summons in waves.", "Salt now works on Hyper mobs.", "Fixed zooming not working on Firefox."]
    }, {
        title: "15th August 2023",
        content: ["Added Ultra keys in Shop.", "Fixed Shop key validation not working."]
    }, {
        title: "14th August 2023",
        content: ["Added new payment methods in Shop!", "*Credit/Debit cards, Google Pay, crypto & many more local payment methods. Check it out!", "Renamed Yoba mob name & changed its description."]
    }, {
        title: "13th August 2023",
        content: ["Fixed tooltips sometimes not hiding on Firefox.", "Increased Mushroom poison: 7 → 10", "Powder cooldown: 2.5s → 1.5s", "Pincer poison: 15 → 20"]
    }, {
        title: "12th August 2023",
        content: ["New mob: Mushroom.", "New petal: Mushroom. Makes you poisonous. Effect stacks.", "Stickbug now makes your petal orbit dance back & forth instead of left & right.", "Reduced Desert Centipede speed in waves by 25%", "Top-left avatar now also shows username.", "Death screen now also shows total rarity collected."]
    }, {
        title: "11th August 2023",
        content: ["Youtube videos are now featured on the game."]
    }, {
        title: "10th August 2023",
        content: ["New mob: Stickbug. Credits to Dwajl.", "New petal: Stickbug. Makes your petal orbit dance.", "Minimum damage needed to get drops from wave mobs: 10% → 20%", "Reduced Super drop rate: 0.02% → 0.01%", "Minor changes to Hyper drop rates.", "Increased minimum kills needed to win wave: 10 → 50", "Fixed Sunflower regenerating shield while Gem is on.", "Watching video ad now gives you a secret skin."]
    }, {
        title: "9th August 2023",
        content: ["Aggressive mobs now despawn if they are too far their zone. Passive mobs like Baby Ant get teleported back to their zone.", "Added video ad."]
    }, {
        title: "8th August 2023",
        content: ["Added account import/export option for countries where Discord is blocked.", "*Before importing any account, make sure to export your current account to not lose it.", "*Do not share your account's password with anyone. Anyone with access to it can have access to your account.", "Removed disclaimer from menu.", "Added banner ads."]
    }, {
        title: "7th August 2023",
        content: ["New mob: Nigersaurus.", "New petal: Chromosome. Dropped by Nigersaurus. Ruins mob movement.", "New mob: Sunflower.", "New petal: Sunflower. Passively regenerates shield.", "Added Mythic spawn. Needs level 200.", "Pincer reload: 1s → 1.5s", "Pincer can not decrease mob speed below 30% now.", "Using Salt with Sponge now decreases damage reflection by 80%", "Increased final wave: 40 → 50"]
    }, {
        title: "6th August 2023",
        content: ["New mob: Furry.", "Nerfed mob health in waves by 8%", "Nerfed mob health & damage in early waves by 75%", "Buffed late wave mobs & their drop rate.", "If 8 mobs are already chasing you in waves, more mobs do not spawn around you.", "Reduced spawner speed in waves: 11.5 → 7", "Wave mobs can now drop lower tier petals too.", "Fixed mobs like Ant Hole rendering below Honey tiles."]
    }, {
        title: "5th August 2023",
        content: ["Tweaked level needed to participate in waves:", "*Ultra: 120", "*Super: 180", "*Hyper: 240", "All mobs now spawn in waves.", "Increased Hyper wave mob count.", "Buffed droprates during late waves.", "Nerfed droprates during early waves.", "You need to cast at least 10% damage to get loot from wave mobs now."]
    }, {
        title: "4th August 2023",
        content: ["All mobs excluding spawners (like Ant Hole) now spawn in waves.", "Wave mobs can not be bred now.", "Increased mob species count during waves: 5 → 6", "Increased Hyper wave mob count.", "Beehive now drops Hornet Egg.", "Fixed players spawning in the wrong zone sometimes.", "Minimum mob size size now depends on rarity.", "Increased Shrinker & Expander reload time: 5s → 6s", "Reduced Shrinker & Expander strength by 20%", "Reduced Ears range by 30%", "Spider Cave now spawns 2 Spider Yoba's on death."]
    }, {
        title: "4th August 2023",
        content: ["Wave changes:", "*Mob health & damage increases more over the waves now.", "*Mobs do not change their target player now.", "Ears now give you telepathic powers.", "Fixed flowers not being able to consume while having nitro. (We care about flowers appetite.)"]
    }, {
        title: "3rd August 2023",
        content: ["Reduced Hyper craft rate: 1% → 0.5%", "Reduced DMCA reload: 20s → 10s"]
    }, {
        title: "2nd August 2023",
        content: ["Reduced Pincer slowness duration & made it depend on petal rarity."]
    }, {
        title: "1st August 2023",
        content: ["Fixed Pincer not slowing down mobs.", "Fixed font not loading on menu sometimes.", "Reduced mobile UI scale.", "We are trying to add more payment methods in the shop. Ultra keys might also come once we get that done. Stay tuned!"]
    }, {
        title: "31st July 2023",
        content: ["Mobs now get teleported back to their zone if they are too far instead of despawning.", "Wave Kills, Score & Time Alive does not reset on game update now.", "Fixed a bug with scoring system.", "Fixed another craft exploit."]
    }, {
        title: "31st July 2023",
        content: ["Added Shop.", "Balancing:", "*Turtle health 500 → 600", "*Halo pet healing: 20 → 25", "*Heavy health: 450 → 500", "*Pincer damage: 5 → 6", "*Snail reload: 1.5s → 1s", "*Iris poison: 45 → 50", "*Grapes poison: 40 → 45", "*Bone armor: 9 → 10", "*Missile damage: 50 → 55", "*Peas health: 20 → 25", "*Cotton health: 12 → 15", "*Arrow damage: 4 → 5", "*Rock health: 150 → 200", "*Powder health: 10 → 15", "*Cement damage: 40 → 50", "*Cement health: 80 → 100", "*Lightning damage: 18 → 20", "*Lightning reload: 2s → 2.5s"]
    }, {
        title: "27th July 2023",
        content: ["New mob: Dragon Nest.", "Fixed Dragon's Fire rotating by Wave.", "Reduced Hornet missile knockback.", "Spider Yoba's Lightsaber now scales with size."]
    }, {
        title: "26th July 2023",
        content: ["New mob: Tumbleweed.", "New petal: Cement. Dropped by Statue. Its damage is based on enemy's health percentage.", "Pill now makes your petal orbit sus."]
    }, {
        title: "25th July 2023",
        content: ["New mob: Statue.", "Reduced Super craft rate: 1.5% → 1%", "Reduced Spider Cave spawns: [3, 6] → [2, 5]", "Buffs:", "*Turtle reload: 2s + 0.5s → 1.5s + 0.5s", "*Halo pet healing: 15 → 20", "*Heavy health: 400 → 450", "*Peas damage: 20 → 25", "*Grapes poison: 35 → 40", "*Snail reload: 2s → 1.5s", "*Bone armor: 8 → 9", "*Cotton health: 10 → 12", "*Swastika health: 30 → 35", "*Rock health: 120 → 150", "*Lightsaber damage: 9 → 10"]
    }, {
        title: "24th July 2023",
        content: ["You can now spawn 10th petal with Key 0.", "Hold shift and press number key to swap petal at slot>10."]
    }, {
        title: "23rd July 2023",
        content: ["New mob: Spider Cave.", "New petal: Spider Egg. Spawns pet spiders. Dropped by Spider Cave.", "Reduced Spider Legs drop rate from Spider."]
    }, {
        title: "22nd July 2023",
        content: ["Level required is now shown in zone leave warning.", "You get teleported immediately if you hit any wave mob while being low level.", "Fixed level text disappearing sometimes."]
    }, {
        title: "21st July 2023",
        content: ["Reduced time you have to wait to get mob attacks in wave: 30s → 15s", "Waves do not auto end now if wave number is lower than 3.", "Increased final wave: 30 → 40.", "Increased kills needed for Hyper wave: 50 → 100"]
    }, {
        title: "20th July 2023",
        content: ["Ants redesign.", "Added R button on mobile devices.", "Reduced mobile UI scale by around 20%."]
    }, {
        title: "19th July 2023",
        content: ["Balancing:", "*Yoba Egg buff.", "*Stinger damage: 100 → 140", "*Stinger reload: 7s → 10s", "*Light damage: 12 → 10", "*Light reload: 0.7s → 0.6s", "*Swastika damage: 30 → 40", "*Swastika reload: 2s → 2.5s", "*Missile damage: 40 → 50", "*Missile reload: 2s + 0.5s → 2.5s+ 0.5s", "*Wing damage: 25 → 35", "*Wing reload: 2s → 2.5s", "*Halo pet healing: 10 → 15", "*Basic reload: 3s → 2.5s", "*Peas damage: 15 → 20", "*Grapes poison: 30 → 35", "*Pincer reload: 1.5s → 1s", "*Heavy health: 350 → 400", "*Taco poop damage: 12 → 15", "*Bone armor: 7 → 8", "*Arrow health: 450 → 500", "*Snail health: 45 → 50", "*Powder damage: 15 → 20", "*Lightsaber damage: 8 → 9"]
    }, {
        title: "18th July 2023",
        content: ["New mob: Turtle", "New petal: Turtle. Its like Missile but increases its size over time. Might be useful for pushing mobs away.", "Pill does not affect Nitro now.", "Pill affects Arrow now."]
    }, {
        title: "16th July 2023",
        content: ["Increased level needed for Super wave: 150 → 175", "Increased level needed for Hyper wave: 175 → 225", "You need to have at least 10 kills during waves to get wave rewards now.", "Balancing:", "*Fire damage: 25 → 20", "*Fire health: 70 → 80", "*Rock health: 60 → 120", "*Rock reload: 2.5s → 5s"]
    }, {
        title: "15th July 2023",
        content: ["Youtubers are now featured on the game.", "Fixed neutral mobs still kissing eachother on border.", "Buffs:", "*Halo pet heal: 9 → 10", "*Peas damage: 12 → 15", "*Missile damage: 35 → 40", "*Pincer reload: 2s → 1.5s", "*Grapes poison: 25 → 30", "*Heavy health: 300 → 350", "*Cotton health: 9 → 10", "*Taco poop damage: 10 → 12", "*Swastika health: 25 → 30", "*Arrow health: 400 → 450", "*Snail health: 40 → 45", "*Soil health increase: 75 → 100", "*Rock health: 50 → 60", "*Lightsaber damage: 7 → 8"]
    }, {
        title: "14th July 2023",
        content: ["Crab redesign.", "Fixed another crafting exploit.", "Reduced kills needed for Ultra wave: 3000 → 2000", "Reduced wave duration by 50%.", "Increased final wave: 30 → 40", "Waves now require minimum level:", "*Ultra: 125+", "*Super: 150+", "*Hyper: 175+", "*If your level is too low, you are teleported in 10s.", "*If your level is lower than 100 and you hit any wave mob anywhere, you are teleported immediately."]
    }, {
        title: "13th July 2023",
        content: ["Re-added Ultra wave. Needs 3000 kills to start.", "Waves can randomly start anytime now even if kills aren't fulfilled.", "Waves do not close if any player has been inside the zone for more than 60s.", "Super Pacman now spawns Ultra Ghosts.", "Score is now given based on the damage casted.", "Nearby players for move away warning: 4 → 3", "Player with most kills during waves get extra petals:", "*Ultra: 1-5", "*Super: 5-15", "*Hyper: 15-25"]
    }, {
        title: "13th July 2023",
        content: ["Even more wave changes:", "*Kills needed for Super wave: 50 → 500", "*Kills needed for Hyper wave: 15 → 50", "*Final wave: 250 → 30.", "*Despawned mobs are not counted in kills now.", "*Removed player limit from waves.", "*Nearby players for move away warning: 6 → 4", "*Warning only shows during waves.", "Server-side optimizations.", "Increased map size by 30%."]
    }, {
        title: "12th July 2023",
        content: ["More wave changes:", "*Removed Ultra wave.", "*If more than 6 players are too close to eachother, some of them get teleported around the zone based on the time they were alive. Too many players closeby causes the server to lag.", "*Zone leave timer is only reducted on hitting mobs if time left is more than 10s.", "*A player has to be at least in the zone for 60s to get mob attacks.", "*A wave starter who died has to return and stay in the zone for at least 60s to keep the waves running.", "*Reduced zone kick time: 120s → 60s.", "*Recuded mob count.", "*Reduced move away timer: 8s → 5s", "*New system for determining wave starters."]
    }, {
        title: "12th July 2023",
        content: ["Wave changes:", "*Increased zone kick time to 120s.", "*If you attack mobs while having timer, 1s is depleted.", "*Increased player cap: 15 → 25", "*Increased wave duration. Longer for higher rarity zones.", "*Reduced drops by 50%.", "*Reduced mob health by 50%.", "*Increased mob species: 4 → 5", "*Fixed mobs spawning out of world/zone.", "*Mobs do not spawn near you if you have timer.", "Honey does not stack with other player's Honey now."]
    }, {
        title: "11th July 2023",
        content: ["Wave mobs now despawn if they are too far from their target or if their target has been neutralized.", "You now have to be at least 15s in the zone to get wave mob spawns.", "Reduced Sandstorm chase speed."]
    }, {
        title: "11th July 2023",
        content: ["Re-added Waves.", "*Reduced mob count.", "*Increased mob health & damage.", "*Increased drop rates.", "*Mob count now depends on the number of players in the zone now.", "*Reduced kills needed to start Hyper wave: 20 → 15", "*If there are more than 15 players in a zone during waves, they are teleported to other zones based on the time they have spend in the zone.", "*Wave mobs now chase players for 100x longer than normal mobs."]
    }, {
        title: "10th July 2023",
        content: ["Removed Waves.", "*Due to waves being unbalanced and melting our servers, we have temporarily removed waves from the game. It might come back again when it is balanced enough.", "Fixed despawning holes spawning ants."]
    }, {
        title: "10th July 2023",
        content: ["Added another AS lobby.", "Fixed a server crash bug.", "Increased kills needed to start waves by roughly 5x.", "Increased wave mob count even more.", "Removed Centipedes from waves.", "Petaler size is now fixed in waves."]
    }, {
        title: "10th July 2023",
        content: ["Increased Wave mob count.", "Reduced Wave duration.", "Pets do not spawn during waves now.", "Wave now ends if the players who were inside the zone when waves started, die. Players who enter the waves later on can not keep the waves going on."]
    }, {
        title: "10th July 2023",
        content: ["Added Waves.", "*Only for Ultra, Super & Hyper zones.", "*Waves start once a certain number of kills are reached in a zone.", "*Weaker mobs with lower droprates summon at start.", "*Mob power and droprate increases increases as wave number advances.", "*Wave is reset if all players are killed in the zone.", "*All mobs are aggressive during waves.", "*Static mobs like Cactus do not spawn during waves.", "*Wave population gets reset every 5th wave.", "*NOTE: Waves are at early stage and subject to major changes in the future.", "Size of summoned ants is now based on size of the Ant Hole."]
    }, {
        title: "9th July 2023",
        content: ["Buffed Hyper droprates slightly.", "Upto 8 people can get loot from Hypers now.", "Mobs only go inside eachother 35% if they are chasing something & touching the walls."]
    }, {
        title: "8th July 2023",
        content: ["New petal: Antidote. Cures poison. Dropped by Guardian.", "New petal: Pill. Elongates petals like Lightsaber & Fire. Dropped by M28.", "Fixed a server crash bug.", "Fixed mobs kissing eachother at border. Big mobs can now go 25% into each other.", "Bone only receives FinalDamage=max(0,IncomingDamage-Armor) now.", "Pollen now smoothly falls on the ground.", "Banned users now have banned label on their profile.", "Added some extra details to Jellyfish.", "Hypers now have 0.02% chance of dropping Super petal.", "Craft rate change:", "*Hyper: 2% → 1%", "*Super: 1% → 1.5%", "Buffs:", "*Coffee speed: 5% * rarity → 6% * rarity", "*Rock health: 45 → 50", "*Wing damage: 20 → 25", "*Starfish healing: 2.5/s → 3/s", "*Grapes poison:  20 → 25", "*Cotton health: 8 → 9", "*Heavy health: 250 → 300", "*Bone armor: 5 → 6", "*Snail damage: 20 → 25", "*Missile damage: 30 → 35", "*Peas damage: 10 → 12", "*Fire damage:  20 → 25", "*Lightning damage: 15 → 18", "*Arrow damage: 3 → 4", "*Halo healing: 8/s → 9/s", "*Swastika health: 20 → 25", "*Lightsaber health: 200 → 300", "*Pincer reload: 2.5s → 2s", "Nerfs:", "*Web reload: 3s + 0.5s → 3.5s + 0.5s", "*Nitro base boost: 0.13 → 0.10"]
    }, {
        title: "7th July 2023",
        content: ["Scorpion redesign."]
    }, {
        title: "6th July 2023",
        content: ["New petal: Nitro. Gives you mild constant boost. Dropped by Snail.", "Fixed Beehive not showing damage effect.", "Fixed Honey damaging newly spawned mobs instantly.", "Fixed client bugging out during game startup sometimes.", "Fixed newly spawned mob's missile hurting players.", "Redesigned some mobs.", "Fixed missiles from mobs not getting hurt by petals.", "Buffs:", "*Coffee speed: rarity * 4% → rarity * 5%", "*Wing reload: 2.5s → 2s", "*Soil health increase: 50 → 75", "*Starfish healing: 2.25/s → 2.5/s", "*Heavy damage: 9 → 10", "*Heavy health: 200 → 250", "*Cotton health: 7 → 8", "*Grapes poison: 15 → 20", "*Peas damage: 8 → 10", "*Lightning reload: 2.5s → 2s", "*Snail damage: 15 → 20", "*Swastika reload: 2.5s → 2s", "*Bone reload: 2.5s → 2s", "*Gas health: 140 → 250", "*Halo pet heal: 7/s → 8/s", "*Missile damage: 25 → 30", "*Fire damage: 15 → 20", "*Taco healing: 8 → 9", "*Pincer slowness duration: 2.5s → 3s", "*Lightsaber health: 120 → 200", "*Yoba damage: 30 → 40", "*Reduced Hornet Egg reload by roughly 50%.", "Nerfs:", "*Honeycomb damage: 0.65 → 0.33", "*Leaf reload: 1s → 1.2s", "*Rice damage: 5 → 4", "*Yoba health: 500 → 350"]
    }, {
        title: "5th July 2023",
        content: ["New mob: Beehive.", "New petal: Honey. Dropped by Beehive. Summons honeycomb around you.", "New useless command: /dlSprite. Downalods sprite sheet of petal/mob icons.", "Some mobs were reworked and minor extra details were added to them.", "Fixed multi count petals like Stinger & Sand spawning out of air instead of the flower.", "We now record petal usage data for balancing petals.", "Buffs:", "*Arrow damage: 1 → 3", "*Arrow health: 250 → 400", "*Banana damage: 1 → 2", "*Banana health: 170 → 400", "*Banana count now increases with rarity. Super: 4, Hyper: 6.", "*Light reload: 0.8s → 0.7s", "*Stinger reload: 7.5s → 7s", "*Halo pet heal: 3 → 7", "*Halo now stacks.", "*Rice damage: 4 → 5", "*Coffee reload: 2s + 1s → 2s + 0.5s", "*Heavy health: 150 → 200", "*Gas poison: 30 → 40", "*Snail damage: 10 → 15", "*Peas damage: 8 → 10", "*Bone armor: 4 → 5", "*Cotton reload: 1.5s → 1s", "*Grapes poison: 11 → 15", "*Taco poop damage: 8 → 10", "*Dandelion heal reduce: 20% → 30%", "*Pollen damage: 15 → 20", "*Lightsaber damage: 6 → 7", "*Swastika damage: 25 → 30", "*Missile reload: 2.5s + 0.5s → 2s + 0.5s", "*Fire damage: 9 → 15", "*Lightning damage: 12 → 15", "*Pincer slow duration: 1.5s → 2.5s", "Nerfs:", "*Sand reload: 1.25s → 1.4s", "*Scorpion missile poison damage: 15 → 7", "*Jellyfish lightning damage: 7 → 5", "*Rose heal: 13 → 11"]
    }, {
        title: "4th July 2023",
        content: ["New petal: Air. Dropped by Ghost", "Fixed Ghost not showing in mob gallery.", "Nerfs:", "*Reduced Ghost move speed: 12.2 → 11.6", "*Pacman spawns 1 ghost on hurt and 2 ghosts on death now.", "*Reduced Spider Yoba's Lightsaber damage by 90%", "*Snail Health: 180 → 120", "*Spider Yoba health: 150 → 100", "*Reduced Ghost damage: 0.6 → 0.1.", "Buffs:", "*Coffee reload: 3.5s → 2s", "*Coffee duration: 1s → 1.5s", "*Pet Ghost damage is now 10x of mob damage (1).", "*Pacman health: 100 → 120."]
    }, {
        title: "3rd July 2023",
        content: ["New mob: Pacman. Spawns Ghosts.", "New mob: Ghost. Fast but low damage. Does not drop anything. Can move through objects.", "New petal: Pacman. Spawns pet Ghosts extremely fast. Dropped by Pacman.", "Reduced Super & Hyper Centipede length: (10, 40) → (5, 10)", "Fixed chat not working on phone."]
    }, {
        title: "2nd July 2023",
        content: ["New petal: Taco. Heals and makes you shoot poop in the opposite direction of motion. Dropped by Petaler.", "New petal: Banana. A healing petal with the mechanics of Arrow. Dropped by Bush.", "Hyper mobs can now go into Ultra zone.", "Mythic+ crafting result is now broadcasted in chat."]
    }, {
        title: "2nd July 2023",
        content: ["Fixed a server crash bug.", "Fixed same account being able to login on the same server multiple times (to patch another craft exploit).", "Reduced chat censorship. If you are caught spamming, your account will be banned."]
    }, {
        title: "1st July 2023",
        content: ["Increased Hyper mobs drop rate.", "All Hyper mobs now have 0.002% chance of dropping a Super petal.", "*Clarification: A Hyper mob can drop the same Ultra petal upto 3 times. It isn't limited to dropping 3 petals only. If a mob has 4 unique petal drops, a Hyper mob can drop upto 12 Ultra petals.", "Fixed petal/mob icons not showing up on some devices.", "To fix crafting exploit, same account can not be online on different servers now."]
    }, {
        title: "1st July 2023",
        content: ["Fixed game random lag spikes on mobile devices.", "Fixed font being sus on petal icons.", "Fixed some mob icons looking sussy.", "Increased UI icons resolution cos they were blurry for some users."]
    }, {
        title: "1st July 2023",
        content: ["Fixed Hyper mobs not dropping upto 3 petals.", "Salt does not work on Hyper mobs now."]
    }, {
        title: "30th June 2023",
        content: ["New rarity: Hyper.", "*Hyper mobs do not drop Super petals.", "*Hyper mobs can drop upto 3 Ultra petals.", "*2% craft success rate.", "*Hyper petals give 1 trillion XP.", "Client-side performance improvements.", "Fixed petals like Stinger & Wing not twirling by Snail.", "Fixed death screen avatar with wings getting clipped.", "Removed EU #3."]
    }, {
        title: "29th June 2023",
        content: ["Players have 3s spawn immunity now.", "Starfish can only regenerate for 5s now.", "Fixed Dandelion not affecting mob healing.", "Fixed mobs dropping petals on suicide.", "Nerfed Ant Holes:", "*Damage needed to poop ants: 5% → 15%", "*Pooped Soldier Ant count: 4 → 3"]
    }, {
        title: "28th June 2023",
        content: ["New petal: Wave. Dropped by Snail. Rotates passive mobs.", "Fixed infinite Gem shield glitch caused by Shell.", "Nerfed Common, Unsual & Rare Gem.", "Fixed number rounding issue.", "If population of a speices in a zone below Legendary remains below 4 for 30s, it is replaced by a new species.", "Increased mob count per speices of Epic & Rare: 5 → 6", "Spawn zone changes:", "*Unsual: 25 → 10", "*Rare: 50 → 35", "*Epic: 75 → 65", "*Legendary: 125 → 100", "Loot for Legendary+ mobs now drop even if they are not in your view."]
    }, {
        title: "27th June 2023",
        content: ["New mob: Snail.", "New petal: Snail. Twirls your petal orbit.", "New petal: Fire. Dropped by Dragon.", "New petal: Gas. Dropped by Dragon.", "You can not hurt newly spawned mobs for 2s now.", "Buffed Lightsaber:", "*Damage: 4 → 6", "*Health: 100 → 120", "Added key binds for opening inventory and shit.", "You can now chat at Level 3."]
    }, {
        title: "27th June 2023",
        content: ["Added 1 AS lobby.", "Removed no spawn damage rule from pets.", "Newly spawned mobs can not hurt anyone for 2s now.", "Buffed Arrow health from 200 to 250.", "Global Leaderboard now shows top 50 players.", "Removed Petals Destroyed leaderboard."]
    }, {
        title: "26th June 2023",
        content: ["New petal: Coffee. Gives you temporary speed boost. Dropped by Bush.", "New petal: Bone. Dropped by Dragon.", "Gem now reflects missiles but with their damage reduced."]
    }, {
        title: "26th June 2023",
        content: ["Fixed a server crash bug.", "Salt only reflects damage if victim's health is more than 15% now.", "Buffed Gem.", "*Reduced Shield regen time.", "*Reduced HP depletion."]
    }, {
        title: "25th June 2023",
        content: ["New mob: Dragon. Breathes Fire.", "New petal: Dragon Egg. Spawns a pet Dragon.", "Fixed seemingly invisible walls appearing in game after shrinking a large mob.", "Fixed Ultra Stick spawn.", "New score formula.", "You can not DMCA mobs with health lower than 40% now.", "Nerfs:", "*Light damage: 13 → 12", "*Leaf damage: 13 → 12", "*Faster rotation speed: -0.2 rad/s for all rarities", "*Salt reflection damage: -20% for all rarities", "*Spider Yoba Lightsaber ignition time: 2s → 5s", "Buffs:", "*Stinger reload: 10s → 7.5s", "*Swastika reload: 3s → 2.5s", "*Sand reload: 1.5s → 1.25s", "*Rock reload: 3s → 2.5s", "*Arrow health: 180 → 220", "*Lightsaber ignition time: 2s → 1.5s"]
    }, {
        title: "24th June 2023",
        content: ["New petal: Arrow. Locks onto a target and randomly through it while slowly damaging it. Big health, low damage. Dropped by Spider Yoba", "Added spawn zones. Zones unlock with level.", "Added level up reward table.", "Increased drop rate of Lightsaber by Spider Yoba.", "Only player who deals the most damage gets the killer mob in their mob gallery now.", "Press F to toggle hitbox.", "Press G to toggle grid.", "Press L to toggle debug info."]
    }, {
        title: "24th June 2023",
        content: ["Fixed duplicate drops.", "Fixed too many pets spawning from 1 egg."]
    }, {
        title: "23rd June 2023",
        content: ["Fixed Rice.", "Fixed players pushing eachother."]
    }, {
        title: "23rd June 2023",
        content: ["New petal: Gem. Dropped by Gaurdian. When you rage, it depletes your hp and creates an invisible shield which enemies can not cross.", "Increased DMCA reload to 20s.", "Added Leave Game button.", "Nerfed Spider Yoba.", "Server side performance improvements.", "Fixed collisions sometimes not registering.", "Fixed Expander & Shrinker not working on Missiles and making them disappear.", "DMCA-ing Ant Hole does not release ants now.", "Stick does not expand now."]
    }, {
        title: "22nd June 2023",
        content: ["Guardian does not spawn when Baby Ant is killed now.", "You need to be at least Level 4 to chat now."]
    }, {
        title: "22nd June 2023",
        content: ["New mob: Guardian. Spawns when a Baby Ant is murdered.", "New petal: Halo. Dropped by Guardian. Passively heals your pets through air.", "Leaf does not heal pets anymore.", "Mobs can only be bred once now.", "Reduced petal knockback on mobs.", "Minor physics change.", "Shell petal doesn't expand now like Rose.", "Fixed a server crash bug.", "Added 1 more EU lobby."]
    }, {
        title: "21st June 2023",
        content: ["Fixed petal arrangement glitching when you gained a new petal slot."]
    }, {
        title: "21st June 2023",
        content: ["New mob: M28.", "New petal: DMCA. Dropped by M28.", "Newly spawned mobs do not hurt anyone for 1s now.", "Added a setting to censor special characters from chat. Enabled by default.", "Fixed a server crash bug.", "Fixed Sponge petal hurting you on respawn.", "Fixed shield showing up on avatar even after you are dead."]
    }, {
        title: "21st June 2023",
        content: ["You can now hide chat from settings.", "You get muted for 60s if you send chats too frequently.", "Added Discord login."]
    }, {
        title: "20th June 2023",
        content: ["Added 1 more EU lobby.", "Added 2 US lobbies.", "Fixed game not loading on some IOS devices.", "Fixed game getting laggy after playing for some time."]
    }, {
        title: "20th June 2023",
        content: ["Game released to public!"]
    }, {
        title: "20th June 2023",
        content: ["Shell petal now actually gives you a shield.", "Added /dlMob and /dlPetal commands. Use them to download icons from the game by providing a name.", "Fixed game freezing for 1s while opening a profile with many petals.", "Minor mobile UI bug fixes.", "Removed tick time & object count from debug info."]
    }, {
        title: "19th June 2023",
        content: ["Added Global Leaderboard.", "Added usernames. Claim it from Stats page.", "Added /profile command. Use it to view profile of an user."]
    }, {
        title: "17th June 2023",
        content: ["New mob: Sponge", "New petal: Sponge"]
    }, {
        title: "16th June 2023",
        content: ["New mob: Starfish & Shell", "New petal: Starfish & Shell."]
    }, {
        title: "15th June 2023",
        content: ["Created changelog."]
    }];
    console.log("running...");
    var h4 = Date.now() < 1712019170434;
    var h5 = Math.floor(Math.random() * 10);
    function h6(rs) {
        const rt = ["𐐘", "𐑀", "𐐿", "𐐃", "𐐫"];
        let ru = "";
        for (const rv of rs) {
            if (rv === " ") {
                ru += " ";
            } else {
                ru += rt[(h5 + rv.charCodeAt(0)) % rt.length];
            }
        }
        return ru;
    }
    if (h4) {
        document.querySelector(".grid .title").setAttribute("stroke", h6("hornex") + ".pro");
    }
    function h7(rs, rt, ru) {
        const rv = rt - rs;
        if (Math.abs(rv) < 0.01) {
            return rt;
        }
        return rs + rv * (1 - Math.exp(-ru * pS));
    }
    var h8 = [];
    var h9 = 0;
    function ha(rs, rt = 5000) {
        const ru = nR("<div class=\"toast\">\n\t\t<div stroke=\"" + jx(rs) + "\"></div>\n\t</div>");
        kI.appendChild(ru);
        let rv = 0;
        rw();
        function rw() {
            ru.style.transform = "translate(-50%, " + h9 + "px)";
            ru.style.opacity = rv;
        }
        this.isDead = false;
        this.update = () => {
            rt -= pR;
            const rx = rt > 0 ? 1 : 0;
            rv = h7(rv, rx, 0.3);
            rw();
            if (rt < 0 && rv <= 0) {
                ru.remove();
                this.isDead = true;
            }
            h9 += rv * (ru.offsetHeight + 5);
        };
        h8.push(this);
    }
    function hb(rs) {
        new ha(rs, 5000);
    }
    function hc() {
        h9 = 0;
        for (let rs = h8.length - 1; rs >= 0; rs--) {
            const rt = h8[rs];
            rt.update();
            if (rt.isDead) {
                h8.splice(rs, 1);
            }
        }
    }
    var hd = true;
    var he = document.querySelector(".ad-blocker");
    fetch("/weborama.js").then(rs => {
        he.style.display = "none";
        hd = false;
    }).catch(rs => {
        he.style.display = "";
    });
    var hf = document.querySelector(".ads");
    var hg = Date.now();
    function hh() {
        console.log("ad refresh");
        hg = Date.now();
        hf.style.display = "";
        try {
            aiptag.cmd.display.push(function () {
                aipDisplayTag.display("hornex-pro_970x250");
            });
            aiptag.cmd.display.push(function () {
                aipDisplayTag.display("hornex-pro_300x600");
            });
        } catch (rs) {
            console.log("Error refreshing ad.");
        }
    }
    setInterval(function () {
        if (hf.style.display === "" && Date.now() - hg > 30000) {
            hh();
        }
    }, 10000);
    var hi = null;
    var hj = 0;
    function hk() {
        console.log("Loading video ad...");
        if (typeof aiptag.adplayer !== "undefined") {
            hi = 69;
            hj = Date.now();
            aiptag.cmd.player.push(function () {
                aiptag.adplayer.startPreRoll();
            });
        } else {
            window.aip_complete("adplayer-not-found");
        }
    }
    window.aip_complete = function (rs) {
        console.log("Preroll state: " + rs);
        if (rs === "video-ad-skipped" || rs.indexOf("complete") > -1) {
            if (hi !== null && Date.now() - hj > 3000) {
                console.log("Video AD success!");
                if (hX) {
                    kJ("\n\t\t\t\t\t<div stroke=\"Your petal damage has been increased by 5% till you are on this server.\"></div>\n\t\t\t\t\t<div class=\"msg-footer\" stroke=\"Do you also want to claim your free Square skin? Your flower will be turned into a box.\"></div>\n\t\t\t\t", ru => {
                        if (ru && hX) {
                            im(new Uint8Array([cH.iWatchAd]));
                            hJ("Claiming secret skin...");
                        }
                    }, {
                        title: "Congratulations!",
                        finalMsg: false
                    });
                }
            } else {
                hJ("Could not claim secret skin.");
            }
        } else {
            alert("Ad failed to load. Try again later. Disable your ad blocker if you have any.\nMessage: " + rs);
        }
        hl.classList.remove("loading");
        hi = null;
    };
    var hl = document.querySelector(".watch-ad");
    hl.onclick = function () {
        hl.classList.add("loading");
        hk();
    };
    hl.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" style=\"color:" + hO.Ultra + "\" stroke=\"GET 5% MORE DAMAGE!!\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Ads help us keep the game running and motivated to push more updates. Watch a video ad to support us and get 5% more petal damage as a reward!\"></div>\n\t\t<div style=\"color:" + hO.Mythic + "\" stroke=\"You also get a funny square skin as reward!\"></div>\n\t</div>");
    };
    hl.tooltipDown = true;
    var hm = ["https://www.youtube.com/watch?v=5fhM-rUfgYo", "https://www.youtube.com/watch?v=Ls63jHIkA5A", "https://www.youtube.com/watch?v=J4dfnmixf98", "https://www.youtube.com/watch?v=yOnyW6iNB1g", "https://www.youtube.com/watch?v=8tbvq_gUC4Y", "https://www.youtube.com/watch?v=U9n1nRs9M3k", "https://www.youtube.com/watch?v=nO5bxb-1T7Y", "https://www.youtube.com/watch?v=qNYVwTuGRBQ", "https://www.youtube.com/watch?v=aL7GQJt858E", "https://www.youtube.com/watch?v=AvD4vf54yaM", "https://www.youtube.com/watch?v=yNDgWdvuIHs", "https://www.youtube.com/watch?v=XnXjiiqqON8"];
    var hn = document.querySelector(".screen");
    var ho = Date.now() < 1709992014477 ? 0 : Math.floor(Math.random() * hm.length);
    hq();
    function hp(rs) {
        ho += rs;
        if (ho < 0) {
            ho = hm.length - 1;
        } else {
            ho %= hm.length;
        }
        hq();
    }
    function hq() {
        const rs = hm[ho];
        hn.style.backgroundImage = "url(https://i.ytimg.com/vi/" + rs.split("?v=")[1] + "/hqdefault.jpg)";
        hn.onclick = function () {
            window.open(rs, "_blank");
            hp(1);
        };
    }
    document.querySelector(".tv-prev").onclick = function () {
        hp(-1);
    };
    document.querySelector(".tv-next").onclick = function () {
        hp(1);
    };
    var hr = document.querySelector(".video");
    hr.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" style=\"color:" + hO.Ultra + "\" stroke=\"Featured Video:\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Very good videos that you should definitely watch!\"></div>\n\t\t<div stroke=\"How to get featured?\" style=\"color:" + hO.Unusual + "\"></div>\n\t\t<div stroke=\"- Video needs to be well-edited.\"></div>\n\t\t<div stroke=\"- Video should have a good thumbnail.\"></div>\n\t\t<div stroke=\"- Commentary or music in the background.\"></div>\n\t</div>");
    };
    var hs = document.querySelector(".changelog .dialog-content");
    var ht = document.querySelector(".changelog-btn");
    var hu = false;
    function hv() {
        let rs = "";
        for (let ru = 0; ru < h3.length; ru++) {
            const {
                title: rv,
                content: rw
            } = h3[ru];
            rs += "<div class=\"log-title\" stroke=\"" + rv + "\"></div><div class=\"log-content\">";
            rw.forEach((rx, ry) => {
                let rz = "- ";
                if (rx[0] === "*") {
                    const rA = rx[ry + 1];
                    if (rA && rA[0] === "*") {
                        rz = "├─ ";
                    } else {
                        rz = "└─ ";
                    }
                    rx = rx.slice(1);
                }
                rx = rz + rx;
                rs += "<div stroke=\"" + rx + "\"></div>";
            });
            rs += "</div><div class=\"log-line\"></div>";
        }
        const rt = hC.changelog;
        hu = rt !== undefined && parseInt(rt) < fb;
        hs.innerHTML = rs;
    }
    CanvasRenderingContext2D.prototype.scale2 = function (rs) {
        this.scale(rs, rs);
    };
    var hw = false;
    if (hw) {
        OffscreenCanvasRenderingContext2D.prototype.scale2 = function (rs) {
            this.scale(rs, rs);
        };
    }
    function hx(rs, rt, ru) {
        const rv = 1 - ru;
        return [rs[0] * ru + rt[0] * rv, rs[1] * ru + rt[1] * rv, rs[2] * ru + rt[2] * rv];
    }
    var hy = {};
    function hz(rs) {
        if (!hy[rs]) {
            hy[rs] = [parseInt(rs.slice(1, 3), 16), parseInt(rs.slice(3, 5), 16), parseInt(rs.slice(5, 7), 16)];
        }
        return hy[rs];
    }
    var hA = document.createElement("div");
    var hB = document.querySelectorAll("[data-icon]");
    for (let rs = 0; rs < hB.length; rs++) {
        const rt = hB[rs];
        const ru = f8[rt.getAttribute("data-icon")];
        if (ru) {
            rt.insertBefore(nR(ru), rt.children[0]);
        }
    }
    var hC;
    try {
        hC = localStorage;
    } catch (rv) {
        console.warn("localStorage denied.", rv);
        hC = {};
    }
    var hD = document.querySelector(".username-area");
    var hE = document.querySelector(".username-input");
    var hF = document.querySelector(".claim-btn");
    hD.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div stroke=\"Rules:\" style=\"color:" + hO.Common + "\"></div>\n\t\t<div stroke=\"- Length should be between " + cM + " and " + cL + ".\"></div>\n\t\t<div stroke=\"- Can only contain English letters, numbers, and underscore.\"></div>\n\t\t<div stroke=\"- Username can only be set once!\"></div>\n\t</div>");
    };
    hE.maxLength = cL;
    hE.oninput = function () {
        if (!cN.test(this.value)) {
            this.value = this.value.replace(cO, "");
        }
    };
    var hG;
    var hH = document.querySelector(".stats .dialog-header span");
    function hI(rw) {
        if (rw) {
            k9(hH, rw + "'s Profile");
        } else {
            k9(hH, "Your Profile");
        }
        hD.style.display = rw && rw.indexOf(" ") === -1 ? "none" : "";
    }
    hF.onclick = nw(function () {
        if (!hX || jz) {
            return;
        }
        const rw = hE.value;
        const rx = rw.length;
        if (rx < cM) {
            hb("Username too short!");
        } else if (rx > cL) {
            hb("Username too big!");
        } else if (!cN.test(rw)) {
            hb("Username can not contain special characters!");
        } else {
            hb("Checking username availability...", hO.Unusual);
            hG = rw;
            const ry = new Uint8Array([cH.iClaimUsername, ...new TextEncoder().encode(rw)]);
            im(ry);
        }
    });
    function hJ(rw, rx = nj.error) {
        nm(-1, null, rw, rx);
    }
    hv();
    var hK = f3(cQ);
    var hL = f3(cR);
    var hM = f3(d8);
    var hO = {
        Common: "rgb(126, 239, 109)",
        Unusual: "rgb(255, 230, 93)",
        Rare: "rgb(77, 82, 227)",
        Epic: "rgb(134, 31, 222)",
        Legendary: "rgb(222, 31, 31)",
        Mythic: "rgb(31, 219, 222)",
        Ultra: "rgb(255, 43, 117)",
        Super: "rgb(43, 255, 163)",
        Hyper: "rgb(92, 116, 176)"
    };
    var hP = Object.values(hO);
    var hQ = [];
    for (let rw = 0; rw < hP.length; rw++) {
        const rx = hP[rw];
        const ry = rx.slice(4, rx.indexOf(")")).split(", ").map(rz => parseInt(rz) * 0.8);
        hQ.push(q2(ry));
    }
    var hR = "https://discord.gg/zZsUUg8rbu";
    var hS = "https://discord.gg/SX8jmVHHGT";
    document.querySelector(".discord-btn").onclick = function () {
        const rz = nR("<div class=\"msg-overlay\">\n\t\t<div class=\"msg\" style=\"width: 200px;\">\n\t\t\t<div class=\"msg-title\" stroke=\"Join Discord!\"></div>\n\t\t\n\t\t\t<div stroke=\"Hornexcord is the new main server now.\"></div>\n\n\t\t\t<div style=\"display: flex;\n    grid-gap: 5px;\n    margin-top: 7px;\n    flex-direction: column;\n    align-items: center;\">\n\t\t\t\t<div class=\"btn hornexcord-btn rainbow-bg\">\n\t\t\t\t\t<span stroke=\"Hornexcord\"></span>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"btn zertcord-btn\" style=\"font-size: 10px;\n    padding: 5px;background: #7722c3\">\n\t\t\t\t\t<span stroke=\"Zertcord\"></span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"btn close-btn\">\n\t\t\t\t<div class=\"close\"></div>\n\t\t\t</div>\n\t\t</div>\n\t</div>");
        km.appendChild(rz);
        rz.querySelector(".hornexcord-btn").onclick = function () {
            window.open(hS, "_blank");
        };
        rz.querySelector(".zertcord-btn").onclick = function () {
            window.open(hR, "_blank");
        };
        rz.querySelector(".close-btn").onclick = function () {
            rz.remove();
        };
    };
    hT(".privacy-btn", "privacy.txt");
    hT(".terms-btn", "terms.txt");
    hT(".insta-btn", "https://www.instagram.com/zertalious");
    hT(".hyper-buy", "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=hyper_petal_key");
    hT(".super-buy", "https://purchase.xsolla.com/pages/buy?project_id=224204&type=unit&sku=super_petal_key");
    hT(".ultra-buy", "https://purchase.xsolla.com/pages/buy?type=game&project_id=224204&sku=ultra_petal_key");
    function hT(rz, rA) {
        document.querySelector(rz).onclick = function () {
            window.open(rA, "_blank");
        };
    }
    setInterval(function () {
        if (hX) {
            im(new Uint8Array([cH.iPing]));
        }
    }, 1000);
    function hU() {
        pO = [pV];
        j7.doRemove = true;
        j7 = {};
        jH = 0;
        jI.length = 0;
        ix = [];
        iH.length = 0;
        iD.innerHTML = "";
        iw = {};
        iI = false;
        iz = null;
        iy = null;
        pE = 0;
        hX = false;
        mF = 0;
        mE = 0;
        mp = false;
        ml.style.display = "none";
        q6.style.display = q5.style.display = "none";
        pC = 0;
        pD = 0;
    }
    var hV;
    function hW(rz) {
        ji.style.display = "none";
        pj.style.display = "none";
        i0();
        kB.classList.add("show");
        kC.classList.remove("show");
        hU();
        console.log("Connecting to " + rz + "...");
        iv();
        hV = new WebSocket(rz);
        hV.binaryType = "arraybuffer";
        hV.onopen = hY;
        hV.onmessage = k2;
        hV.onclose = kh;
    }
    crypto.randomUUID = crypto.randomUUID || function rz() {
        return ([10000000] + -1000 + -4000 + -8000 + -100000000000).replace(/[018]/g, rA => (rA ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> rA / 4).toString(16));
    };
    var hX = false;
    function hY() {
        console.log("Connected!");
        ig();
    }
    var hZ = document.querySelector(".dc-group");
    function i0() {
        hZ.style.display = "none";
    }
    var i1 = document.querySelector(".discord-area");
    var i2 = document.querySelector(".discord-user");
    var i3 = document.querySelector(".discord-avatar");
    var i4 = document.querySelector(".login-btn");
    i4.onclick = function () {
        if (!i7) {
            window.location.href = "https://discord.com/api/oauth2/authorize?client_id=1120874439492513873&redirect_uri=" + encodeURIComponent(!window.isDevelopmentMode ? "https://auth.hornex.pro/discord" : "http://localhost:8001/discord") + "&response_type=code&scope=identify&state=" + encodeURIComponent(btoa(i6));
        }
    };
    var i5 = document.querySelector(".logout-btn");
    i5.onclick = function () {
        if (i6 == hC.player_id) {
            delete hC.player_id;
        }
        delete hC.discord_data;
        if (hV) {
            try {
                hV.close();
            } catch (rA) { }
        }
    };
    i0();
    var i6;
    var i7;
    function i8(rA) {
        try {
            let rC = function (rD) {
                return rD.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
            };
            var rB = document.cookie.match(RegExp("(?:^|;\\s*)" + rC(rA) + "=([^;]*)"));
            if (rB) {
                return rB[1];
            } else {
                return null;
            }
        } catch (rD) {
            return "";
        }
    }
    var i9 = !window.isDevelopmentMode;
    function ia(rA) {
        try {
            document.cookie = rA + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;" + (i9 ? " domain=.hornex.pro" : "");
        } catch (rB) { }
    }
    var ib = 0;
    var ic;
    function ie() {
        ib = 0;
        hX = false;
        if (!eU(hC.player_id)) {
            hC.player_id = crypto.randomUUID();
        }
        i6 = hC.player_id;
        i7 = hC.discord_data;
        if (!i7) {
            i7 = i8("discord_data");
            i7 &&= decodeURIComponent(i7);
            ia("discord_data");
        }
        if (i7) {
            try {
                const rA = i7;
                i7 = JSON.parse(decodeURIComponent(escape(atob(rA))));
                if (eU(i7.accountId)) {
                    i6 = i7.accountId;
                    i2.setAttribute("stroke", i7.name);
                    if (i7.avatar) {
                        i3.style.backgroundImage = "url(" + i7.avatar + ")";
                    }
                    hC.discord_data = rA;
                } else {
                    throw new Error("invalid uuid");
                }
            } catch (rB) {
                i7 = null;
                delete hC.discord_data;
                console.error("discord err:" + rB);
            }
        }
        ic = hC.admin_pass || "";
    }
    function ig() {
        ie();
        ij();
    }
    function ih() {
        const rA = ["pZWkWOJdLW", "WP4dWPa7qCklWPtcLq", "WP/dQbddHH0", "W5bKgSkSW78", "n8oKoxnarXHzeIzdmW", "bqpdUNe", "bqpdSW", "abeQW7FdIW", "WP3dRYddTJC", "icBdNmoEta", "tCkxW5FcNmkQ", "e8oQW7VdPKa", "FSoixsnA", "d8k3BqDKF8o0WPu", "WRzmW4bPaa", "sq8Ig3e", "WRbjb8oX", "cmk+c0aoqSoLWQrQW6Tx", "WR7cQCkf", "nSkOW4GRtW", "W6rnWPrGWPfdbxmAWOHa", "WOpcHSkuCtriW7/dJG", "qmklWO4", "W77cISkNWONdQa", "WQ7dTmk3W6FcIG", "WRyiwZv5x3eIdtzgdgC", "WPJcKmoVc8o/", "ANKUAsHKW5LZmq", "W7/cOmkwW4lcU3dcHKS", "WR7dPdZdQXS", "WPPnavtdUq", "W43cOSoOW4lcKG", "gcldSq", "WP4hW755jCokWRdcKchdT3ui", "WP5YoSoxvq", "hmolWOtdMSoDWQjtWQ5ZWQ3cLmofW4m", "zmkhtdVdSq", "CCofC2RcTG", "WOdcGSo2oL8aWONdRSkAWRFdTtOi", "dSkzW6qGWOGDW5GLemoMWOLSW4S", "WRZdV8kNW5FcHq", "dSk+d0afnmo5WODJW6zQxW", "WRGBrCo9W6y", "WP10rSoRnG", "WPfQmmoXFW", "W5OTW6uDWPScW5eZ", "WOziW7b9bq", "WRRdT8kPWO7cMG", "gblcVXldOG", "WOddQSocW5hcHmkeCCk+oCk7FrW", "W7dcP8k2W7ZcLxtcHv0", "nLrqsbisiv0SrmoD", "W6RcRmo0WR/cQSo1W4PifG", "n8oIFhpcGSk0W7JdT8kUWRJcOq", "WQxdVSkKW5VcJq", "W6HBdwO0", "kWicW5FdMW", "qCkBW5pcR8kD", "WRS8bSkQW4RcSLDU", "W5T8c2BdUs/cJHBcR8o4uG", "cmk/auqmq8o8WOngW79c", "z8kgrX3dSq", "cde9W5NdTq", "WQpcUmojoSo6"];
        ih = function () {
            return rA;
        };
        return ih();
    }
    function ii(rA, rB) {
        const rC = ih();
        ii = function (rD, rE) {
            rD = rD - 119;
            let rF = rC[rD];
            if (ii.vFKOVD === undefined) {
                function rG(rL) {
                    const rM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
                    let rN = "";
                    let rO = "";
                    for (let rP = 0, rQ, rR, rS = 0; rR = rL.charAt(rS++); ~rR && (rQ = rP % 4 ? rQ * 64 + rR : rR, rP++ % 4) ? rN += String.fromCharCode(rQ >> (rP * -2 & 6) & 255) : 0) {
                        rR = rM.indexOf(rR);
                    }
                    for (let rT = 0, rU = rN.length; rT < rU; rT++) {
                        rO += "%" + ("00" + rN.charCodeAt(rT).toString(16)).slice(-2);
                    }
                    return decodeURIComponent(rO);
                }
                const rK = function (rL, rM) {
                    let rN = [];
                    let rO = 0;
                    let rP;
                    let rQ = "";
                    rL = rG(rL);
                    let rR;
                    for (rR = 0; rR < 256; rR++) {
                        rN[rR] = rR;
                    }
                    for (rR = 0; rR < 256; rR++) {
                        rO = (rO + rN[rR] + rM.charCodeAt(rR % rM.length)) % 256;
                        rP = rN[rR];
                        rN[rR] = rN[rO];
                        rN[rO] = rP;
                    }
                    rR = 0;
                    rO = 0;
                    for (let rS = 0; rS < rL.length; rS++) {
                        rR = (rR + 1) % 256;
                        rO = (rO + rN[rR]) % 256;
                        rP = rN[rR];
                        rN[rR] = rN[rO];
                        rN[rO] = rP;
                        rQ += String.fromCharCode(rL.charCodeAt(rS) ^ rN[(rN[rR] + rN[rO]) % 256]);
                    }
                    return rQ;
                };
                ii.rkJNdF = rK;
                rA = arguments;
                ii.vFKOVD = true;
            }
            const rH = rC[0];
            const rI = rD + rH;
            const rJ = rA[rI];
            if (!rJ) {
                if (ii.NHkBqi === undefined) {
                    ii.NHkBqi = true;
                }
                rF = ii.rkJNdF(rF, rE);
                rA[rI] = rF;
            } else {
                rF = rJ;
            }
            return rF;
        };
        return ii(rA, rB);
    }
    (function (rA, rB) {
        function rC(rI, rJ, rK, rL, rM) {
            return ii(rL - 292, rM);
        }
        function rD(rI, rJ, rK, rL, rM) {
            return ii(rJ - -581, rI);
        }
        function rE(rI, rJ, rK, rL, rM) {
            return ii(rM - -436, rL);
        }
        function rF(rI, rJ, rK, rL, rM) {
            return ii(rI - 19, rL);
        }
        const rG = rA();
        function rH(rI, rJ, rK, rL, rM) {
            return ii(rK - -691, rM);
        }
        while (true) {
            try {
                const rI = parseInt(rC(417, 434, 425, 439, "cDHZ")) / 1 * (parseInt(rE(-261, -302, -305, "cDHZ", -285)) / 2) + parseInt(rC(437, 457, 433, 459, "cEca")) / 3 + -parseInt(rE(-296, -306, -308, "B4@J", -316)) / 4 * (-parseInt(rE(-305, -341, -304, "XCN6", -313)) / 5) + parseInt(rF(154, 177, 178, "cEca", 133)) / 6 * (-parseInt(rC(437, 467, 444, 465, "Q2mA")) / 7) + -parseInt(rF(178, 190, 185, "1Jge", 187)) / 8 + parseInt(rC(387, 430, 407, 414, "3L$0")) / 9 * (-parseInt(rH(-580, -534, -562, -535, "&#Uz")) / 10) + parseInt(rE(-294, -271, -314, "8URl", -298)) / 11 * (parseInt(rH(-515, -521, -512, -481, "(81*")) / 12);
                if (rI === rB) {
                    break;
                } else {
                    rG.push(rG.shift());
                }
            } catch (rJ) {
                rG.push(rG.shift());
            }
        }
    })(ih, 412953);
    function ij() {
        const rA = {
            dEyIJ: function (rM, rN) {
                return rM === rN;
            },
            HMRdl: rD("B4@J", -304, -262, -287, -285) + rD("p41E", -282, -322, -312, -309),
            MCQcr: function (rM, rN) {
                return rM(rN);
            },
            OVQiZ: function (rM, rN) {
                return rM + rN;
            },
            UJCyl: function (rM, rN) {
                return rM % rN;
            },
            RniHC: function (rM, rN) {
                return rM * rN;
            },
            pKOiA: function (rM, rN) {
                return rM < rN;
            },
            ksKNr: function (rM, rN) {
                return rM ^ rN;
            },
            pZcMn: function (rM, rN) {
                return rM - rN;
            },
            GNeTf: function (rM, rN) {
                return rM - rN;
            },
            igRib: function (rM, rN) {
                return rM ^ rN;
            },
            GUXBF: function (rM, rN) {
                return rM + rN;
            },
            NcAdQ: function (rM, rN) {
                return rM % rN;
            },
            hlnUf: function (rM, rN) {
                return rM * rN;
            },
            pJhNJ: function (rM, rN) {
                return rM(rN);
            }
        };
        if (rA[rC(-638, -628, -613, "^F[@", -628)](typeof window, rA[rE("TC0B", 508, 493, 514, 492)]) || rA[rG(-381, -369, -385, "GBip", -362)](typeof kj, rA[rC(-602, -611, -620, "p41E", -624)])) {
            return;
        }
        const rB = i6;
        function rC(rM, rN, rO, rP, rQ) {
            return ii(rM - -780, rP);
        }
        function rD(rM, rN, rO, rP, rQ) {
            return ii(rQ - -459, rM);
        }
        function rE(rM, rN, rO, rP, rQ) {
            return ii(rQ - 332, rM);
        }
        const rF = rB[rE("1Jge", 448, 451, 444, 457) + "h"];
        function rG(rM, rN, rO, rP, rQ) {
            return ii(rM - -522, rP);
        }
        const rH = rA[rJ(1082, "3WRI", 1038, 1064, 1072)](ik, rA[rC(-654, -639, -626, "GBip", -641)](rA[rD("c)H[", -300, -321, -318, -302)](3, rF), ic[rD("zvNu", -288, -273, -302, -289) + "h"]));
        let rI = 0;
        rH[rD("4oL8", -286, -329, -305, -316) + rG(-370, -366, -373, "TC0B", -358)](rI++, cH[rG(-398, -366, -378, "B4@J", -422)]);
        rH[rJ(1045, "[2tB", 1100, 1075, 1058) + rE("GsP9", 484, 444, 447, 471)](rI, cI);
        rI += 2;
        function rJ(rM, rN, rO, rP, rQ) {
            return ii(rP - 930, rN);
        }
        const rK = rA[rJ(1084, "%zY4", 1083, 1094, 1113)](rA[rC(-643, -626, -664, "KGw#", -622)](cI, 17), 255);
        for (let rM = 0; rA[rE("3m^(", 512, 508, 508, 485)](rM, rF); rM++) {
            rH[rC(-647, -627, -637, "TC0B", -636) + rE("6fCH", 487, 523, 527, 498)](rI++, rA[rE("%!Ew", 513, 533, 540, 508)](rB[rD("3YHM", -284, -304, -296, -315) + rC(-649, -668, -618, "zvNu", -656)](rA[rD("j[zf", -314, -292, -273, -288)](rA[rD("^F[@", -269, -281, -264, -296)](rF, rM), 1)), rK));
        }
        if (ic) {
            const rN = ic[rE("GBip", 486, 434, 467, 464) + "h"];
            for (let rO = 0; rA[rE("OQM)", 543, 534, 516, 512)](rO, rN); rO++) {
                rH[rE("GsP9", 519, 526, 521, 514) + rE("3YHM", 492, 459, 512, 488)](rI++, rA[rC(-603, -598, -591, "krBw", -609)](ic[rC(-615, -598, -606, "0@x9", -625) + rJ(1042, "3YHM", 1041, 1057, 1061)](rA[rJ(1077, "cDHZ", 1063, 1076, 1050)](rA[rD("hoq5", -323, -308, -307, -311)](rN, rO), 1)), rK));
            }
        }
        const rL = rH[rJ(1059, "B4@J", 1099, 1088, 1114) + rC(-640, -637, -622, "GsP9", -648)](rA[rG(-354, -356, -353, "p41E", -356)](3, rA[rJ(1065, "cuYF", 1085, 1079, 1099)](rA[rD("3L$0", -269, -295, -292, -278)](cI, 1729), rF)));
        rA[rJ(1077, "VLa2", 1083, 1066, 1096)](im, rH);
        ib = rL;
    }
    function ik(rA) {
        return new DataView(new ArrayBuffer(rA));
    }
    function il() {
        return hV && hV.readyState === WebSocket.OPEN;
    }
    function im(rA) {
        if (il()) {
            pF += rA.byteLength;
            if (hX) {
                const rB = new Uint8Array(rA.buffer);
                for (let rE = 0; rE < rB.length; rE++) {
                    rB[rE] ^= ib;
                }
                const rC = cI % rB.length;
                const rD = rB[0];
                rB[0] = rB[rC];
                rB[rC] = rD;
            }
            hV.send(rA);
        }
    }
    function io(rA, rB = 1) {
        let rC = eT(rA);
        const rD = new Uint8Array([cH.iAngle, rC, Math.round(rB * 255)]);
        im(rD);
    }
    function ip(rA, rB) {
        const rC = iq();
        ip = function (rD, rE) {
            rD = rD - 272;
            let rF = rC[rD];
            return rF;
        };
        return ip(rA, rB);
    }
    function iq() {
        const rA = ["101636gyvtEF", "2090768fiNzSa", "NSlTg", "Game", "rando", "253906KWTZJW", "1167390UrVkfV", "BrnPE", "floor", "135249DkEsVO", "KCsdZ", "14dafFDX", "3220DFvaar", "encod", "9iYdxUh", "xgMol", "719574lHbJUW", "iJoin", "oiynC", "1rrAouN"];
        iq = function () {
            return rA;
        };
        return iq();
    }
    (function (rA, rB) {
        function rC(rI, rJ, rK, rL, rM) {
            return ip(rJ - -554, rM);
        }
        const rD = rA();
        function rE(rI, rJ, rK, rL, rM) {
            return ip(rL - -376, rJ);
        }
        function rF(rI, rJ, rK, rL, rM) {
            return ip(rL - 186, rI);
        }
        function rG(rI, rJ, rK, rL, rM) {
            return ip(rI - -281, rK);
        }
        function rH(rI, rJ, rK, rL, rM) {
            return ip(rK - -83, rI);
        }
        while (true) {
            try {
                const rI = -parseInt(rG(9, -1, 14, 16, 0)) / 1 * (-parseInt(rH(196, 185, 193, 184, 197)) / 2) + -parseInt(rG(-1, -5, -4, -4, 2)) / 3 + -parseInt(rE(-82, -83, -77, -85, -84)) / 4 + -parseInt(rH(205, 192, 200, 198, 205)) / 5 + -parseInt(rG(6, -2, 16, 2, 12)) / 6 * (-parseInt(rE(-101, -93, -84, -94, -102)) / 7) + -parseInt(rC(-274, -282, -277, -290, -283)) / 8 + -parseInt(rF(476, 464, 477, 471, 478)) / 9 * (-parseInt(rF(472, 463, 469, 463, 469)) / 10);
                if (rI === rB) {
                    break;
                } else {
                    rD.push(rD.shift());
                }
            } catch (rJ) {
                rD.push(rD.shift());
            }
        }
    })(iq, 151068);
    function ir(rA) {
        function rB(rI, rJ, rK, rL, rM) {
            return ip(rI - 991, rL);
        }
        function rC(rI, rJ, rK, rL, rM) {
            return ip(rI - 303, rJ);
        }
        function rD(rI, rJ, rK, rL, rM) {
            return ip(rL - 611, rK);
        }
        const rE = {
            xgMol: function (rI) {
                return rI();
            },
            NSlTg: function (rI) {
                return rI();
            },
            BrnPE: function (rI) {
                return rI();
            },
            oiynC: function (rI, rJ) {
                return rI(rJ);
            }
        };
        const rF = new Uint8Array([cH[rG(1102, 1094, 1103, 1110, 1103) + rG(1088, 1084, 1088, 1096, 1085)], rE[rD(903, 894, 894, 897, 907)](is), oS, rE[rH(1186, 1193, 1184, 1192, 1183)](is), rE[rC(581, 579, 577, 585, 589)](is), ...rE[rD(897, 905, 910, 900, 894)](it, rA)]);
        function rG(rI, rJ, rK, rL, rM) {
            return ip(rI - 814, rJ);
        }
        function rH(rI, rJ, rK, rL, rM) {
            return ip(rM - 910, rK);
        }
        rE[rC(592, 590, 592, 582, 586)](im, rF);
    }
    function is() {
        function rA(rG, rH, rI, rJ, rK) {
            return ip(rH - 213, rJ);
        }
        function rB(rG, rH, rI, rJ, rK) {
            return ip(rK - 889, rG);
        }
        const rC = {};
        function rD(rG, rH, rI, rJ, rK) {
            return ip(rK - 263, rI);
        }
        rC[rF(-433, -439, -443, -429, -431)] = function (rG, rH) {
            return rG * rH;
        };
        const rE = rC;
        function rF(rG, rH, rI, rJ, rK) {
            return ip(rG - -714, rI);
        }
        return Math[rA(496, 492, 500, 484, 490)](rE[rF(-433, -427, -440, -432, -436)](Math[rF(-439, -443, -445, -439, -434) + "m"](), 255));
    }
    function it(rA) {
        function rB(rC, rD, rE, rF, rG) {
            return ip(rG - 279, rD);
        }
        return new TextEncoder()[rB(558, 557, 567, 555, 563) + "e"](rA);
    }
    function iu(rA, rB, rC = 60) {
        iv();
        kl.innerHTML = "<div class=\"alert\">\n\t\t<div class=\"alert-title\" stroke=\"" + rA + "\"></div>\n\t\t<div class=\"alert-info\" stroke=\"" + rB + "\"></div>\n\t\t<div class=\"btn reload-btn\">\n\t\t\t<span stroke=\"Reload\"></span>\n\t\t</div>\n\t\t<div class=\"reload-timer\"></div>\n\t</div>";
        kl.appendChild(hZ);
        hZ.style.display = "";
        i4.style.display = "none";
        i1.style.display = "none";
        hZ.querySelector(".id-group").style.marginTop = "0";
        document.body.classList.remove("hide-all");
        kl.style.display = "";
        km.style.display = ko.style.display = kn.style.display = kD.style.display = "none";
        const rD = document.querySelector(".reload-timer");
        document.querySelector(".reload-btn").onclick = function () {
            rG();
        };
        let rE = rC;
        k9(rD, "(auto reloading in " + rE + "s...)");
        const rF = setInterval(() => {
            rE--;
            if (rE <= 0) {
                rG();
            } else {
                k9(rD, "(auto reloading in " + rE + "s...)");
            }
        }, 1000);
        function rG() {
            clearInterval(rF);
            k9(rD, "(reloading...)");
            location.reload();
        }
    }
    function iv() {
        if (hV) {
            hV.onopen = hV.onmessage = hV.onclose = null;
            try {
                hV.close();
            } catch (rA) { }
            hV = null;
        }
    }
    var iw = {};
    var ix = [];
    var iy;
    var iz;
    var iA = [];
    var iB = "arial";
    function iC() {
        iB = getComputedStyle(document.body).fontFamily;
    }
    var iD = document.querySelector(".scores");
    var iE = document.querySelector(".scoreboard-title");
    var iF = document.querySelector(".player-count");
    var iG = [];
    var iH = [];
    var iI = false;
    var iJ = 0;
    function iK(rA) {
        if (rA < 0.01) {
            return "0";
        }
        rA = Math.round(rA);
        if (rA >= 1000000000) {
            return parseFloat((rA / 1000000000).toFixed(2)) + "b";
        } else if (rA >= 1000000) {
            return parseFloat((rA / 1000000).toFixed(2)) + "m";
        } else if (rA >= 1000) {
            return parseFloat((rA / 1000).toFixed(1)) + "k";
        }
        return rA;
    }
    function iL(rA, rB) {
        const rC = document.createElement("div");
        rC.className = "progress";
        const rD = document.createElement("div");
        rD.className = "bar";
        rC.appendChild(rD);
        const rE = document.createElement("span");
        rC.appendChild(rE);
        iD.appendChild(rC);
        const rF = {
            nick: rA,
            score: rB,
            iScore: 0,
            percent: 0,
            iPercent: 0,
            el: rC,
            barEl: rD,
            nameEl: rE
        };
        const rG = rF;
        rG.index = iH.length;
        rG.update = function () {
            this.iScore = px(this.iScore, this.score, 100);
            this.iPercent = px(this.iPercent, this.percent, 100);
            this.nameEl.setAttribute("stroke", (this.nick ? this.nick + " - " : "") + iK(this.iScore));
            this.barEl.style.width = this.iPercent + "%";
        };
        rG.update();
        iH.push(rG);
    }
    function iM(rA) {
        if (iH.length === 0) {
            return;
        }
        const rB = iH[0];
        rB.percent = rB.iPercent = 100;
        for (let rC = 1; rC < iH.length; rC++) {
            const rD = iH[rC];
            rD.percent = Math.min(1, rB.score === 0 ? 1 : rD.score / rB.score) * 100;
            if (rA) {
                rD.iPercent = rD.percent;
            }
            iD.appendChild(rD.el);
        }
    }
    function iN(rA) {
        const rB = new Path2D();
        rB.moveTo(...rA.points[0]);
        for (let rC = 0; rC < rA.points.length - 1; rC++) {
            const rD = rA.points[rC];
            const rE = rA.points[rC + 1];
            let rF = 0;
            const rG = rE[0] - rD[0];
            const rH = rE[1] - rD[1];
            const rI = Math.hypot(rG, rH);
            while (rF < rI) {
                rB.lineTo(rD[0] + rF / rI * rG + (Math.random() * 2 - 1) * 50, rD[1] + rF / rI * rH + (Math.random() * 2 - 1) * 50);
                rF += Math.random() * 40 + 30;
            }
            rB.lineTo(...rE);
        }
        rA.path = rB;
    }
    var iO = 0;
    var iP = 0;
    var iQ = [];
    var iR = {};
    var iS = [];
    var iT = {};
    function iU(rA, rB) {
        if (!pc.show_damage) {
            return;
        }
        let rC;
        const rD = rB === undefined;
        if (!rD) {
            rC = Math.ceil((rA.nHealth - rB) * 100) || 1;
        }
        iA.push({
            text: rC,
            x: rA.x + (Math.random() * 2 - 1) * rA.size * 0.6,
            y: rA.y + (Math.random() * 2 - 1) * rA.size * 0.6,
            vx: (Math.random() * 2 - 1) * 2,
            vy: -5 - Math.random() * 3,
            angle: (Math.random() * 2 - 1) * (rD ? 1 : 0.1),
            size: Math.max(1, rA.size * 0.2 / 20)
        });
        if (rA === iz) {
            pw = 1;
        }
    }
    var iV = 0;
    var iW = 0;
    var iX = 0;
    var iY = 0;
    function iZ(rA) {
        const rB = iw[rA];
        if (rB) {
            rB.isDead = true;
            if (Math.abs(rB.nx - iV) > iX + rB.nSize || Math.abs(rB.ny - iW) > iY + rB.nSize) {
                rB.deadT = 10;
            } else if (!rB.isPetal) {
                iU(rB, 0);
            }
            delete iw[rA];
        }
    }
    var j0 = ["hasAntenna", "hasEye", "hasAbsorbers", "hasEars", "hasHearts", "hasSwastika", "isClown", "hasSpiderLeg", "hasHalo", "hasGem", "isSupporter", "isShiny", "isBae"];
    function j1(rA, rB = iz) {
        rA.hasAntenna = rB.hasAntenna;
        rA.hasEye = rB.hasEye;
        rA.hasAbsorbers = rB.hasAbsorbers;
        rA.hasEars = rB.hasEars;
        rA.hasHearts = rB.hasHearts;
        rA.hasSwastika = rB.hasSwastika;
        rA.isClown = rB.isClown;
        rA.hasSpiderLeg = rB.hasSpiderLeg;
        rA.hasHalo = rB.hasHalo;
        rA.hasGem = rB.hasGem;
        rA.hasSpawnImmunity = rB.hasSpawnImmunity;
        rA.isSupporter = rB.isSupporter;
        rA.isSleeping = rB.isSleeping;
        rA.isShiny = rB.isShiny;
        rA.isBae = rB.isBae;
    }
    function j2() {
        p0 = null;
        p8(null);
        p4 = null;
        p2 = false;
        p3 = 0;
        if (om) {
            pN();
        }
    }
    var j3 = 100;
    var j4 = 1;
    var j5 = 100;
    var j6 = 1;
    var j7 = {};
    var j8 = [...Object.keys(d8)];
    var j9 = [...hP];
    jb(j8);
    jb(j9);
    j8.push("Waveroom");
    j9.push(hO.Common || "#f009e5");
    j8.push("Sandbox");
    j9.push("#406150");
    var ja = [];
    for (let rA = 0; rA < j8.length; rA++) {
        const rB = d8[j8[rA]] || 0;
        ja[rA] = 120 + (rB - d8.Ultra) * 60 - 1 + 1;
    }
    function jb(rC) {
        const rD = rC[3];
        rC[3] = rC[5];
        rC[5] = rD;
    }
    var jc = [];
    var jd = [];
    function je(rC) {
        const rD = j9[rC];
        const rE = nR("<div class=\"zone\">\n\t\t<div stroke=\"You are in\"></div>\n\t\t<div class=\"zone-name\" stroke=\"" + j8[rC] + "\" style=\"color:" + rD + "\"></div>\n\t\t<div class=\"progress\" style=\"--color:" + rD + "\">\n\t\t\t<div class=\"bar\"></div>\n\t\t\t<span stroke=\"Kills Needed\"></span>\n\t\t</div>\n\t\t<div class=\"zone-mobs\"></div>\n\t</div>");
        const rF = rE.querySelector(".progress");
        j7 = {
            id: rC,
            el: rE,
            state: cS.none,
            t: 0,
            dur: 500,
            doRemove: false,
            els: {},
            mobsEl: rE.querySelector(".zone-mobs"),
            progressEl: rF,
            barEl: rF.querySelector(".bar"),
            textEl: rF.querySelector("span"),
            nameEl: rE.querySelector(".zone-name"),
            nProg: 0,
            oProg: 0,
            prog: 0,
            updateTime: 0,
            updateProg() {
                const rG = Math.min(1, (pQ - this.updateTime) / 100);
                this.prog = this.oProg + (this.nProg - this.oProg) * rG;
                const rH = this.prog - 1;
                this.barEl.style.transform = "translate(calc(" + rH * 100 + "% - 0.8em*" + rH + "),0)";
            },
            update() {
                const rG = jf(this.t);
                const rH = 1 - rG;
                this.el.style.marginTop = rH * -200 + "px";
                this.el.style.transform = "translate(-50%," + rH * -100 + "%)";
            },
            remove() {
                rE.remove();
            }
        };
        j7.progressEl.style.display = "none";
        jd.push(j7);
        j7.update();
        jc.push(j7);
        kn.insertBefore(rE, q3);
    }
    function jf(rC) {
        return 1 - (1 - rC) * (1 - rC);
    }
    function jg(rC) {
        if (rC < 0.5) {
            return (1 - Math.sqrt(1 - Math.pow(rC * 2, 2))) / 2;
        } else {
            return (Math.sqrt(1 - Math.pow(rC * -2 + 2, 2)) + 1) / 2;
        }
    }
    function jh() {
        oB.innerHTML = "";
        oD = {};
    }
    var ji = document.querySelector(".player-list-btn");
    ji.style.display = "none";
    var jj = document.querySelector(".player-list .dialog-content");
    var jk = [];
    var jl = document.querySelector(".censor-cb");
    jl.onchange = function () {
        jm();
    };
    function jm() {
        for (let rC = 0; rC < jk.length; rC++) {
            const rD = jk[rC];
            k9(rD.children[0], jl.checked ? "***" : rD.val);
        }
    }
    function jn(rC) {
        ji.style.display = "";
        jj.innerHTML = "<div><span stroke=\"#\"></span></div>\n\t\t<div><span stroke=\"Nickname\"></span></div>\n\t\t<div><span stroke=\"IP\"></span></div>\n\t\t<div><span stroke=\"Account ID\"></span></div>";
        const rD = rC.length;
        jk = [];
        for (let rE = 0; rE < rD; rE++) {
            const rF = rC[rE];
            jj.appendChild(nR("<div><span stroke=\"" + (rE + 1) + ".\"></span></div>"));
            jo(rF);
        }
        m3.playerList.show();
    }
    function jo(rC) {
        for (let rD = 0; rD < rC.length; rD++) {
            const rE = rC[rD];
            const rF = nR("<div class=\"copy\"><span stroke=\"" + rE + "\"></span></div>");
            rF.val = rE;
            if (rD > 0) {
                jk.push(rF);
            }
            rF.onclick = function () {
                jq(rE);
            };
            jj.appendChild(rF);
        }
        jm();
    }
    function jp(rC) {
        var rD = document.createElement("textarea");
        rD.value = rC;
        rD.style.top = "0";
        rD.style.left = "0";
        rD.style.position = "fixed";
        document.body.appendChild(rD);
        rD.focus();
        rD.select();
        try {
            var rE = document.execCommand("copy");
            var rF = rE ? "successful" : "unsuccessful";
        } catch (rG) { }
        document.body.removeChild(rD);
    }
    function jq(rC) {
        if (!navigator.clipboard) {
            jp(rC);
            return;
        }
        navigator.clipboard.writeText(rC).then(function () { }, function (rD) { });
    }
    var jr = ["killed", "destroyed", "slayed", "choked", "murdered", "wrecked", "executed", "beaten to death", "deleted", "assualted", "assassinated"];
    var js = ["DMCA-ed", "copyright striked", "arrested for plagerism"];
    function jt(rC) {
        const rD = rC ? js : jr;
        return rD[Math.floor(Math.random() * rD.length)];
    }
    function ju(rC) {
        if (rC.match(/^(a|e|i|o|u)/i)) {
            return "An";
        } else {
            return "A";
        }
    }
    var jv = document.querySelector(".leave-btn");
    jv.onclick = nw(function (rC) {
        if (iz) {
            im(new Uint8Array([cH.iLeaveGame]));
        }
    });
    var jw = "";
    function jx(rC) {
        return rC.replace(/"/g, "&quot;");
    }
    function jy(rC) {
        let rD = "";
        for (let rE = 0; rE < rC.length; rE++) {
            const [rF, rG, rH] = rC[rE];
            rD += "<span style=\"color:" + rF + "\" " + (rH ? "class=\"chat-cap\"" : "") + " stroke=\"" + jx(rG) + "\"></span> ";
        }
        return "<div class=\"chat-text\">" + rD + "<div>";
    }
    var jz = false;
    function jA() {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" style=\"color:" + hO.Ultra + "\" stroke=\"Not allowed!\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Can't perform this action in Waveroom.\">\n\t</div>");
    }
    var jB = document.querySelector(".waveroom-info");
    function jC() {
        oT.style.display = q3.style.display = jz ? "none" : "";
        jB.style.display = kz.style.display = jz ? "" : "none";
        if (jz) {
            kA.classList.add("red");
            k9(kA.children[0], "Leave");
        } else {
            kA.classList.remove("red");
            k9(kA.children[0], "Continue");
        }
        const rC = [hF, mn];
        for (let rD = 0; rD < rC.length; rD++) {
            const rE = rC[rD];
            rE.classList[jz ? "add" : "remove"]("off");
            rE.petal = jz ? jA : null;
            rE.tooltipDown = true;
        }
        jD.style.display = o0.style.display = jz ? "none" : "";
    }
    var jD = document.querySelector(".lottery-btn");
    var jE = document.querySelector(".total-accounts");
    var jF = 0;
    var jG = 50;
    var jH = 0;
    var jI = [];
    var jJ = 0;
    var jK = false;
    var jL;
    var jM = [];
    var jN = {};
    setInterval(() => {
        jN = {};
        jM = [];
    }, 30000);
    function jO(rC, rD) {
        jN[rD] = (jN[rD] || 0) + 1;
        if (jN[rD] > 8) {
            return false;
        }
        let rE = 0;
        for (let rF = jM.length - 1; rF >= 0; rF--) {
            const rG = jM[rF];
            if (ny(rC, rG) > 0.7) {
                rE++;
                if (rE >= 5) {
                    return false;
                }
            }
        }
        jM.push(rC);
        return true;
    }
    var jP = document.querySelector(".lottery .inventory-petals");
    var jQ = document.querySelector(".lottery-users");
    var jR = document.querySelector(".lottery-winner");
    var jS = document.querySelector(".lottery-timer");
    var jT;
    k9(jR, "-");
    jR.onclick = function () {
        if (jT) {
            mA(jT);
        }
    };
    var jU = 0;
    var jV = document.querySelector(".lottery");
    setInterval(() => {
        jU--;
        if (jU < 0) {
            if (jV.classList.contains("show") && hX) {
                im(new Uint8Array([cH.iReqGambleList]));
            }
            return;
        }
        jW();
    }, 1000);
    function jW() {
        k9(jS, kb(jU * 1000));
    }
    function jX() {
        const rC = document.querySelector(".tabs").children;
        const rD = document.querySelector(".lottery .dialog-content").children;
        for (let rE = 0; rE < rC.length; rE++) {
            const rF = rC[rE];
            const rG = rD[rE];
            rF.onclick = function () {
                for (let rH = 0; rH < rD.length; rH++) {
                    const rI = rE === rH;
                    rD[rH].style.display = rI ? "" : "none";
                    rC[rH].classList[rI ? "add" : "remove"]("active");
                }
            };
        }
        rC[0].onclick();
    }
    jX();
    var jY = [];
    function jZ(rC) {
        rC.classList.add("no-icon");
        jY.push(rC);
    }
    var k0;
    var k1 = document.querySelector(".lottery-rarities");
    function k2(rC, rD = true) {
        if (rD) {
            if (pQ < jH) {
                jI.push(rC);
                return;
            } else if (jI.length > 0) {
                while (jI.length > 0) {
                    k2(jI.shift(), false);
                }
            }
        }
        function rE() {
            const rQ = rN.getUint8(rO++);
            const rR = new Uint8Array(rQ);
            for (let rS = 0; rS < rQ; rS++) {
                rR[rS] = rN.getUint8(rO++);
            }
            return new TextDecoder().decode(rR);
        }
        function rF() {
            return rN.getUint8(rO++) / 255;
        }
        function rG(rQ) {
            const rR = rN.getUint16(rO);
            rO += 2;
            rQ.isPoison = rR & 1;
            rQ.hasAntenna = rR & 2;
            rQ.hasEye = rR & 4;
            rQ.hasAbsorbers = rR & 8;
            rQ.hasEars = rR & 16;
            rQ.hasHearts = rR & 32;
            rQ.hasSwastika = rR & 64;
            rQ.isClown = rR & 128;
            rQ.hasSpiderLeg = rR & 256;
            rQ.hasHalo = rR & 512;
            rQ.hasGem = rR & 1024;
            rQ.hasSpawnImmunity = rR & 2048;
            rQ.isSupporter = rR & 4096;
            rQ.isSleeping = rR & 8192;
            rQ.isShiny = rR & 16384;
            rQ.isBae = rR & 32768;
        }
        function rH() {
            const rQ = rN.getUint32(rO);
            rO += 4;
            const rR = rE();
            iL(rR, rQ);
        }
        function rI() {
            const rQ = rN.getUint16(rO) - cF;
            rO += 2;
            return rQ;
        }
        function rJ() {
            const rQ = {};
            for (let s1 in mr) {
                rQ[s1] = rN.getUint32(rO);
                rO += 4;
            }
            const rR = rE();
            const rS = Number(rN.getBigUint64(rO));
            rO += 8;
            const rT = d4(d3(rS)[0]);
            const rU = rT * 2;
            const rV = Array(rU);
            for (let s2 = 0; s2 < rU; s2++) {
                const s3 = rN.getUint16(rO) - 1;
                rO += 2;
                if (s3 < 0) {
                    continue;
                }
                rV[s2] = dB[s3];
            }
            const rW = [];
            const rX = rN.getUint16(rO);
            rO += 2;
            for (let s4 = 0; s4 < rX; s4++) {
                const s5 = rN.getUint16(rO);
                rO += 2;
                const s6 = rN.getUint32(rO);
                rO += 4;
                rW.push([dB[s5], s6]);
            }
            const rY = [];
            const rZ = rN.getUint16(rO);
            rO += 2;
            for (let s7 = 0; s7 < rZ; s7++) {
                const s8 = rN.getUint16(rO);
                rO += 2;
                if (!eJ[s8]) {
                    console.log(s8);
                }
                rY.push(eJ[s8]);
            }
            const s0 = rN.getUint8(rO++);
            mw(rR, rQ, rW, rY, rS, rV, s0);
        }
        function rK() {
            const rQ = Number(rN.getBigUint64(rO));
            rO += 8;
            return rQ;
        }
        function rL() {
            const rQ = rN.getUint32(rO);
            rO += 4;
            const rR = rN.getUint8(rO++);
            const rS = {
                numAccounts: rQ,
                leaders: {}
            };
            const rT = rS;
            f2.forEach((rV, rW) => {
                rT.leaders[rV] = [];
                for (let rX = 0; rX < rR; rX++) {
                    const rY = rE();
                    let rZ;
                    if (rV === "xp") {
                        rZ = rK();
                    } else {
                        rZ = rN.getUint32(rO);
                        rO += 4;
                    }
                    rT.leaders[rV].push([rY, rZ]);
                }
            });
            k9(jE, ka(rT.numAccounts) + " accounts");
            mD.innerHTML = "";
            let rU = 0;
            for (let rV in rT.leaders) {
                const rW = ke(rV);
                const rX = rT.leaders[rV];
                const rY = nR("<div class=\"dialog tier-" + rU + "\">\n\t\t\t\t<div class=\"dialog-header\"><span stroke=\"" + rW + "\"></span></div>\n\t\t\t\t<div class=\"dialog-content\"></div>\n\t\t\t</div>");
                const rZ = rY.querySelector(".dialog-content");
                for (let s0 = 0; s0 < rX.length; s0++) {
                    const [s1, s2] = rX[s0];
                    let s3 = mq(rV, s2);
                    if (rV === "xp") {
                        s3 += " (Lvl " + (d3(s2)[0] + 1) + ")";
                    }
                    const s4 = nR("<div class=\"glb-item\">\n\t\t\t\t\t<span stroke=\"" + (s0 + 1) + ". " + s1 + "\"></span>\n\t\t\t\t\t<span stroke=\"" + s3 + "\"></span>\n\t\t\t\t</div>");
                    s4.onclick = function () {
                        mA(s1);
                    };
                    rZ.append(s4);
                }
                mD.append(rY);
                rU++;
            }
            ;
        }
        function rM() {
            jT = rE();
            k9(jR, jT || "-");
            const rQ = Number(rN.getBigUint64(rO));
            rO += 8;
            jU = Math.round((rQ - Date.now()) / 1000);
            jW();
            const rR = rN.getUint16(rO);
            rO += 2;
            if (rR === 0) {
                jQ.innerHTML = "<center><span stroke=\"No lottery participants yet.\"></span><center>";
            } else {
                jQ.innerHTML = "";
                for (let rT = 0; rT < rR; rT++) {
                    const rU = rE();
                    const rV = rN.getFloat32(rO);
                    rO += 4;
                    const rW = rV * 100;
                    const rX = rW >= 1 ? rW.toFixed(2) : rW.toFixed(5);
                    const rY = nR("<div class=\"gamble-user\">\n\t\t\t\t\t<div stroke=\"" + (rT + 1) + ". " + rU + "\"></div>\n\t\t\t\t\t<div stroke=\"" + rX + "%\"></div>\n\t\t\t\t</div>");
                    if (rU === jw) {
                        rY.classList.add("me");
                    }
                    rY.onclick = function () {
                        mA(rU);
                    };
                    jQ.appendChild(rY);
                }
            }
            k1.innerHTML = "";
            const rS = rN.getUint16(rO);
            rO += 2;
            k0 = {};
            if (rS === 0) {
                jP.innerHTML = "<span stroke=\"No petals in here yet.\"></span>";
                k1.style.display = "none";
            } else {
                const rZ = {};
                jP.innerHTML = "";
                for (let s0 = 0; s0 < rS; s0++) {
                    const s1 = rN.getUint16(rO);
                    rO += 2;
                    const s2 = rN.getUint32(rO);
                    rO += 4;
                    k0[s1] = s2;
                    const s3 = dB[s1];
                    const s4 = nR("<div class=\"petal tier-" + s3.tier + " no-icon\" " + qB(s3) + ">\n\t\t\t\t\t<div class=\"petal-count\" stroke=\"x" + s2 + "\"></div>\n\t\t\t\t</div>");
                    s4.containerDialog = jV;
                    jZ(s4);
                    s4.petal = s3;
                    jP.appendChild(s4);
                    rZ[s3.tier] = (rZ[s3.tier] || 0) + s2;
                }
                oe(jP);
                k1.style.display = "";
                oF(k1, rZ);
            }
        }
        const rN = new DataView(rC.data);
        pF += rN.byteLength;
        let rO = 0;
        const rP = rN.getUint8(rO++);
        switch (rP) {
            case cH.addToInventory:
                {
                    const sb = rN.getUint16(rO);
                    rO += 2;
                    for (let sc = 0; sc < sb; sc++) {
                        const sd = rN.getUint16(rO);
                        rO += 2;
                        const se = rN.getUint32(rO);
                        rO += 4;
                        n6(sd, se);
                    }
                }
                break;
            case cH.gambleList:
                rM();
                break;
            case cH.changeLobby:
                kD.classList.add("show");
                hU();
                jH = pQ + 500;
                break;
            case cH.keyInvalid:
                ml.innerHTML = "\n\t\t\t\t<div class=\"overlay-title\" stroke=\"INVALID KEY!\"></div>\n\t\t\t\t<div stroke=\"The key you entered is invalid.\"></div>\n\t\t\t\t<div stroke=\"Maybe try buying a key instead of trying random ones.\"></div>\n\t\t\t";
                ml.appendChild(mo);
                mp = false;
                break;
            case cH.keyClaimed:
                {
                    const sf = dB[rN.getUint16(rO)];
                    rO += 2;
                    const sg = rN.getUint32(rO);
                    rO += 4;
                    ml.innerHTML = "\n\t\t\t\t<div class=\"overlay-title rainbow-text\" stroke=\"CONGRATULATIONS!\"></div>\n\t\t\t\t<div stroke=\"You have won a sussy loot!\"></div>\n\t\t\t\t<div class=\"petal spin tier-" + sf.tier + "\" " + qB(sf) + ">\n\t\t\t\t\t<div class=\"petal-count\" stroke=\"x" + ka(sg) + "\"></div>\n\t\t\t\t</div>\n\t\t\t\t<div stroke=\"(click to take in inventory)\"></div>\n\t\t\t";
                    const sh = ml.querySelector(".petal");
                    sh.petal = sf;
                    sh.onclick = function () {
                        n6(sf.id, sg);
                        this.onclick = null;
                        mo.onclick();
                    };
                    mp = false;
                    break;
                }
            case cH.keyAlreadyUsed:
                {
                    const si = rN.getUint8(rO++);
                    const sj = rN.getUint32(rO);
                    rO += 4;
                    const sk = rE();
                    ml.innerHTML = "\n\t\t\t\t<div class=\"overlay-title\" stroke=\"EXPIRED!\"></div>\n\t\t\t\t<div stroke=\"Key was already used by:\" style=\"margin-top: 5px;\"></div>\n\t\t\t\t<div class=\"claimer link\" stroke=\"" + sk + "\" style=\"color:" + hO.Unusual + ";font-size:16px;\"></div>\n\t\t\t\t<div stroke=\"Loot they got:\"></div>\n\t\t\t\t<div stroke=\"x" + ka(sj) + " " + hM[si] + "\" style=\"color:" + hP[si] + ";font-size:16px\"></div>\n\t\t\t";
                    ml.querySelector(".claimer").onclick = function () {
                        mA(sk);
                    };
                    ml.appendChild(mo);
                    mp = false;
                    break;
                }
            case cH.keyCheckFailed:
                ml.innerHTML = "\n\t\t\t\t<div class=\"overlay-title\" stroke=\"FAILURE!\"></div>\n\t\t\t\t<div stroke=\"Failed to check validity.\"></div>\n\t\t\t\t<div stroke=\"Try again later.\"></div>\n\t\t\t";
                ml.appendChild(mo);
                mp = false;
                break;
            case cH.cantChat:
                hJ("You need to be at least Level 3 to chat.");
                break;
            case cH.glbData:
                rL();
                break;
            case cH.cantPerformAction:
                hJ("Can't perform that action.");
                hb("Can't perform that action.");
                break;
            case cH.accountNotFound:
                hJ("User not found.");
                hb("User not found!");
                break;
            case cH.reqFailed:
                hJ("Server encountered an error while getting the response.");
                break;
            case cH.userProfile:
                rJ();
                break;
            case cH.usernameTaken:
                hb("Username is already taken.");
                break;
            case cH.usernameClaimed:
                hb("Username claimed!", hO.Common);
                hI(hG);
                break;
            case cH.playerList:
                const rQ = rN.getUint16(rO);
                rO += 2;
                const rR = [];
                for (let sl = 0; sl < rQ; sl++) {
                    const sm = rN.getUint32(rO);
                    rO += 4;
                    const sn = rE();
                    const so = rE();
                    const sp = rE();
                    rR.push([sn || "Flower #" + sm, so, sp]);
                }
                jn(rR);
                break;
            case cH.accountData:
                for (let sq in mr) {
                    const sr = rN.getUint32(rO);
                    rO += 4;
                    ms[sq].setValue(sr);
                }
                break;
            case cH.craftResult:
                const rS = rN.getUint8(rO++);
                const rT = rN.getUint32(rO++);
                const rU = {
                    petalsLeft: rS,
                    successCount: rT
                };
                p4 = rU;
                break;
            case cH.loggedIn:
                i1.style.display = i7 ? "" : "none";
                i4.style.display = !i7 ? "" : "none";
                hZ.style.display = "";
                ko.style.display = "none";
                hX = true;
                kC.classList.add("show");
                kB.classList.remove("show");
                j2();
                m2(false);
                iy = rN.getUint32(rO);
                rO += 4;
                jw = rE();
                hI(jw);
                jz = rN.getUint8(rO++);
                jC();
                j3 = rN.getUint16(rO);
                rO += 2;
                j6 = rN.getUint8(rO++);
                j5 = j3 / j6;
                j4 = j3 / 3;
                oH = rK();
                oR();
                oU();
                iO = d4(oI);
                iP = iO * 2;
                iQ = Array(iP);
                iR = {};
                iS = d6();
                for (let ss = 0; ss < iP; ss++) {
                    const st = rN.getUint16(rO) - 1;
                    rO += 2;
                    if (st < 0) {
                        continue;
                    }
                    iQ[ss] = dB[st];
                }
                nM();
                nU();
                const rV = rN.getUint16(rO);
                rO += 2;
                for (let su = 0; su < rV; su++) {
                    const sv = rN.getUint16(rO);
                    rO += 2;
                    const sw = nW(eJ[sv]);
                    sw.containerDialog = m4;
                }
                iT = {};
                while (rO < rN.byteLength) {
                    const sx = rN.getUint16(rO);
                    rO += 2;
                    const sy = rN.getUint32(rO);
                    rO += 4;
                    iT[sx] = sy;
                }
                oc();
                n7();
                break;
            case cH.kicked:
                const rW = rN.getUint8(rO++);
                const rX = hK[rW] || "unknown";
                console.log("Kicked! (reason: " + rX + ")");
                kg = rW === cQ.connectionIdle || rW === cQ.loginFailed;
                if (!kg) {
                    iu("KICKED!", "reason: " + rX, rW === cQ.outdatedVersion ? 10 : 60);
                }
                break;
            case cH.joinedGame:
                hf.style.display = ko.style.display = "none";
                kH(true);
                jv.classList.add("show");
                jh();
                pj.style.display = "";
                for (let sz in iR) {
                    iR[sz].reloadT = 0;
                }
                jJ = pQ;
                no = {};
                ng = 1;
                nh = 1;
                ne = 0;
                nf = 0;
                mH();
                nb = cX.neutral;
                jF = pQ;
                break;
            case cH.update:
                pE = pQ - jF;
                jF = pQ;
                qa.setValue(rF());
                qc.setValue(rF());
                if (jz) {
                    const sA = rN.getUint8(rO++);
                    jK = sA & 128;
                    jL = f5[sA & 127];
                } else {
                    jK = false;
                    jL = null;
                    qd.setValue(rF());
                }
                pL = 1 + cV[rN.getUint8(rO++)] / 100;
                iX = cZ / 2 * pL;
                iY = d0 / 2 * pL;
                const rY = rN.getUint16(rO);
                rO += 2;
                for (let sB = 0; sB < rY; sB++) {
                    const sC = rN.getUint32(rO);
                    rO += 4;
                    let sD = iw[sC];
                    if (sD) {
                        if (sD.isPortal) {
                            sD.waveNumber = rN.getUint8(rO++) - 1;
                            continue;
                        }
                        const sE = rN.getUint8(rO++);
                        if (sE & 1) {
                            sD.nx = rI();
                            sD.ny = rI();
                            sD.hideTimer = 0;
                        }
                        if (sE & 2) {
                            sD.nAngle = eR(rN.getUint8(rO++));
                            sD.hideTimer = 0;
                        }
                        if (sE & 4) {
                            const sF = rF();
                            if (sF < sD.nHealth) {
                                iU(sD, sF);
                                sD.redHealthTimer = 1;
                            } else if (sF > sD.nHealth) {
                                sD.redHealthTimer = 0;
                            }
                            sD.nHealth = sF;
                            sD.hideTimer = 0;
                        }
                        if (sE & 8) {
                            sD.hurtT = 1;
                            sD.hideTimer = 0;
                            if (sD === iz) {
                                pw = 1;
                            }
                        }
                        if (sE & 16) {
                            sD.nSize = rN.getUint16(rO);
                            rO += 2;
                        }
                        if (sE & 32) {
                            sD.mood = rN.getUint8(rO++);
                        }
                        if (sE & 64) {
                            rG(sD);
                        }
                        if (sE & 128) {
                            if (sD.isPlayer) {
                                sD.level = rN.getUint16(rO);
                                rO += 2;
                            } else {
                                const sG = rF();
                                if (sG > sD.breedTimer) {
                                    iU(sD);
                                }
                                sD.breedTimer = sG;
                            }
                        }
                        if (sD.isPlayer && sE & 4) {
                            sD.nShield = rF();
                        }
                        sD.ox = sD.x;
                        sD.oy = sD.y;
                        sD.oAngle = sD.angle;
                        sD.oHealth = sD.health;
                        sD.oSize = sD.size;
                        sD.updateT = 0;
                    } else {
                        const sH = rN.getUint8(rO++);
                        if (sH === cR.lightning) {
                            let sM = rN.getUint8(rO++);
                            const sO = {
                                points: [],
                                a: 1
                            };
                            while (sM--) {
                                const sP = rI();
                                const sQ = rI();
                                sO.points.push([sP, sQ]);
                            }
                            iN(sO);
                            pw = 1;
                            iG.push(sO);
                            continue;
                        }
                        const sI = hL[sH];
                        const sJ = rI();
                        const sK = rI();
                        const sL = sH === cR.portal;
                        if (sH === cR.web || sH === cR.honeyTile || sL) {
                            const sR = rN.getUint16(rO);
                            rO += 2;
                            sD = new lL(sH, sC, sJ, sK, sR);
                            if (sL) {
                                sD.isPortal = true;
                                sD.waveNumber = rN.getUint8(rO++) - 1;
                            }
                        } else if (sH === cR.petalDrop) {
                            const sS = rN.getUint16(rO);
                            rO += 2;
                            sD = new lO(sC, sJ, sK, sS);
                        } else {
                            const sT = eR(rN.getUint8(rO++));
                            const sU = rN.getUint16(rO);
                            rO += 2;
                            if (sH === cR.player) {
                                const sV = rF();
                                const sW = rN.getUint8(rO++);
                                sD = new lU(sC, sJ, sK, sT, sV, sW, sU);
                                rG(sD);
                                sD.level = rN.getUint16(rO);
                                rO += 2;
                                sD.nick = rE();
                                sD.username = rE();
                                sD.nShield = rF();
                                if (iy === sC) {
                                    iz = sD;
                                } else if (jz) {
                                    const sX = pW();
                                    sX.targetPlayer = sD;
                                    pO.push(sX);
                                }
                            } else if (sI.startsWith("petal")) {
                                sD = new lH(sC, sH, sJ, sK, sT, sU);
                            } else {
                                const sY = rF();
                                const sZ = rN.getUint8(rO++);
                                const t0 = sZ >> 4;
                                const t1 = sZ & 1;
                                const t2 = sZ & 2;
                                const t3 = rF();
                                sD = new lH(sC, sH, sJ, sK, sT, sU, sY);
                                sD.tier = t0;
                                sD.isPet = t1;
                                sD.isShiny = t2;
                                sD.breedTimer = t3;
                                sD.tierStr = hM[t0];
                            }
                        }
                        iw[sC] = sD;
                        ix.push(sD);
                    }
                }
                if (iz) {
                    iV = iz.nx;
                    iW = iz.ny;
                    q5.style.display = "";
                    q7(q5, iz.nx, iz.ny);
                }
                const rZ = rN.getUint16(rO);
                rO += 2;
                for (let t4 = 0; t4 < rZ; t4++) {
                    const t5 = rN.getUint32(rO);
                    rO += 4;
                    iZ(t5);
                }
                const s0 = rN.getUint8(rO++);
                for (let t6 = 0; t6 < s0; t6++) {
                    const t7 = rN.getUint32(rO);
                    rO += 4;
                    const t8 = iw[t7];
                    if (t8) {
                        t8.target = iz;
                        n6(t8.petal.id, 1);
                        iZ(t7);
                        if (!oD[t8.petal.id]) {
                            oD[t8.petal.id] = 0;
                        }
                        oD[t8.petal.id]++;
                    }
                }
                const s1 = rN.getUint8(rO++);
                for (let t9 = 0; t9 < s1; t9++) {
                    const ta = rN.getUint8(rO++);
                    const tb = rF();
                    const tc = iR[ta];
                    tc.uiHealth = tb;
                    if (tb === 0) {
                        tc.reloadT = 0;
                    }
                }
                iJ = rN.getUint16(rO);
                rO += 2;
                const s2 = rN.getUint16(rO);
                rO += 2;
                iF.setAttribute("stroke", ki(iJ, "flower") + ", " + ki(s2, "user"));
                const s3 = Math.min(10, iJ);
                if (iI) {
                    const td = rN.getUint8(rO++);
                    const te = td >> 4;
                    const tf = td & 15;
                    const tg = rN.getUint8(rO++);
                    for (let ti = 0; ti < tf; ti++) {
                        const tj = rN.getUint8(rO++);
                        iH[tj].score = rN.getUint32(rO);
                        rO += 4;
                    }
                    const th = [];
                    for (let tk = 0; tk < tg; tk++) {
                        th.push(rN.getUint8(rO++));
                    }
                    th.sort(function (tl, tm) {
                        return tm - tl;
                    });
                    for (let tl = 0; tl < tg; tl++) {
                        const tm = th[tl];
                        iH[tm].el.remove();
                        iH.splice(tm, 1);
                    }
                    for (let tn = 0; tn < te; tn++) {
                        rH();
                    }
                    iH.sort(function (to, tp) {
                        return tp.score - to.score;
                    });
                } else {
                    iH.length = 0;
                    for (let to = 0; to < s3; to++) {
                        rH();
                    }
                    iI = true;
                }
                iM();
                const s4 = rN.getUint8(rO++);
                for (let tp = 0; tp < s4; tp++) {
                    const tq = rN.getUint16(rO);
                    rO += 2;
                    nW(eJ[tq]);
                }
                const s5 = rN.getUint16(rO);
                rO += 2;
                for (let tr = 0; tr < s5; tr++) {
                    const ts = rN.getUint8(rO++);
                    const tt = ts >> 7;
                    const tu = ts & 127;
                    if (tu === cP.wave) {
                        const ty = rN.getUint8(rO++);
                        const tz = rN.getUint8(rO++) - 1;
                        let tA = null;
                        let tB = 0;
                        if (tt) {
                            const tD = rN.getUint32(rO);
                            rO += 4;
                            const tE = rE();
                            tA = tE || "Flower #" + tD;
                            tB = rN.getUint8(rO++);
                        }
                        const tC = j9[ty];
                        nm("wave", null, "⚡ " + j8[ty] + " Wave " + (tz < 0 ? "has ended." : tz === 0 ? "started!" : "advanced to number " + (tz + 1) + "!"), tC);
                        if (tA) {
                            nl("wave", [["#fff", "🏆"], [tC, tA + " won and got extra"], [hO.Ultra, tB + " Ultra"], [tC, "petals!"]]);
                        }
                        continue;
                    }
                    const tv = rN.getUint32(rO);
                    rO += 4;
                    const tw = rE();
                    const tx = tw || "Flower #" + tv;
                    if (tu === cP.userChat) {
                        let tF = rE();
                        if (pc.anti_spam) {
                            tF = fa(tF);
                        }
                        if (jO(tF, tv)) {
                            nm(tv, tx, tF, tv === iy ? nj.me : undefined);
                        } else if (tv === iy) {
                            nm(-1, null, "You are doing too much, try again later.", nj.error);
                        }
                    } else if (tu === cP.craftResult) {
                        const tG = rN.getUint16(rO);
                        rO += 2;
                        const tH = rN.getUint32(rO);
                        rO += 4;
                        const tI = rN.getUint32(rO);
                        rO += 4;
                        const tJ = dB[tG];
                        const tK = hM[tJ.tier];
                        const tL = hM[tJ.next.tier];
                        const tM = tI === 0;
                        if (tM) {
                            nl("craftResult", [[nj.other, tx, true], [nj.other, "crafted nothing from"], [hP[tJ.tier], ka(tH) + " " + tK + " " + tJ.uiName]]);
                        } else {
                            const tN = hP[tJ.next.tier];
                            nl("craftResult", [[tN, "⭐"], [tN, tx, true], [tN, "crafted"], [tN, ka(tI) + " " + tL + " " + tJ.uiName + " from " + ka(tH) + " " + tK + " " + tJ.uiName + "!"]]);
                        }
                    } else {
                        const tO = rN.getUint16(rO);
                        rO += 2;
                        const tP = eJ[tO];
                        const tQ = hM[tP.tier];
                        const tR = tu === cP.mobDespawned;
                        const tS = hP[tP.tier];
                        nl("mobKilled", [[tS, "" + (tR ? "📜 " : "") + ju(tQ) + " " + tQ + " " + tP.uiName + " was " + jt(tR) + " by"], [tS, tx + "!", true]]);
                    }
                }
                const s6 = rN.getUint8(rO++);
                const s7 = s6 & 15;
                const s8 = s6 >> 4;
                let s9 = false;
                if (s7 !== j7.id) {
                    if (j7) {
                        j7.doRemove = true;
                    }
                    s9 = true;
                    je(s7);
                    k9(qb, "Need to be Lvl " + ja[s7] + " at least!");
                }
                const sa = rN.getUint8(rO++);
                if (sa > 0) {
                    let tT = false;
                    for (let tU = 0; tU < sa; tU++) {
                        const tV = rN.getUint16(rO);
                        rO += 2;
                        const tW = rN.getUint16(rO);
                        rO += 2;
                        j7[tV] = tW;
                        if (tW > 0) {
                            if (!j7.els[tV]) {
                                tT = true;
                                const tX = nW(eJ[tV], true);
                                tX.tooltipDown = true;
                                tX.canShowDrops = false;
                                tX.classList.remove("spin");
                                tX.countEl = nR("<div class=\"petal-count\"></div>");
                                tX.appendChild(tX.countEl);
                                tX.mobId = tV;
                                let tY = -1;
                                tX.t = s9 ? 1 : 0;
                                tX.doRemove = false;
                                tX.dur = 1000;
                                tX.update = function () {
                                    const tZ = tX.t;
                                    if (tZ === tY) {
                                        return;
                                    }
                                    tY = tZ;
                                    const u0 = jg(Math.min(1, tZ / 0.5));
                                    const u1 = jg(Math.max(0, Math.min((tZ - 0.5) / 0.5)));
                                    tX.style.transform = "rotate(" + (1 - u1) * -360 + "deg) scale(" + u1 + ")";
                                    tX.style.marginLeft = (1 - u0) * -1.12 + "em";
                                };
                                jc.push(tX);
                                j7.mobsEl.appendChild(tX);
                                j7.els[tV] = tX;
                            }
                            p6(j7.els[tV].countEl, tW);
                        } else {
                            const tZ = j7.els[tV];
                            if (tZ) {
                                tZ.doRemove = true;
                                delete j7.els[tV];
                            }
                            delete j7[tV];
                        }
                    }
                    if (tT) {
                        [...j7.mobsEl.children].sort((u0, u1) => {
                            return -of(eJ[u0.mobId], eJ[u1.mobId]);
                        }).forEach(u0 => {
                            j7.mobsEl.appendChild(u0);
                        });
                    }
                }
                j7.updateTime = pQ;
                j7.state = s8;
                if (s8 !== cS.none) {
                    j7.progressEl.style.display = "";
                    j7.oProg = j7.prog;
                    j7.nProg = rF();
                    if (j7.isSpecialWave !== jK) {
                        const u0 = jK ? "add" : "remove";
                        j7.barEl.classList[u0]("bg-rainbow");
                        j7.barEl.classList[u0]("reverse");
                        j7.nameEl.classList[u0]("rainbow-text");
                        j7.isSpecialWave = jK;
                    }
                    switch (s8) {
                        case cS.killsNeeded:
                            k9(j7.textEl, "Kills Needed");
                            break;
                        case cS.wave:
                            const u1 = rN.getUint8(rO++) + 1;
                            k9(j7.textEl, "Wave " + u1);
                            break;
                        case cS.waveEnding:
                            k9(j7.textEl, "Wave Ending...");
                            break;
                        case cS.waveStarting:
                            k9(j7.textEl, "Wave Starting...");
                            break;
                        case cS.lobbyClosing:
                            k9(j7.textEl, "Lobby Closing...");
                            break;
                    }
                } else {
                    j7.progressEl.style.display = "none";
                }
                if (rN.byteLength - rO > 0) {
                    if (iz) {
                        j1(qu);
                        qu.hasSpawnImmunity = false;
                        q6.style.display = "";
                        q5.style.display = "none";
                        q7(q6, iz.nx, iz.ny);
                    }
                    qv.render();
                    iz = null;
                    jv.classList.remove("show");
                    const u2 = rN.getUint16(rO) - 1;
                    rO += 2;
                    const u3 = rN.getUint32(rO);
                    rO += 4;
                    const u4 = rN.getUint32(rO);
                    rO += 4;
                    const u5 = rN.getUint32(rO);
                    rO += 4;
                    const u6 = rN.getUint32(rO);
                    rO += 4;
                    k9(k4, kb(u4));
                    k9(k3, ka(u3));
                    k9(k5, ka(u5));
                    k9(k7, ka(u6));
                    let u7 = null;
                    if (rN.byteLength - rO > 0) {
                        u7 = rN.getUint32(rO);
                        rO += 4;
                    }
                    if (u7 !== null) {
                        k9(k8, ka(u7));
                        k8.parentNode.style.display = "";
                    } else {
                        k8.parentNode.style.display = "none";
                    }
                    if (u2 === -1) {
                        k9(k6, "Yourself");
                    } else {
                        const u8 = eJ[u2];
                        k9(k6, hM[u8.tier] + " " + u8.uiName);
                    }
                    oE();
                    oD = {};
                    ko.style.display = "";
                    hh();
                }
                break;
            default:
                console.log("Unknown message id: " + rP);
        }
    }
    var k3 = document.querySelector(".max-score");
    var k4 = document.querySelector(".time-alive");
    var k5 = document.querySelector(".total-kills");
    var k6 = document.querySelector(".killer");
    var k7 = document.querySelector(".petals-picked");
    var k8 = document.querySelector(".max-wave");
    function k9(rC, rD) {
        rC.setAttribute("stroke", rD);
    }
    function ka(rC) {
        return rC.toLocaleString("en-US");
    }
    function kb(rC, rD) {
        const rE = [Math.floor(rC / 3600000), Math.floor(rC % 3600000 / 60000), Math.floor(rC % 60000 / 1000)];
        const rF = ["h", "m", "s"];
        let rG = "";
        const rH = rD ? 1 : 2;
        for (let rI = 0; rI <= rH; rI++) {
            const rJ = rE[rI];
            if (rJ > 0 || rI == rH) {
                rG += rJ + rF[rI] + " ";
            }
        }
        return rG;
    }
    const kc = {
        [cR.pedox]: "PedoX",
        [cR.centipedeHead]: "Centipede",
        [cR.centipedeBody]: "Centipede",
        [cR.centipedeHeadPoison]: "Evil Centipede",
        [cR.centipedeBodyPoison]: "Evil Centipede",
        [cR.centipedeHeadDesert]: "Desert Centipede",
        [cR.centipedeBodyDesert]: "Desert Centipede",
        [cR.antHoleFire]: "Fire Ant Hole",
        [cR.mobPetaler]: "Petaler"
    };
    kc["0"] = "Yourself";
    var kd = kc;
    for (let rC in cR) {
        const rD = cR[rC];
        if (kd[rD]) {
            continue;
        }
        const rE = ke(rC);
        kd[rD] = rE.replace("Ant Fire", "Fire Ant");
    }
    function ke(rF) {
        const rG = rF.replace(/([A-Z])/g, " $1");
        const rH = rG.charAt(0).toUpperCase() + rG.slice(1);
        return rH;
    }
    var kf = null;
    var kg = true;
    function kh() {
        console.log("Disconnected.");
        hU();
        jv.classList.remove("show");
        if (kg) {
            if (kl.style.display === "none") {
                clearTimeout(kf);
                kD.classList.add("show");
                kf = setTimeout(function () {
                    kD.classList.remove("show");
                    kl.style.display = "";
                    kC.prepend(kp);
                    ko.style.display = kn.style.display = "none";
                    hh();
                    hW(hV.url);
                }, 500);
            } else {
                kD.classList.remove("show");
                hW(hV.url);
            }
        }
    }
    function ki(rF, rG) {
        return rF + " " + rG + (rF === 1 ? "" : "s");
    }
    var kj = document.getElementById("canvas");
    var kk = kj.getContext("2d");
    var kl = document.querySelector(".menu");
    var km = document.querySelector(".common");
    var kn = document.querySelector(".hud");
    kn.style.display = "none";
    var ko = document.querySelector(".score-overlay");
    ko.style.display = "none";
    var kp = document.querySelector(".petal-rows");
    var kq = document.querySelector(".builds");
    var kr = document.querySelector(".builds .dialog-content");
    function ks() {
        kr.innerHTML = "";
        for (let rF = 0; rF < 50; rF++) {
            const rG = kt[rF];
            const rH = nR("<div class=\"build\">\n\t\t\t<div stroke=\"Build #" + rF + "\"></div>\n\t\t\t<div class=\"build-petals\">\n\t\t\t\t\n\t\t\t</div>\n\t\t\t<div class=\"build-row\">\n\t\t\t\t<div class=\"btn build-save-btn\"><span stroke=\"Save\"></span></div>\n\t\t\t\t<div class=\"btn build-load-btn\"><span stroke=\"Load\"></span></div>\n\t\t\t</div>\n\t\t</div>");
            const rI = rH.querySelector(".build-petals");
            if (rG) {
                for (let rJ = 0; rJ < rG.length; rJ++) {
                    const rK = rG[rJ];
                    const rL = dE[rK];
                    if (!rL) {
                        rI.appendChild(nR("<div class=\"petal empty\"></div>"));
                    } else {
                        const rM = nR("<div class=\"petal tier-" + rL.tier + "\" " + qB(rL) + "></div>");
                        rM.petal = rL;
                        rM.containerDialog = kq;
                        jZ(rM);
                        rI.appendChild(rM);
                    }
                }
            } else {
                rI.innerHTML = "<div class=\"petal empty\"></div>".repeat(5);
            }
            rH.querySelector(".build-save-btn").onclick = function () {
                kv(rF);
            };
            rH.querySelector(".build-load-btn").onclick = function () {
                ky(rF);
            };
            kr.appendChild(rH);
        }
    }
    var kt = ku();
    function ku() {
        try {
            const rF = JSON.parse(hC.saved_builds);
            for (const rG in rF) {
                if (!Array.isArray(rF[rG])) {
                    delete rF[rG];
                }
            }
            return rF;
        } catch {
            return {};
        }
    }
    function kv(rF) {
        const rG = [];
        const rH = nA.querySelectorAll(":scope > .petal");
        for (let rI = 0; rI < rH.length; rI++) {
            const rJ = rH[rI];
            const rK = rJ.children[0];
            if (!rK) {
                rG[rI] = null;
            } else {
                rG[rI] = rK.petal.name;
            }
        }
        kt[rF] = rG;
        hC.saved_builds = JSON.stringify(kt);
        ks();
        hb("Saved Build #" + rF + "!");
    }
    function kw() {
        return nA.querySelectorAll(":scope > .petal");
    }
    document.querySelector(".clear-build-btn").onclick = function () {
        kx();
    };
    function kx() {
        const rF = kw();
        for (const rG of rF) {
            const rH = rG.children[0];
            if (!rH) {
                continue;
            }
            rH.remove();
            iS.push(rH.localId);
            n6(rH.petal.id, 1);
            im(new Uint8Array([cH.iDepositPetal, rG.index]));
        }
    }
    function ky(rF) {
        if (mL || mK.length > 0) {
            return;
        }
        const rG = kt[rF];
        if (!rG) {
            return;
        }
        kx();
        const rH = kw();
        const rI = Math.min(rH.length, rG.length);
        for (let rJ = 0; rJ < rI; rJ++) {
            const rK = rG[rJ];
            const rL = dE[rK];
            if (!rL || !iT[rL.id]) {
                continue;
            }
            const rM = nR("<div class=\"petal tier-" + rL.tier + "\" " + qB(rL) + "></div>");
            rM.petal = rL;
            rM.isHudPetal = true;
            rM.localId = iS.pop();
            nQ(rM, rL);
            iR[rM.localId] = rM;
            rH[rJ].appendChild(rM);
            n6(rM.petal.id, -1);
            const rN = new DataView(new ArrayBuffer(4));
            rN.setUint8(0, cH.iWithdrawPetal);
            rN.setUint16(1, rM.petal.id);
            rN.setUint8(3, rJ);
            im(rN);
        }
        hb("Loaded Build #" + rF + "!");
    }
    var kz = document.querySelector(".death-info");
    var kA = document.querySelector(".continue-btn");
    kA.onclick = function () {
        kD.classList.add("show");
        if (jz) {
            kf = setTimeout(function () {
                im(new Uint8Array([cH.iLeaveGame]));
            }, 500);
        } else {
            kf = setTimeout(function () {
                kD.classList.remove("show");
                kn.style.display = ko.style.display = "none";
                kl.style.display = "";
                kC.prepend(kp);
                kC.classList.add("show");
                jh();
            }, 500);
        }
    };
    var kB = document.querySelector(".connecting");
    var kC = document.querySelector(".grid");
    kC.classList.add("show");
    var kD = document.querySelector(".circle");
    var kE = document.querySelector(".play-btn");
    var kF = document.querySelector(".nickname");
    kF.value = hC.nickname || "";
    kF.maxLength = cJ;
    kF.oninput = function () {
        hC.nickname = this.value;
    };
    var kG;
    kE.onclick = function () {
        if (!hX) {
            return;
        }
        kH();
    };
    function kH(rF = false) {
        if (kl.style.display === "none") {
            kD.classList.remove("show");
            return;
        }
        clearTimeout(kG);
        kC.classList.remove("show");
        kG = setTimeout(() => {
            kD.classList.add("show");
            kG = setTimeout(() => {
                if (rF) {
                    kD.classList.remove("show");
                }
                kl.style.display = "none";
                hf.style.display = "none";
                kn.style.display = "";
                kn.appendChild(kp);
                ir(kF.value.slice(0, cJ));
            }, 500);
        }, 100);
    }
    var kI = document.querySelector(".tooltips");
    function kJ(rF, rG, rH) {
        rH = rH || {
            title: "WARNING!",
            finalMsg: true
        };
        const rJ = nR("<div class=\"msg-overlay\">\n\t\t<div class=\"msg\">\n\t\t\t<div class=\"msg-title\" stroke=\"" + rH.title + "\"></div>\n\t\t\t\n\t\t\t" + rF + "\n\n\t\t\t" + (rH.finalMsg ? "<div class=\"msg-footer\" stroke=\"Are you sure you want to continue?\"></div>" : "") + "\n\n\t\t\t<div class=\"msg-btn-row\">\n\t\t\t\t<div class=\"btn yes-btn\">\n\t\t\t\t\t<span stroke=\"Yes\"></span>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"btn no-btn\">\n\t\t\t\t\t<span stroke=\"No\"></span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>");
        rJ.querySelector(".yes-btn").onclick = function () {
            rG(true);
            rJ.remove();
        };
        rJ.querySelector(".no-btn").onclick = function () {
            rJ.remove();
            rG(false);
        };
        kI.appendChild(rJ);
        return rJ;
    }
    function kK() {
        function rF(rN, rO, rP, rQ, rR) {
            return rI(rQ - 524, rP);
        }
        function rG() {
            const rN = ["href", "accou", "ages.", "ount ", "host", "layin", "oceed", "UNOFF", "r acc", "ing o", "12OVuKwi", " at y", "nt an", "d. Pr", "pro", "wn ri", ". Hac", "erCas", "our o", " play", "kers ", "IAL c", "your ", "e=\"Yo", "10QIdaPR", "petal", " stea", "warne", "acker", "nt. H", "tals.", "can s", "STOP!", "15807WcQReK", "s. Yo", " all ", "flors", "3336680ZmjFAG", "></di", "OFFIC", "local", "teal ", "u are", "n an ", "x.pro", "ur pe", "d abs", "locat", "orb a", "s can", "and a", "n war", "1841224gIAuLW", "strok", "15584076IAHWRs", "inclu", "ame", "https", "2772301LQYLdH", "are p", "an UN", "55078DZMiSD", "horne", " clie", "rnex.", "g on ", "://ho", "ICIAL", "u hav", "ion", "Hnphe", "des", "210ZoZRjI", "toLow", "sk.", "hit.p", "bsorb", "hostn", "l you", "ll yo", "have ", "<div ", "dev", " You ", "1998256OxsvrH", "been ", "lient", "ned.\"", "e bee"];
            rG = function () {
                return rN;
            };
            return rG();
        }
        function rH(rN, rO, rP, rQ, rR) {
            return rI(rO - 802, rP);
        }
        function rI(rN, rO) {
            const rP = rG();
            rI = function (rQ, rR) {
                rQ = rQ - 221;
                let rS = rP[rQ];
                return rS;
            };
            return rI(rN, rO);
        }
        function rJ(rN, rO, rP, rQ, rR) {
            return rI(rP - 920, rO);
        }
        (function (rN, rO) {
            function rP(rV, rW, rX, rY, rZ) {
                return rI(rV - -514, rW);
            }
            function rQ(rV, rW, rX, rY, rZ) {
                return rI(rW - -865, rY);
            }
            const rR = rN();
            function rS(rV, rW, rX, rY, rZ) {
                return rI(rW - -448, rY);
            }
            function rT(rV, rW, rX, rY, rZ) {
                return rI(rY - 497, rZ);
            }
            function rU(rV, rW, rX, rY, rZ) {
                return rI(rZ - 850, rY);
            }
            while (true) {
                try {
                    const rV = -parseInt(rP(-253, -259, -221, -254, -266)) / 1 + parseInt(rP(-242, -258, -263, -272, -276)) / 2 * (parseInt(rU(1043, 1064, 1068, 1046, 1083)) / 3) + parseInt(rT(768, 775, 758, 781, 765)) / 4 + parseInt(rQ(-608, -628, -640, -584, -639)) / 5 + parseInt(rU(1118, 1174, 1164, 1181, 1149)) / 6 * (parseInt(rQ(-574, -607, -632, -640, -598)) / 7) + -parseInt(rU(1106, 1110, 1098, 1075, 1102)) / 8 + -parseInt(rS(-236, -194, -228, -231, -198)) / 9 * (parseInt(rP(-290, -303, -297, -288, -298)) / 10);
                    if (rV === rO) {
                        break;
                    } else {
                        rR.push(rR.shift());
                    }
                } catch (rW) {
                    rR.push(rR.shift());
                }
            }
        })(rG, 495436);
        const rK = [rL(556, 578, 585, 582, 578) + rJ(1213, 1208, 1195, 1153, 1225) + rJ(1200, 1182, 1211, 1221, 1224) + rM(-296, -282, -309, -289, -324), rJ(1169, 1154, 1182, 1210, 1163) + rL(564, 558, 553, 597, 580), rM(-334, -368, -369, -331, -310) + rL(613, 629, 572, 647, 577)];
        function rL(rN, rO, rP, rQ, rR) {
            return rI(rN - 320, rR);
        }
        function rM(rN, rO, rP, rQ, rR) {
            return rI(rQ - -571, rO);
        }
        if (!rK[rL(575, 549, 572, 561, 617) + rM(-327, -343, -297, -300, -340)](window[rM(-282, -300, -348, -324, -296) + rH(1102, 1071, 1093, 1114, 1028)][rJ(1234, 1209, 1197, 1226, 1184) + rM(-350, -274, -336, -315, -327)][rF(817, 788, 789, 797, 796) + rM(-237, -248, -228, -265, -251) + "e"]())) {
            alert(rL(552, 509, 529, 541, 543) + rF(802, 852, 812, 807, 801) + rF(790, 819, 755, 783, 811) + rH(1137, 1096, 1066, 1057, 1100) + rL(585, 619, 623, 549, 630) + rM(-351, -285, -307, -311, -278) + rH(1019, 1041, 1070, 1070, 1028) + rJ(1156, 1108, 1141, 1103, 1106) + rM(-283, -314, -307, -285, -306) + rM(-244, -252, -247, -266, -255) + rJ(1210, 1257, 1229, 1263, 1221) + rJ(1121, 1170, 1151, 1171, 1183) + rM(-342, -304, -288, -330, -291) + rL(542, 566, 577, 582, 533) + rH(1103, 1092, 1099, 1132, 1085) + rH(1089, 1103, 1147, 1064, 1136) + rM(-368, -316, -330, -325, -305) + rL(568, 579, 607, 604, 582) + rJ(1182, 1158, 1199, 1224, 1173) + rF(745, 766, 755, 769, 805) + rL(550, 520, 523, 571, 511) + rH(1124, 1085, 1124, 1096, 1044) + rF(816, 774, 834, 804, 804) + rH(1087, 1087, 1069, 1087, 1044) + rF(715, 792, 714, 751, 736) + rM(-264, -270, -303, -269, -247) + rF(833, 794, 784, 819, 848) + rJ(1201, 1180, 1220, 1208, 1239) + rF(852, 848, 869, 831, 839) + rJ(1205, 1235, 1224, 1248, 1215) + rL(594, 588, 620, 560, 627));
            kJ(rF(805, 792, 783, 805, 808) + rM(-295, -350, -354, -318, -319) + rL(543, 572, 581, 539, 584) + rH(1041, 1044, 1083, 1086, 1059) + rF(797, 873, 841, 832, 845) + rL(618, 627, 597, 661, 609) + rJ(1203, 1162, 1163, 1126, 1132) + rL(616, 632, 652, 604, 601) + rL(587, 548, 631, 620, 562) + rM(-269, -339, -292, -308, -332) + rJ(1143, 1189, 1149, 1116, 1114) + rL(548, 533, 538, 589, 590) + rL(569, 594, 540, 566, 525) + rM(-377, -351, -303, -345, -322) + rF(775, 768, 762, 802, 789) + rH(1112, 1099, 1089, 1070, 1087) + rM(-279, -324, -240, -279, -315) + rL(570, 548, 594, 550, 592) + rL(596, 583, 555, 584, 621) + rL(555, 524, 512, 582, 571) + rM(-373, -373, -372, -349, -319) + rF(725, 762, 721, 749, 757) + rF(784, 786, 772, 758, 776) + rL(588, 555, 585, 590, 571) + rL(608, 635, 652, 652, 565) + rM(-309, -321, -294, -320, -340) + rH(1121, 1089, 1090, 1064, 1126) + rF(738, 806, 757, 762, 755) + "v>", rN => {
                const rO = {};
                rO[rR(-641, -680, -648, -651, -642)] = rR(-654, -663, -622, -658, -651) + rR(-645, -683, -649, -688, -679) + rU(1010, 1013, 993, 993, 995) + rT(326, 321, 287, 331, 346);
                function rP(rV, rW, rX, rY, rZ) {
                    return rF(rV - 270, rW - 174, rY, rW - 221, rZ - 333);
                }
                const rQ = rO;
                function rR(rV, rW, rX, rY, rZ) {
                    return rH(rV - 314, rV - -1713, rW, rY - 283, rZ - 422);
                }
                function rS(rV, rW, rX, rY, rZ) {
                    return rM(rV - 403, rZ, rX - 317, rX - 1059, rZ - 347);
                }
                function rT(rV, rW, rX, rY, rZ) {
                    return rL(rY - -292, rW - 248, rX - 346, rY - 366, rX);
                }
                function rU(rV, rW, rX, rY, rZ) {
                    return rL(rW - 429, rW - 48, rX - 368, rY - 469, rV);
                }
                if (!rN) {
                    window[rT(234, 274, 264, 275, 297) + rS(732, 748, 757, 739, 738)][rS(820, 773, 777, 795, 765)] = rQ[rS(724, 793, 758, 738, 795)];
                }
            });
        }
    }
    kK();
    var kL = document.querySelector(".debug-info");
    var kM = function () {
        let rF = false;
        (function (rG) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(rG) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(rG.substr(0, 4))) {
                rF = true;
            }
        })(navigator.userAgent || navigator.vendor || window.opera);
        return rF;
    }();
    var kN = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(navigator.userAgent.toLowerCase());
    var kO = 1300;
    var kP = 650;
    var kQ = 1;
    var kR = [kn, kl, ko, km, kI, hf];
    var kS = 1;
    var kT = 1;
    function kU() {
        kT = Math.max(kj.width / cZ, kj.height / d0);
        kS = Math[pc.enable_min_scaling ? "min" : "max"](kV() / kO, kW() / kP) * (kM && !kN ? 1.1 : 1);
        kS *= kQ;
        for (let rF = 0; rF < kR.length; rF++) {
            const rG = kR[rF];
            let rH = kS * (rG.uiScale || 1);
            rG.style.transform = "scale(" + rH + ")";
            rG.style.transformOrigin = "0 0";
            rG.style.width = kV() / rH + "px";
            rG.style.height = kW() / rH + "px";
        }
    }
    function kV() {
        return document.documentElement.clientWidth;
    }
    function kW() {
        return document.documentElement.clientHeight;
    }
    var kX = 1;
    function kY() {
        kX = pc.low_quality ? 0.65 : window.devicePixelRatio;
        kj.width = kV() * kX;
        kj.height = kW() * kX;
        kU();
        for (let rF = 0; rF < mK.length; rF++) {
            mK[rF].resize();
        }
    }
    window.onresize = function () {
        kY();
        qJ();
    };
    var kZ = function () {
        const rF = 35;
        const rG = rF / 2;
        const rH = document.createElement("canvas");
        rH.width = rH.height = rF;
        const rI = rH.getContext("2d");
        rI.strokeStyle = "rgba(0,0,0,0.1)";
        rI.beginPath();
        rI.moveTo(0, rG);
        rI.lineTo(rF, rG);
        rI.moveTo(rG, 0);
        rI.lineTo(rG, rF);
        rI.stroke();
        return rI.createPattern(rH, "repeat");
    }();
    var l0 = 25;
    var l1 = Math.PI * 2;
    var l2 = [];
    l3(Math.PI / 180 * 30, 1);
    l3(Math.PI / 180 * 60, 1, 6);
    l3(Math.PI / 180 * 90, -1, 6);
    l3(Math.PI / 180 * 120, -1);
    l3(-Math.PI / 180 * 30, -1);
    l3(-Math.PI / 180 * 60, -1, 6);
    l3(-Math.PI / 180 * 90, 1, 6);
    l3(-Math.PI / 180 * 120, 1);
    function l3(rF, rG, rH = 8) {
        rG *= -1;
        const rI = Math.cos(rF);
        const rJ = Math.sin(rF);
        const rK = rI * 40;
        const rL = rJ * 40;
        l2.push({
            dir: rG,
            start: [rK, rL],
            curve: [rK + rI * 23 + -rJ * rG * rH, rL + rJ * 23 + rI * rG * rH, rK + rI * 46, rL + rJ * 46],
            side: Math.sign(rF)
        });
    }
    var l4 = l5();
    function l5() {
        const rF = new Path2D();
        const rG = Math.PI / 5;
        rF.arc(0, 0, 40, rG, l1 - rG);
        rF.quadraticCurveTo(18, 0, Math.cos(rG) * 40, Math.sin(rG) * 40);
        rF.closePath();
        return rF;
    }
    var l6 = l7();
    function l7() {
        const rF = new Path2D();
        rF.moveTo(-40, 5);
        rF.bezierCurveTo(-40, 40, 40, 40, 40, 5);
        rF.lineTo(40, -5);
        rF.bezierCurveTo(40, -40, -40, -40, -40, -5);
        rF.closePath();
        return rF;
    }
    function l8(rF, rG = 1, rH = 0) {
        const rI = new Path2D();
        for (let rJ = 0; rJ < rF; rJ++) {
            const rK = Math.PI * 2 * rJ / rF + rH;
            rI.lineTo(Math.cos(rK) - Math.sin(rK) * 0.1 * rG, Math.sin(rK));
        }
        rI.closePath();
        return rI;
    }
    var l9 = {
        petalRock: l8(5),
        petalSoil: l8(10),
        petalSalt: l8(7),
        petalLightning: function () {
            const rF = new Path2D();
            for (let rG = 0; rG < 20; rG++) {
                const rH = rG / 20 * Math.PI * 2;
                const rI = rG % 2 === 0 ? 1 : 0.55;
                rF.lineTo(Math.cos(rH) * rI, Math.sin(rH) * rI);
            }
            rF.closePath();
            return rF;
        }(),
        petalCotton: lb(9, 1, 0.5, 1.6),
        petalWeb: lb(5, 1, 0.5, 0.7),
        petalCactus: lb(8, 1, 0.5, 0.7),
        petalSand: l8(6, 0, 0.2)
    };
    function la(rF, rG, rH, rI, rJ) {
        rF.strokeStyle = rJ;
        rF.lineWidth = rH;
        rF.save();
        rG *= 0.45;
        rF.scale2(rG);
        rF.translate(-20, 0);
        rF.beginPath();
        rF.moveTo(0, 38);
        rF.lineTo(80, 7);
        rF.lineTo(80, -7);
        rF.lineTo(0, -38);
        rF.lineTo(-20, -30);
        rF.lineTo(-20, 30);
        rF.closePath();
        rH = rH / rG;
        rF.lineWidth = 100 + rH;
        rF.strokeStyle = rJ;
        rF.stroke();
        rF.strokeStyle = rF.fillStyle = rI;
        rF.lineWidth -= rH * 2;
        rF.stroke();
        rF.fill();
        rF.restore();
    }
    function lb(rF, rG, rH, rI) {
        const rJ = new Path2D();
        lc(rJ, rF, rG, rH, rI);
        rJ.closePath();
        return rJ;
    }
    function lc(rF, rG, rH, rI, rJ) {
        rF.moveTo(rH, 0);
        for (let rK = 1; rK <= rG; rK++) {
            const rL = Math.PI * 2 * (rK - rI) / rG;
            const rM = Math.PI * 2 * rK / rG;
            rF.quadraticCurveTo(Math.cos(rL) * rH * rJ, Math.sin(rL) * rH * rJ, Math.cos(rM) * rH, Math.sin(rM) * rH);
        }
    }
    var ld = function () {
        const rF = new Path2D();
        rF.moveTo(60, 0);
        const rG = 6;
        for (let rH = 0; rH < rG; rH++) {
            const rI = (rH + 0.5) / rG * Math.PI * 2;
            const rJ = (rH + 1) / rG * Math.PI * 2;
            rF.quadraticCurveTo(Math.cos(rI) * 120, Math.sin(rI) * 120, Math.cos(rJ) * 60, Math.sin(rJ) * 60);
        }
        rF.closePath();
        return rF;
    }();
    var le = function () {
        const rF = new Path2D();
        const rG = 6;
        for (let rH = 0; rH < rG; rH++) {
            const rI = (rH + 0.5) / rG * Math.PI * 2;
            rF.moveTo(0, 0);
            rF.lineTo(...lf(55, 0, rI));
            for (let rJ = 0; rJ < 2; rJ++) {
                const rK = rJ / 2 * 30 + 20;
                const rL = 10 - rJ * 2;
                rF.moveTo(...lf(rK + rL, -rL, rI));
                rF.lineTo(...lf(rK, 0, rI));
                rF.lineTo(...lf(rK + rL, rL, rI));
            }
        }
        return rF;
    }();
    function lf(rF, rG, rH) {
        const rI = Math.sin(rH);
        const rJ = Math.cos(rH);
        return [rF * rJ + rG * rI, rG * rJ - rF * rI];
    }
    function lg(rF, rG, rH) {
        rF /= 360;
        rG /= 100;
        rH /= 100;
        let rI;
        let rJ;
        let rK;
        if (rG === 0) {
            rI = rJ = rK = rH;
        } else {
            const rM = (rP, rQ, rR) => {
                if (rR < 0) {
                    rR += 1;
                }
                if (rR > 1) {
                    rR -= 1;
                }
                if (rR < 1 / 6) {
                    return rP + (rQ - rP) * 6 * rR;
                }
                if (rR < 1 / 2) {
                    return rQ;
                }
                if (rR < 2 / 3) {
                    return rP + (rQ - rP) * (2 / 3 - rR) * 6;
                }
                return rP;
            };
            const rN = rH < 0.5 ? rH * (1 + rG) : rH + rG - rH * rG;
            const rO = rH * 2 - rN;
            rI = rM(rO, rN, rF + 1 / 3);
            rJ = rM(rO, rN, rF);
            rK = rM(rO, rN, rF - 1 / 3);
        }
        const rL = rP => {
            const rQ = Math.round(rP * 255).toString(16);
            if (rQ.length === 1) {
                return "0" + rQ;
            } else {
                return rQ;
            }
        };
        return "#" + rL(rI) + rL(rJ) + rL(rK);
    }
    var lh = [];
    for (let rF = 0; rF < 10; rF++) {
        const rG = 1 - rF / 10;
        lh.push(lg(40 + rG * 200, 80, rG * 60));
    }
    var li = ["#ffe667", "#d0bb55"];
    var lj = li[0];
    var lk = ["#fc9840", "#bc0000", "#4040fc", "#fc5c5c"];
    function ll(rH = "#c69a2c") {
        const rI = [];
        for (let rJ = 0; rJ < 5; rJ++) {
            rI.push(q0(rH, 0.8 - rJ / 5 * 0.25));
        }
        return rI;
    }
    var lm = {
        pet: {
            body: lj,
            wing: q0(lj, 0.7),
            tail_outline: q0(lj, 0.4),
            bone_outline: q0(lj, 0.4),
            bone: q0(lj, 0.6),
            tail: ll(q0(lj, 0.8))
        },
        main: {
            body: "#c69a2c",
            wing: "#97782b",
            tail_outline: "#6f5514",
            bone_outline: "#493911",
            bone: "#6f5514",
            tail: ll()
        }
    };
    var ln = new Path2D("M 152.826 143.111 C 121.535 159.092 120.433 160.864 121.908 197.88 C 121.908 197.88 123.675 213.781 146.643 226.148 C 169.611 238.515 364.84 213.782 364.84 213.782 C 364.84 213.782 374.834 202.63 351.59 180.213 C 328.346 157.796 273.282 161.162 250.883 146.643 C 228.484 132.124 197.731 120.178 152.826 143.111 Z");
    var lo = new Path2D("M 128.975 219.082 C 109.777 227.556 115.272 259.447 122.792 271.202 C 122.792 271.202 133.393 288.869 160.778 297.703 C 188.163 306.537 333.922 316.254 348.94 298.586 C 363.958 280.918 365.856 273.601 348.055 271.201 C 330.254 268.801 245.518 268.115 235.866 255.3 C 226.214 242.485 208.18 200.322 128.975 219.082 Z");
    var lp = [];
    for (let rH = 0; rH < 3; rH++) {
        lp.push(q0(li[0], 1 - rH / 3 * 0.2));
    }
    function lq(rI = Math.random()) {
        return function () {
            rI = (rI * 9301 + 49297) % 233280;
            return rI / 233280;
        };
    }
    const lr = {
        [cR.petalYobaEgg]: ["#7af54c", "#5ec13a"],
        [cR.petalDragonEgg]: ["#c69a2c", "#8a6b1f"],
        [cR.petalRockEgg]: ["#735d5f", "#4e3f40"]
    };
    var ls = lr;
    var lu = {
        petalRose: true,
        petalCoffee: true,
        petalTaco: true,
        petalBanana: true,
        petalAntidote: true,
        petalSuspill: true,
        petalShell: true
    };
    var lw = {
        petalLightsaber: true,
        petalArrow: true,
        petalFire: true,
        petalGas: true,
        petalWave: true,
        petalNitro: true,
        petalSword: true
    };
    var ly = {
        petalFire: true,
        petalGas: true,
        petalWave: true,
        petalNitro: true
    };
    var lA = {
        petalArrow: true,
        petalStinger: true,
        petalBanana: true
    };
    var lC = {
        turtle: true,
        mobPetaler: true,
        stickbug: true
    };
    var lE = {
        antHole: true,
        antHoleFire: true,
        spiderCave: true,
        beehive: true,
        dragonNest: true
    };
    function lF(rI, rJ) {
        rI.beginPath();
        rI.moveTo(rJ, 0);
        for (let rK = 0; rK < 6; rK++) {
            const rL = rK / 6 * Math.PI * 2;
            rI.lineTo(Math.cos(rL) * rJ, Math.sin(rL) * rJ);
        }
        rI.closePath();
    }
    function lG(rI, rJ, rK, rL, rM) {
        rI.beginPath();
        rI.moveTo(9, -5);
        rI.bezierCurveTo(-15, -25, -15, 25, 9, 5);
        rI.quadraticCurveTo(13, 0, 9, -5);
        rI.closePath();
        rI.lineJoin = rI.lineCap = "round";
        rI.strokeStyle = rL;
        rI.lineWidth = rJ;
        rI.stroke();
        rI.lineWidth -= rM;
        rI.fillStyle = rI.strokeStyle = rK;
        rI.fill();
        rI.stroke();
    }
    var lH = class {
        constructor(rI = -1, rJ, rK, rL, rM, rN = 7, rO = -1) {
            this.id = rI;
            this.type = rJ;
            this.typeStr = hL[rJ];
            this.isPetal = this.typeStr.startsWith("petal");
            this.x = this.nx = this.ox = rK;
            this.y = this.ny = this.oy = rL;
            this.angle = this.nAngle = this.oAngle = rM;
            this.redHealth = this.health = this.nHealth = this.oHealth = rO;
            this.redHealthTimer = 0;
            this.size = this.nSize = this.oSize = rN;
            this.updateT = 0;
            this.isDead = false;
            this.deadT = 0;
            this.hurtT = 0;
            this.isCentiBody = this.typeStr.indexOf("Body") > -1;
            this.hpAlpha = this.isCentiBody ? this.health < 1 : 1;
            this.isPet = false;
            this.breedTimer = 0;
            this.iBreedTimer = 0;
            this.breedTimerAlpha = 0;
            this.eyeX = 1;
            this.eyeY = 0;
            this.doLerpEye = [cR.spiderYoba, cR.yoba, cR.player].includes(this.type);
            this.isRectHitbox = lw[this.typeStr];
            this.rectAscend = ly[this.typeStr] ? 50 / 200 : 0;
            this.isConsumable = lu[this.typeStr];
            this.consumeTime = 0;
            this.poisonT = 0;
            this.isPoison = false;
            this.moveCounter = 0;
            this.visible = true;
            this.hideTimer = 2;
            this.turtleF = 0;
            this.renderBelowEverything = lE[this.typeStr];
            this.renderOverEverything = lA[this.typeStr];
            this.hideAfterInactivity = lC[this.typeStr];
        }
        update() {
            if (this.isDead) {
                this.deadT += pR / 200;
            }
            this.poisonT += (this.isPoison ? 1 : -1) * pR / 200;
            this.poisonT = Math.min(1, Math.max(0, this.poisonT));
            this.breedTimerAlpha = px(this.breedTimerAlpha, this.iBreedTimer > 0.01 ? 1 : 0, 100);
            this.iBreedTimer = px(this.iBreedTimer, this.breedTimer, 100);
            if (this.hurtT > 0) {
                this.hurtT -= pR / 150;
                if (this.hurtT < 0) {
                    this.hurtT = 0;
                }
            }
            this.updateT += pR / 100;
            this.t = Math.min(1, this.updateT);
            this.x = this.ox + (this.nx - this.ox) * this.t;
            this.y = this.oy + (this.ny - this.oy) * this.t;
            this.health = this.oHealth + (this.nHealth - this.oHealth) * this.t;
            this.size = this.oSize + (this.nSize - this.oSize) * this.t;
            if (this.doLerpEye) {
                const rI = Math.min(1, pR / 100);
                this.eyeX += (Math.cos(this.nAngle) - this.eyeX) * rI;
                this.eyeY += (Math.sin(this.nAngle) - this.eyeY) * rI;
            }
            this.angle = f7(this.oAngle, this.nAngle, this.t);
            this.moveCounter += Math.hypot(this.x - this.nx, this.y - this.ny) / 50 * pR / 18;
            if (this.redHealthTimer > 0) {
                this.redHealthTimer -= pR / 600;
                if (this.redHealthTimer < 0) {
                    this.redHealthTimer = 0;
                }
            }
            if (this.hideAfterInactivity) {
                this.hideTimer += pR / 1500;
                if (this.hideTimer > 1) {
                    this.hideTimer = 1;
                }
                this.visible = this.hideTimer < 1;
            }
            if (this.health < 1) {
                this.hpAlpha = px(this.hpAlpha, 1, 200);
            }
            if (this.redHealthTimer === 0) {
                this.redHealth += (this.health - this.redHealth) * Math.min(1, pR / 200);
            }
        }
        drawShell(rI, rJ = false) {
            const rK = this.size / 25;
            rI.scale2(rK);
            rI.translate(5, 0);
            rI.lineWidth = 5;
            rI.lineCap = rI.lineJoin = "round";
            rI.strokeStyle = rI.fillStyle = this.getHurtColor("#c9b46e");
            if (rJ) {
                rI.save();
                rI.translate(3, 0);
                rI.beginPath();
                rI.moveTo(-10, 0);
                rI.lineTo(-40, -15);
                rI.quadraticCurveTo(-33, 0, -40, 15);
                rI.closePath();
                rI.restore();
                rI.stroke();
                rI.fill();
            }
            rI.beginPath();
            rI.moveTo(0, 30);
            const rL = 28;
            const rM = 36;
            const rN = 5;
            rI.moveTo(0, rL);
            for (let rO = 0; rO < rN; rO++) {
                const rP = ((rO + 0.5) / rN * 2 - 1) * Math.PI / 2;
                const rQ = ((rO + 1) / rN * 2 - 1) * Math.PI / 2;
                rI.quadraticCurveTo(Math.cos(rP) * rM * 0.85, -Math.sin(rP) * rM, Math.cos(rQ) * rL * 0.7, -Math.sin(rQ) * rL);
            }
            rI.lineTo(-28, -9);
            rI.quadraticCurveTo(-38, 0, -28, 9);
            rI.lineTo(0, rL);
            rI.closePath();
            rI.fillStyle = this.getHurtColor("#fcdd86");
            rI.fill();
            rI.stroke();
            rI.beginPath();
            for (let rR = 0; rR < 4; rR++) {
                const rS = (rR / 3 * 2 - 1) * Math.PI / 7;
                const rT = -30 + Math.cos(rS) * 13;
                const rU = Math.sin(rS) * 11;
                rI.moveTo(rT, rU);
                rI.lineTo(rT + Math.cos(rS) * 27, rU + Math.sin(rS) * 27);
            }
            rI.lineWidth = 4;
            rI.stroke();
        }
        makeSpiderLegs(rI, rJ = "#323032", rK = 0) {
            for (let rL = 0; rL < l2.length; rL++) {
                const rM = l2[rL];
                rI.save();
                rI.rotate(rM.dir * Math.sin(this.moveCounter + rL) * 0.15 + rK * rM.side);
                rI.beginPath();
                rI.moveTo(...rM.start);
                rI.quadraticCurveTo(...rM.curve);
                rI.strokeStyle = this.getHurtColor(rJ);
                rI.lineWidth = 8;
                rI.lineCap = "round";
                rI.stroke();
                rI.restore();
            }
        }
        drawSnailShell(rI) {
            rI.beginPath();
            let rJ = 0;
            let rK = 0;
            let rL;
            let rM;
            const rN = 20;
            for (let rO = 0; rO < rN; rO++) {
                const rP = rO / rN * Math.PI * 4 + Math.PI / 2;
                const rQ = (rO + 1) / rN * 40;
                rL = Math.cos(rP) * rQ;
                rM = Math.sin(rP) * rQ;
                const rR = rJ + rL;
                const rS = rK + rM;
                rI.quadraticCurveTo((rJ + rR) * 0.5 + rM * 0.15, (rK + rS) * 0.5 - rL * 0.15, rR, rS);
                rJ = rR;
                rK = rS;
            }
            rI.quadraticCurveTo(rJ - rM * 0.42 + rL * 0.4, rK + rL * 0.42 + rM * 0.4, rJ - rM * 0.84, rK + rL * 0.84);
            rI.fillStyle = this.getHurtColor("#8b533f");
            rI.fill();
            rI.lineWidth = 8;
            rI.strokeStyle = this.getHurtColor("#69371d");
            rI.stroke();
        }
        petalBanana(rI) {
            rI.scale2(this.size / 13);
            rI.rotate(-Math.PI / 6);
            rI.lineCap = rI.lineJoin = "round";
            rI.beginPath();
            rI.moveTo(0, -14);
            rI.lineTo(6, -20);
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#347918");
            rI.lineWidth = 7;
            rI.stroke();
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#7dad0c");
            rI.lineWidth = 2;
            rI.stroke();
            rI.beginPath();
            rI.moveTo(0, -12);
            rI.quadraticCurveTo(-6, 0, 4, 14);
            rI.bezierCurveTo(-9, 10, -9, -10, 0, -14);
            rI.lineWidth = 12;
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#c1ab00");
            rI.fill();
            rI.stroke();
            rI.lineWidth = 6;
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#ffe200");
            rI.stroke();
            rI.fill();
        }
        petalTaco(rI) {
            rI.scale2(this.size / 45);
            rI.translate(-20, 0);
            rI.lineCap = rI.lineJoin = "round";
            rI.beginPath();
            const rJ = 6;
            const rK = Math.PI * 0.45;
            const rL = 60;
            const rM = 70;
            rI.moveTo(0, 0);
            for (let rN = 0; rN < rJ; rN++) {
                const rO = (rN / rJ * 2 - 1) * rK;
                const rP = ((rN + 1) / rJ * 2 - 1) * rK;
                if (rN === 0) {
                    rI.quadraticCurveTo(-10, -50, Math.cos(rO) * rL, Math.sin(rO) * rL);
                }
                const rQ = (rO + rP) / 2;
                rI.quadraticCurveTo(Math.cos(rQ) * rM, Math.sin(rQ) * rM, Math.cos(rP) * rL, Math.sin(rP) * rL);
            }
            rI.quadraticCurveTo(-10, 50, 0, 0);
            rI.fillStyle = this.getHurtColor("#4eae26");
            rI.strokeStyle = this.getHurtColor("#368316");
            rI.lineWidth = 10;
            rI.stroke();
            rI.fill();
            rI.beginPath();
            rI.arc(0, 0, 40, -Math.PI / 2, Math.PI / 2);
            rI.closePath();
            rI.strokeStyle = this.getHurtColor("#bb771e");
            rI.lineWidth = 30;
            rI.stroke();
            rI.lineWidth = 10;
            rI.strokeStyle = rI.fillStyle = this.getHurtColor("#e6a44d");
            rI.fill();
            rI.stroke();
        }
        pacman(rI, rJ = false) {
            rI.scale2(this.size / 100);
            let rK = this.isIcon ? 0.75 : Math.sin(Date.now() / 150 + this.moveCounter);
            rK = rK * 0.5 + 0.5;
            rK *= 0.7;
            rI.beginPath();
            rI.moveTo(0, 0);
            rI.arc(0, 0, 100, rK, Math.PI * 2 - rK);
            rI.closePath();
            rI.fillStyle = this.getHurtColor("#fcfe04");
            rI.fill();
            rI.clip();
            rI.strokeStyle = "rgba(0,0,0,0.15)";
            rI.lineWidth = rJ ? 40 : 30;
            rI.lineJoin = "round";
            rI.stroke();
            if (!rJ) {
                rI.beginPath();
                rI.arc(0 - rK * 8, -50 - rK * 3, 16, 0, Math.PI * 2);
                rI.fillStyle = "rgba(0,0,0,0.2)";
                rI.fill();
            }
        }
        ghost(rI) {
            rI.scale2(this.size / 80);
            rI.rotate(-this.angle);
            rI.translate(0, 80);
            const rJ = Date.now() / 300 + this.moveCounter;
            rI.beginPath();
            const rK = 3;
            let rL;
            for (let rO = 0; rO < rK; rO++) {
                const rP = (rO / rK * 2 - 1) * 100;
                const rQ = ((rO + 1) / rK * 2 - 1) * 100;
                rL = 20 + (Math.sin(rO / rK * Math.PI * 8 + rJ) * 0.5 + 0.5) * 30;
                if (rO === 0) {
                    rI.moveTo(rP, -rL);
                }
                rI.bezierCurveTo(rP, rL, rQ, rL, rQ, -rL);
            }
            rI.bezierCurveTo(100, -250, -100, -250, -100, -rL);
            rI.closePath();
            rI.globalAlpha *= 0.7;
            const rM = this.isPet ? li[0] : this.id < 0 ? lk[0] : lk[this.id % lk.length];
            rI.fillStyle = this.getHurtColor(rM);
            rI.fill();
            rI.clip();
            rI.lineJoin = "round";
            rI.strokeStyle = "rgba(0,0,0,0.15)";
            "hsla(0,0%,100%,0.15)";
            rI.lineWidth = 30;
            rI.stroke();
            let rN = Math.sin(rJ * 1);
            rN = rN * 0.5 + 0.5;
            rN *= 3;
            rI.beginPath();
            rI.ellipse(0, -130 - rN * 2, 40 - rN, 20 - rN * 1.5, 0, 0, Math.PI * 2);
            rI.fillStyle = rI.strokeStyle;
            rI.fill();
        }
        bubble(rI, rJ) {
            rI.scale2(this.size / 20);
            const rK = rI.globalAlpha;
            rI.strokeStyle = rI.fillStyle = this.getHurtColor("#ffffff");
            rI.globalAlpha = rK * 0.4;
            rI.save();
            rI.beginPath();
            rI.rotate(Math.PI * 0.16);
            rI.translate(rJ ? -6 : -9, 0);
            rI.moveTo(0, -4);
            rI.quadraticCurveTo(-2, 0, 0, 4);
            rI.lineWidth = 8;
            rI.lineJoin = rI.lineCap = "round";
            rI.stroke();
            rI.restore();
            rI.beginPath();
            rI.arc(0, 0, 20, 0, Math.PI * 2);
            rI.fill();
            rI.clip();
            rI.globalAlpha = rK * 0.5;
            rI.lineWidth = rJ ? 8 : 3;
            rI.stroke();
        }
        beehive(rI) {
            rI.scale2(this.size / 100);
            const rJ = this.getHurtColor("#fdda40");
            const rK = this.getHurtColor("#fbb257");
            const rL = 4;
            rI.lineJoin = rI.lineCap = "round";
            const rM = 100 - rI.lineWidth * 0.5;
            for (let rN = 0; rN <= rL; rN++) {
                const rO = (1 - rN / rL) * rM;
                lF(rI, rO);
                rI.lineWidth = 30 + rN * (Math.sin(Date.now() / 800 + rN) * 0.5 + 0.5) * 5;
                rI.fillStyle = rI.strokeStyle = rN % 2 === 0 ? rJ : rK;
                if (rN === rL - 1) {
                    rI.fill();
                }
                rI.stroke();
            }
        }
        makeHole(rI, rJ) {
            rI.beginPath();
            rI.arc(0, 0, this.size, 0, l1);
            rI.fillStyle = this.getHurtColor(rJ);
            rI.fill();
            rI.fillStyle = "rgba(0,0,0,0.2)";
            for (let rK = 1; rK < 4; rK++) {
                rI.beginPath();
                rI.arc(0, 0, this.size * (1 - rK / 4), 0, l1);
                rI.fill();
            }
        }
        makeFire(rI, rJ) {
            rI.translate(-this.size, 0);
            rI.globalCompositeOperation = "lighter";
            const rK = 50;
            let rL = false;
            if (!this.parts) {
                rL = true;
                this.parts = [];
            }
            while (this.parts.length < rK) {
                this.parts.push({
                    x: rL ? Math.random() : 0,
                    y: Math.random() * 2 - 1,
                    vx: Math.random() * 0.03 + 0.02,
                    size: Math.random() * 0.2 + 0.2
                });
            }
            const rM = this.size * 2;
            const rN = Math.max(this.size * 0.1, 4);
            const rO = rI.globalAlpha;
            rI.fillStyle = rJ;
            rI.beginPath();
            for (let rP = rK - 1; rP >= 0; rP--) {
                const rQ = this.parts[rP];
                rQ.x += rQ.vx;
                const rR = rQ.x * rM;
                const rS = this.rectAscend * rR;
                const rT = rQ.y * rS;
                const rU = Math.pow(1 - Math.abs(rT) / rS, 0.2) * Math.pow(1 - rR / rM, 0.2);
                if (rQ.x >= 1 || rU < 0.001) {
                    this.parts.splice(rP, 1);
                    continue;
                }
                rI.globalAlpha = rU * rO * 0.5;
                rI.beginPath();
                rI.arc(rR, rT, rQ.size * rS + rN, 0, Math.PI * 2);
                rI.fill();
            }
        }
        pedox(rI) {
            rI.scale2(this.size / 70);
            rI.rotate(-Math.PI / 2);
            const rJ = pQ / 200;
            rI.lineWidth = 20;
            rI.strokeStyle = "rgba(0,0,0,0.1)";
            rI.lineCap = rI.lineJoin = "round";
            rI.fillStyle = this.getHurtColor("#eeeeee");
            if (true) {
                this.pedoxMain(rI);
                return;
            }
            const rK = 2;
            for (let rL = 1; rL <= rK; rL++) {
                rI.save();
                let rM = 1 - rL / rK;
                rM *= 1 + Math.sin(rJ + rL) * 0.5;
                rM = 1 + rM * 0.5;
                rI.globalAlpha *= Math.pow(rL / rK, 2);
                rI.scale(rM, rM);
                if (rL !== rK) {
                    rI.globalAlpha *= 0.7;
                    rI.globalCompositeOperation = "lighter";
                    rI.filter = "blur(10px)";
                }
                this.pedoxMain(rI);
                rI.restore();
            }
        }
        sword(rI, rJ = 190) {
            rI.save();
            rI.beginPath();
            rI.moveTo(0, -70 + rJ + 30);
            rI.lineTo(26, -70 + rJ);
            rI.lineTo(13, -70);
            rI.lineTo(-13, -70);
            rI.lineTo(-26, -70 + rJ);
            rI.lineTo(0, -70 + rJ + 30);
            rI.clip();
            rI.fill();
            rI.stroke();
            rI.restore();
            rI.save();
            rI.beginPath();
            rI.moveTo(-18, -70);
            rI.quadraticCurveTo(-5, -80, -10, -105);
            rI.bezierCurveTo(-10, -115, 10, -115, 10, -105);
            rI.quadraticCurveTo(5, -80, 18, -70);
            rI.quadraticCurveTo(0, -60, -18, -70);
            rI.closePath();
            if (this.isPetal) {
                rI.fillStyle = this.getHurtColor("#ab5705");
                rI.strokeStyle = this.getHurtColor("#854608");
            } else {
                rI.strokeStyle = this.getHurtColor("#dddddd");
            }
            rI.fill();
            rI.lineWidth = 10;
            rI.stroke();
            rI.restore();
        }
        pedoxMain(rI) {
            rI.save();
            rI.beginPath();
            for (let rJ = 0; rJ < 2; rJ++) {
                rI.moveTo(20, -30);
                rI.quadraticCurveTo(90, -10, 50, -50);
                rI.lineTo(160, -50);
                rI.quadraticCurveTo(140, 60, 20, 0);
                rI.scale(-1, 1);
            }
            rI.clip();
            rI.fill();
            rI.stroke();
            rI.restore();
            this.sword(rI);
            rI.save();
            rI.beginPath();
            rI.arc(0, 0, 50, 0, Math.PI, true);
            rI.lineTo(-50, 30);
            rI.lineTo(-30, 30);
            rI.lineTo(-31, 50);
            rI.lineTo(31, 50);
            rI.lineTo(30, 30);
            rI.lineTo(50, 30);
            rI.lineTo(50, 0);
            rI.fill();
            rI.clip();
            rI.stroke();
            rI.beginPath();
            rI.ellipse(-18, -2, 15, 11, -0.4, 0, Math.PI * 2);
            rI.ellipse(18, -2, 15, 11, 0.4, 0, Math.PI * 2);
            rI.fillStyle = rI.strokeStyle;
            rI.fill();
            rI.restore();
        }
        turtle(rI) {
            rI.scale2(this.size / 100);
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            const rJ = this.getHurtColor("#82b11e");
            const rK = this.getHurtColor("#a2dd26");
            this.turtleF += pR / 300 * (this.visible ? 1 : -1);
            this.turtleF = Math.min(1, Math.max(0, this.turtleF));
            const rL = this.isIcon ? 1 : this.turtleF;
            const rM = 1 - rL;
            rI.save();
            rI.beginPath();
            rI.translate((48 + (Math.sin(this.moveCounter * 1) * 0.5 + 0.5) * 8) * rL + (1 - rL) * -20, 0);
            rI.scale(1.1, 1.1);
            rI.moveTo(0, -10);
            rI.bezierCurveTo(140, -130, 140, 130, 0, 10);
            rI.fillStyle = rK;
            rI.fill();
            rI.lineJoin = "round";
            rI.lineWidth = 28;
            rI.clip();
            rI.stroke();
            rI.restore();
            for (let rN = 0; rN < 2; rN++) {
                const rO = Math.sin(this.moveCounter * 1);
                rI.save();
                const rP = rN * 2 - 1;
                rI.scale(1, rP);
                rI.translate(rL * 50 - rM * 10, rL * 80);
                rI.rotate(rO * 0.2 + 0.3 - rM * 1);
                rI.beginPath();
                rI.moveTo(10, -10);
                rI.quadraticCurveTo(30, 40, -20, 80);
                rI.quadraticCurveTo(10, 30, -15, 0);
                rI.strokeStyle = rJ;
                rI.lineWidth = 44;
                rI.lineCap = rI.lineJoin = "round";
                rI.stroke();
                rI.lineWidth -= 28;
                rI.fillStyle = rI.strokeStyle = rK;
                rI.fill();
                rI.stroke();
                rI.restore();
            }
            for (let rQ = 0; rQ < 2; rQ++) {
                const rR = Math.sin(this.moveCounter * 1 + 1);
                rI.save();
                const rS = rQ * 2 - 1;
                rI.scale(1, rS);
                rI.translate(rL * -65, rL * 50);
                rI.rotate(rR * 0.3 + 1.3);
                rI.beginPath();
                rI.moveTo(12, -5);
                rI.quadraticCurveTo(40, 30, 0, 60);
                rI.quadraticCurveTo(20, 30, 0, 0);
                rI.strokeStyle = rJ;
                rI.lineWidth = 44;
                rI.lineCap = rI.lineJoin = "round";
                rI.stroke();
                rI.lineWidth -= 28;
                rI.fillStyle = rI.strokeStyle = rK;
                rI.stroke();
                rI.fill();
                rI.restore();
            }
            this.drawTurtleShell(rI);
        }
        drawTurtleShell(rI, rJ = 1) {
            rI.beginPath();
            rI.arc(0, 0, 100, 0, Math.PI * 2);
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.fillStyle = this.getHurtColor("#8f5f34");
            rI.fill();
            rI.lineWidth = rJ * 30;
            rI.save();
            rI.clip();
            rI.stroke();
            rI.restore();
            rI.save();
            rI.beginPath();
            rI.arc(0, 0, 100 - rI.lineWidth / 2, 0, Math.PI * 2);
            rI.clip();
            rI.beginPath();
            for (let rK = 0; rK < 6; rK++) {
                const rL = rK / 6 * Math.PI * 2;
                rI.lineTo(Math.cos(rL) * 40, Math.sin(rL) * 40);
            }
            rI.closePath();
            for (let rM = 0; rM < 6; rM++) {
                const rN = rM / 6 * Math.PI * 2;
                const rO = Math.cos(rN) * 40;
                const rP = Math.sin(rN) * 40;
                rI.moveTo(rO, rP);
                rI.lineTo(rO * 3, rP * 3);
            }
            rI.lineWidth = rJ * 16;
            rI.lineCap = rI.lineJoin = "round";
            rI.stroke();
            rI.restore();
        }
        tumbleweed(rI) {
            rI.scale2(this.size / 130);
            let rJ;
            let rK;
            const rL = 45;
            const rM = lq(this.weedSeed ||= this.isIcon ? 40 : Math.random() * 1000);
            let rN = rM() * 6.28;
            const rO = Date.now() / 200;
            const rP = ["#ab7544", "#724c2a"].map(rQ => this.getHurtColor(rQ));
            for (let rQ = 0; rQ <= rL; rQ++) {
                if (rQ % 5 === 0 || rQ === rL) {
                    if (rQ > 0) {
                        rI.lineWidth = 25;
                        rI.lineJoin = rI.lineCap = "round";
                        rI.strokeStyle = rP[1];
                        rI.stroke();
                        rI.lineWidth = 12;
                        rI.strokeStyle = rP[0];
                        rI.stroke();
                    }
                    if (rQ !== rL) {
                        rI.beginPath();
                        rI.moveTo(rJ, rK);
                    }
                }
                let rR = rQ / 50;
                rR *= rR;
                rN += (0.3 + rM() * 0.8) * 3;
                const rS = 20 + Math.sin(rR * 3.14) * 110;
                const rT = Math.sin(rQ + rO) * 0.5;
                const rU = Math.cos(rN + rT) * rS;
                const rV = Math.sin(rN + rT) * rS;
                const rW = rU - rJ;
                const rX = rV - rK;
                rI.quadraticCurveTo((rJ + rU) / 2 + rX, (rK + rV) / 2 - rW, rU, rV);
                rJ = rU;
                rK = rV;
            }
        }
        dragonNest(rI) {
            rI.scale2(this.size / 110);
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.lineWidth = 28;
            rI.beginPath();
            rI.arc(0, 0, 110, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor("#a58368");
            rI.fill();
            rI.save();
            rI.clip();
            rI.stroke();
            rI.restore();
            rI.beginPath();
            rI.arc(0, 0, 70, 0, Math.PI * 2);
            rI.fillStyle = "rgba(0,0,0,0.3)";
            rI.fill();
            rI.save();
            rI.clip();
            rI.stroke();
            rI.restore();
            const rJ = lq(this.seed ||= this.isIcon ? 30 : Math.random() * 1000);
            const rK = this.getHurtColor("#543d37");
            const rL = this.getHurtColor("#735b49");
            for (let rO = 0; rO < 3; rO++) {
                rI.beginPath();
                const rP = 12;
                for (let rQ = 0; rQ < rP; rQ++) {
                    const rR = Math.PI * 2 * rQ / rP;
                    rI.save();
                    rI.rotate(rR + rJ() * 0.4);
                    rI.translate(60 + rJ() * 10, 0);
                    rI.moveTo(rJ() * 5, rJ() * 5);
                    rI.bezierCurveTo(20 + rJ() * 10, rJ() * 20, 40 + rJ() * 20, rJ() * 30 + 10, 60 + rJ() * 10, rJ() * 10 + 10);
                    rI.restore();
                }
                rI.lineCap = rI.lineJoin = "round";
                rI.lineWidth = 18 - rO * 2;
                rI.strokeStyle = rK;
                rI.stroke();
                rI.lineWidth -= 8;
                rI.strokeStyle = rL;
                rI.stroke();
            }
            const rM = 40;
            rI.rotate(-this.angle);
            rI.fillStyle = this.getHurtColor("#fff0b8");
            rI.strokeStyle = this.getHurtColor("#cfc295");
            rI.lineWidth = 9;
            const rN = this.health * 6;
            for (let rS = 0; rS < rN; rS++) {
                const rT = (rS - 1) / 6 * Math.PI * 2 - Math.PI / 2;
                rI.beginPath();
                rI.ellipse(Math.cos(rT) * rM, Math.sin(rT) * rM * 0.7, 25, 35, 0, 0, Math.PI * 2);
                rI.fill();
                rI.stroke();
            }
        }
        uwu(rI) {
            rI.rotate(-this.angle);
            rI.scale2(this.size / 60);
            rI.lineCap = rI.lineJoin = "round";
            let rJ = Math.sin(Date.now() / 300 + this.moveCounter * 0.5) * 0.5 + 0.5;
            rJ *= 1.5;
            rI.beginPath();
            rI.moveTo(-50, -50 - rJ * 3);
            rI.quadraticCurveTo(0, -60, 50, -50 - rJ * 3);
            rI.quadraticCurveTo(80 - rJ * 3, -10, 80, 50);
            rI.quadraticCurveTo(70, 75, 40, 78 + rJ * 5);
            rI.lineTo(30, 60 + rJ * 5);
            rI.quadraticCurveTo(45, 55, 50, 45);
            rI.quadraticCurveTo(0, 65, -50, 50);
            rI.quadraticCurveTo(-45, 55, -30, 60 + rJ * 3);
            rI.lineTo(-40, 78 + rJ * 5);
            rI.quadraticCurveTo(-70, 75, -80, 50);
            rI.quadraticCurveTo(-80 + rJ * 3, -10, -50, -50 - rJ * 3);
            rI.fillStyle = this.getHurtColor("#b0c0ff");
            rI.fill();
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.save();
            rI.clip();
            rI.lineWidth = 14;
            rI.stroke();
            rI.restore();
            for (let rK = 0; rK < 2; rK++) {
                rI.save();
                rI.scale(rK * 2 - 1, 1);
                rI.translate(-34, -24 - rJ * 3);
                rI.rotate(-0.6);
                rI.scale(1.3, 1.3);
                rI.beginPath();
                rI.moveTo(-20, 0);
                rI.quadraticCurveTo(-20, -25, 0, -40);
                rI.quadraticCurveTo(20, -25, 20, 0);
                rI.fill();
                rI.clip();
                rI.lineWidth = 13;
                rI.stroke();
                rI.restore();
            }
            rI.save();
            rI.beginPath();
            rI.ellipse(0, 30, 36 - rJ * 2, 8 - rJ, 0, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor("#eb4755");
            rI.globalAlpha *= 0.2;
            rI.fill();
            rI.restore();
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#8d9acc");
            for (let rL = 0; rL < 2; rL++) {
                rI.save();
                rI.scale(rL * 2 - 1, 1);
                rI.translate(25 - rJ * 1, 15 - rJ * 3);
                rI.rotate(-0.3);
                rI.beginPath();
                rI.arc(0, 0, 15, 0, Math.PI * 2 * 0.72);
                rI.fill();
                rI.restore();
            }
            rI.save();
            rI.lineWidth = 5;
            rI.translate(0, 33 - rJ * 1);
            rI.beginPath();
            rI.moveTo(-12, 0);
            rI.bezierCurveTo(-12, 8, 0, 8, 0, 0);
            rI.bezierCurveTo(0, 8, 12, 8, 12, 0);
            rI.stroke();
            rI.restore();
        }
        nig(rI) {
            rI.scale2(this.size / 60);
            rI.rotate(-Math.PI / 2);
            rI.beginPath();
            rI.moveTo(50, 80);
            rI.quadraticCurveTo(30, 30, 50, -20);
            rI.quadraticCurveTo(90, -100, 0, -100);
            rI.quadraticCurveTo(-90, -100, -50, -20);
            rI.quadraticCurveTo(-30, 30, -50, 80);
            rI.fillStyle = this.getHurtColor("#7d893e");
            rI.fill();
            rI.lineJoin = rI.lineCap = "round";
            rI.lineWidth = 20;
            rI.clip();
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.stroke();
            rI.fillStyle = this.getHurtColor("#cdbb48");
            const rJ = 6;
            rI.beginPath();
            rI.moveTo(-50, 80);
            for (let rK = 0; rK < rJ; rK++) {
                const rL = ((rK + 0.5) / rJ * 2 - 1) * 50;
                const rM = ((rK + 1) / rJ * 2 - 1) * 50;
                rI.quadraticCurveTo(rL, 30, rM, 80);
            }
            rI.lineWidth = 8;
            rI.fill();
            rI.stroke();
            rI.strokeStyle = rI.fillStyle = "rgba(0,0,0,0.2)";
            rI.save();
            rI.translate(0, -5);
            rI.beginPath();
            rI.moveTo(0, 0);
            rI.bezierCurveTo(-10, 25, 10, 25, 0, 0);
            rI.stroke();
            rI.restore();
            for (let rN = 0; rN < 2; rN++) {
                rI.save();
                rI.scale(rN * 2 - 1, 1);
                rI.translate(25, -56);
                rI.beginPath();
                rI.arc(0, 0, 18, 0, Math.PI * 2);
                rI.clip();
                rI.lineWidth = 15;
                rI.stroke();
                rI.fill();
                rI.restore();
            }
        }
        sunflower(rI) {
            rI.scale2(this.size / 50);
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.lineWidth = 16;
            const rJ = 7;
            rI.beginPath();
            const rK = 18;
            rI.fillStyle = this.getHurtColor("#ffd800");
            const rL = Math.sin(pQ / 600);
            for (let rM = 0; rM < 2; rM++) {
                const rN = 1.2 - rM * 0.2;
                for (let rO = 0; rO < rJ; rO++) {
                    rI.save();
                    rI.rotate(rO / rJ * Math.PI * 2 + rM / rJ * Math.PI);
                    rI.translate(46, 0);
                    rI.scale(rN, rN);
                    const rP = Math.sin(rL + rO * 0.05 * (1 - rM * 0.5));
                    rI.beginPath();
                    rI.moveTo(0, rK);
                    rI.quadraticCurveTo(20, rK, 40 + rP, 0 + rP * 5);
                    rI.quadraticCurveTo(20, -rK, 0, -rK);
                    rI.fill();
                    rI.clip();
                    rI.stroke();
                    rI.restore();
                }
            }
            rI.beginPath();
            rI.arc(0, 0, 50, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor("#a52a2a");
            rI.fill();
            rI.clip();
            rI.lineWidth = 25;
            rI.stroke();
        }
        stickbug(rI) {
            rI.scale2(this.size / 40);
            let rJ = this.moveCounter;
            const rK = this.isIcon ? 0 : Math.sin(pQ / 100) * 15;
            rI.lineCap = rI.lineJoin = "round";
            rI.beginPath();
            rI.save();
            const rL = 3;
            for (let rM = 0; rM < 2; rM++) {
                const rN = rM === 0 ? 1 : -1;
                for (let rO = 0; rO <= rL; rO++) {
                    rI.save();
                    rI.moveTo(0, 0);
                    const rP = Math.sin(rJ + rO + rM);
                    rI.rotate((rO / rL * 2 - 1) * 0.6 + 1.4 + rP * 0.15);
                    rI.lineTo(45 + rN * rK, 0);
                    rI.rotate(0.2 + (rP * 0.5 + 0.5) * 0.1);
                    rI.lineTo(75, 0);
                    rI.restore();
                }
                rI.scale(1, -1);
            }
            rI.restore();
            rI.lineWidth = 8;
            rI.strokeStyle = this.getHurtColor("#5b4d3c");
            rI.stroke();
            rI.save();
            rI.translate(0, rK);
            this.stickbugBody(rI);
            rI.restore();
        }
        stickbugBody(rI, rJ = false) {
            rI.lineCap = rI.lineJoin = "round";
            rI.rotate(-0.15);
            rI.beginPath();
            rI.moveTo(-50, 0);
            rI.lineTo(40, 0);
            rI.moveTo(15, 0);
            rI.lineTo(-5, 25);
            rI.moveTo(-3, 0);
            rI.lineTo(12, -20);
            rI.moveTo(-14, -5);
            rI.lineTo(-46, -23);
            rI.lineWidth = 28;
            rI.strokeStyle = this.getHurtColor("#775d3e");
            rI.stroke();
            rI.strokeStyle = this.getHurtColor("#a07f53");
            rI.lineWidth -= rJ ? 15 : 10;
            rI.stroke();
        }
        mushroom(rI) {
            rI.scale2(this.size / 100);
            rI.beginPath();
            rI.arc(0, 0, 100, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor("#d54324");
            rI.fill();
            rI.clip();
            rI.lineWidth = this.isPetal ? 50 : 30;
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.stroke();
            if (!this.mushroomPath) {
                const rJ = new Path2D();
                const rK = this.isPetal ? 2 : 3;
                for (let rL = 0; rL <= rK; rL++) {
                    for (let rM = 0; rM <= rK; rM++) {
                        const rN = ((rM / rK + Math.random() * 0.1) * 2 - 1) * 70 + (rL % 2 === 0 ? -20 : 0);
                        const rO = ((rL / rK + Math.random() * 0.1) * 2 - 1) * 70;
                        const rP = Math.random() * 13 + (this.isPetal ? 14 : 7);
                        rJ.moveTo(rN, rO);
                        rJ.arc(rN, rO, rP, 0, Math.PI * 2);
                    }
                }
                this.mushroomPath = rJ;
            }
            rI.beginPath();
            rI.arc(0, 0, 100 - rI.lineWidth / 2, 0, Math.PI * 2);
            rI.clip();
            rI.fillStyle = "hsla(0,0%,100%,0.5)";
            rI.fill(this.mushroomPath);
        }
        fossil(rI) {
            rI.scale2(this.size / 100);
            rI.save();
            rI.translate(-245, -220);
            rI.strokeStyle = this.getHurtColor("#aaaaaa");
            rI.fillStyle = this.getHurtColor("#cccccc");
            rI.lineWidth = 15;
            rI.lineJoin = rI.lineCap = "round";
            const rJ = !this.isPetal;
            if (rJ) {
                rI.save();
                rI.translate(270, 222);
                rI.save();
                rI.rotate(-0.1);
                for (let rK = 0; rK < 3; rK++) {
                    rI.beginPath();
                    rI.moveTo(-5, 0);
                    rI.quadraticCurveTo(0, 40, 5, 0);
                    rI.stroke();
                    rI.fill();
                    rI.translate(40, 0);
                }
                rI.restore();
                rI.translate(23, 50);
                rI.rotate(0.05);
                for (let rL = 0; rL < 2; rL++) {
                    rI.beginPath();
                    rI.moveTo(-5, 0);
                    rI.quadraticCurveTo(0, -40, 5, 0);
                    rI.stroke();
                    rI.fill();
                    rI.translate(40, 0);
                }
                rI.restore();
            }
            rI.fill(ln);
            rI.stroke(ln);
            rI.fill(lo);
            rI.stroke(lo);
            rI.restore();
            if (rJ) {
                rI.beginPath();
                rI.arc(-50, -44, 30, 0, Math.PI * 2);
                rI.arc(70, -28, 14, 0, Math.PI * 2);
                rI.fillStyle = "rgba(0,0,0,0.2)";
                rI.fill();
            }
        }
        avacado(rI) {
            rI.scale2(this.size / 70);
            rI.save();
            if (!this.isPetal) {
                rI.rotate(Math.PI / 2);
            }
            rI.translate(0, 45);
            rI.beginPath();
            rI.moveTo(0, -100);
            rI.bezierCurveTo(30, -100, 60, 0, 0, 0);
            rI.bezierCurveTo(-60, 0, -30, -100, 0, -100);
            rI.lineCap = rI.lineJoin = "round";
            rI.lineWidth = 60;
            rI.strokeStyle = this.getHurtColor("#416d1e");
            rI.stroke();
            rI.lineWidth -= this.isPetal ? 35 : 20;
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#9fab2d");
            rI.stroke();
            rI.lineWidth -= this.isPetal ? 22 : 15;
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#d3d14f");
            rI.stroke();
            rI.fill();
            rI.translate(0, -36);
            if (this.isPetal) {
                rI.scale2(0.9);
            }
            rI.beginPath();
            rI.ellipse(0, 0, 29, 32, 0, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor("#634418");
            rI.fill();
            rI.clip();
            rI.lineWidth = 13;
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.stroke();
            rI.beginPath();
            rI.ellipse(11, -6, 6, 10, -0.3, 0, Math.PI * 2);
            rI.fillStyle = "hsla(0,0%,100%,0.1)";
            rI.fill();
            rI.restore();
        }
        dice(rI) {
            rI.scale2(this.size / 25);
            if (!this.isIcon && this.isPetal) {
                rI.rotate(Math.sin(pQ / 100 + this.id) * 0.15);
            }
            rI.beginPath();
            rI.rect(-22, -22, 44, 44);
            rI.fillStyle = this.getHurtColor("#ffffff");
            rI.fill();
            rI.lineWidth = 6;
            rI.lineJoin = "round";
            rI.strokeStyle = this.getHurtColor("#cccccc");
            rI.stroke();
            rI.beginPath();
            const rJ = this.isIcon ? 1 : 1 - Math.sin(pQ / 500);
            const rK = rO(0, 0.25);
            const rL = 1 - rO(0.25, 0.25);
            const rM = rO(0.5, 0.25);
            const rN = rO(0.75, 0.25);
            function rO(rP, rQ) {
                return Math.min(1, Math.max(0, (rJ - rP) / rQ));
            }
            rI.rotate(rL * Math.PI / 4);
            for (let rP = 0; rP < 2; rP++) {
                const rQ = (rP * 2 - 1) * 7 * rN;
                for (let rR = 0; rR < 3; rR++) {
                    let rS = rK * (-11 + rR * 11);
                    rI.moveTo(rS, rQ);
                    rI.arc(rS, rQ, 4.7, 0, Math.PI * 2);
                }
            }
            rI.fillStyle = this.getHurtColor("#bbbbbb");
            rI.fill();
        }
        draw(rI) {
            rI.save();
            rI.translate(this.x, this.y);
            this.deadPreDraw(rI);
            rI.rotate(this.angle);
            rI.lineWidth = 8;
            const rJ = (rO, rP) => {
                rL = this.size / 20;
                rI.scale(rL, rL);
                rI.beginPath();
                rI.arc(0, 0, 20, 0, l1);
                rI.fillStyle = this.getHurtColor(rO);
                rI.fill();
                rI.strokeStyle = this.getHurtColor(rP);
                rI.stroke();
            };
            const rK = (rO, rP, rQ) => {
                rO = l9[rO];
                rI.scale(this.size, this.size);
                rI.lineWidth /= this.size;
                rI.strokeStyle = this.getHurtColor(rQ);
                rI.stroke(rO);
                rI.fillStyle = this.getHurtColor(rP);
                rI.fill(rO);
            };
            let rL;
            let rM;
            let rN;
            switch (this.type) {
                case cR.dice:
                case cR.petalDice:
                    this.dice(rI);
                    break;
                case cR.avacado:
                case cR.petalAvacado:
                    this.avacado(rI);
                    break;
                case cR.petalSword:
                    rI.strokeStyle = "rgba(0,0,0,0.2)";
                    rI.lineWidth = 20;
                    rI.fillStyle = this.getHurtColor("#eeeeee");
                    rI.translate(-this.size, 0);
                    rI.rotate(-Math.PI / 2);
                    rI.scale2(0.5);
                    rI.translate(0, 70);
                    this.sword(rI, this.size * 4);
                    break;
                case cR.pedox:
                    this.pedox(rI);
                    break;
                case cR.petalSkull:
                    this.fossil(rI);
                    break;
                case cR.fossil:
                    this.fossil(rI);
                    break;
                case cR.mushroom:
                case cR.petalMushroom:
                    this.mushroom(rI);
                    break;
                case cR.petalStickbug:
                    rI.scale2(this.size / 30);
                    this.stickbugBody(rI, true);
                    break;
                case cR.stickbug:
                    this.stickbug(rI);
                    break;
                case cR.petalSunflower:
                    rI.lineWidth *= 0.7;
                    rK("petalCactus", "#ffd800", "#ccad00");
                    rI.beginPath();
                    rI.arc(0, 0, 0.6, 0, l1);
                    rI.fillStyle = this.getHurtColor("#a52a2a");
                    rI.fill();
                    rI.clip();
                    rI.strokeStyle = "rgba(0,0,0,0.2";
                    rI.stroke();
                    break;
                case cR.sunflower:
                    this.sunflower(rI);
                    break;
                case cR.petalChromosome:
                    rI.scale2(this.size / 22);
                    rI.rotate(Math.PI / 2);
                    rI.beginPath();
                    for (let sA = 0; sA < 2; sA++) {
                        rI.moveTo(-10, -30);
                        rI.bezierCurveTo(-10, 6, 10, 6, 10, -30);
                        rI.scale(1, -1);
                    }
                    rI.lineWidth = 16;
                    rI.lineCap = "round";
                    rI.strokeStyle = this.getHurtColor("#bb3bc2");
                    rI.stroke();
                    rI.lineWidth -= 7;
                    rI.strokeStyle = "hsla(0,0%,100%,0.4)";
                    rI.stroke();
                    break;
                case cR.nigersaurus:
                    this.nig(rI);
                    break;
                case cR.furry:
                    this.uwu(rI);
                    break;
                case cR.dragonNest:
                    this.dragonNest(rI);
                    break;
                case cR.tumbleweed:
                    this.tumbleweed(rI);
                    break;
                case cR.statue:
                    if (!this.statuePlayer) {
                        this.statuePlayer = new lU(-1, 0, 0, 0, 1, cX.neutral, 25);
                        this.statuePlayer.isDead = true;
                        this.statuePlayer.isStatue = true;
                        this.statuePlayer.sadT = 1;
                        this.statuePlayer.hasGem = true;
                        this.statuePlayer.nick = "RuinedLiberty";
                        this.statuePlayer.isShiny = this.isShiny;
                    }
                    rI.rotate(Math.PI / 2);
                    this.statuePlayer.hurtT = this.hurtT;
                    this.statuePlayer.size = this.size;
                    this.statuePlayer.draw(rI);
                    break;
                case cR.turtle:
                    this.turtle(rI);
                    break;
                case cR.petalTurtle:
                    rI.save();
                    rI.scale2(this.size / 100);
                    rI.rotate(Date.now() / 400 % 6.28);
                    this.drawTurtleShell(rI, 1.5);
                    rI.restore();
                    break;
                case cR.petalSuspill:
                    rI.scale2(this.size / 20);
                    rI.beginPath();
                    rI.moveTo(0, -5);
                    rI.lineTo(-8, 0);
                    rI.lineTo(0, 5);
                    rI.lineTo(8, 0);
                    rI.closePath();
                    rI.lineCap = rI.lineJoin = "round";
                    rI.lineWidth = 32;
                    rI.strokeStyle = this.getHurtColor("#393cb3");
                    rI.stroke();
                    rI.lineWidth = 20;
                    rI.strokeStyle = this.getHurtColor("#6265eb");
                    rI.stroke();
                    break;
                case cR.petalAntidote:
                    rI.scale2(this.size / 20);
                    rI.beginPath();
                    rI.moveTo(-5, -5);
                    rI.lineTo(-5, 5);
                    rI.lineTo(5, 0);
                    rI.closePath();
                    rI.lineCap = rI.lineJoin = "round";
                    rI.lineWidth = 32;
                    rI.strokeStyle = this.getHurtColor("#76ad45");
                    rI.stroke();
                    rI.lineWidth = 20;
                    rI.strokeStyle = this.getHurtColor("#a2eb62");
                    rI.stroke();
                    break;
                case cR.petalFire:
                    this.makeFire(rI, "rgb(222,111,44)");
                    break;
                case cR.petalGas:
                    this.makeFire(rI, "#38c125");
                    break;
                case cR.petalNitro:
                    this.makeFire(rI, "#15cee5");
                    break;
                case cR.beehive:
                    this.beehive(rI);
                    break;
                case cR.ghost:
                    this.ghost(rI);
                    break;
                case cR.pacman:
                    this.pacman(rI);
                    break;
                case cR.petalPacman:
                    this.pacman(rI, true);
                    break;
                case cR.petalBanana:
                    this.petalBanana(rI);
                    break;
                case cR.petalTaco:
                    this.petalTaco(rI);
                    break;
                case cR.petalHoney:
                    rI.scale2(this.size / 25);
                    lF(rI, 25);
                    rI.lineJoin = "round";
                    rI.fillStyle = this.getHurtColor("#ffd941");
                    rI.strokeStyle = this.getHurtColor("#c8a826");
                    rI.fill();
                    rI.stroke();
                    break;
                case cR.petalWave:
                    rI.translate(-this.size, 0);
                    const rO = Date.now() / 50;
                    const rP = this.size * 2;
                    rI.beginPath();
                    const rQ = 50;
                    for (let sB = 0; sB < rQ; sB++) {
                        const sC = sB / rQ;
                        const sD = sC * Math.PI * (this.isIcon ? 7.75 : 10) - rO;
                        const sE = sC * rP;
                        const sF = sE * this.rectAscend;
                        rI.lineTo(sE, Math.sin(sD) * sF);
                    }
                    rI.strokeStyle = "#fff";
                    rI.lineJoin = rI.lineCap = "round";
                    rI.lineWidth = 4;
                    rI.shadowColor = "#34f6ff";
                    rI.shadowBlur = this.isIcon ? 10 : 20;
                    rI.stroke();
                    rI.stroke();
                    rI.stroke();
                    break;
                case cR.petalSnail:
                    rI.scale2(this.size / 55);
                    this.drawSnailShell(rI);
                    break;
                case cR.petalBone:
                    rI.scale2(this.size / 20);
                    rI.beginPath();
                    for (let sG = 0; sG < 2; sG++) {
                        rI.moveTo(-23, -5);
                        rI.quadraticCurveTo(0, 5.5, 23, -5);
                        rI.scale(1, -1);
                    }
                    rI.lineWidth = 15;
                    rI.lineCap = "round";
                    rI.strokeStyle = this.getHurtColor("#cccccc");
                    rI.stroke();
                    rI.lineWidth -= 6;
                    rI.strokeStyle = this.getHurtColor("#ffffff");
                    rI.stroke();
                    break;
                case cR.petalCoffee:
                    rI.scale2(this.size / 35);
                    rI.beginPath();
                    rI.ellipse(0, 0, 40, 29, 0, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#924614");
                    rI.fill();
                    rI.clip();
                    rI.strokeStyle = "rgba(0,0,0,0.3)";
                    rI.lineWidth = 18;
                    rI.stroke();
                    rI.beginPath();
                    rI.moveTo(-30, 0);
                    rI.bezierCurveTo(-15, -20, 15, 10, 30, 0);
                    rI.bezierCurveTo(15, 20, -15, -10, -30, 0);
                    rI.lineWidth = 3;
                    rI.lineCap = rI.lineJoin = "round";
                    rI.strokeStyle = rI.fillStyle = "#3f1803";
                    rI.fill();
                    rI.stroke();
                    break;
                case cR.rock:
                    if (this.pathSize !== this.nSize) {
                        this.pathSize = this.nSize;
                        const sH = new Path2D();
                        const sI = Math.round(this.nSize * (this.nSize < 200 ? 0.2 : 0.15));
                        const sJ = Math.PI * 2 / sI;
                        const sK = this.nSize < 100 ? 0.3 : 0.1;
                        for (let sL = 0; sL < sI; sL++) {
                            const sM = sL * sJ;
                            const sN = sM + Math.random() * sJ;
                            const sO = 1 - Math.random() * sK;
                            sH.lineTo(Math.cos(sN) * this.nSize * sO, Math.sin(sN) * this.nSize * sO);
                        }
                        sH.closePath();
                        this.path = sH;
                    }
                    rL = this.size / this.nSize;
                    rI.scale(rL, rL);
                    const rR = this.isPet ? li : ["#735d5f", "#4e3f40"];
                    rI.strokeStyle = this.getHurtColor(rR[1]);
                    rI.stroke(this.path);
                    rI.fillStyle = this.getHurtColor(rR[0]);
                    rI.fill(this.path);
                    break;
                case cR.cactus:
                    if (this.pathSize !== this.nSize) {
                        this.pathSize = this.nSize;
                        const sP = Math.round(this.nSize > 200 ? this.nSize * 0.18 : this.nSize * 0.25);
                        const sQ = 0.5;
                        const sR = 0.85;
                        this.path = lb(sP, this.nSize, sQ, sR);
                        if (this.nSize < 300) {
                            const sS = new Path2D();
                            const sT = sP * 2;
                            for (let sU = 0; sU < sT; sU++) {
                                const sV = (sU + 1) / sT * Math.PI * 2;
                                let sW = (sU % 2 === 0 ? 0.7 : 1.2) * this.nSize;
                                sS.lineTo(Math.cos(sV) * sW, Math.sin(sV) * sW);
                            }
                            sS.closePath();
                            this.spikePath = sS;
                        } else {
                            this.spikePath = null;
                        }
                    }
                    rL = this.size / this.nSize;
                    rI.scale(rL, rL);
                    if (this.spikePath) {
                        rI.fillStyle = this.getHurtColor("#333333");
                        rI.fill(this.spikePath);
                    }
                    rI.strokeStyle = this.getHurtColor("#288842");
                    rI.stroke(this.path);
                    rI.fillStyle = this.getHurtColor("#32a852");
                    rI.fill(this.path);
                    break;
                case cR.beetle:
                    rI.save();
                    rL = this.size / 40;
                    rI.scale(rL, rL);
                    rI.fillStyle = rI.strokeStyle = this.getHurtColor("#333333");
                    rI.lineCap = rI.lineJoin = "round";
                    for (let sX = 0; sX < 2; sX++) {
                        const sY = sX === 0 ? 1 : -1;
                        rI.save();
                        rI.translate(28, sY * 13);
                        rI.rotate(Math.sin(this.moveCounter * 1.24) * 0.1 * sY);
                        rI.beginPath();
                        rI.moveTo(0, sY * 6);
                        rI.lineTo(20, sY * 11);
                        rI.lineTo(40, 0);
                        rI.quadraticCurveTo(20, sY * 5, 0, 0);
                        rI.closePath();
                        rI.fill();
                        rI.stroke();
                        rI.restore();
                    }
                    rM = this.isPet ? li : ["#8f5db0", "#754a8f"];
                    rI.fillStyle = this.getHurtColor(rM[0]);
                    rI.fill(l6);
                    rI.lineWidth = 6;
                    rI.fillStyle = rI.strokeStyle = this.getHurtColor(rM[1]);
                    rI.stroke(l6);
                    rI.beginPath();
                    rI.moveTo(-21, 0);
                    rI.quadraticCurveTo(0, -3, 21, 0);
                    rI.lineCap = "round";
                    rI.lineWidth = 7;
                    rI.stroke();
                    const rS = [[-17, -13], [17, -13], [0, -17]];
                    rI.beginPath();
                    for (let sZ = 0; sZ < 2; sZ++) {
                        const t0 = sZ === 1 ? 1 : -1;
                        for (let t1 = 0; t1 < rS.length; t1++) {
                            let [t2, t3] = rS[t1];
                            t3 *= t0;
                            rI.moveTo(t2, t3);
                            rI.arc(t2, t3, 5, 0, l1);
                        }
                    }
                    rI.fill();
                    rI.fill();
                    rI.restore();
                    break;
                case cR.hornet:
                case cR.bee:
                    rI.save();
                    rL = this.size / 40;
                    rI.scale(rL, rL);
                    const rT = this.type === cR.hornet;
                    if (rT) {
                        rI.save();
                        rI.translate(-45, 0);
                        rI.rotate(Math.PI);
                        this.makeMissile(rI, 15 / 1.1);
                        rI.restore();
                    }
                    rM = this.isPet ? li : rT ? ["#ffd363", "#d3ad46"] : ["#ffe763", "#d3bd46"];
                    rI.beginPath();
                    rI.ellipse(0, 0, 40, 25, 0, 0, l1);
                    rI.lineWidth = 10;
                    rI.strokeStyle = this.getHurtColor(rM[1]);
                    rI.stroke();
                    rI.fillStyle = this.getHurtColor(rM[0]);
                    rI.fill();
                    rI.save();
                    rI.clip();
                    rI.beginPath();
                    const rU = [-30, -5, 22];
                    for (let t4 = 0; t4 < rU.length; t4++) {
                        const t5 = rU[t4];
                        rI.moveTo(t5, -50);
                        rI.quadraticCurveTo(t5 - 20, 0, t5, 50);
                    }
                    rI.lineWidth = 14;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    rI.restore();
                    if (rT) {
                        this.makeAntenna(rI);
                    } else {
                        this.makeBallAntenna(rI);
                    }
                    rI.restore();
                    break;
                case cR.scorpion:
                    rL = this.size / 50;
                    rI.scale(rL, rL);
                    const rV = 47;
                    rI.beginPath();
                    for (let t6 = 0; t6 < 8; t6++) {
                        let t7 = (0.25 + t6 % 4 / 3 * 0.4) * Math.PI + Math.sin(t6 + this.moveCounter * 1.3) * 0.2;
                        if (t6 >= 4) {
                            t7 *= -1;
                        }
                        rI.moveTo(0, 0);
                        rI.lineTo(Math.cos(t7) * rV, Math.sin(t7) * rV);
                    }
                    rI.lineWidth = 7;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.lineCap = "round";
                    rI.stroke();
                    rI.fillStyle = rI.strokeStyle = this.getHurtColor("#333333");
                    rI.lineCap = rI.lineJoin = "round";
                    rI.lineWidth = 6;
                    for (let t8 = 0; t8 < 2; t8++) {
                        const t9 = t8 === 0 ? 1 : -1;
                        rI.save();
                        rI.translate(22, t9 * 10);
                        rI.rotate(-(Math.sin(this.moveCounter * 1.6) * 0.5 + 0.5) * 0.07 * t9);
                        rI.beginPath();
                        rI.moveTo(0, t9 * 6);
                        rI.quadraticCurveTo(20, t9 * 15, 40, 0);
                        rI.quadraticCurveTo(20, t9 * 5, 0, 0);
                        rI.closePath();
                        rI.fill();
                        rI.stroke();
                        rI.restore();
                    }
                    rI.lineWidth = 8;
                    la(rI, 1, 8, this.getHurtColor("#c69a2c"), this.getHurtColor("#9e7d24"));
                    let rW;
                    rW = [[11, 20], [-5, 21], [-23, 19], [28, 11]];
                    rI.beginPath();
                    for (let ta = 0; ta < rW.length; ta++) {
                        const [tb, tc] = rW[ta];
                        rI.moveTo(tb, -tc);
                        rI.quadraticCurveTo(tb + Math.sign(tb) * 4.2, 0, tb, tc);
                    }
                    rI.lineCap = "round";
                    rI.stroke();
                    rI.translate(-33, 0);
                    la(rI, 0.45, 8, this.getHurtColor("#dbab2e"), this.getHurtColor("#b28b29"));
                    rI.beginPath();
                    rW = [[-5, 5], [6, 4]];
                    for (let td = 0; td < rW.length; td++) {
                        const [te, tf] = rW[td];
                        rI.moveTo(te, -tf);
                        rI.quadraticCurveTo(te - 3, 0, te, tf);
                    }
                    rI.lineWidth = 5;
                    rI.lineCap = "round";
                    rI.stroke();
                    rI.translate(17, 0);
                    rI.beginPath();
                    rI.moveTo(0, -9);
                    rI.lineTo(0, 9);
                    rI.lineTo(11, 0);
                    rI.closePath();
                    rI.lineJoin = rI.lineCap = "round";
                    rI.lineWidth = 6;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.fillStyle = this.getHurtColor("#444444");
                    rI.fill();
                    rI.stroke();
                    break;
                case cR.ladybug:
                    this.makeLadybug(rI, "#e94034", "#b53229", "#000000");
                    break;
                case cR.darkLadybug:
                    this.makeLadybug(rI, "#962921", "#79211b", "#be342a");
                    break;
                case cR.yellowLadybug:
                    this.makeLadybug(rI, "#ebeb34", "#bebe2a", "#000000");
                    break;
                case cR.bush:
                    rL = this.size / 70;
                    rI.scale2(rL);
                    rI.fillStyle = this.getHurtColor("#33a853");
                    rI.fill(ld);
                    rI.clip(ld);
                    rI.lineWidth = 15;
                    rI.strokeStyle = "rgba(0, 0, 0, 0.2)";
                    rI.stroke(ld);
                    rI.lineCap = "round";
                    rI.lineWidth = 7;
                    rI.strokeStyle = "rgba(0, 0, 0, 0.15)";
                    rI.stroke(le);
                    break;
                case cR.petalSponge:
                    rI.scale2(this.size / 40);
                    this.makeSponge(rI, 50, 30, 7);
                    break;
                case cR.sponge:
                    rI.scale2(this.size / 100);
                    this.makeSponge(rI);
                    rI.fillStyle = rI.strokeStyle;
                    const rX = 6;
                    const rY = 3;
                    rI.beginPath();
                    for (let tg = 0; tg < rX; tg++) {
                        const th = tg / rX * Math.PI * 2;
                        rI.save();
                        rI.rotate(th);
                        for (let ti = 0; ti < rY; ti++) {
                            const tj = ti / rY;
                            const tk = 18 + tj * 68;
                            const tl = 7 + tj * 6;
                            rI.moveTo(tk, 0);
                            rI.arc(tk, 0, tl, 0, Math.PI * 2);
                        }
                        rI.restore();
                    }
                    rI.fill();
                    break;
                case cR.crab:
                    rL = this.size / 49;
                    rI.scale2(rL);
                    rI.lineCap = rI.lineJoin = "round";
                    rN = this.moveCounter * 350;
                    const rZ = (Math.sin(rN * 0.01) * 0.5 + 0.5) * 0.1;
                    rI.strokeStyle = rI.fillStyle = this.getHurtColor("#333333");
                    rI.lineWidth = 3;
                    for (let tm = 0; tm < 2; tm++) {
                        rI.save();
                        const tn = tm * 2 - 1;
                        rI.scale(1, tn);
                        rI.translate(28, -39);
                        rI.scale(1.5, 1.5);
                        rI.rotate(rZ);
                        rI.beginPath();
                        rI.moveTo(0, 0);
                        rI.quadraticCurveTo(12, -8, 20, 3);
                        rI.lineTo(11, 1);
                        rI.lineTo(17, 9);
                        rI.quadraticCurveTo(12, 5, 0, 6);
                        rI.closePath();
                        rI.stroke();
                        rI.fill();
                        rI.restore();
                    }
                    rI.beginPath();
                    for (let to = 0; to < 2; to++) {
                        for (let tp = 0; tp < 4; tp++) {
                            const tq = to * 2 - 1;
                            const tr = (Math.sin(rN * 0.005 + to + tp * 2) * 0.5 + 0.5) * 0.5;
                            rI.save();
                            rI.scale(1, tq);
                            rI.translate(tp / 3 * 30 - 15, 40);
                            const ts = tp < 2 ? 1 : -1;
                            rI.rotate(tr * ts);
                            rI.moveTo(0, 0);
                            rI.translate(0, 25);
                            rI.lineTo(0, 0);
                            rI.rotate(ts * 0.7 * (tr + 0.3));
                            rI.lineTo(0, 10);
                            rI.restore();
                        }
                    }
                    rI.lineWidth = 10;
                    rI.stroke();
                    rI.beginPath();
                    rI.moveTo(2, 23);
                    rI.quadraticCurveTo(23, 0, 2, -23);
                    rI.lineTo(-10, -15);
                    rI.lineTo(-10, 15);
                    rI.closePath();
                    rI.strokeStyle = this.getHurtColor("#b05a3c");
                    rI.lineWidth = 68;
                    rI.lineCap = rI.lineJoin = "round";
                    rI.stroke();
                    rI.lineWidth -= 18;
                    rI.strokeStyle = this.getHurtColor("#dc704b");
                    rI.stroke();
                    rI.strokeStyle = "rgba(0,0,0,0.2)";
                    rI.beginPath();
                    const s0 = 18;
                    for (let tu = 0; tu < 2; tu++) {
                        rI.moveTo(-18, s0);
                        rI.quadraticCurveTo(0, -7 + s0, 18, s0);
                        rI.scale(1, -1);
                    }
                    rI.lineWidth = 9;
                    rI.stroke();
                    break;
                case cR.starfish:
                    rL = this.size / 80;
                    rI.scale2(rL);
                    rI.rotate(Date.now() / 2000 % l1 + this.moveCounter * 0.4);
                    const s1 = 5;
                    if (!this.legD) {
                        this.legD = Array(s1).fill(100);
                    }
                    const s3 = this.legD;
                    const s4 = this.isDead ? 0 : Math.floor(this.nHealth * (s1 - 1));
                    rI.beginPath();
                    for (let tv = 0; tv < s1; tv++) {
                        const tw = (tv + 0.5) / s1 * Math.PI * 2;
                        const tx = (tv + 1) / s1 * Math.PI * 2;
                        s3[tv] += ((tv < s4 ? 100 : 60) - s3[tv]) * 0.2;
                        const ty = s3[tv];
                        if (tv === 0) {
                            rI.moveTo(ty, 0);
                        }
                        rI.quadraticCurveTo(Math.cos(tw) * 5, Math.sin(tw) * 5, Math.cos(tx) * ty, Math.sin(tx) * ty);
                    }
                    rI.closePath();
                    rI.lineCap = rI.lineJoin = "round";
                    rI.lineWidth = 38;
                    rI.strokeStyle = this.getHurtColor("#a33b15");
                    rI.stroke();
                    rI.lineWidth = 26;
                    rI.strokeStyle = rI.fillStyle = this.getHurtColor("#d9511f");
                    rI.fill();
                    rI.stroke();
                    rI.beginPath();
                    for (let tz = 0; tz < s1; tz++) {
                        const tA = tz / s1 * Math.PI * 2;
                        rI.save();
                        rI.rotate(tA);
                        const tB = s3[tz] / 100;
                        let tC = 26;
                        const tD = 4;
                        for (let tE = 0; tE < tD; tE++) {
                            const tF = (1 - tE / tD * 0.7) * 12 * tB;
                            rI.moveTo(tC, 0);
                            rI.arc(tC, 0, tF, 0, Math.PI * 2);
                            tC += tF * 2 + tB * 3.5;
                        }
                        rI.restore();
                    }
                    rI.fillStyle = "hsla(0,0%,100%,0.25)";
                    rI.fill();
                    break;
                case cR.petalStarfish:
                    rL = this.size / 30;
                    rI.scale2(rL);
                    rI.translate(-34, 0);
                    rI.beginPath();
                    rI.moveTo(0, -8);
                    rI.quadraticCurveTo(155, 0, 0, 8);
                    rI.closePath();
                    rI.lineCap = rI.lineJoin = "round";
                    rI.lineWidth = 26;
                    rI.strokeStyle = this.getHurtColor("#a33b15");
                    rI.stroke();
                    rI.lineWidth = 16;
                    rI.strokeStyle = rI.fillStyle = this.getHurtColor("#d9511f");
                    rI.fill();
                    rI.stroke();
                    rI.beginPath();
                    let s5 = 13;
                    for (let tG = 0; tG < 4; tG++) {
                        const tH = (1 - tG / 4 * 0.7) * 10;
                        rI.moveTo(s5, 0);
                        rI.arc(s5, 0, tH, 0, Math.PI * 2);
                        s5 += tH * 2 + 4;
                    }
                    rI.fillStyle = "hsla(0,0%,100%,0.25)";
                    rI.fill();
                    break;
                case cR.sandstorm:
                    rL = this.size / 100;
                    rI.scale(rL, rL);
                    rI.lineJoin = rI.lineCap = "round";
                    rI.strokeStyle = "#222";
                    rI.lineWidth = 20;
                    const s6 = [1, 0.63, 0.28];
                    const s7 = this.isPet ? lp : ["#ebda8d", "#e0c85c", "#d6b936"];
                    const s8 = pQ * 0.005 % l1;
                    for (let tI = 0; tI < 3; tI++) {
                        const tJ = s6[tI];
                        const tK = s7[tI];
                        rI.save();
                        rI.rotate(s8 * (tI % 2 === 0 ? -1 : 1));
                        rI.beginPath();
                        const tL = 7 - tI;
                        for (let tM = 0; tM < tL; tM++) {
                            const tN = Math.PI * 2 * tM / tL;
                            rI.lineTo(Math.cos(tN) * tJ * 100, Math.sin(tN) * tJ * 100);
                        }
                        rI.closePath();
                        rI.strokeStyle = rI.fillStyle = this.getHurtColor(tK);
                        rI.fill();
                        rI.stroke();
                        rI.restore();
                    }
                    break;
                case cR.mobPetaler:
                    rL = this.size / 65;
                    rI.scale(rL, rL);
                    rN = this.moveCounter * 2;
                    rI.rotate(Math.PI / 2);
                    if (this.visible) {
                        const tO = 3;
                        rI.beginPath();
                        for (let tS = 0; tS < 2; tS++) {
                            for (let tT = 0; tT <= tO; tT++) {
                                const tU = tT / tO * 80 - 40;
                                rI.save();
                                const tV = tS * 2 - 1;
                                rI.translate(tV * -45, tU);
                                const tW = 1.1 + Math.sin(tT / tO * Math.PI) * 0.5;
                                rI.scale(tW * tV, tW);
                                rI.rotate(Math.sin(rN + tT + tV) * 0.3 + 0.3);
                                rI.moveTo(0, 0);
                                rI.quadraticCurveTo(-15, -5, -20, 10);
                                rI.restore();
                            }
                        }
                        rI.strokeStyle = this.getHurtColor("#333333");
                        rI.lineWidth = 8;
                        rI.lineCap = rI.lineJoin = "round";
                        rI.stroke();
                        rI.lineWidth = 12;
                        const tP = Date.now() * 0.01;
                        const tQ = Math.sin(tP * 0.5) * 0.5 + 0.5;
                        const tR = tQ * 0.1 + 1;
                        rI.beginPath();
                        rI.arc(tR * -15, 43 - tQ, 16, 0, Math.PI);
                        rI.arc(tR * 15, 43 - tQ, 16, 0, Math.PI);
                        rI.moveTo(-22, -43);
                        rI.arc(0, -43 - tQ, 22, 0, Math.PI, true);
                        rI.strokeStyle = this.getHurtColor("#7d5098");
                        rI.stroke();
                        rI.fillStyle = this.getHurtColor("#8f5db0");
                        rI.fill();
                        rI.save();
                        rI.rotate(Math.PI * 3 / 2);
                        this.makeBallAntenna(rI, 26 - tQ, 0);
                        rI.restore();
                    }
                    if (!this.petalerDrop) {
                        const tX = dH[d8.Ultra];
                        const tY = Math.max(this.id % tX.length, 0);
                        const tZ = new lO(-1, 0, 0, tX[tY].id);
                        tZ.spawnT = 1;
                        tZ.angle = 0;
                        this.petalerDrop = tZ;
                    }
                    rI.scale2(1.3);
                    this.petalerDrop.draw(rI);
                    break;
                case cR.petalStick:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    rI.moveTo(-17, 0);
                    rI.lineTo(0, 0);
                    rI.lineTo(17, 6);
                    rI.moveTo(0, 0);
                    rI.lineTo(11, -7);
                    rI.strokeStyle = this.getHurtColor("#654a19");
                    rI.lineCap = "round";
                    rI.lineWidth = 12;
                    rI.stroke();
                    rI.strokeStyle = this.getHurtColor("#7d5b1f");
                    rI.lineWidth = 6;
                    rI.stroke();
                    break;
                case cR.petalPoo:
                    rL = this.size / 128;
                    rI.scale2(rL);
                    rI.translate(-128, -120);
                    rI.fillStyle = this.getHurtColor("#634002");
                    rI.fill(f8.poopPath);
                    rI.strokeStyle = this.getHurtColor("#503402");
                    rI.lineWidth = 20;
                    rI.stroke(f8.poopPath);
                    break;
                case cR.petalDandelion:
                    rL = this.size / 25;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    rI.moveTo(-25, 0);
                    rI.lineTo(-45, 0);
                    rI.lineCap = "round";
                    rI.lineWidth = 20;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(0, 0, 25, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#ffffff");
                    rI.fill();
                    rI.lineWidth = 7;
                    rI.strokeStyle = this.getHurtColor("#cfcfcf");
                    rI.stroke();
                    break;
                case cR.guardian:
                    rI.rotate(-this.angle);
                    rI.scale2(this.size / 20);
                    this.drawWingAndHalo(rI);
                    rI.beginPath();
                    rI.arc(0, 0, 20, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#ffffff");
                    rI.fill();
                    rI.clip();
                    rI.lineWidth = 12;
                    rI.strokeStyle = "rgba(0,0,0,0.2)";
                    rI.stroke();
                    break;
                case cR.dragon:
                    rI.scale2(this.size / 100);
                    this.drawDragon(rI);
                    break;
                case cR.shell:
                    this.drawShell(rI, true);
                    break;
                case cR.petalShell:
                    this.drawShell(rI, false);
                    break;
                case cR.petalRice:
                    rL = this.size / 10;
                    rI.scale2(rL);
                    rI.beginPath();
                    rI.moveTo(0, 8);
                    rI.quadraticCurveTo(2.5, 0, 0, -8);
                    rI.lineCap = "round";
                    rI.lineWidth = 10;
                    rI.strokeStyle = this.getHurtColor("#cfcfcf");
                    rI.stroke();
                    rI.strokeStyle = this.getHurtColor("#ffffff");
                    rI.lineWidth = 6;
                    rI.stroke();
                    break;
                case cR.petalPincer:
                    rL = this.size / 10;
                    rI.scale2(rL);
                    rI.translate(7, 0);
                    rI.lineCap = "round";
                    rI.beginPath();
                    rI.moveTo(-5, -5);
                    rI.bezierCurveTo(-20, -5, -20, 7, 0, 5);
                    rI.bezierCurveTo(-10, 3, -10, -3, -5, -5);
                    rI.fillStyle = this.getHurtColor("#333333");
                    rI.fill();
                    rI.strokeStyle = this.getHurtColor("#222222");
                    rI.lineWidth = 3;
                    rI.lineJoin = "round";
                    rI.stroke();
                    break;
                case cR.dandelion:
                    rL = this.size / 50;
                    rI.scale2(rL);
                    rI.beginPath();
                    for (let u0 = 0; u0 < 9; u0++) {
                        const u1 = u0 / 9 * Math.PI * 2;
                        const u2 = (1 + Math.cos(u0 / 9 * Math.PI * 3.5) * 0.07) * 60;
                        rI.moveTo(0, 0);
                        rI.lineTo(Math.cos(u1) * u2, Math.sin(u1) * u2);
                    }
                    rI.lineCap = "round";
                    rI.lineWidth = 16;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(0, 0, 50, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#ffffff");
                    rI.fill();
                    rI.lineWidth = 6;
                    rI.strokeStyle = this.getHurtColor("#cfcfcf");
                    rI.stroke();
                    break;
                case cR.spider:
                    rI.save();
                    rL = this.size / 40;
                    rI.scale(rL, rL);
                    this.makeSpiderLegs(rI);
                    rI.fillStyle = this.getHurtColor(this.isPet ? li[0] : "#4f412e");
                    rI.strokeStyle = "rgba(0,0,0,0.15)";
                    rI.lineWidth = 16;
                    rI.beginPath();
                    rI.arc(0, 0, 44, 0, Math.PI * 2);
                    rI.fill();
                    rI.save();
                    rI.clip();
                    rI.stroke();
                    rI.restore();
                    rI.restore();
                    break;
                case cR.soldierAnt:
                case cR.workerAnt:
                case cR.babyAnt:
                case cR.soldierAntFire:
                case cR.workerAntFire:
                case cR.babyAntFire:
                case cR.queenAnt:
                case cR.queenAntFire:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    const s9 = Math.sin(this.moveCounter * 1.6);
                    const sa = this.typeStr.startsWith("soldierAnt");
                    const sb = this.typeStr.startsWith("queen");
                    const sc = this.typeStr.startsWith("babyAnt");
                    const sd = this.typeStr.startsWith("babyAnt") ? -4 : 0;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.lineCap = "round";
                    rI.lineWidth = 6;
                    if (sb) {
                        rI.translate(8, 0);
                    }
                    for (let u3 = 0; u3 < 2; u3++) {
                        const u4 = u3 === 0 ? -1 : 1;
                        rI.save();
                        rI.rotate(u4 * (s9 * 0.5 + 0.6) * 0.08);
                        const u5 = u4 * 4;
                        rI.beginPath();
                        rI.moveTo(0, u5);
                        rI.quadraticCurveTo(12, u4 * 6 + u5, 24, u5);
                        rI.stroke();
                        rI.restore();
                    }
                    if (this.isPet) {
                        rI.fillStyle = this.getHurtColor(li[0]);
                        rI.strokeStyle = this.getHurtColor(li[1]);
                    } else if (this.typeStr.endsWith("Fire")) {
                        rI.fillStyle = this.getHurtColor("#a82a00");
                        rI.strokeStyle = this.getHurtColor("#882200");
                    } else {
                        rI.fillStyle = this.getHurtColor("#555555");
                        rI.strokeStyle = this.getHurtColor("#454545");
                    }
                    rI.lineWidth = sb ? 9 : 12;
                    if (sb) {
                        rI.save();
                        rI.translate(-24, 0);
                        rI.scale(-1, 1);
                        lG(rI, 21, rI.fillStyle, rI.strokeStyle, rI.lineWidth);
                        rI.restore();
                    }
                    if (!sc) {
                        rI.save();
                        rI.beginPath();
                        rI.arc(-10, 0, sb ? 18 : 12, 0, l1);
                        rI.fill();
                        rI.clip();
                        rI.stroke();
                        rI.restore();
                    }
                    if (sa || sb) {
                        rI.save();
                        rI.fillStyle = this.getHurtColor("#eeeeee");
                        rI.globalAlpha *= 0.5;
                        const u6 = Math.PI / 7 * (sb ? 0.85 : 1) + s9 * 0.08;
                        for (let u7 = 0; u7 < 2; u7++) {
                            const u8 = u7 === 0 ? -1 : 1;
                            rI.save();
                            rI.rotate(u8 * u6);
                            rI.translate(sb ? -19 : -9, u8 * -3 * (sb ? 1.3 : 1));
                            rI.beginPath();
                            rI.ellipse(0, 0, sb ? 20 : 14, sb ? 8.5 : 6, 0, 0, l1);
                            rI.fill();
                            rI.restore();
                        }
                        rI.restore();
                    }
                    rI.save();
                    rI.translate(4 + sd, 0);
                    lG(rI, sc ? 20 : 12.1, rI.fillStyle, rI.strokeStyle, rI.lineWidth);
                    rI.restore();
                    break;
                case cR.antHole:
                    this.makeHole(rI, "#b58500");
                    break;
                case cR.antHoleFire:
                    this.makeHole(rI, "#b52d00");
                    break;
                case cR.spiderCave:
                    this.makeHole(rI, "#444444");
                    rI.globalAlpha *= 0.2;
                    lK(rI, this.size * 1.3, 4);
                    break;
                case cR.centipedeBody:
                case cR.centipedeHead:
                case cR.centipedeHeadPoison:
                case cR.centipedeBodyPoison:
                case cR.centipedeBodyDesert:
                case cR.centipedeHeadDesert:
                    rI.save();
                    rL = this.size / 40;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    for (let u9 = 0; u9 < 2; u9++) {
                        rI.save();
                        rI.scale(1, u9 * 2 - 1);
                        rI.translate(0, 35);
                        rI.moveTo(9, 0);
                        rI.lineTo(5, 10);
                        rI.lineTo(-5, 10);
                        rI.lineTo(-9, 0);
                        rI.lineTo(9, 0);
                        rI.restore();
                    }
                    rI.lineWidth = 18;
                    rI.lineJoin = rI.lineCap = "round";
                    rI.strokeStyle = rI.fillStyle = this.getHurtColor("#353331");
                    rI.fill();
                    rI.stroke();
                    let se;
                    if (this.typeStr.indexOf("Desert") > -1) {
                        se = ["#d3c66d", "#ada25b"];
                    } else if (this.typeStr.indexOf("Poison") > -1) {
                        se = ["#8f5db0", "#764b90"];
                    } else {
                        se = ["#8ac355", "#709e45"];
                    }
                    rI.beginPath();
                    rI.arc(0, 0, 40, 0, l1);
                    rI.fillStyle = this.getHurtColor(se[0]);
                    rI.fill();
                    rI.lineWidth = 8;
                    rI.strokeStyle = this.getHurtColor(se[1]);
                    rI.stroke();
                    if (this.typeStr.indexOf("Head") > -1) {
                        this.makeBallAntenna(rI, -15, 0, 1.25, 4);
                    }
                    rI.restore();
                    break;
                case cR.yoba:
                case cR.spiderYoba:
                    rN = Math.sin(Date.now() / 1000 + this.moveCounter * 0.7) * 0.5 + 0.5;
                    rL = this.size / 80;
                    rI.scale(rL, rL);
                    const sf = this.type === cR.spiderYoba;
                    if (sf) {
                        rI.save();
                        rI.scale(2, 2);
                        this.makeSpiderLegs(rI);
                        rI.restore();
                    }
                    rI.rotate(-this.angle);
                    rI.lineWidth = 10;
                    rI.beginPath();
                    rI.arc(0, 0, 80, 0, Math.PI * 2);
                    rM = this.isPet ? li : sf ? ["#f54ce7", "#cb37bf"] : ["#7af54c", "#5ec13a"];
                    rI.fillStyle = this.getHurtColor(rM[0]);
                    rI.fill();
                    rI.clip();
                    rI.strokeStyle = this.getHurtColor(rM[1]);
                    rI.stroke();
                    const sg = this.getHurtColor("#ffffff");
                    const sh = this.getHurtColor("#000000");
                    const si = (ua = 1) => {
                        rI.save();
                        rI.scale(ua, 1);
                        rI.translate(19 - rN * 4, -29 + rN * 5);
                        rI.beginPath();
                        rI.moveTo(0, 0);
                        rI.bezierCurveTo(6, -10, 30, -10, 45, -2);
                        rI.quadraticCurveTo(25, 5 + rN * 2, 0, 0);
                        rI.closePath();
                        rI.lineWidth = 3;
                        rI.stroke();
                        rI.fillStyle = sg;
                        rI.fill();
                        rI.clip();
                        rI.beginPath();
                        rI.arc(22 + ua * this.eyeX * 16, -4 + this.eyeY * 4, 6, 0, Math.PI * 2);
                        rI.fillStyle = sh;
                        rI.fill();
                        rI.restore();
                    };
                    si(1);
                    si(-1);
                    rI.save();
                    rI.translate(0, 10);
                    rI.beginPath();
                    rI.moveTo(-40 + rN * 10, -14 + rN * 5);
                    rI.quadraticCurveTo(0, +rN * 5, 44 - rN * 15, -14 + rN * 5);
                    rI.bezierCurveTo(20, 40 - rN * 20, -20, 40 - rN * 20, -40 + rN * 10, -14 + rN * 5);
                    rI.closePath();
                    rI.lineWidth = 5;
                    rI.stroke();
                    rI.fillStyle = sh;
                    rI.fill();
                    rI.clip();
                    const sj = rN * 2;
                    const sk = rN * -10;
                    rI.save();
                    rI.translate(0, sk);
                    rI.beginPath();
                    rI.moveTo(55, -8);
                    rI.bezierCurveTo(20, 38, -20, 38, -50, -8);
                    rI.strokeStyle = sg;
                    rI.lineWidth = 13;
                    rI.stroke();
                    rI.lineWidth = 4;
                    rI.strokeStyle = sh;
                    rI.beginPath();
                    for (let ua = 0; ua < 6; ua++) {
                        const ub = ((ua + 1) / 6 * 2 - 1) * 35;
                        rI.moveTo(ub, 10);
                        rI.lineTo(ub, 70);
                    }
                    rI.stroke();
                    rI.restore();
                    rI.save();
                    rI.translate(0, sj);
                    rI.beginPath();
                    rI.moveTo(-50, -20);
                    rI.quadraticCurveTo(0, 8, 50, -18);
                    rI.strokeStyle = sg;
                    rI.lineWidth = 13;
                    rI.stroke();
                    rI.lineWidth = 5;
                    rI.strokeStyle = sh;
                    rI.beginPath();
                    for (let uc = 0; uc < 6; uc++) {
                        let ud = ((uc + 1) / 7 * 2 - 1) * 50;
                        rI.moveTo(ud, -20);
                        rI.lineTo(ud, 2);
                    }
                    rI.stroke();
                    rI.restore();
                    rI.restore();
                    const sl = 1 - rN;
                    rI.globalAlpha *= Math.max(0, (sl - 0.3) / 0.7);
                    rI.beginPath();
                    for (let ue = 0; ue < 2; ue++) {
                        rI.save();
                        if (ue === 1) {
                            rI.scale(-1, 1);
                        }
                        rI.translate(-51 + rN * (10 + ue * 3.4) - ue * 3.4, -15 + rN * (5 - ue * 1));
                        rI.moveTo(10, 0);
                        rI.arc(0, 0, 10, 0, Math.PI / 2);
                        rI.restore();
                    }
                    rI.translate(0, 40);
                    rI.moveTo(40 - rN * 10, -14 + rN * 5);
                    rI.bezierCurveTo(20, 20 - rN * 10, -20, 20 - rN * 10, -40 + rN * 10, -14 + rN * 5);
                    rI.lineCap = "round";
                    rI.lineWidth = 2;
                    rI.stroke();
                    break;
                case cR.jellyfish:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    const sm = rI.globalAlpha;
                    rI.strokeStyle = rI.fillStyle = this.getHurtColor("#ffffff");
                    rI.globalAlpha = sm * 0.6;
                    rI.beginPath();
                    for (let uf = 0; uf < 10; uf++) {
                        const ug = uf / 10 * Math.PI * 2;
                        rI.save();
                        rI.rotate(ug);
                        rI.translate(17.5, 0);
                        rI.moveTo(0, 0);
                        const uh = Math.sin(ug + Date.now() / 500);
                        rI.rotate(uh * 0.5);
                        rI.quadraticCurveTo(4, uh * -2, 14, 0);
                        rI.restore();
                    }
                    rI.lineCap = "round";
                    rI.lineWidth = 2.3;
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(0, 0, 20, 0, Math.PI * 2);
                    rI.globalAlpha = sm * 0.5;
                    rI.fill();
                    rI.clip();
                    rI.lineWidth = 3;
                    rI.stroke();
                    rI.lineWidth = 1.2;
                    rI.globalAlpha = sm * 0.6;
                    rI.beginPath();
                    rI.lineCap = "round";
                    for (let ui = 0; ui < 4; ui++) {
                        rI.save();
                        rI.rotate(ui / 4 * Math.PI * 2);
                        rI.translate(4, 0);
                        rI.moveTo(0, -2);
                        rI.bezierCurveTo(6.5, -8, 6.5, 8, 0, 2);
                        rI.restore();
                    }
                    rI.stroke();
                    break;
                case cR.bubble:
                    this.bubble(rI);
                    break;
                case cR.petalBubble:
                    this.bubble(rI, true);
                    break;
                case cR.m28:
                    rI.scale2(this.size / 50);
                    rI.lineWidth = 25;
                    rI.lineJoin = "round";
                    const sn = this.isIcon ? 0.6 : Date.now() / 1200 % 6.28;
                    for (let uj = 0; uj < 10; uj++) {
                        const uk = 1 - uj / 10;
                        const ul = uk * 80 * (1 + (Math.sin(sn * 3 + uj * 0.5 + this.moveCounter) * 0.6 + 0.4) * 0.2);
                        rI.rotate(sn);
                        rI.strokeStyle = this.getHurtColor(lh[uj]);
                        rI.strokeRect(-ul / 2, -ul / 2, ul, ul);
                    }
                    break;
                case cR.petalDmca:
                    rI.scale2(this.size / 18);
                    rI.beginPath();
                    rI.moveTo(-25, -10);
                    rI.quadraticCurveTo(0, -2, 25, -10);
                    rI.quadraticCurveTo(30, 0, 25, 10);
                    rI.quadraticCurveTo(0, 2, -25, 10);
                    rI.quadraticCurveTo(-30, 0, -25, -10);
                    rI.closePath();
                    rI.lineJoin = "round";
                    rI.lineWidth = 4;
                    rI.strokeStyle = this.getHurtColor("#a17c4c");
                    rI.stroke();
                    rI.fillStyle = this.getHurtColor("#f2b971");
                    rI.fill();
                    rI.clip();
                    rI.beginPath();
                    rI.moveTo(25, -10);
                    rI.quadraticCurveTo(20, 0, 25, 10);
                    rI.lineTo(40, 10);
                    rI.lineTo(40, -10);
                    rI.fillStyle = "rgba(0,0,0,0.15)";
                    rI.fill();
                    rI.beginPath();
                    rI.moveTo(0, -10);
                    rI.quadraticCurveTo(-5, 0, 0, 10);
                    rI.lineWidth = 10;
                    rI.strokeStyle = this.getHurtColor("#b0473b");
                    rI.stroke();
                    break;
                case cR.petalLeaf:
                    rL = this.size / 12;
                    rI.scale(rL, rL);
                    rI.rotate(-Math.PI / 6);
                    rI.translate(-12, 0);
                    rI.beginPath();
                    rI.moveTo(-5, 0);
                    rI.lineTo(0, 0);
                    rI.lineWidth = 4;
                    rI.lineCap = rI.lineJoin = "round";
                    rI.strokeStyle = this.getHurtColor("#2e933c");
                    rI.stroke();
                    rI.beginPath();
                    rI.moveTo(0, 0);
                    rI.quadraticCurveTo(10, -20, 30, 0);
                    rI.quadraticCurveTo(10, 20, 0, 0);
                    rI.lineWidth = 6;
                    rI.fillStyle = this.getHurtColor("#39b54a");
                    rI.stroke();
                    rI.fill();
                    rI.beginPath();
                    rI.moveTo(6, 0);
                    rI.quadraticCurveTo(14, -2, 22, 0);
                    rI.lineWidth = 3.5;
                    rI.stroke();
                    break;
                case cR.petalRock:
                    rK("petalRock", "#735d5f", "#4e3f40");
                    break;
                case cR.petalSoil:
                    rK("petalSoil", "#695118", "#554213");
                    break;
                case cR.petalWeb:
                    rK("petalWeb", "#ffffff", "#cfcfcf");
                    break;
                case cR.petalSalt:
                    rK("petalSalt", "#ffffff", "#cfcfcf");
                    break;
                case cR.petalCement:
                    rK("petalSalt", "#D2D1CD", "#A8A7A4");
                    break;
                case cR.petalArrow:
                    const so = this.isIcon ? 60 : this.size * 2;
                    rI.translate(-this.size - 10, 0);
                    rI.lineJoin = rI.lineCap = "round";
                    rI.beginPath();
                    rI.moveTo(0, 0);
                    rI.lineTo(so, 0);
                    rI.lineWidth = 6;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(10, 0, 5, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#222222");
                    rI.fill();
                    rI.translate(so, 0);
                    rI.beginPath();
                    rI.moveTo(13, 0);
                    rI.lineTo(0, -3.5);
                    rI.lineTo(0, 3.5);
                    rI.closePath();
                    rI.strokeStyle = rI.fillStyle;
                    rI.fill();
                    rI.lineWidth = 3;
                    rI.stroke();
                    break;
                case cR.petalLightsaber:
                    const sp = this.size * 2;
                    const sq = 10;
                    rI.translate(-this.size, 0);
                    rI.lineCap = "round";
                    rI.shadowColor = "#34f6ff";
                    rI.beginPath();
                    rI.moveTo(0, 0);
                    rI.lineTo(-sq * 1.8, 0);
                    rI.strokeStyle = "#555";
                    rI.lineWidth = sq * 1.4;
                    rI.stroke();
                    rI.strokeStyle = "#888";
                    rI.lineWidth *= 0.7;
                    rI.stroke();
                    rI.beginPath();
                    rI.moveTo(0, 0);
                    rI.lineTo(-sq * 0.45, 0);
                    rI.strokeStyle = "#555";
                    rI.lineWidth = sq * 2 + 3.5;
                    rI.stroke();
                    rI.strokeStyle = "#999";
                    rI.lineWidth = sq * 2;
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(0, 0, sq, 0, Math.PI * 2);
                    rI.fillStyle = "#eee";
                    rI.fill();
                    rI.strokeStyle = "#fff";
                    rI.beginPath();
                    const sr = Date.now() * 0.001 % 1;
                    const ss = sr * sp;
                    const st = sp * 0.2;
                    rI.moveTo(Math.max(ss - st, 0), 0);
                    rI.lineTo(Math.min(ss + st, sp), 0);
                    const su = Math.sin(sr * Math.PI);
                    rI.shadowBlur = sq * 3 * su;
                    rI.lineWidth = sq;
                    rI.stroke();
                    rI.stroke();
                    rI.beginPath();
                    rI.moveTo(0, 0);
                    rI.lineTo(sp, 0);
                    rI.lineWidth = sq;
                    rI.shadowBlur = sq;
                    rI.stroke();
                    break;
                case cR.petalEgg:
                case cR.petalAntEgg:
                case cR.petalYobaEgg:
                case cR.petalDragonEgg:
                case cR.petalSpiderEgg:
                case cR.petalRockEgg:
                    rL = this.size / 35;
                    rI.scale2(rL);
                    rI.beginPath();
                    if (this.type !== cR.petalAntEgg && this.type !== cR.petalSpiderEgg) {
                        rI.ellipse(0, 0, 30, 40, 0, 0, l1);
                    } else {
                        rI.arc(0, 0, 35, 0, l1);
                    }
                    rM = ls[this.type] || ["#fff0b8", "#cfc295"];
                    rI.fillStyle = this.getHurtColor(rM[0]);
                    rI.fill();
                    rI.strokeStyle = this.getHurtColor(rM[1]);
                    rI.stroke();
                    break;
                case cR.petalLightning:
                    rI.lineWidth = 4;
                    rI.lineCap = rI.lineJoin = "miter";
                    rK("petalLightning", "#29f2e5", "#21c4b9");
                    break;
                case cR.petalCotton:
                    rK("petalCotton", "#ffffff", "#cfcfcf");
                    break;
                case cR.petalWing:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    if (!this.isIcon) {
                        rI.rotate(pQ / 100 % 6.28);
                    }
                    rI.beginPath();
                    rI.arc(0, 0, 20, 0, Math.PI);
                    rI.quadraticCurveTo(0, 12, 20, 0);
                    rI.closePath();
                    rI.lineJoin = rI.lineCap = "round";
                    rI.lineWidth *= 0.7;
                    rI.fillStyle = this.getHurtColor("#ffffff");
                    rI.fill();
                    rI.strokeStyle = this.getHurtColor("#cfcfcf");
                    rI.stroke();
                    break;
                case cR.petalCactus:
                    rI.lineWidth *= 0.7;
                    rK("petalCactus", "#38c75f", "#2da14d");
                    rI.beginPath();
                    rI.arc(0, 0, 0.6, 0, l1);
                    rI.fillStyle = "hsla(0,0%,100%,0.3)";
                    rI.fill();
                    break;
                case cR.petalSand:
                    rI.lineWidth *= 0.8;
                    rK("petalSand", "#e0c85c", "#b5a24b");
                    break;
                case cR.petalPowder:
                    rL = this.size / 10;
                    rI.scale(rL, rL);
                    if (!this.powderPath || pQ - this.powderTime > 20) {
                        this.powderTime = pQ;
                        const um = new Path2D();
                        for (let un = 0; un < 10; un++) {
                            const uo = (Math.random() * 2 - 1) * 7;
                            const up = (Math.random() * 2 - 1) * 7;
                            um.moveTo(uo, up);
                            um.arc(uo, up, 5, 0, l1);
                        }
                        this.powderPath = um;
                    }
                    rI.fillStyle = this.getHurtColor("#eeeeee");
                    rI.fill(this.powderPath);
                    break;
                case cR.petalShrinker:
                case cR.petalExpander:
                    rL = this.size / 30;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    const sv = 1 / 3;
                    for (let uq = 0; uq < 3; uq++) {
                        const ur = uq / 3 * Math.PI * 2;
                        rI.moveTo(0, 0);
                        rI.arc(0, 0, 30, ur, ur + Math.PI / 3);
                    }
                    rI.lineCap = "round";
                    rI.lineWidth = 10;
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(0, 0, 15, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor(this.type === cR.petalShrinker ? "#ff3333" : "#7777ff");
                    rI.fill();
                    rI.stroke();
                    break;
                case cR.petalPollen:
                    rJ("#ffe763", "#cfbb50");
                    break;
                case cR.petalFaster:
                    rJ("#feffc9", "#cecfa3");
                    break;
                case cR.petalBasic:
                case cR.petalLight:
                    rJ("#ffffff", "#cfcfcf");
                    break;
                case cR.petalSwastika:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    rI.rotate(-Math.PI / 4);
                    const sw = rI.lineWidth;
                    rI.lineWidth *= 1.5;
                    rI.beginPath();
                    rI.moveTo(-20, -20 - sw);
                    rI.lineTo(-20, 0);
                    rI.lineTo(20, 0);
                    rI.lineTo(20, 20 + sw);
                    rI.rotate(Math.PI / 2);
                    rI.moveTo(-20, -20 - sw);
                    rI.lineTo(-20, 0);
                    rI.lineTo(20, 0);
                    rI.lineTo(20, 20 + sw);
                    rI.lineCap = rI.lineCap = "miter";
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.stroke();
                    break;
                case cR.petalIris:
                    rJ("#ce76db", "#a760b1");
                    break;
                case cR.petalRose:
                    rJ("#ff94c9", "#ce79a2");
                    break;
                case cR.petalPea:
                    rJ("#8ac255", "#709d45");
                    break;
                case cR.petalHeavy:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    rI.arc(0, 0, 20, 0, l1);
                    rI.fillStyle = this.getHurtColor("#333333");
                    rI.fill();
                    rI.clip();
                    rI.strokeStyle = this.getHurtColor("#222222");
                    rI.stroke();
                    rI.beginPath();
                    rI.arc(5, -5, 5, 0, Math.PI * 2);
                    rI.fillStyle = this.getHurtColor("#cccccc");
                    rI.fill();
                    break;
                case cR.petalYinYang:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    const sx = (us, ut, uu = false) => {
                        rI.lineCap = "round";
                        rI.strokeStyle = this.getHurtColor(ut);
                        rI.fillStyle = this.getHurtColor(us);
                        rI.beginPath();
                        rI.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
                        rI.stroke();
                        rI.fill();
                    };
                    const sy = (us, ut) => {
                        rI.save();
                        rI.clip();
                        rI.lineCap = "round";
                        rI.fillStyle = this.getHurtColor(us);
                        rI.strokeStyle = this.getHurtColor(ut);
                        rI.fill();
                        rI.stroke();
                        rI.restore();
                    };
                    rI.lineCap = "round";
                    rI.beginPath();
                    rI.arc(0, 0, 20, 0, Math.PI * 2);
                    sy("#333333", "#222222");
                    rI.rotate(Math.PI);
                    rI.beginPath();
                    rI.arc(0, 0, 20, -Math.PI / 2, Math.PI / 2);
                    rI.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
                    rI.arc(0, -10, 10, Math.PI / 2, Math.PI * 3 / 2, true);
                    sy("#ffffff", "#cfcfcf");
                    rI.rotate(-Math.PI);
                    rI.beginPath();
                    rI.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
                    sy("#333333", "#222222");
                    break;
                case cR.petalMissile:
                    this.makeMissile(rI, this.size);
                    break;
                case cR.petalStinger:
                    rL = this.size / 40;
                    rI.scale(rL, rL);
                    rI.beginPath();
                    rI.moveTo(-30, -30);
                    rI.lineTo(20, 0);
                    rI.lineTo(-30, 30);
                    rI.closePath();
                    rI.strokeStyle = this.getHurtColor("#333333");
                    rI.fillStyle = this.getHurtColor("#444444");
                    rI.fill();
                    rI.lineWidth = 22;
                    rI.lineCap = rI.lineJoin = "round";
                    rI.stroke();
                    break;
                case cR.snail:
                    rI.scale2(this.size / 65);
                    rI.translate(-10, 10);
                    rI.lineJoin = rI.lineCap = "round";
                    rI.save();
                    rI.beginPath();
                    rI.moveTo(30, 0);
                    rI.translate(70 - (Math.sin(Date.now() / 400 + this.moveCounter * 0.8) * 0.5 + 0.5) * 4, 0);
                    rI.lineTo(0, 0);
                    rI.lineWidth = 42;
                    rI.strokeStyle = this.getHurtColor("#cf7030");
                    rI.stroke();
                    rI.strokeStyle = this.getHurtColor("#f7904b");
                    rI.lineWidth -= 12;
                    rI.stroke();
                    rI.beginPath();
                    for (let us = 0; us < 2; us++) {
                        rI.moveTo(9, 7);
                        rI.lineTo(40, 20);
                        rI.lineTo(7, 9);
                        rI.lineTo(9, 7);
                        rI.scale(1, -1);
                    }
                    rI.lineWidth = 3;
                    rI.fillStyle = rI.strokeStyle = "#333";
                    rI.stroke();
                    rI.fill();
                    rI.restore();
                    this.drawSnailShell(rI);
                    break;
                case cR.petalMagnet:
                    rL = this.size / 20;
                    rI.scale(rL, rL);
                    const sz = (ut = 1, uu, uv) => {
                        rI.save();
                        rI.scale(1, ut);
                        rI.beginPath();
                        rI.rect(-100, 0, 300, -300);
                        rI.clip();
                        rI.beginPath();
                        rI.moveTo(-20, 0);
                        rI.quadraticCurveTo(-18, -25, 17, -15);
                        rI.lineCap = "round";
                        rI.lineWidth = 22;
                        rI.strokeStyle = this.getHurtColor(uv);
                        rI.stroke();
                        rI.lineWidth = 14;
                        rI.strokeStyle = this.getHurtColor(uu);
                        rI.stroke();
                        rI.restore();
                    };
                    sz(1, "#a44343", "#853636");
                    sz(-1, "#4343a4", "#363685");
                    break;
                default:
                    rI.beginPath();
                    rI.arc(0, 0, this.size, 0, Math.PI * 2);
                    rI.fillStyle = "red";
                    rI.fill();
                    pK(rI, this.typeStr, 20, "#fff", 3);
            }
            rI.restore();
            this.shinyCol = null;
        }
        drawWingAndHalo(rI, rJ) {
            rJ = rJ || pQ / 300 + this.moveCounter * 0.3;
            const rK = Math.sin(rJ) * 0.5 + 0.5;
            rI.lineCap = "round";
            const rL = 4;
            for (let rM = 0; rM < 2; rM++) {
                rI.save();
                if (rM === 0) {
                    rI.beginPath();
                }
                for (let rN = 0; rN < 2; rN++) {
                    for (let rO = 0; rO < rL; rO++) {
                        rI.save();
                        if (rM > 0) {
                            rI.beginPath();
                        }
                        const rP = -0.19 - rO / rL * Math.PI * 0.25;
                        rI.rotate(rP + rK * 0.05);
                        rI.moveTo(0, 0);
                        const rQ = Math.sin(rJ + rO);
                        rI.translate(28 - (rQ * 0.5 + 0.5), 0);
                        rI.rotate(rQ * 0.08);
                        rI.lineTo(0, 0);
                        rI.quadraticCurveTo(0, 7, 5.5, 14);
                        if (rM > 0) {
                            rI.lineWidth = 6.5;
                            rI.strokeStyle = "hsl(60,60%," + (47 + rO / rL * 20) + "%)";
                            rI.stroke();
                        }
                        rI.restore();
                    }
                    rI.scale(-1, 1);
                }
                if (rM === 0) {
                    rI.lineWidth = 9;
                    rI.strokeStyle = "hsl(60,60%,30%)";
                    rI.stroke();
                }
                rI.restore();
            }
            rI.beginPath();
            rI.ellipse(0, -30 + Math.sin(rJ * 0.6) * 0.5, 11, 4.5, 0, 0, Math.PI * 2);
            rI.strokeStyle = "hsl(60,60%,30%)";
            rI.lineWidth = 5.5;
            rI.stroke();
            rI.shadowBlur = 5 + rK * 8;
            rI.shadowColor = "hsl(60,60%,60%)";
            rI.strokeStyle = rI.shadowColor;
            rI.lineWidth = 3.5;
            rI.stroke();
            rI.shadowBlur = 0;
        }
        drawDragon(rI) {
            const rJ = this.isPet ? lm.pet : lm.main;
            const rK = Date.now() / 500 + this.moveCounter;
            const rL = Math.sin(rK) - 0.5;
            rI.lineCap = rI.lineJoin = "round";
            const rM = 70;
            rI.save();
            rI.beginPath();
            for (let rN = 0; rN < 2; rN++) {
                rI.save();
                const rO = rN * 2 - 1;
                rI.scale(1, rO);
                rI.translate(20, rM);
                rI.rotate(rL * 0.1);
                rI.moveTo(0, 0);
                rI.lineTo(-10, 50);
                rI.quadraticCurveTo(50, 50, 100, 30);
                rI.quadraticCurveTo(50, 50, 100, 30);
                rI.quadraticCurveTo(30, 140, -80, 120 - rL * 20);
                rI.quadraticCurveTo(-10 + rL * 15, 110 - rL * 10, -40, 80 - rL * 10);
                rI.quadraticCurveTo(-10 + rL * 10, 60 + rL * 5, -60, 50 - Math.max(0, rL) * 10);
                rI.quadraticCurveTo(-10, 20 - rL * 10, -70, rL * 10);
                rI.restore();
            }
            rI.fillStyle = this.getHurtColor(rJ.wing);
            rI.fill();
            rI.lineWidth = 18;
            rI.strokeStyle = "rgba(0,0,0,0.2)";
            rI.clip();
            rI.stroke();
            rI.restore();
            rI.save();
            rI.translate(80, 0);
            rI.scale(2, 2);
            rI.beginPath();
            for (let rP = 0; rP < 2; rP++) {
                rI.scale(1, -1);
                rI.save();
                rI.translate(0, 15);
                rI.rotate((Math.sin(rK * 2) * 0.5 + 0.5) * 0.08);
                rI.moveTo(0, -4);
                rI.quadraticCurveTo(10, 0, 20, -6);
                rI.quadraticCurveTo(15, 3, 0, 5);
                rI.restore();
            }
            rI.fillStyle = rI.strokeStyle = "#333";
            rI.fill();
            rI.lineWidth = 6;
            rI.stroke();
            rI.restore();
            for (let rQ = 0; rQ < 2; rQ++) {
                const rR = rQ === 0;
                if (rR) {
                    rI.beginPath();
                }
                for (let rS = 4; rS >= 0; rS--) {
                    const rT = rS / 5;
                    const rU = 50 - rT * 45;
                    if (!rR) {
                        rI.beginPath();
                    }
                    rI.rect(-80 - rT * 80 - rU / 2, -rU / 2 + Math.sin(rT * Math.PI * 2 + rK * 3) * 8 * rT, rU, rU);
                    if (!rR) {
                        rI.lineWidth = 20;
                        rI.fillStyle = rI.strokeStyle = this.getHurtColor(rJ.tail[rS]);
                        rI.stroke();
                        rI.fill();
                    }
                }
                if (rR) {
                    rI.lineWidth = 34;
                    rI.strokeStyle = this.getHurtColor(rJ.tail_outline);
                    rI.stroke();
                }
            }
            rI.beginPath();
            rI.arc(0, 0, 100, 0, Math.PI * 2);
            rI.fillStyle = this.getHurtColor(rJ.body);
            rI.fill();
            rI.lineWidth = 36;
            rI.strokeStyle = "rgba(0,0,0,0.3)";
            rI.save();
            rI.clip();
            rI.stroke();
            rI.restore();
            rI.save();
            for (let rV = 0; rV < 2; rV++) {
                rI.beginPath();
                for (let rW = 0; rW < 2; rW++) {
                    rI.save();
                    const rX = rW * 2 - 1;
                    rI.scale(1, rX);
                    rI.translate(20, rM);
                    rI.rotate(rL * 0.1);
                    rI.moveTo(0, 10);
                    rI.lineTo(-10, 50);
                    rI.quadraticCurveTo(50, 50, 100, 30);
                    rI.quadraticCurveTo(50, 50, 100, 30);
                    rI.quadraticCurveTo(30, 140, -80, 120 - rL * 20);
                    rI.moveTo(100, 30);
                    rI.quadraticCurveTo(35, 90, -40, 80 - rL * 10);
                    rI.moveTo(-10, 50);
                    rI.quadraticCurveTo(-40, 50, -60, 50 - Math.max(0, rL) * 10);
                    rI.restore();
                }
                if (rV === 0) {
                    rI.lineWidth = 16;
                    rI.strokeStyle = this.getHurtColor(rJ.bone_outline);
                } else {
                    rI.lineWidth = 10;
                    rI.strokeStyle = this.getHurtColor(rJ.bone);
                }
                rI.stroke();
            }
            rI.restore();
        }
        makeLadybug(rI, rJ, rK, rL) {
            rI.save();
            const rM = this.size / 40;
            rI.scale(rM, rM);
            rJ = this.getHurtColor(rJ);
            rK = this.getHurtColor(rK);
            rL = this.getHurtColor(rL);
            const rN = Math.PI / 5;
            rI.lineCap = rI.lineJoin = "round";
            const rO = Math.sin(Date.now() / 300 + this.moveCounter * 0.2);
            const rP = rO * 0.3 + 0.7;
            rI.beginPath();
            rI.arc(22, 0, 23, 0, l1);
            rI.moveTo(0, 0);
            rI.arc(-5, 0, 33, 0, l1);
            rI.fillStyle = this.getHurtColor("#000000");
            rI.fill();
            rI.save();
            rI.translate(18, 0);
            for (let rS = 0; rS < 2; rS++) {
                rI.save();
                rI.scale(1, rS * 2 - 1);
                rI.rotate(Math.PI * 0.08 * rP);
                rI.translate(-18, 0);
                rI.beginPath();
                rI.arc(0, 0, 40, Math.PI, -rN);
                rI.quadraticCurveTo(20 - rP * 3, -15, 20, 0);
                rI.closePath();
                rI.fillStyle = rJ;
                rI.fill();
                const rT = "spotPath_" + rS;
                if (!this[rT]) {
                    const rU = new Path2D();
                    for (let rV = 0; rV < 2; rV++) {
                        const rW = (Math.random() * 2 - 1) * 40;
                        const rX = Math.random() * -40;
                        const rY = Math.random() * 9 + 8;
                        rU.moveTo(rW, rX);
                        rU.arc(rW, rX, rY, 0, l1);
                    }
                    this[rT] = rU;
                }
                rI.clip();
                rI.fillStyle = rL;
                rI.fill(this[rT]);
                rI.restore();
                rI.lineWidth = 7;
                rI.strokeStyle = rK;
                rI.stroke();
            }
            rI.restore();
            rI.save();
            let rQ = 9;
            rI.translate(42, 0);
            const rR = Math.PI * 3 - rO;
            rI.beginPath();
            for (let rZ = 0; rZ < 2; rZ++) {
                let s0 = 0;
                let s1 = 8;
                rI.moveTo(s0, s1);
                for (let s2 = 0; s2 < rQ; s2++) {
                    const s3 = s2 / rQ;
                    const s4 = s3 * rR;
                    const s5 = (1 - s3) * 15;
                    const s6 = Math.cos(s4) * s5;
                    const s7 = Math.sin(s4) * s5;
                    const s8 = s0 + s6;
                    const s9 = s1 + s7;
                    rI.quadraticCurveTo(s0 + s6 * 0.5 + s7 * 0.25, s1 + s7 * 0.5 - s6 * 0.25, s8, s9);
                    s0 = s8;
                    s1 = s9;
                }
                rI.scale(1, -1);
            }
            rI.lineCap = rI.lineJoin = "round";
            rI.lineWidth = 2;
            rI.strokeStyle = rI.fillStyle;
            rI.stroke();
            rI.restore();
            rI.restore();
        }
        makeSponge(rI, rJ = 100, rK = 80, rL = 18, rM = 8) {
            rI.beginPath();
            const rN = 1 / rL * Math.PI * 2;
            rI.moveTo(rK, 0);
            for (let rO = 0; rO < rL; rO++) {
                const rP = rO * rN;
                const rQ = (rO + 1) * rN;
                rI.bezierCurveTo(Math.cos(rP) * rJ, Math.sin(rP) * rJ, Math.cos(rQ) * rJ, Math.sin(rQ) * rJ, Math.cos(rQ) * rK, Math.sin(rQ) * rK);
            }
            rI.fillStyle = this.getHurtColor("#efc99b");
            rI.fill();
            rI.lineWidth = rM;
            rI.lineCap = rI.lineJoin = "round";
            rI.strokeStyle = this.getHurtColor("#c1a37d");
            rI.stroke();
        }
        getHurtColor(rI) {
            const rJ = 1 - this.hurtT;
            if (rJ >= 1 && this.poisonT === 0 && !this.hasSpawnImmunity && !this.isShiny) {
                return rI;
            }
            rI = hz(rI);
            if (this.hasSpawnImmunity) {
                rI = hx(rI, [255, 255, 255], 0.85 + Math.sin(pQ / 50) * 0.15);
            }
            if (this.poisonT > 0) {
                rI = hx(rI, [143, 93, 176], 1 - this.poisonT * 0.75);
            }
            rI = hx(rI, [255, 0, 0], rJ * 0.25 + 0.75);
            if (this.isShiny) {
                if (!this.shinyCol) {
                    let rK = pQ / 4;
                    if (!isNaN(this.id)) {
                        rK += this.id;
                    }
                    this.shinyCol = lI(rK % 360, 100, 50);
                }
                rI = hx(rI, this.shinyCol, 0.75);
            }
            return q2(rI);
        }
        deadPreDraw(rI) {
            this.shinyCol = null;
            if (this.isDead) {
                const rJ = Math.sin(this.deadT * Math.PI / 2);
                if (!this.rectAscend) {
                    const rK = 1 + rJ * 1;
                    rI.scale(rK, rK);
                }
                rI.globalAlpha *= 1 - rJ;
            }
        }
        makeAntenna(rI, rJ = true, rK = 1) {
            rI.beginPath();
            rK = rK * 8;
            rI.moveTo(35, -rK);
            rI.quadraticCurveTo(51, -2 - rK, 60, -12 - rK);
            rI.lineTo(35, -rK);
            rI.moveTo(35, rK);
            rI.quadraticCurveTo(51, 2 + rK, 60, 12 + rK);
            rI.lineTo(35, rK);
            const rL = "#333333";
            rI.fillStyle = rI.strokeStyle = rJ ? this.getHurtColor(rL) : "#333333";
            rI.fill();
            rI.lineCap = rI.lineJoin = "round";
            rI.lineWidth = 4;
            rI.stroke();
        }
        makeMissile(rI, rJ, rK = 1) {
            const rL = rJ / 30 * 1.1;
            rI.scale(rL, rL);
            rI.beginPath();
            rI.moveTo(-30, -17);
            rI.lineTo(30, 0);
            rI.lineTo(-30, 17);
            rI.closePath();
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#333333");
            rI.fill();
            rI.lineWidth = rK * 20;
            rI.lineCap = rI.lineJoin = "round";
            rI.stroke();
        }
        makeBallAntenna(rI, rJ = 0, rK = 0, rL = 1, rM = 5) {
            rI.save();
            rI.translate(rJ, rK);
            rI.scale(rL, rL);
            rI.beginPath();
            rI.moveTo(35, -8);
            rI.quadraticCurveTo(52, -5.5, 60, -20);
            rI.moveTo(35, 8);
            rI.quadraticCurveTo(52, 5.5, 60, 20);
            rI.fillStyle = rI.strokeStyle = this.getHurtColor("#333333");
            rI.lineCap = rI.lineJoin = "round";
            rI.lineWidth = rM;
            rI.stroke();
            rI.beginPath();
            const rN = Math.PI * 0.165;
            rI.ellipse(60, -20, 7, 9, rN, 0, l1);
            rI.ellipse(60, 20, 7, 9, -rN, 0, l1);
            rI.fill();
            rI.restore();
        }
    };
    var lI = (rI, rJ, rK) => {
        rJ /= 100;
        rK /= 100;
        const rL = rO => (rO + rI / 30) % 12;
        const rM = rJ * Math.min(rK, 1 - rK);
        const rN = rO => rK - rM * Math.max(-1, Math.min(rL(rO) - 3, Math.min(9 - rL(rO), 1)));
        return [rN(0) * 255, rN(8) * 255, rN(4) * 255];
    };
    function lJ(rI) {
        return -(Math.cos(Math.PI * rI) - 1) / 2;
    }
    function lK(rI, rJ, rK = 6, rL = "#fff") {
        const rM = rJ / 100;
        rI.scale(rM, rM);
        rI.beginPath();
        for (let rN = 0; rN < 12; rN++) {
            rI.moveTo(0, 0);
            const rO = rN / 12 * Math.PI * 2;
            rI.lineTo(Math.cos(rO) * 100, Math.sin(rO) * 100);
        }
        rI.lineWidth = rK;
        rI.fillStyle = rI.strokeStyle = rL;
        rI.lineCap = rI.lineJoin = "round";
        for (let rP = 0; rP < 5; rP++) {
            const rQ = rP / 5 * 100 + 10;
            lc(rI, 12, rQ, 0.5, 0.85);
        }
        rI.stroke();
    }
    var lL = class {
        constructor(rI, rJ, rK, rL, rM) {
            this.type = rI;
            this.id = rJ;
            this.x = rK;
            this.y = rL;
            this.size = rM;
            this.angle = Math.random() * l1;
            this.waveNumber = -1;
            this.isDead = false;
            this.spawnT = 0;
            this.deadT = 0;
            this.renderBelowEverything = true;
            this.waveShowTimer = 0;
            this.isPetal = true;
        }
        update() {
            if (this.spawnT < 1) {
                this.spawnT += pR / 200;
                if (this.spawnT > 1) {
                    this.spawnT = 1;
                }
            }
            if (this.isDead) {
                this.deadT += pR / 200;
            }
        }
        draw(rI) {
            rI.save();
            rI.translate(this.x, this.y);
            if (this.type === cR.web) {
                rI.rotate(this.angle);
                const rJ = this.size;
                const rK = pH(rI, "web_" + this.size, rJ * 2.2, rJ * 2.2, rM => {
                    rM.translate(rJ * 1.1, rJ * 1.1);
                    lK(rM, rJ);
                }, true);
                const rL = this.spawnT + this.deadT * 0.5;
                rI.globalAlpha = (1 - this.deadT) * 0.3;
                rI.scale(rL, rL);
                rI.drawImage(rK, -rK.worldW / 2, -rK.worldH / 2, rK.worldW, rK.worldH);
            } else if (this.type === cR.honeyTile) {
                let rM = this.spawnT + this.deadT * 0.5;
                rI.globalAlpha = 1 - this.deadT;
                rI.globalAlpha *= 0.9;
                const rN = 0.93 + (Math.sin(Date.now() / 400 + this.x + this.y) * 0.5 + 0.5) * 0.07;
                rM *= rN;
                const rO = this.size;
                const rP = pH(rI, "tile_" + this.size, rO * 2.2, rO * 2.2, rQ => {
                    rQ.translate(rO * 1.1, rO * 1.1);
                    const rR = rO / 100;
                    rQ.scale(rR, rR);
                    lF(rQ, 92);
                    rQ.lineJoin = rQ.lineCap = "round";
                    rQ.lineWidth = 40;
                    rQ.strokeStyle = "rgba(0,0,0,0.1)";
                    rQ.stroke();
                    rQ.fillStyle = "#fdda40";
                    rQ.strokeStyle = "#fbb257";
                    rQ.lineWidth = 14;
                    rQ.fill();
                    rQ.stroke();
                }, true);
                rI.scale(rM, rM);
                rI.drawImage(rP, -rP.worldW / 2, -rP.worldH / 2, rP.worldW, rP.worldH);
            } else if (this.type === cR.portal) {
                rI.scale2(this.size / 50);
                rI.lineJoin = "round";
                rI.save();
                this.waveShowTimer += (this.waveNumber >= 0 ? 1 : -1) * pR / 300;
                this.waveShowTimer = Math.min(1, Math.max(0, this.waveShowTimer));
                if (this.waveShowTimer > 0) {
                    rI.scale2(this.waveShowTimer);
                    rI.globalAlpha *= this.waveShowTimer;
                    rI.lineWidth = 0.1;
                    rI.strokeStyle = rI.fillStyle = "hsla(0,0%,100%,0.4)";
                    rI.textAlign = "center";
                    rI.font = "bolder 25px " + iB;
                    const rR = "WAVE" + (this.waveNumber + 1);
                    lS(rI, rR, 0, 0, 80, Math.PI * (rR.length * 0.09), true);
                }
                rI.restore();
                const rQ = this.isIcon ? 0.6 : (this.id + Date.now()) / 1200 % 6.28;
                rI.save();
                for (let rS = 0; rS < 8; rS++) {
                    const rT = 1 - rS / 8;
                    const rU = rT * 80;
                    rI.rotate(rQ);
                    rI.strokeStyle = "hsla(0,0%,100%,0.15)";
                    rI.beginPath();
                    rI.rect(-rU / 2, -rU / 2, rU, rU);
                    rI.closePath();
                    rI.lineWidth = 40;
                    rI.stroke();
                    rI.lineWidth = 20;
                    rI.stroke();
                }
                rI.restore();
                if (!this.portalPoints) {
                    this.portalPoints = [];
                    for (let rV = 0; rV < 30; rV++) {
                        this.portalPoints.push({
                            x: Math.random() + 1,
                            v: 0
                        });
                    }
                }
                for (let rW = 0; rW < this.portalPoints.length; rW++) {
                    const rX = this.portalPoints[rW];
                    rX.x += rX.v;
                    if (rX.x > 1) {
                        rX.x %= 1;
                        rX.angle = Math.random() * 6.28;
                        rX.v = Math.random() * 0.005 + 0.008;
                        rX.s = Math.random() * 0.025 + 0.008;
                    }
                    rI.save();
                    rI.globalAlpha = rX.x < 0.2 ? rX.x / 0.2 : rX.x > 0.8 ? 1 - (rX.x - 0.8) / 0.2 : 1;
                    rI.scale(90, 90);
                    rI.rotate(rX.angle);
                    rI.translate(rX.x, 0);
                    rI.beginPath();
                    rI.arc(0, 0, rX.s, 0, Math.PI * 2);
                    rI.fillStyle = "hsla(0,0%,100%,0.4)";
                    rI.fill();
                    rI.restore();
                }
            }
            rI.restore();
        }
    };
    var lM = 0;
    var lN = 0;
    var lO = class extends lL {
        constructor(rI, rJ, rK, rL) {
            super(cR.petalDrop, rI, rJ, rK, 70);
            this.angle = (Math.random() * 2 - 1) * 0.2;
            this.petal = dB[rL];
        }
        update() {
            if (this.spawnT < 2 || pQ - lM < 2500) {
                this.spawnT += pR / 300;
                return;
            }
            if (this.isDead) {
                this.deadT += pR / 200;
            }
            if (this.target) {
                this.x = px(this.x, this.target.x, 200);
                this.y = px(this.y, this.target.y, 200);
            }
        }
        draw(rI) {
            if (this.spawnT === 0) {
                return;
            }
            rI.save();
            rI.translate(this.x, this.y);
            const rJ = "petalDrop_" + this.petal.id;
            let rK = (this.cacheRendered || lN < 3) && pH(rI, rJ, 120, 120, rN => {
                this.cacheRendered = true;
                lN++;
                rN.translate(60, 60);
                rN.lineCap = rN.lineJoin = "round";
                rN.beginPath();
                rN.rect(-50, -50, 100, 100);
                rN.lineWidth = 18;
                rN.strokeStyle = "rgba(0,0,0,0.08)";
                rN.stroke();
                rN.lineWidth = 8;
                rN.fillStyle = hP[this.petal.tier];
                rN.fill();
                rN.strokeStyle = hQ[this.petal.tier];
                rN.stroke();
                const rO = pK(rN, this.petal.uiName, 18, "#fff", 3, true);
                rN.drawImage(rO, -rO.worldW / 2, 50 - 13 / 2 - rO.worldH, rO.worldW, rO.worldH);
                rN.save();
                rN.translate(0 + this.petal.uiX, -5 + this.petal.uiY);
                this.petal.drawIcon(rN);
                rN.restore();
            }, true);
            if (!rK) {
                rK = pG[rJ];
            }
            rI.rotate(this.angle);
            const rL = Math.min(this.spawnT, 1);
            const rM = this.size / 100 * (1 + Math.sin(Date.now() / 250 + this.id) * 0.05) * rL * (1 - this.deadT);
            rI.scale(rM, rM);
            rI.rotate(Math.PI * lJ(1 - rL));
            if (rK) {
                rI.drawImage(rK, -rK.worldW / 2, -rK.worldH / 2, rK.worldW, rK.worldH);
            } else {
                rI.beginPath();
                rI.rect(-60, -60, 120, 120);
                rI.fillStyle = hP[this.petal.tier];
                rI.fill();
            }
            rI.restore();
        }
    };
    function lP(rI) {
        rI.beginPath();
        rI.moveTo(0, 4.5);
        rI.quadraticCurveTo(3.75, 0, 0, -4.5);
        rI.quadraticCurveTo(-3.75, 0, 0, 4.5);
        rI.closePath();
        rI.lineCap = rI.lineJoin = "round";
        rI.fillStyle = rI.strokeStyle = "#333";
        rI.lineWidth = 1;
        rI.stroke();
        rI.fill();
        rI.clip();
        rI.beginPath();
        rI.arc(0, 0, 2, 0, l1);
        rI.fillStyle = "#eee";
        rI.fill();
    }
    function lQ(rI, rJ = false) {
        lR(rI, -Math.PI / 5, Math.PI / 22);
        lR(rI, Math.PI / 5, -Math.PI / 22);
        if (rJ) {
            const rK = Math.PI / 7;
            rI.beginPath();
            rI.arc(0, 0, 23.5, Math.PI + rK, Math.PI * 2 - rK);
            rI.strokeStyle = "#222";
            rI.lineWidth = 4;
            rI.lineCap = "round";
            rI.stroke();
        }
    }
    function lR(rI, rJ, rK) {
        rI.save();
        rI.rotate(rJ);
        rI.translate(0, -23.6);
        rI.rotate(rK);
        rI.beginPath();
        rI.moveTo(-6.5, 1);
        rI.lineTo(0, -15);
        rI.lineTo(6.5, 1);
        rI.fillStyle = "#fe98a2";
        rI.lineWidth = 3.5;
        rI.fill();
        rI.lineJoin = "round";
        rI.strokeStyle = "#222";
        rI.stroke();
        rI.restore();
    }
    function lS(rI, rJ, rK, rL, rM, rN, rO = false) {
        var rP = rJ.length;
        var rQ;
        rI.save();
        rI.translate(rK, rL);
        rI.rotate(rN * 1 / 2);
        rI.rotate(rN / rP * 1 / 2);
        rI.textBaseline = "top";
        for (var rR = 0; rR < rP; rR++) {
            rI.rotate(-rN / rP);
            rI.save();
            rI.translate(0, rM);
            rQ = rJ[rR];
            if (rO) {
                rI.strokeText(rQ, 0, 0);
            }
            rI.fillText(rQ, 0, 0);
            rI.restore();
        }
        rI.restore();
    }
    function lT(rI, rJ = 1) {
        const rK = 15;
        rI.beginPath();
        const rL = 6;
        for (let rQ = 0; rQ < rL; rQ++) {
            const rR = rQ / rL * Math.PI * 2;
            rI.lineTo(Math.cos(rR) * rK, Math.sin(rR) * rK);
        }
        rI.closePath();
        rI.lineWidth = 4;
        rI.strokeStyle = "hsl(110,100%,10%)";
        rI.stroke();
        rI.fillStyle = "hsl(110,100%,50%)";
        rI.fill();
        const rM = Math.PI * 2 / rL;
        const rN = Math.cos(rM) * rK;
        const rO = Math.sin(rM) * rK;
        for (let rS = 0; rS < rL; rS++) {
            rI.beginPath();
            rI.moveTo(0, 0);
            rI.lineTo(rK, 0);
            rI.lineTo(rN, rO);
            rI.closePath();
            rI.fillStyle = "rgba(0,0,0," + (0.2 + (rS + 4) % rL / rL * 0.35) + ")";
            rI.fill();
            rI.rotate(rM);
        }
        rI.beginPath();
        const rP = rK * 0.65;
        for (let rT = 0; rT < rL; rT++) {
            const rU = rT / rL * Math.PI * 2;
            rI.lineTo(Math.cos(rU) * rP, Math.sin(rU) * rP);
        }
        rI.shadowBlur = 35 + rJ * 15;
        rI.shadowColor = rI.fillStyle = "hsl(110,100%,60%)";
        rI.fill();
        rI.fill();
        rI.fill();
    }
    var lU = class extends lH {
        constructor(rI, rJ, rK, rL, rM, rN, rO) {
            super(rI, cR.player, rJ, rK, rL, rO, rM);
            this.mood = rN;
            this.angryT = 0;
            this.sadT = 0;
            this.eyeX = 0;
            this.eyeY = 0;
            this.nick = "";
            this.level = 0;
            this.doLerpEye = true;
            this.isPoison = false;
            this.hasAntenna = false;
            this.hasEye = false;
            this.hasAbsorbers = false;
            this.hasEars = false;
            this.isPlayer = true;
            this.shield = 0;
            this.nShield = 0;
        }
        update() {
            super.update();
            if (this.isDead) {
                this.sadT = 1;
                this.angryT = 0;
            } else {
                const rI = pR / 200;
                let rJ = this.mood;
                if (this.isPoison && rJ === cX.neutral) {
                    rJ = cX.sad;
                }
                this.angryT = Math.min(1, Math.max(0, this.angryT + (rJ === cX.angry ? rI : -rI)));
                this.sadT = Math.min(1, Math.max(0, this.sadT + (rJ === cX.sad ? rI : -rI)));
                this.shield = px(this.shield, this.nShield, 100);
            }
        }
        draw(rI) {
            rI.save();
            rI.translate(this.x, this.y);
            let rJ = this.size / l0;
            if (this.isDead) {
                rI.rotate(this.deadT * Math.PI / 4);
            }
            rI.scale(rJ, rJ);
            this.deadPreDraw(rI);
            if (this.hasSpiderLeg) {
                rI.save();
                rI.rotate(this.angle);
                rI.scale2(this.size / 40 / rJ);
                this.makeSpiderLegs(rI);
                rI.restore();
            }
            if (this.hasHalo) {
                rI.save();
                rI.scale2(l0 / 18);
                this.drawWingAndHalo(rI, pQ / 300);
                rI.restore();
            }
            const rK = "#222";
            if (this.isBae) {
                const rW = Date.now();
                const rX = (Math.sin(rW / 300) * 0.5 + 0.5) * 2;
                rI.beginPath();
                rI.moveTo(5, -34);
                rI.bezierCurveTo(47, -25, 20, 5, 43 - rX, 25);
                rI.quadraticCurveTo(0, 40 + rX * 0.6, -43 + rX, 25);
                rI.bezierCurveTo(-20, 5, -47, -25, -5, -34);
                rI.quadraticCurveTo(0, -35, 5, -34);
                rI.fillStyle = rK;
                rI.fill();
            }
            if (this.hasEars) {
                lQ(rI);
            }
            const rM = {
                YOBA: ["#bff14c", "#a5d141"]
            };
            const rN = this.hasAbsorbers ? ["#000000", "#333333"] : this.isStatue ? ["#5ab6ab", "#328379"] : rM[this.username] || ["#ffe763", "#cfbb50"];
            rN[0] = this.getHurtColor(rN[0]);
            rN[1] = this.getHurtColor(rN[1]);
            let rO = 2.75;
            if (!this.isStatue) {
                rO /= rJ;
            }
            rI.fillStyle = rN[0];
            rI.lineWidth = rO;
            rI.strokeStyle = rN[1];
            if (this.isStatue) {
                rI.beginPath();
                rI.moveTo(0, 0);
                rI.quadraticCurveTo(-30, 15, -30, 30);
                rI.quadraticCurveTo(0, 55, 30, 30);
                rI.quadraticCurveTo(30, 15, 0, 0);
                rI.fill();
                rI.stroke();
                rI.save();
                rI.fillStyle = rI.strokeStyle;
                rI.textAlign = "center";
                rI.font = "bolder 12px " + iB;
                lS(rI, "Ruined", 0, 0, 28, Math.PI * 0.5);
                rI.restore();
            }
            rI.beginPath();
            if (this.isSupporter) {
                if (!this.isBae) {
                    rI.rect(-25, -25, 50, 50);
                } else {
                    rI.moveTo(25, 25);
                    rI.lineTo(-25, 25);
                    rI.lineTo(-25, -10);
                    rI.lineTo(-10, -25);
                    rI.lineTo(10, -25);
                    rI.lineTo(25, -10);
                    rI.closePath();
                }
            } else {
                rI.arc(0, 0, l0, 0, l1);
            }
            rI.fill();
            rI.stroke();
            if (this.hasSwastika) {
                rI.save();
                rI.clip();
                rI.beginPath();
                if (!this.isBae) {
                    rI.moveTo(-8, -30);
                    rI.lineTo(15, -7);
                    rI.lineTo(30, -20);
                    rI.lineTo(30, -50);
                }
                rI.translate(0, (1 - (this.sadT + this.angryT)) * 2);
                rI.moveTo(-2, 0);
                rI.lineTo(-3, 4.5);
                rI.lineTo(3, 4.5);
                rI.lineTo(2, 0);
                rI.fillStyle = "#333";
                rI.fill();
                rI.restore();
            }
            if (this.isBae) {
                rI.beginPath();
                rI.moveTo(0, -23);
                rI.quadraticCurveTo(4, -13, 27, -8);
                rI.lineTo(20, -28);
                rI.lineTo(-20, -28);
                rI.lineTo(-27, -8);
                rI.quadraticCurveTo(-4, -13, 0, -23);
                rI.fillStyle = rK;
                rI.fill();
            }
            if (this.hasHearts) {
                rI.strokeStyle = "#ff7380";
                rI.lineWidth = 1.4;
                rI.beginPath();
                rI.lineCap = "round";
                const rY = 4.5;
                for (let rZ = 0; rZ < 2; rZ++) {
                    const s0 = -18 + rZ * 29;
                    for (let s1 = 0; s1 < 3; s1++) {
                        const s2 = s0 + s1 * 3;
                        rI.moveTo(s2, rY + -1.5);
                        rI.lineTo(s2 + 1.6, rY + 1.6);
                    }
                }
                rI.stroke();
            }
            if (this.isClown) {
                rI.beginPath();
                rI.arc(0, 2.5, 3.3, 0, l1);
                rI.fillStyle = "#db4437";
                rI.fill();
                rI.beginPath();
                rI.arc(13, 2.8, 5.5, 0, l1);
                rI.arc(-13, 2.8, 5.5, 0, l1);
                rI.fillStyle = "#ff7892";
                rI.fill();
                rI.save();
                rI.rotate(-Math.PI / 4);
                rI.beginPath();
                const s3 = [[25, -4, 5], [25, 4, 5], [30, 0, 4.5]];
                if (this.isSupporter) {
                    s3.forEach(s4 => {
                        s4[0] *= 1.1;
                        s4[1] *= 1.1;
                    });
                }
                for (let s4 = 0; s4 < 2; s4++) {
                    for (let s5 = 0; s5 < s3.length; s5++) {
                        const s6 = s3[s5];
                        rI.moveTo(s6[0], s6[1]);
                        rI.arc(...s6, 0, l1);
                    }
                    rI.rotate(-Math.PI / 2);
                }
                rI.fillStyle = "#bb1a34";
                rI.fill();
                rI.restore();
            }
            const rP = this.angryT;
            const rQ = this.sadT;
            const rR = rP * 6;
            const rS = rQ * 4;
            function rT(s7, s8) {
                rI.beginPath();
                const s9 = 3.25;
                rI.moveTo(s7 - s9, s8 - s9);
                rI.lineTo(s7 + s9, s8 + s9);
                rI.moveTo(s7 + s9, s8 - s9);
                rI.lineTo(s7 - s9, s8 + s9);
                rI.lineWidth = 2;
                rI.lineCap = "round";
                rI.strokeStyle = "#333";
                rI.stroke();
                rI.closePath();
            }
            function rU(s7, s8) {
                rI.save();
                rI.translate(s7, s8);
                rI.beginPath();
                rI.moveTo(-4, 0);
                rI.quadraticCurveTo(0, 6, 4, 0);
                rI.lineWidth = 2;
                rI.lineCap = "round";
                rI.strokeStyle = "#333";
                rI.stroke();
                rI.restore();
            }
            if (this.isDead) {
                rT(7, -5);
                rT(-7, -5);
            } else if (this.isSleeping) {
                rU(7, -5);
                rU(-7, -5);
            } else {
                let s7 = function (s9, sa, sb, sc, se = 0) {
                    const sf = se ^ 1;
                    rI.moveTo(s9 - sb, sa - sc + se * rR + sf * rS);
                    rI.lineTo(s9 + sb, sa - sc + sf * rR + se * rS);
                    rI.lineTo(s9 + sb, sa + sc);
                    rI.lineTo(s9 - sb, sa + sc);
                    rI.lineTo(s9 - sb, sa - sc);
                };
                let s8 = function (s9 = 0) {
                    rI.beginPath();
                    rI.ellipse(7, -5, 2.5 + s9, 6 + s9, 0, 0, l1);
                    rI.moveTo(-7, -5);
                    rI.ellipse(-7, -5, 2.5 + s9, 6 + s9, 0, 0, l1);
                    rI.strokeStyle = rI.fillStyle = "#333";
                    rI.fill();
                };
                rI.save();
                rI.beginPath();
                s7(7, -5, 3.5999999999999996, 7.3, 1);
                s7(-7, -5, 3.5999999999999996, 7.3, 0);
                rI.clip();
                s8(0.7);
                s8(0);
                rI.clip();
                rI.beginPath();
                rI.arc(7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, l1);
                rI.moveTo(-7, -5);
                rI.arc(-7 + this.eyeX * 2, -5 + this.eyeY * 3.5, 3.1, 0, l1);
                rI.fillStyle = "#eee";
                rI.fill();
                rI.restore();
            }
            if (this.hasEye) {
                rI.save();
                rI.translate(0, -12);
                if (this.isDead) {
                    rI.scale(0.7, 0.7);
                    rT(0, -3);
                } else if (this.isSleeping) {
                    rI.scale(0.7, 0.7);
                    rU(0, -3);
                } else {
                    lP(rI);
                }
                rI.restore();
            }
            if (this.hasAntenna) {
                rI.save();
                rI.translate(0, 10);
                rI.rotate(-Math.PI / 2);
                rI.scale(0.82, 0.82);
                this.makeAntenna(rI, false, 0.85);
                rI.restore();
            }
            const rV = rP * -10.5 + rQ * -9;
            rI.save();
            rI.beginPath();
            rI.translate(0, 9.5);
            rI.moveTo(-5.6, 0);
            rI.quadraticCurveTo(0, 5 + rV, 5.6, 0);
            rI.lineCap = "round";
            if (this.isClown) {
                rI.lineWidth = 7;
                rI.strokeStyle = "#db4437";
                rI.stroke();
                rI.strokeStyle = "#400";
            } else {
                rI.strokeStyle = "#333";
            }
            rI.lineWidth = 1.75;
            rI.stroke();
            rI.restore();
            if (this.hasGem) {
                const s9 = this.angryT;
                const sa = 40;
                const sb = Date.now() / 300;
                const sc = this.isStatue ? 0 : Math.sin(sb) * 0.5 + 0.5;
                const se = sc * 4;
                const sf = 40 - sc * 4;
                const sg = sf - (this.isStatue ? 1 : jg(s9)) * 80;
                const sh = this.hasSwastika;
                rI.lineWidth = 9 + rO * 2;
                rI.lineJoin = "round";
                rI.lineCap = "round";
                for (let si = 0; si < 2; si++) {
                    rI.beginPath();
                    rI.save();
                    for (let sj = 0; sj < 2; sj++) {
                        rI.moveTo(25, 0);
                        let sk = sg;
                        if (sh && sj === 0) {
                            sk = sf;
                        }
                        rI.quadraticCurveTo(45 + se, sk * 0.5, 11, sk);
                        rI.scale(-1, 1);
                    }
                    rI.restore();
                    rI.strokeStyle = rN[1 - si];
                    rI.stroke();
                    rI.lineWidth = 9;
                }
                rI.save();
                rI.translate(0, sg);
                lT(rI, sc);
                rI.restore();
            }
            rI.restore();
        }
        drawArmAndGem(rI, rJ) { }
        drawChats(rI, rJ = 1) {
            const rK = nk[this.id];
            if (!rK) {
                return;
            }
            for (let rL = 0; rL < rK.length; rL++) {
                const rM = rK[rL];
                if (rM.t > lW + lX) {
                    continue;
                }
                if (!rM.x) {
                    rM.x = this.x;
                    rM.y = this.y - this.size - 68;
                    rM.oPlayerX = this.x;
                    rM.oPlayerY = this.y;
                }
                const rN = rM.t > lW ? 1 - (rM.t - lW) / lX : 1;
                const rO = rN * rN * rN;
                rM.x += (this.x - rM.oPlayerX) * rO;
                rM.y += (this.y - rM.oPlayerY) * rO;
                rM.oPlayerX = this.x;
                rM.oPlayerY = this.y;
                const rP = Math.min(1, rM.t / 100);
                rI.save();
                rI.globalAlpha = (rN < 0.7 ? rN / 0.7 : 1) * rP * 0.9;
                rI.translate(rM.x, rM.y - rM.t / lW * 20);
                rI.scale2(rJ);
                const rQ = pK(rI, rM.text, 16, "#111", 0, true, false);
                rI.scale2(rP);
                rI.beginPath();
                const rR = rQ.worldW + 10;
                const rS = rQ.worldH + 15;
                if (rI.roundRect) {
                    rI.roundRect(-rR / 2, -rS / 2, rR, rS, 5);
                } else {
                    rI.rect(-rR / 2, -rS / 2, rR, rS);
                }
                rI.fillStyle = rM.col;
                rI.fill();
                rI.strokeStyle = "#111";
                rI.lineWidth = 1.5;
                rI.stroke();
                rI.drawImage(rQ, -rQ.worldW / 2, -rQ.worldH / 2, rQ.worldW, rQ.worldH);
                rI.restore();
            }
        }
    };
    var lV = 20000;
    var lW = 4000;
    var lX = 3000;
    var lY = lW + lX;
    function lZ(rI, rJ, rK = 1) {
        if (rI.isDead) {
            return;
        }
        rJ.save();
        rJ.translate(rI.x, rI.y);
        m0(rI, rJ, undefined, rK);
        rJ.translate(0, -rI.size - 25);
        rJ.save();
        rJ.scale2(rK);
        if (rI.username) {
            pK(rJ, "@" + rI.username, 11, "#8ecc51", 3);
            rJ.translate(0, -16);
        }
        if (rI.nick) {
            pK(rJ, rI.nick, 18, "#fff", 3);
            rJ.translate(0, -5);
        }
        rJ.restore();
        if (!rI.isPlayer && rI.breedTimerAlpha > 0.001) {
            rJ.globalAlpha = rI.breedTimerAlpha;
            rJ.scale(rI.breedTimerAlpha * 3, rI.breedTimerAlpha * 3);
            rJ.beginPath();
            rJ.arc(0, 0, 20, 0, l1);
            rJ.fillStyle = "#333";
            rJ.fill();
            nC(rJ, 0.8);
            rJ.beginPath();
            rJ.arc(0, 0, 20, 0, l1);
            rJ.fillStyle = "rgba(0,0,0,0.4)";
            rJ.fill();
            rJ.beginPath();
            rJ.moveTo(0, 0);
            rJ.arc(0, 0, 16, 0, l1 * rI.iBreedTimer);
            rJ.lineTo(0, 0);
            rJ.clip();
            nC(rJ, 0.8);
        }
        rJ.restore();
    }
    function m0(rI, rJ, rK = undefined, rL = 1) {
        if (rI.hpAlpha <= 0) {
            return;
        }
        rJ.save();
        rJ.globalAlpha = rI.hpAlpha;
        rJ.strokeStyle = "#222";
        rJ.beginPath();
        const rM = rK ? 140 : rI.isPlayer ? 75 : 100;
        let rN = rK ? 26 : 9;
        const rO = !rK && pc.show_health;
        if (rO) {
            rN += 20;
        }
        if (rK) {
            rJ.translate(rI.size + 17, 0);
        } else if (rI.isPlayer ? pc.fixed_player_health_size : pc.fixed_mob_health_size) {
            rJ.translate(0, rI.size);
            rJ.scale2(rL);
            rJ.translate(-rM / 2, rN / 2 + 20);
        } else {
            const rQ = Math.max(1, rI.size / 100);
            rJ.scale(rQ, rQ);
            rJ.translate(-rM / 2, rI.size / rQ + 27);
        }
        rJ.beginPath();
        rJ.moveTo(rK ? -20 : 0, 0);
        rJ.lineTo(rM, 0);
        rJ.lineCap = "round";
        rJ.lineWidth = rN;
        rJ.strokeStyle = "#222";
        rJ.stroke();
        function rP(rR) {
            rJ.globalAlpha = rR < 0.05 ? rR / 0.05 : 1;
        }
        if (rI.redHealth > 0) {
            rP(rI.redHealth);
            rJ.beginPath();
            rJ.moveTo(0, 0);
            rJ.lineTo(rI.redHealth * rM, 0);
            rJ.lineWidth = rN * (rK ? 0.55 : 0.44);
            rJ.strokeStyle = "#f22";
            rJ.stroke();
        }
        if (rI.health > 0) {
            rP(rI.health);
            rJ.beginPath();
            rJ.moveTo(0, 0);
            rJ.lineTo(rI.health * rM, 0);
            rJ.lineWidth = rN * (rK ? 0.7 : 0.66);
            rJ.strokeStyle = "#75dd34";
            rJ.stroke();
        }
        if (rI.shield) {
            rP(rI.shield);
            rJ.beginPath();
            rJ.moveTo(0, 0);
            rJ.lineTo(rI.shield * rM, 0);
            rJ.lineWidth = rN * (rK ? 0.45 : 0.35);
            rJ.strokeStyle = "#ffffff";
            rJ.stroke();
        }
        if (rI.isPlayer) {
            rJ.globalAlpha = 1;
            const rR = pK(rJ, "Lvl " + (rI.level + 1), rK ? 12 : 14, "#fff", 3, true);
            rJ.drawImage(rR, rM + rN / 2 - rR.worldW, rN / 2, rR.worldW, rR.worldH);
            if (rK) {
                const rS = pK(rJ, "@" + rI.username, 12, "#8ecc51", 3, true);
                rJ.drawImage(rS, -rN / 2, -rN / 2 - rS.worldH, rS.worldW, rS.worldH);
            }
        } else {
            rJ.globalAlpha = 1;
            const rT = kd[rI.type];
            const rU = pK(rJ, rT, 14, "#fff", 3, true, rI.tierStr);
            rJ.save();
            rJ.translate(0, -rN / 2 - rU.worldH);
            if (rU.worldW > rM + rN) {
                rJ.drawImage(rU, rM / 2 - rU.worldW / 2, 0, rU.worldW, rU.worldH);
            } else {
                rJ.drawImage(rU, -rN / 2, 0, rU.worldW, rU.worldH);
            }
            rJ.restore();
            const rV = pK(rJ, rI.tierStr, 14, hO[rI.tierStr], 3, true);
            rJ.drawImage(rV, rM + rN / 2 - rV.worldW, rN / 2, rV.worldW, rV.worldH);
        }
        if (rO) {
            let rW = m1(rI.health);
            if (rI.shield > 0) {
                rW += " + " + m1(rI.shield);
            }
            rJ.save();
            rJ.translate(rM / 2, 0);
            pK(rJ, rW, 14, "#fff", 3, undefined, (rI.isPlayer ? 1 : 0) + "_" + Math.floor(rI.size / 100));
            rJ.restore();
        }
        if (rK && rI.nick) {
            rJ.globalAlpha = 1;
            rJ.translate(rM / 2, 0);
            pK(rJ, rI.nick, 17, "#fff", 3);
        }
        rJ.restore();
    }
    function m1(rI) {
        return (rI * 100).toLocaleString("en-US", {
            maximumFractionDigits: 2
        }) + "%";
    }
    function m2(rI) {
        for (let rJ in oG) {
            oG[rJ].dispose(rI);
        }
        oZ();
    }
    var m3 = {};
    var m4 = document.querySelector(".mob-gallery");
    mJ(".builds-btn", ".builds", "builds");
    mJ(".mobs-btn", ".mob-gallery", "mobGallery");
    mJ(".changelog-btn", ".changelog", "changelog", () => {
        hu = false;
        hC.changelog = fb;
    });
    mJ(".settings-btn", ".settings", "settings");
    mJ(".credits-btn", ".credits", "credits");
    mJ(".inventory-btn", ".inventory", "inventory");
    mJ(".absorb-btn", ".absorb", "absorb");
    mJ(".stats-btn", ".stats", "stats");
    mJ(".player-list-btn", ".player-list", "playerList");
    mJ(".lb-btn", ".lb", "lb");
    mJ(".rewards-btn", ".rewards", "rewards");
    mJ(".shop-btn", ".shop", "shop", () => {
        mk.style.display = "none";
        hC.shop = mj;
    });
    mJ(".lottery-btn", ".lottery", "lottery", () => {
        if (!hX) {
            return;
        }
        im(new Uint8Array([cH.iReqGambleList]));
    });
    var m5 = document.querySelector(".game-stats .dialog-content");
    var m6 = false;
    var m7 = null;
    var m8 = nR("<div stroke=\"Last Updated: 10s ago\"></div>");
    setInterval(() => {
        if (m7) {
            m9();
        }
    }, 1000);
    function m9() {
        k9(m8, "Last Updated: " + kb(Date.now() - m7.createdAt) + " ago");
    }
    function ma(rI) {
        document.body.classList.add("hide-all");
        const rJ = nR("<div class=\"dialog show expand no-hide data\">\n\t\t<div class=\"dialog-header\">\n\t\t\t<div class=\"data-title\" stroke=\"" + rI.title + "\" style=\"color:" + rI.titleColor + "\"></div>\n\t\t\t" + (rI.desc ? "<div class=\"data-desc\" stroke=\"" + rI.desc + "\" " + (rI.descColor ? "style=\"color:" + rI.descColor + "\"" : "") + "></div>" : "") + "\n\t\t</div>\n\t\t<div class=\"close-btn btn\">\n\t\t\t<div class=\"close\"></div>\n\t\t</div>\n\t\t<div class=\"dialog-content\"></div>\n\t</div>");
        r6 = rJ;
        rJ.dispose = function () {
            document.body.classList.remove("hide-all");
            rJ.remove();
            r6 = null;
        };
        rJ.querySelector(".close-btn").onclick = rJ.dispose;
        const rK = rJ.querySelector(".dialog-content");
        const rL = 20;
        rM(0);
        if (rI.groups.length > rL) {
            const rN = nR("<div class=\"data-top-area\">\n\t\t\t<label>\n\t\t\t\t<span stroke=\"Current Page:\"></span>\n\t\t\t\t<select tabindex=\"-1\"></select>\n\t\t\t</label>\n\t\t\t<label>\n\t\t\t\t<span stroke=\"Search:\"></span>\n\t\t\t\t<input class=\"textbox data-search\" type=\"text\" placeholder=\"Enter value...\" tabindex=\"-1\">\n\t\t\t</label>\n\t\t\t<div class=\"data-search-result\" style=\"display:none;\"></div>\n\t\t</div>");
            rJ.appendChild(rN);
            const rO = rN.querySelector("select");
            const rP = Math.ceil(rI.groups.length / rL);
            for (let rS = 0; rS < rP; rS++) {
                const rT = nR("<option value=\"" + rS + "\">Page #" + (rS + 1) + "</option>");
                rO.appendChild(rT);
            }
            rO.oninput = function () {
                rM(this.value);
            };
            const rQ = rJ.querySelector(".data-search-result");
            const rR = rJ.querySelector(".data-search");
            rR.oninput = function () {
                const rU = this.value.trim();
                rQ.innerHTML = "";
                rQ.style.display = "none";
                if (!rU) {
                    return;
                }
                const rV = new RegExp(rU, "i");
                let rW = 0;
                for (let rX = 0; rX < rI.groups.length; rX++) {
                    const rY = rI.groups[rX];
                    if (rV.test(rY.key)) {
                        const rZ = nR("<div class=\"data-search-item\">\n\t\t\t\t\t\t<div stroke=\"#" + (rX + 1) + "\"></div>\n\t\t\t\t\t\t<div class=\"username-link\" stroke=\"" + rY.key + "\"></div>\n\t\t\t\t\t\t<div stroke=\"" + ka(rY.totalPetals) + " petals\"></div>\n\t\t\t\t\t</div>");
                        rQ.appendChild(rZ);
                        rZ.querySelector(".username-link").onclick = function () {
                            mA(rY.key);
                        };
                        rZ.onclick = function (s0) {
                            if (s0.target === this) {
                                const s1 = Math.floor(rX / rL);
                                rM(s1);
                                rO.value = s1;
                            }
                        };
                        rW++;
                        if (rW >= 8) {
                            break;
                        }
                    }
                }
                if (rW > 0) {
                    rQ.style.display = "";
                }
            };
        }
        function rM(rU = 0) {
            const rV = rU * rL;
            const rW = Math.min(rI.groups.length, rV + rL);
            rK.innerHTML = "";
            for (let rX = rV; rX < rW; rX++) {
                const rY = rI.groups[rX];
                rK.appendChild(rI.getTitleEl(rY, rX));
                const rZ = nR("<div class=\"petal-container\"></div>");
                for (let s0 = 0; s0 < rY.petals.length; s0++) {
                    const [s1, s2] = rY.petals[s0];
                    const s3 = dE[s1];
                    const s4 = nR("<div class=\"petal tier-" + s3.tier + "\" " + qB(s3) + "></div>");
                    jZ(s4);
                    const s5 = "x" + ka(s2);
                    const s6 = nR("<div class=\"petal-count\" stroke=\"" + s5 + "\"></div>");
                    if (s5.length > 6) {
                        s6.classList.add("small");
                    }
                    s4.appendChild(s6);
                    s4.petal = s3;
                    rZ.appendChild(s4);
                }
                rK.appendChild(rZ);
            }
        }
        km.appendChild(rJ);
    }
    function mb(rI, rJ = false) {
        let rK = [];
        let rL = 0;
        for (const rN in rI) {
            const rO = rI[rN];
            let rP = 0;
            let rQ = [];
            for (const rS in rO) {
                const rT = rO[rS];
                rQ.push([rS, rT]);
                rP += rT;
                rL += rT;
            }
            rQ = rQ.sort((rU, rV) => rV[1] - rU[1]);
            const rR = {
                key: rN,
                petals: rQ,
                totalPetals: rP
            };
            rK.push(rR);
        }
        if (rJ) {
            rK = rK.sort((rU, rV) => rV.totalPetals - rU.totalPetals);
        }
        const rM = {
            totalPetals: rL,
            groups: rK
        };
        return rM;
    }
    function mc() {
        return md(new Date());
    }
    function md(rI) {
        const rK = rI.toLocaleDateString("en", {
            day: "numeric"
        });
        const rM = rI.toLocaleDateString("en", {
            month: "long"
        });
        const rO = rI.toLocaleDateString("en", {
            year: "numeric"
        });
        return "" + rK + me(rK) + " " + rM + " " + rO;
    }
    function me(rI) {
        if (rI >= 11 && rI <= 13) {
            return "th";
        }
        switch (rI % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }
    function mf(rI, rJ) {
        const rK = nR("<div>\n\t\t<span stroke=\"" + (rJ + 1) + ".\"> <span class=\"username-link\" stroke=\"" + rI.key + "\"></span> <span stroke=\"• " + ka(rI.totalPetals) + " petal" + (rI.totalPetals == 1 ? "" : "s") + "\"></span>\n\t</div>");
        rK.querySelector(".username-link").onclick = function () {
            mA(rI.key);
        };
        return rK;
    }
    var mg = {
        ultraPlayers: {
            title: "Ultra Players (200+)",
            parse(rI) {
                const rJ = rI.ultraPlayers;
                if (rJ.version !== 1) {
                    throw new Error("compression version not supported: " + rJ.version);
                }
                const rK = {};
                const rL = rJ.petalStr.split("+");
                for (const rN in rJ.users) {
                    const rO = rJ.users[rN].split(" ");
                    const rP = {};
                    for (let rQ = 0; rQ < rO.length - 1; rQ++) {
                        let [rR, rS] = rO[rQ].split(",");
                        rP[rL[rR]] = parseInt(rS);
                    }
                    rK[rN] = rP;
                }
                const rM = mb(rK, true);
                return {
                    title: this.title,
                    titleColor: hO.Ultra,
                    desc: mc() + " • " + ka(rM.groups.length) + " players • " + ka(rM.totalPetals) + " petals",
                    getTitleEl: mf,
                    groups: rM.groups
                };
            }
        },
        superPlayers: {
            title: "Super Players",
            parse(rI) {
                const rJ = mb(rI.superPlayers, true);
                return {
                    title: this.title,
                    titleColor: hO.Super,
                    desc: mc() + " • " + ka(rJ.groups.length) + " players • " + ka(rJ.totalPetals) + " petals",
                    getTitleEl: mf,
                    groups: rJ.groups
                };
            }
        },
        hyperPlayers: {
            title: "Hyper Players",
            parse(rI) {
                const rJ = mb(rI.hyperPlayers, true);
                return {
                    title: this.title,
                    titleColor: hO.Hyper,
                    desc: mc() + " • " + ka(rJ.groups.length) + " players • " + ka(rJ.totalPetals) + " petals",
                    getTitleEl: mf,
                    groups: rJ.groups
                };
            }
        },
        petals: {
            title: "All Petals",
            parse(rI) {
                const rJ = mb(rI.petals, false);
                const rK = rJ.groups.sort((rL, rM) => rM.key - rL.key);
                return {
                    title: this.title,
                    titleColor: hO.Common,
                    desc: mc() + " • " + ka(rJ.totalPetals) + " petals",
                    getTitleEl(rL, rM) {
                        return nR("<div stroke=\"" + hM[rL.key] + " • " + ka(rL.totalPetals) + " petals\"></div>");
                    },
                    groups: rK
                };
            }
        }
    };
    function mh(rI) {
        const rJ = 60000;
        const rK = rJ * 60;
        const rL = rK * 24;
        const rM = rL * 365;
        let rN = Math.floor(rI / rM);
        rI %= rM;
        let rO = Math.floor(rI / rL);
        rI %= rL;
        let rP = Math.floor(rI / rK);
        rI %= rK;
        let rQ = Math.floor(rI / rJ);
        let rR = [];
        if (rN > 0) {
            rR.push(rN + "y");
        }
        if (rO > 0) {
            rR.push(rO + "d");
        }
        if (rP > 0) {
            rR.push(rP + "h");
        }
        if (rQ > 0) {
            rR.push(rQ + "m");
        }
        return rR.join(" ");
    }
    function mi() {
        if (m6) {
            return;
        }
        if (m7 && Date.now() - m7.createdAt < 3600000) {
            return;
        }
        m6 = true;
        fetch((i9 ? "https://stats.hornex.pro/" : "http://localhost:6767/") + "gameStats.json").then(rI => rI.json()).then(rI => {
            m6 = false;
            m7 = rI;
            m9();
            m5.innerHTML = "";
            const rK = {
                totalTimePlayed: true,
                totalGamesPlayed: true,
                totalChatSent: true,
                totalKills: true,
                totalAccounts: true
            };
            const rL = nR("<div style=\"width:100%; text-align:center;\"></div>");
            m5.appendChild(rL);
            for (const rM in rK) {
                if (rM in rI) {
                    const rN = rI[rM];
                    const rO = nR("<div class=\"stat\">\n\t\t\t\t\t<div class=\"stat-name\" stroke=\"" + ke(rM) + "\"></div>\n\t\t\t\t\t<div class=\"stat-value\" stroke=\"" + (rM == "totalTimePlayed" ? mh(rN * 1000 * 60) : ka(rN)) + "\"></div>\n\t\t\t\t</div>");
                    rL.appendChild(rO);
                }
            }
            for (const rP in mg) {
                if (!(rP in rI)) {
                    continue;
                }
                const rQ = mg[rP];
                const rR = nR("<div class=\"btn\">\n\t\t\t\t<span stroke=\"" + rQ.title + "\"></span>\n\t\t\t</div>");
                rR.onclick = function () {
                    ma(rQ.parse(rI));
                };
                m5.appendChild(rR);
            }
            m5.appendChild(m8);
        }).catch(rI => {
            m6 = false;
            hb("Failed to get game stats. Retrying in 5s...");
            console.error("Failed to load game stats!", rI);
            setTimeout(mi, 5000);
        });
    }
    mJ(".game-stats-btn", ".game-stats", "gameStats", mi);
    var mj = 11;
    var mk = document.querySelector(".shop-info");
    if (hC.shop == mj) {
        mk.style.display = "none";
    }
    var ml = document.querySelector(".shop-overlay");
    ml.style.display = "none";
    var mm = document.querySelector(".key-input");
    var mn = document.querySelector(".submit-btn");
    var mo = document.querySelector(".dismiss-btn");
    mo.onclick = function () {
        ml.style.display = "none";
    };
    var mp = false;
    mn.onclick = nw(function (rI) {
        if (!hX || mp || jz) {
            return;
        }
        const rJ = mm.value.trim();
        if (!rJ || !eU(rJ)) {
            mm.classList.remove("invalid");
            mm.offsetWidth;
            mm.classList.add("invalid");
            return;
        }
        ml.style.display = "";
        ml.innerHTML = "<div class=\"spinner\"></div>";
        im(new Uint8Array([cH.iCheckKey, ...new TextEncoder().encode(rJ)]));
        mp = true;
    });
    function mq(rI, rJ) {
        if (rI === "timeJoined") {
            rJ = new Date(rJ === 0 ? Date.now() : rJ * 1000 * 60 * 60).toLocaleDateString("en", {
                year: "numeric",
                day: "2-digit",
                month: "2-digit"
            });
        } else if (rI === "timePlayed" || rI === "maxTimeAlive") {
            rJ = kb(rJ * 1000 * 60, true);
        } else {
            rJ = ka(rJ);
        }
        return rJ;
    }
    var mr = f1();
    var ms = {};
    var mt = document.querySelector(".stats .dialog-content");
    mt.innerHTML = "";
    for (let rI in mr) {
        const rJ = mu(rI);
        rJ.setValue(0);
        mt.appendChild(rJ);
        ms[rI] = rJ;
    }
    function mu(rK) {
        const rL = nR("<div class=\"stat\">\n\t\t<div class=\"stat-name\" stroke=\"" + ke(rK) + "\"></div>\n\t\t<div class=\"stat-value\" stroke=\"0\"></div>\n\t</div>");
        const rM = rL.querySelector(".stat-value");
        rL.setValue = function (rN) {
            k9(rM, mq(rK, rN));
        };
        return rL;
    }
    var mv;
    function mw(rK, rL, rM, rN, rO, rP, rQ) {
        if (mv) {
            mv.hide();
            mv = null;
        }
        const rR = rP.length / 2;
        const rS = "<div class=\"petal empty\"></div>".repeat(rR);
        const rT = nR("<div class=\"dialog expand big-dialog show profile no-hide\">\n\t\t<div class=\"btn close-btn\">\n\t\t\t<div class=\"close\"></div>\n\t\t</div>\n\t\t<div class=\"dialog-header\"><span stroke=\"" + rK + "'s Profile\"></span></div>\n\t\t<div class=\"dialog-content\">\n\t\t\t<div class=\"progress level-progress\">\n\t\t\t\t<div class=\"bar main\"></div>\n\t\t\t\t<span class=\"level\" stroke=\"Level 100 - 20/10000 XP\"></span>\n\t\t\t</div>\n\n\t\t\t<div class=\"petal-rows\">\n\t\t\t\t<div class=\"petals\">" + rS + "</div>\n\t\t\t\t<div class=\"petals small\">" + rS + "</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"dialog stats\">\n\t\t\t\t<div class=\"dialog-header\"><span stroke=\"Stats\"></span></div>\n\t\t\t\t<div class=\"dialog-content\"></div>\n\t\t\t</div>\n\n\t\t\t<div class=\"dialog mob-gallery\">\n\t\t\t\t<div class=\"dialog-header\"><span stroke=\"Mob Gallery\"></span></div>\n\t\t\t\t<div class=\"dialog-content\">\n\t\t\t\t\t" + "<div class=\"slot\"></div>".repeat(eK * dG) + "\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"dialog inventory\">\n\t\t\t\t<div class=\"dialog-header\"><span stroke=\"Inventory\"></span></div>\n\t\t\t\t<div class=\"dialog-content\">\n\t\t\t\t\t" + (rM.length === 0 ? "<div stroke=\"Such empty, much space\"></div>" : "") + "\n\t\t\t\t\t<div class=\"inventory-petals\"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t</div>\n\t</div>");
        if (rQ) {
            rT.appendChild(nR("<div class=\"banned\">\n\t\t\t<span stroke=\"BANNED!\"></span>\n\t\t</div>"));
        }
        mv = rT;
        const rU = rT.querySelector(".petals");
        const rV = rT.querySelector(".petals.small");
        for (let s7 = 0; s7 < rP.length; s7++) {
            const s8 = rP[s7];
            if (!s8) {
                continue;
            }
            const s9 = og(s8);
            s9.classList.remove("spin");
            s9.canSkipRen = true;
            s9.countEl.remove();
            s9.countEl = null;
            if (s7 < rR) {
                rU.children[s7].appendChild(s9);
            } else {
                rV.children[s7 - rR].appendChild(s9);
            }
        }
        rT.hide = function () {
            rT.style.animationDirection = "reverse";
            rT.style.display = "none";
            rT.offsetWidth;
            rT.style.display = "";
            setTimeout(function () {
                rT.remove();
            }, 1000);
        };
        rT.querySelector(".close-btn").onclick = function () {
            rT.hide();
        };
        const rW = d3(rO);
        const rX = rW[0];
        const rY = rW[1];
        const rZ = d1(rX + 1);
        const s0 = rO - rY;
        const s1 = rT.querySelector(".level");
        k9(s1, "Level " + (rX + 1) + " - " + iK(s0) + "/" + iK(rZ) + " XP");
        const s2 = Math.min(1, s0 / rZ);
        const s3 = rT.querySelector(".main");
        s3.style.width = s2 * 100 + "%";
        const s4 = rT.querySelector(".stats .dialog-content");
        for (let sa in mr) {
            const sb = mu(sa);
            sb.setValue(rL[sa]);
            s4.appendChild(sb);
        }
        const s5 = rT.querySelector(".inventory-petals");
        rM.sort((sc, sd) => of(sc[0], sd[0]));
        for (let sc = 0; sc < rM.length; sc++) {
            const [sd, se] = rM[sc];
            const sf = og(sd);
            jZ(sf);
            sf.classList.remove("spin");
            sf.canSkipRen = true;
            p6(sf.countEl, se);
            s5.appendChild(sf);
        }
        if (rM.length > 0) {
            const sg = nR("<div class=\"inventory-rarities\"></div>");
            const sh = {};
            for (let si = 0; si < rM.length; si++) {
                const [sj, sk] = rM[si];
                sh[sj.tier] = (sh[sj.tier] || 0) + sk;
            }
            oF(sg, sh);
            rT.querySelector(".inventory").appendChild(sg);
        }
        const s6 = rT.querySelector(".mob-gallery .dialog-content");
        for (let sl = 0; sl < rN.length; sl++) {
            const sm = rN[sl];
            const sn = nW(sm, true);
            sn.classList.remove("spin");
            sn.canSkipRen = true;
            const so = s6.children[sm.uniqueIndex * dG + sm.tier];
            s6.insertBefore(sn, so);
            so.remove();
        }
        rT.classList.add("hide-icons");
        setTimeout(function () {
            rT.classList.remove("hide-icons");
        }, 0);
        km.appendChild(rT);
    }
    var mz = document.querySelector(".find-user-input");
    document.querySelector(".find-user-btn").onclick = nw(function (rK) {
        const rL = mz.value.trim();
        nv(rL);
    });
    function mA(rK) {
        const rL = new Uint8Array([cH.iReqUserProfile, ...new TextEncoder().encode(rK)]);
        im(rL);
    }
    var mB = document.querySelector(".stats");
    var mC = document.querySelector(".lb");
    var mD = mC.querySelector(".dialog-content");
    var mE = 0;
    var mF = 0;
    setInterval(function () {
        if (hX) {
            if (pQ - mF > 30000 && mB.classList.contains("show")) {
                im(new Uint8Array([cH.iReqAccountData]));
                mF = pQ;
            }
            if (pQ - mE > 60000 && mC.classList.contains("show")) {
                im(new Uint8Array([cH.iReqGlb]));
                mE = pQ;
            }
        }
    }, 1000);
    var mG = false;
    function mH(rK) {
        for (let rL in m3) {
            if (rK === rL) {
                continue;
            }
            m3[rL].hide();
        }
        mG = false;
    }
    window.onclick = function (rK) {
        if ([kl, ko, kj].includes(rK.target)) {
            mH();
        }
    };
    function mI() {
        if (iz && !pc.enable_kb_movement) {
            io(0, 0);
        }
    }
    function mJ(rK, rL, rM, rN) {
        const rO = document.querySelector(rL);
        const rP = rO.querySelector(".dialog-content");
        const rQ = document.querySelector(rK);
        let rR = null;
        let rS = rO.querySelector(".expand-btn");
        if (rS) {
            rS.onclick = function () {
                rO.classList.toggle("expand");
            };
        }
        rP.style.display = "none";
        rO.classList.remove("show");
        rQ.onclick = function () {
            rT.toggle();
        };
        rO.querySelector(".close-btn").onclick = function () {
            mH();
        };
        const rT = [rQ, rO];
        rT.hide = function () {
            rQ.classList.remove("active");
            rO.classList.remove("show");
            if (!rR) {
                rR = setTimeout(function () {
                    rP.style.display = "none";
                    rR = null;
                }, 1000);
            }
        };
        rT.toggle = function () {
            mH(rM);
            if (rO.classList.contains("show")) {
                rT.hide();
            } else {
                rT.show();
            }
        };
        rT.show = function () {
            if (rN) {
                rN();
            }
            clearTimeout(rR);
            rR = null;
            rP.style.display = "";
            rQ.classList.add("active");
            rO.classList.add("show");
            mG = true;
            mI();
        };
        m3[rM] = rT;
    }
    var mK = [];
    var mL;
    var mM = 0;
    var mN = false;
    var mO = document.querySelector(".inventory-btn");
    var mP = {
        tagName: "fake",
        getBoundingClientRect() {
            const rK = mO.getBoundingClientRect();
            const rL = {
                x: rK.x + rK.width / 2,
                y: rK.y + rK.height / 2
            };
            return rL;
        },
        appendChild(rK) {
            rK.remove();
        }
    };
    function mQ(rK) {
        if (!hX) {
            return;
        }
        const rL = rK.target;
        if (rL.isHudPetal) {
            mL = na(rL, rK);
        } else if (rL.isInventoryPetal) {
            mH();
            const rM = rL.cloneNode();
            rM.petal = rL.petal;
            nQ(rM, rL.petal);
            rM.reloadT = 1;
            rM.isInventoryPetal = true;
            rM.targetEl = mP;
            rM.classList.add("picked");
            const rN = rL.getBoundingClientRect();
            rM.style.left = rN.x / kS + "px";
            rM.style.top = rN.y / kS + "px";
            kI.appendChild(rM);
            mL = na(rM, rK);
            mM = 0;
            mG = true;
        } else {
            return false;
        }
        mM = Date.now();
        mN = true;
        return true;
    }
    function mR(rK) {
        for (let rL = 0; rL < rK.children.length; rL++) {
            const rM = rK.children[rL];
            if (rM.classList.contains("petal") && !n9(rM)) {
                return rM;
            }
        }
    }
    function mS() {
        if (mL) {
            if (mN && Date.now() - mM < 500) {
                if (mL.isHudPetal) {
                    const rK = mL.startEl.index;
                    mL.setTargetEl(rK >= iO ? nA.children[rK - iO + 1] : nB.children[rK]);
                } else if (mL.isInventoryPetal) {
                    let rL = mR(nA) || mR(nB);
                    if (rL) {
                        mL.setTargetEl(rL);
                    }
                }
            }
            mL.release();
            if (mL.isInventoryPetal) {
                mL.isInventoryPetal = false;
                mL.isHudPetal = true;
                m3.inventory.show();
                if (mL.targetEl !== mP) {
                    const rM = mL.swapped;
                    if (rM) {
                        mL.localId = rM.localId;
                        n6(rM.petal.id, 1);
                    } else {
                        mL.localId = iS.pop();
                    }
                    iR[mL.localId] = mL;
                    n6(mL.petal.id, -1);
                    const rN = new DataView(new ArrayBuffer(4));
                    rN.setUint8(0, cH.iWithdrawPetal);
                    rN.setUint16(1, mL.petal.id);
                    rN.setUint8(3, mL.targetEl.index);
                    im(rN);
                }
            } else if (mL.targetEl === mP) {
                iS.push(mL.localId);
                n6(mL.petal.id, 1);
                im(new Uint8Array([cH.iDepositPetal, mL.startEl.index]));
            } else {
                n8(mL.startEl.index, mL.targetEl.index);
            }
            mL = null;
        }
    }
    function mT(rK) {
        if (mL) {
            mL.setTargetByEvent(rK);
            mN = false;
        }
    }
    var mU = document.querySelector(".joystick");
    function mV() {
        mU.style.display = "none";
        const rK = mU.querySelector(".joystick-knob");
        let rL;
        let rM;
        let rN = null;
        mU.onStart = function (rP) {
            if (rN === null) {
                rK.style.width = rK.style.transform = "0";
                mU.style.display = "";
                [rL, rM] = mW(rP);
                rO();
                rN = rP.identifier;
            }
        };
        mU.onMove = function (rP) {
            if (rP.identifier === rN) {
                const [rQ, rR] = mW(rP);
                const rS = rQ - rL;
                const rT = rR - rM;
                const rU = mU.getBoundingClientRect();
                let rV = Math.hypot(rS, rT);
                const rW = rU.width / 2 / kS;
                if (rV > rW) {
                    rV = rW;
                }
                const rX = Math.atan2(rT, rS);
                rK.style.transform = "rotate(" + rX + "rad)";
                rK.style.width = rV + "px";
                io(rX, rV / rW);
                return true;
            }
        };
        mU.onEnd = function (rP) {
            if (rP.identifier === rN) {
                mU.style.display = "none";
                rN = null;
                io(0, 0);
            }
        };
        function rO() {
            mU.style.left = rL + "px";
            mU.style.top = rM + "px";
        }
    }
    mV();
    function mW(rK) {
        return [rK.clientX / kS, rK.clientY / kS];
    }
    var mX = document.querySelector(".angry-btn");
    var mY = document.querySelector(".sad-btn");
    var mZ = document.querySelector(".swap-btn");
    var n0 = {};
    var n1 = {};
    if (kM) {
        document.body.classList.add("mobile");
        window.ontouchstart = function (rL) {
            for (let rM = 0; rM < rL.changedTouches.length; rM++) {
                const rN = rL.changedTouches[rM];
                const rO = rN.target;
                if (rO === kj) {
                    mU.onStart(rN);
                    continue;
                } else if (rO === mY) {
                    pr("mouse2", true);
                    n0[rN.identifier] = function () {
                        pr("mouse2", false);
                    };
                } else if (rO === mX) {
                    pr("mouse0", true);
                    n0[rN.identifier] = function () {
                        pr("mouse0", false);
                    };
                } else if (rO === mZ) {
                    pr("KeyR", true);
                    n0[rN.identifier] = function () {
                        pr("KeyR", false);
                    };
                }
                if (mL) {
                    continue;
                }
                if (rO.petal) {
                    const rP = n4(rO);
                    mQ(rN);
                    if (mL) {
                        n1[rN.identifier] = mT;
                    }
                    n0[rN.identifier] = function () {
                        if (mL) {
                            mS();
                        }
                        rP.doShow = false;
                    };
                }
            }
        };
        document.addEventListener("touchmove", function (rL) {
            for (let rM = 0; rM < rL.changedTouches.length; rM++) {
                const rN = rL.changedTouches[rM];
                if (mU.onMove(rN)) {
                    rL.preventDefault();
                }
                if (n1[rN.identifier]) {
                    n1[rN.identifier](rN);
                    rL.preventDefault();
                } else if (mL) {
                    rL.preventDefault();
                }
            }
        }, {
            passive: false
        });
        window.ontouchend = function (rL) {
            for (let rM = 0; rM < rL.changedTouches.length; rM++) {
                const rN = rL.changedTouches[rM];
                mU.onEnd(rN);
                if (n0[rN.identifier]) {
                    n0[rN.identifier]();
                    delete n0[rN.identifier];
                    delete n1[rN.identifier];
                }
            }
        };
    } else {
        document.body.classList.add("desktop");
        let rL = false;
        window.onmousedown = function (rM) {
            if (rM.button === 0) {
                rL = true;
                mQ(rM);
            }
        };
        document.onmousemove = function (rM) {
            mT(rM);
            const rN = rM.target;
            if (rN.petal && !rL) {
                const rO = n4(rN);
                rN.onmouseleave = rN.onmousedown = function () {
                    rO.doShow = false;
                };
            }
        };
        document.onmouseup = function (rM) {
            if (rM.button === 0) {
                rL = false;
                mS();
            }
        };
        kn.onmousemove = kj.onmousemove = function (rM) {
            ne = rM.clientX - kV() / 2;
            nf = rM.clientY - kW() / 2;
            if (!pc.enable_kb_movement && iz && !mG) {
                const rN = Math.hypot(ne, nf);
                const rO = Math.atan2(nf, ne);
                io(rO, rN < 50 ? rN / 100 : 1);
            }
        };
    }
    function n2(rM, rN, rO) {
        return Math.max(rN, Math.min(rM, rO));
    }
    var n3 = [];
    function n4(rM) {
        let rN = n3.find(rO => rO.el === rM);
        if (rN) {
            rN.doShow = true;
            return rN;
        }
        rN = typeof rM.petal === "function" ? rM.petal() : nL(rM.petal, rM.canShowDrops);
        rN.doShow = true;
        rN.alpha = 0;
        rN.style.position = "fixed";
        rN.style.transform = "none";
        kI.appendChild(rN);
        if (kM) {
            rN.style.right = "10px";
            rN.style.top = "10px";
            rN.style.bottom = "unset";
            rN.style.left = "unset";
        } else {
            const rO = rM.getBoundingClientRect();
            const rP = rN.getBoundingClientRect();
            rN.style.top = n2(rM.tooltipDown ? (rO.top + rO.height) / kS + 10 : (rO.top - rP.height) / kS - 10, 10, window.innerHeight / kS - 10) + "px";
            rN.style.left = n2((rO.left + rO.width / 2 - rP.width / 2) / kS, 10, window.innerWidth / kS - 10 - rP.width / kS) + "px";
            rN.style.bottom = "unset";
            rN.style.right = "unset";
        }
        rN.style.transition = "none";
        rN.style.opacity = 0;
        rN.el = rM;
        n3.push(rN);
        return rN;
    }
    var n5 = document.querySelector(".inventory-rarities");
    function n6(rM, rN = 1) {
        if (!iT[rM]) {
            iT[rM] = 0;
            pb(rM);
            od();
        }
        iT[rM] += rN;
        ob[rM].setCount(iT[rM]);
        if (iT[rM] <= 0) {
            delete iT[rM];
            ob[rM].dispose();
            od();
        }
        n7();
    }
    function n7() {
        n5.innerHTML = "";
        if (Object.keys(iT).length === 0) {
            n5.style.display = "none";
        } else {
            n5.style.display = "";
        }
        const rM = {};
        for (const rN in iT) {
            const rO = dB[rN];
            const rP = iT[rN];
            rM[rO.tier] = (rM[rO.tier] || 0) + rP;
        }
        oF(n5, rM);
        for (const rQ in or) {
            const rR = or[rQ];
            rR.classList[rM[rQ] ? "remove" : "add"]("disabled");
        }
    }
    function n8(rM, rN) {
        if (rM === rN) {
            return;
        }
        im(new Uint8Array([cH.iSwapPetal, rM, rN]));
    }
    function n9(rM) {
        return rM.pickedEl || rM.querySelector(".petal");
    }
    function na(rM, rN, rO = true) {
        const rP = mK.find(rZ => rZ === rM);
        if (rP) {
            rP.reset(rN);
            return rP;
        }
        let rQ;
        let rR;
        let rS;
        let rT;
        let rU = 0;
        let rV = 0;
        let rW = 0;
        let rX;
        rM.reset = function (rZ, s0) {
            rX = rM.targetEl || rM.parentNode;
            rX.pickedEl = rM;
            rM.startEl = rX;
            rM.canRemove = false;
            rM.released = false;
            const s1 = rM.getBoundingClientRect();
            if (rZ.tagName === undefined) {
                rU = rZ.clientX - s1.x;
                rV = rZ.clientY - s1.y;
                rM.setTargetByEvent(rZ);
                rQ = rS;
                rR = rT;
            } else {
                rQ = s1.x;
                rR = s1.y;
                rM.setTargetEl(rZ);
                rM.release(s0);
            }
            rY();
        };
        rM.release = function (rZ = true) {
            rM.released = true;
            if (rX.pickedEl === rM) {
                rX.pickedEl = null;
            }
            if (!rM.targetEl) {
                rM.setTargetEl(rX);
                if (Math.hypot(rS - rQ, rT - rR) > kS * 50) {
                    rM.setTargetEl(mP);
                }
            } else if (rZ) {
                const s0 = n9(rM.targetEl);
                rM.swapped = s0;
                if (s0) {
                    na(s0, rX, false);
                }
            }
            if (rM.targetEl !== rX) {
                rM.reloadT = 0;
            }
            rM.targetEl.pickedEl = rM;
        };
        rM.setTargetEl = function (rZ) {
            rM.targetEl = rZ;
            const s0 = rZ.getBoundingClientRect();
            rS = s0.x;
            rT = s0.y;
            rM.style.fontSize = rZ === mP ? "1px" : getComputedStyle(rZ).fontSize;
        };
        rM.setTargetByEvent = function (rZ) {
            rS = rZ.clientX - rU;
            rT = rZ.clientY - rV;
            rM.targetEl = null;
            let s0 = Infinity;
            let s1 = null;
            const s2 = kp.querySelectorAll(".petal.empty");
            for (let s3 = 0; s3 < s2.length; s3++) {
                const s4 = s2[s3];
                const s5 = s4.getBoundingClientRect();
                const s6 = Math.hypot(s5.x + s5.width / 2 - rZ.clientX, s5.y + s5.height / 2 - rZ.clientY);
                if (s6 < kS * 30) {
                    if (s6 < s0) {
                        s1 = s4;
                        s0 = s6;
                    }
                }
            }
            if (s1 && s1 !== rX) {
                rM.setTargetEl(s1);
            }
        };
        rM.reset(rN, rO);
        rM.classList.add("picked");
        kI.appendChild(rM);
        function rY() {
            rM.style.left = rQ / kS + "px";
            rM.style.top = rR / kS + "px";
        }
        rM.resize = function () {
            if (rM.targetEl) {
                rM.setTargetEl(rM.targetEl);
            }
        };
        rM.update = function () {
            rQ = px(rQ, rS, 100);
            rR = px(rR, rT, 100);
            rY();
            let rZ = 0;
            let s0 = Infinity;
            if (rM.targetEl) {
                s0 = Math.hypot(rS - rQ, rT - rR);
                rZ = s0 > 5 ? 1 : 0;
            } else {
                rZ = 1;
            }
            rW = px(rW, rZ, 100);
            rM.style.transform = "scale(" + (1 + rW * 0.3) + ") rotate(" + rW * Math.sin(Date.now() / 150) * 10 + "deg)";
            if (rM.released && rW < 0.05 && s0 < 5) {
                rM.classList.remove("picked");
                rM.style.left = rM.style.top = rM.style.transform = rM.style.fontSize = rM.style.transformOrigin = "";
                rM.canRemove = true;
                rM.targetEl.appendChild(rM);
                rM.targetEl.pickedEl = null;
                rM.targetEl = null;
            }
        };
        mK.push(rM);
        return rM;
    }
    var nb = cX.neutral;
    document.oncontextmenu = function () {
        return false;
    };
    var nc = 0;
    var nd = 0;
    var ne = 0;
    var nf = 0;
    var ng = 1;
    var nh = 1;
    document.onwheel = function (rM) {
        if (rM.target === kj) {
            ng *= rM.deltaY < 0 ? 1.1 : 0.9;
            ng = Math.min(3, Math.max(1, ng));
        }
    };
    var nj = {
        other: "#b9baba",
        me: "#fbdf26",
        error: "#ff4f4f"
    };
    var nk = {};
    function nl(rM, rN) {
        nm(rM, null, null, null, jy(rN));
    }
    function nm(rM, rN, rO, rP = nj.other, rQ) {
        const rR = nR("<div class=\"chat-item\"></div>");
        if (!rQ) {
            if (rN) {
                const rT = nR("<div class=\"chat-name\"></div>");
                k9(rT, rN + ":");
                rR.appendChild(rT);
            }
            const rS = nR("<div class=\"chat-text\"></div>");
            k9(rS, rO);
            rR.appendChild(rS);
            rR.children[0].style.color = rP;
            if (rN) {
                rR.prepend(nR("<div stroke=\"[GLOBAL] \"></div>"));
            }
        } else {
            rR.innerHTML = rQ;
        }
        pk.appendChild(rR);
        while (pk.children.length > 60) {
            pk.children[0].remove();
        }
        pk.scrollTop = pk.scrollHeight;
        rR.text = rO;
        rR.col = rP;
        nn(rM, rR);
        return rR;
    }
    function nn(rM, rN) {
        rN.t = 0;
        rN.spawnT = 0;
        if (!nk[rM]) {
            nk[rM] = [];
        }
        nk[rM].push(rN);
    }
    var no = {};
    kj.onmousedown = window.onmouseup = nw(function (rM) {
        const rN = "mouse" + rM.button;
        pr(rN, rM.type === "mousedown");
    });
    var np = 0;
    function nq(rM) {
        const rN = 512;
        const rO = rN / 100;
        const rP = document.createElement("canvas");
        rP.width = rP.height = rN;
        const rQ = rP.getContext("2d");
        rQ.translate(rN / 2, rN / 2);
        rQ.scale2(rO);
        rM.drawIcon(rQ);
        const rR = (rM.isPetal ? "Petal " : "Mob ") + rM.uiName;
        nr(rP, rR);
    }
    function nr(rM, rN) {
        const rO = document.createElement("a");
        rO.download = rN;
        rO.href = typeof rM === "string" ? rM : rM.toDataURL();
        rO.click();
        hJ(rN + " downloaded!", hO.Common);
    }
    var ns = 0;
    setInterval(function () {
        ns = 0;
    }, 6000);
    setInterval(function () {
        nx.length = 0;
    }, 10000);
    var nt = false;
    var nu = false;
    function nv(rM) {
        rM = rM.trim();
        if (!rM) {
            hJ("No username provided.");
            hb("No username provided.");
        } else if (rM.length < cM || rM.length > cL) {
            hJ("Invalid username.");
            hb("Invalid username.");
        } else {
            hJ("Getting " + rM + "'s profile...", hO.Unusual);
            hb("Getting " + rM + "'s profile...");
            mA(rM);
        }
    }
    document.onkeydown = document.onkeyup = nw(function (rM) {
        if (rM.altKey) {
            rM.preventDefault();
        }
        nt = rM.altKey;
        nu = rM.shiftKey;
        if (rM.keyCode === 9) {
            rM.preventDefault();
            return;
        }
        if (document.activeElement && document.activeElement.tagName === "INPUT") {
            if (rM.type === "keyup" && rM.keyCode === 13) {
                if (document.activeElement === hE) {
                    hF.click();
                } else if (document.activeElement === pj) {
                    let rN = pj.value.trim().slice(0, cK);
                    if (rN && hX) {
                        if (pQ - np > 1000) {
                            const rO = rN.startsWith("/dlMob");
                            if (rO || rN.startsWith("/dlPetal")) {
                                const rP = rN.slice(rO ? 7 : 9);
                                if (!rP) {
                                    hJ("Provide a name dummy.");
                                } else if (rO) {
                                    const rQ = eL[rP];
                                    if (!rQ) {
                                        hJ("Invalid mob name: " + rP + "!");
                                    } else {
                                        nq(rQ);
                                    }
                                } else {
                                    const rR = dE[rP];
                                    if (!rR) {
                                        hJ("Invalid petal name: " + rP + "!");
                                    } else {
                                        nq(rR);
                                    }
                                }
                            } else if (rN.startsWith("/dlSprite")) {
                                nr(qy, "Sprite");
                            } else if (rN.startsWith("/profile")) {
                                const rS = rN.slice(9);
                                nv(rS);
                            } else {
                                let rT = 0;
                                for (let rU = 0; rU < nx.length; rU++) {
                                    if (ny(rN, nx[rU]) > 0.95) {
                                        rT++;
                                    }
                                }
                                if (rT >= 3) {
                                    ns += 10;
                                }
                                ns++;
                                if (ns > 3) {
                                    hJ("You have been muted for 60s for spamming.");
                                    np = pQ + 60000;
                                } else {
                                    nx.push(rN);
                                    if (nx.length > 10) {
                                        nx.shift();
                                    }
                                    rN = decodeURIComponent(encodeURIComponent(rN).replace(/%CC(%[A-Z0-9]{2})+%20/g, " ").replace(/%CC(%[A-Z0-9]{2})+(\w)/g, "$2"));
                                    im(new Uint8Array([cH.iChat, ...new TextEncoder().encode(rN)]));
                                    np = pQ;
                                }
                            }
                        } else {
                            nm(-1, null, "Slow it down sussy baka!", nj.error);
                        }
                    }
                    pj.value = "";
                    pj.blur();
                }
            }
            return;
        }
        pr(rM.code, rM.type === "keydown");
    });
    function nw(rM) {
        return function (rN) {
            if (rN instanceof Event && rN.isTrusted && !rN.repeat) {
                rM(rN);
            }
        };
    }
    var nx = [];
    function ny(rM, rN) {
        var rO = rM;
        var rP = rN;
        if (rM.length < rN.length) {
            rO = rN;
            rP = rM;
        }
        var rQ = rO.length;
        if (rQ == 0) {
            return 1;
        }
        return (rQ - nz(rO, rP)) / parseFloat(rQ);
    }
    function nz(rM, rN) {
        rM = rM.toLowerCase();
        rN = rN.toLowerCase();
        var rO = new Array();
        for (var rP = 0; rP <= rM.length; rP++) {
            var rQ = rP;
            for (var rR = 0; rR <= rN.length; rR++) {
                if (rP == 0) {
                    rO[rR] = rR;
                } else if (rR > 0) {
                    var rS = rO[rR - 1];
                    if (rM.charAt(rP - 1) != rN.charAt(rR - 1)) {
                        rS = Math.min(Math.min(rS, rQ), rO[rR]) + 1;
                    }
                    rO[rR - 1] = rQ;
                    rQ = rS;
                }
            }
            if (rP > 0) {
                rO[rN.length] = rQ;
            }
        }
        return rO[rN.length];
    }
    var nA = document.querySelector(".petals");
    var nB = document.querySelector(".petals.small");
    function nC(rM, rN = 1) {
        rM.save();
        rM.scale(rN * 0.25, rN * 0.25);
        rM.translate(-75, -75);
        rM.beginPath();
        rM.moveTo(75, 40);
        rM.bezierCurveTo(75, 37, 70, 25, 50, 25);
        rM.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        rM.bezierCurveTo(20, 80, 40, 102, 75, 120);
        rM.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        rM.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        rM.bezierCurveTo(85, 25, 75, 37, 75, 40);
        rM.fillStyle = "#ff7380";
        rM.fill();
        rM.lineJoin = rM.lineCap = "round";
        rM.strokeStyle = "#d43a47";
        rM.lineWidth = 12;
        rM.stroke();
        rM.restore();
    }
    for (let rM = 0; rM < dB.length; rM++) {
        const rN = dB[rM];
        if (rN.ability !== undefined) {
            switch (rN.ability) {
                case de.thirdEye:
                    rN.drawIcon = function (rO) {
                        rO.scale(2.5, 2.5);
                        lP(rO);
                    };
                    break;
                case de.wig:
                    rN.drawIcon = function (rO) {
                        rO.scale2(0.9);
                        const rP = pW();
                        rP.isBae = true;
                        rP.draw(rO);
                    };
                    break;
                case de.antennae:
                    rN.drawIcon = function (rO) {
                        rO.rotate(-Math.PI / 2);
                        rO.translate(-48, 0);
                        pV.makeAntenna(rO, false);
                    };
                    break;
                case de.ears:
                    rN.drawIcon = function (rO) {
                        rO.rotate(Math.PI / 10);
                        rO.translate(3, 21);
                        lQ(rO, true);
                    };
                    break;
                case de.heart:
                    rN.drawIcon = function (rO) {
                        nC(rO);
                    };
                    break;
                case de.spiderLeg:
                    rN.drawIcon = function (rO) {
                        rO.translate(0, 3);
                        rO.rotate(-Math.PI / 4);
                        rO.scale2(0.4);
                        pV.makeSpiderLegs(rO);
                        rO.beginPath();
                        rO.arc(0, 0, 33, 0, Math.PI * 2);
                        rO.lineWidth = 8;
                        rO.strokeStyle = "#333";
                        rO.stroke();
                    };
                    break;
                case de.halo:
                    rN.drawIcon = function (rO) {
                        rO.translate(0, 7);
                        rO.scale2(0.8);
                        pV.drawWingAndHalo(rO, 0.5);
                    };
                    break;
                case de.gem:
                    rN.drawIcon = function (rO) {
                        rO.scale2(1.3);
                        lT(rO);
                    };
                    break;
                default:
                    rN.drawIcon = function (rO) { };
            }
        } else {
            const rO = new lH(-1, rN.type, 0, 0, rN.uiAngle, rN.isLightsaber ? 16 : rN.size * 1.1, 0);
            rO.isIcon = true;
            if (rN.count === 1) {
                rN.drawIcon = function (rP) {
                    rO.draw(rP);
                };
            } else {
                rN.drawIcon = function (rP) {
                    for (let rQ = 0; rQ < rN.count; rQ++) {
                        rP.save();
                        const rR = rQ / rN.count * Math.PI * 2;
                        if (rN.fixAngle) {
                            rP.translate(...lf(rN.uiCountGap, 0, rR));
                        } else {
                            rP.rotate(rR);
                            rP.translate(rN.uiCountGap, 0);
                        }
                        rP.rotate(rN.countAngleOffset);
                        rO.draw(rP);
                        rP.restore();
                    }
                };
            }
        }
    }
    var nE = {
        red: "#e05748",
        green: "#5ef64f",
        pink: "#ff63eb",
        purple: "#c76cd1",
        lightblue: "#38ecd9",
        blue: "#5849f5",
        yellow: "#ceea33"
    };
    function nF() {
        const rP = document.querySelector(".rewards .dialog-content");
        let rQ = "\n\t<div><span stroke=\"Level\"></span></div>\n\t<div><span stroke=\"Health\"></span></div>\n\t<div><span stroke=\"Damage\"></span></div>\n\t<div><span stroke=\"Petal Slots\"></span></div>";
        for (let rR = 0; rR < 200; rR++) {
            const rS = d5(rR);
            const rT = rS * 200;
            const rU = rS * 25;
            const rV = d4(rR);
            rQ += "\n\t\t<div><span stroke=\"Level " + (rR + 1) + "\"></span></div>\n\t\t<div><span stroke=\"" + ka(Math.round(rT)) + "\"></span></div>\n\t\t<div><span stroke=\"" + ka(Math.round(rU)) + "\"></span></div>\n\t\t<div><span stroke=\"" + rV + "\"></span></div>";
        }
        rQ += "\n\t\t<div><span stroke=\"...\"></span></div>\n\t\t<div><span stroke=\"...\"></span></div>\n\t\t<div><span stroke=\"...\"></span></div>\n\t\t<div><span stroke=\"...\"></span></div>";
        rQ += "\n\t\t<div><span stroke=\"Level 191 + 30n\"></span></div>\n\t\t<div><span stroke=\"Same\"></span></div>\n\t\t<div><span stroke=\"Same\"></span></div>\n\t\t<div><span stroke=\"14 + 1n\"></span></div>";
        rP.innerHTML = rQ;
    }
    nF();
    function nG(rP, rQ) {
        const rR = eL[rP];
        const rS = rR.uiName;
        const rT = rR.tier;
        return "x" + rQ.count * rQ.petCount + (" " + rS + "\"></div> <div style=\"color:" + hP[rT] + "\" stroke=\"(" + hM[rT] + ")");
    }
    function nH(rP) {
        return rP.toFixed(2).replace(/\.?0+$/, "");
    }
    function nI(rP) {
        const rQ = rP.honeyRange;
        return Math.round(rQ * rQ / 2500);
    }
    var nJ = [["damage", "Damage", nE.red], ["health", "Health", nE.green], ["hpRegen", "Heal", nE.pink], ["poisonDamage", "Poison", nE.purple], ["duration", "Duration", nE.blue], ["lightningDmg", "Lightning", nE.lightblue], ["lightningBounces", "Bounces", nE.yellow], ["healthIncrease", "Flower Health", nE.yellow, rP => "+" + ka(rP)], ["pickupRange", "Extra Pickup Range", nE.yellow, rP => "+" + ka(rP)], ["webSize", "Web Radius", nE.yellow], ["reflect", "Damage Reflection", nE.yellow, rP => Math.round(rP * 100) + "%"], ["spinSpeed", "Extra Spin Speed", nE.yellow, rP => "+" + nH(rP) + " rad/s"], ["hpRegenPerSec", "Passive Heal", nE.pink, rP => ka(rP) + "/s"], ["hpRegen75PerSec", "Passive Heal", nE.pink, rP => ka(rP) + "/s if H<50%"], ["mobSizeChange", "Mob Size Change", nE.yellow, rP => (rP > 0 ? "+" : "") + rP], ["extraSpeed", "Extra Speed", nE.lightblue, rP => "+" + rP + "%"], ["extraSpeedTemp", "Temporary Extra Speed", nE.lightblue, rP => "+" + parseInt(rP * 100) + "%"], ["agroRangeDec", "Mob Agro Range", nE.yellow, rP => "-" + rP + "%"], ["spawn", "Spawns", nE.yellow, nG], ["slowDuration", "Slowness Duration", nE.lightblue, rP => rP / 1000 + "s"], ["affectHealDur", "Heal Affect Duration", nE.lightblue, rP => rP + "s"], ["shield", "Shield", nE.lightblue, rP => ka(rP) + " HP"], ["soakTime", "Soak Duration", nE.lightblue, rP => rP + "s"], ["despawnTime", "Take Down Time", nE.lightblue, rP => rP / 1000 + "s"], ["armor", "Armor", nE.lightblue], ["flowerPoison", "Flower Poison", nE.lightblue], ["twirl", "Orbit Twirl", nE.lightblue, rP => rP + " radians"], ["entRot", "Mob Rotation", nE.lightblue, rP => rP + " radians"], ["consumeProjDamage", "Poop Damage", nE.lightblue], ["consumeProjHealth", "Poop Health", nE.yellow], ["retardDuration", "Retardation Duration", nE.lightblue, rP => rP / 1000 + "s"], ["shieldRegenPerSec", "Passive Shield", nE.pink, rP => ka(rP) + "/s"], ["honeyDmg", "Honey Damage", nE.lightblue, (rP, rQ) => ka(rP) + "/tile (" + ka(nI(rQ) * rP * 20) + "/s for all tiles)"], ["honeyRange", "Honey Range", nE.yellow, (rP, rQ) => ka(rP) + " (" + nI(rQ) + " tiles)"], ["passiveBoost", "Nitro Boost", nE.lightblue, (rP, rQ) => nH(rP * rQ.size)], ["elongation", "Elongation", nE.lightblue], ["shlong", "Orbit Shlongation", nE.yellow], ["orbitDance", "Orbit Dance", nE.lightblue], ["weight", "Petal Weight", nE.lightblue], ["curePoison", "Poison Reduction", nE.lightblue], ["petSizeIncrease", "Pet Size Increase", nE.lightblue, rP => "+" + nH(rP * 100) + "%"], ["projDamage", "Missile Damage", nE.blue], ["projHealth", "Missile Health", nE.lightblue], ["projPoisonDamage", "Missile Poison", nE.pink], ["projAffectHealDur", "Heal Affect Duration", nE.lightblue, rP => rP + "s"], ["fireDamage", "Fire Damage", nE.lightblue], ["fireTime", "Fire Duration", nE.yellow, rP => rP / 1000 + "s"]];
    var nK = [["orbitRange", "Range", nE.lightblue], ["fovFactor", "Extra Vision", nE.yellow, rP => ka(rP * 100) + "%"], ["extraRange", "Extra Range", nE.yellow], ["breedPower", "Breed Strength", nE.lightblue], ["breedRange", "Breed Range", nE.yellow], ["extraSpeed", "Extra Speed", nE.lightblue, rP => "+" + rP + "%"], ["petHeal", "Pet Heal", nE.lightblue, rP => ka(rP) + "/s"], ["shieldHpLosePerSec", "Health Depletion", nE.red, rP => rP * 100 + "%/s"], ["shieldReload", "Shield Reuse Cooldown", nE.lightblue, rP => rP + "s"], ["misReflectDmgFactor", "Reflected Missile Damage", nE.yellow, rP => "-" + parseInt((1 - rP) * 100) + "%"]];
    function nL(rP, rQ = true) {
        let rR = "";
        let rS = "";
        let rT;
        if (rP.ability === undefined) {
            rT = nJ;
            if (rP.respawnTime) {
                rS = "<div class=\"petal-reload petal-info\">\n\t\t\t\t<div stroke=\"" + (rP.respawnTime / 1000 + "s" + (rP.useTime > 0 ? " + " + rP.useTime / 1000 + "s" : "")) + "\"></div>\n\t\t\t\t<div class=\"reload\" stroke=\"↻\"></div>\n\t\t\t</div>";
            }
        } else {
            rT = nK;
        }
        for (let rV = 0; rV < rT.length; rV++) {
            const [rW, rX, rY, rZ] = rT[rV];
            const s0 = rP[rW];
            if (s0 && s0 !== 0) {
                rR += "<div class=\"petal-info\">\n\t\t\t\t<div style=\"color: " + rY + "\" stroke=\"" + rX + ":\"></div>\n\t\t\t\t<div stroke=\"" + (rZ ? rZ(s0, rP) : ka(s0)) + "\"></div>\n\t\t\t</div>";
            }
        }
        const rU = nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" stroke=\"" + rP.uiName + "\"></div>\n\t\t<div class=\"tooltip-subtitle\" stroke=\"" + hM[rP.tier] + "\" style=\"color:" + hP[rP.tier] + "\"></div>\n\t\t" + rS + "\n\t\t<div class=\"tooltip-desc\" stroke=\"" + rP.desc + "\"></div>\n\t\t" + rR + "\n\t</div>");
        if (rP.drops && rQ) {
            rU.lastElementChild.style.marginBottom = "10px";
            for (let s1 = 0; s1 < rP.drops.length; s1++) {
                const [s2, s3] = rP.drops[s1];
                const s4 = nR("<div class=\"petal-drop-row\"></div>");
                rU.appendChild(s4);
                const s5 = f4[s3][rP.tier];
                for (let s6 = 0; s6 < s5.length; s6++) {
                    const [s7, s8] = s5[s6];
                    const s9 = eV(s2, s8);
                    const sa = nR("<div class=\"petal petal-drop tier-" + s9.tier + "\" " + qB(s9) + ">\n\t\t\t\t\t\n\t\t\t\t\t<div class=\"drop-rate\" stroke=\"" + s7 + "%\"></div>\n\t\t\t\t</div>");
                    s4.appendChild(sa);
                }
            }
        }
        return rU;
    }
    function nM() {
        if (mL) {
            mL.remove();
            mL = null;
        }
        const rP = kp.querySelectorAll(".petal");
        for (let rQ = 0; rQ < rP.length; rQ++) {
            const rR = rP[rQ];
            rR.remove();
        }
        for (let rS = 0; rS < iP; rS++) {
            const rT = nR("<div class=\"petal empty\"></div>");
            rT.index = rS;
            const rU = iQ[rS];
            if (rU) {
                const rV = nR("<div class=\"petal tier-" + rU.tier + "\" " + qB(rU) + "></div>");
                rV.petal = rU;
                rV.isHudPetal = true;
                rV.localId = iS.pop();
                nQ(rV, rU);
                rT.appendChild(rV);
                iR[rV.localId] = rV;
            }
            if (rS >= iO) {
                rT.appendChild(nR("<div class=\"petal-key\" stroke=\"[" + (rS - iO + 1) % 10 + "]\"></div>"));
                nB.appendChild(rT);
            } else {
                nA.appendChild(rT);
            }
        }
    }
    function nN(rP) {
        if (rP < 0.5) {
            return rP * 4 * rP * rP;
        } else {
            return 1 - Math.pow(rP * -2 + 2, 3) / 2;
        }
    }
    var nO = [];
    function nP(rP, rQ) {
        rP.reloadT = 0;
        rP.uiHealth = 1;
        let rR = 1;
        let rS = 0;
        let rT = -1;
        rP.classList.add("no-icon");
        rP.setAttribute("style", "");
        const rU = nR("<canvas class=\"petal-bg\"></canvas>");
        rP.appendChild(rU);
        nO.push(rU);
        const rV = qt;
        rU.width = rU.height = rV;
        const rW = rU.getContext("2d");
        rU.render = function () {
            rW.clearRect(0, 0, rV, rV);
            if (rS < 0.99) {
                rW.globalAlpha = 1 - rS;
                rW.fillStyle = "rgba(0,0,0,0.2)";
                rW.fillRect(0, 0, rV, (1 - rR) * rV);
            }
            if (rS < 0.01) {
                return;
            }
            rW.globalAlpha = rS;
            rW.save();
            rW.scale2(rV / 100);
            rW.translate(50, 45);
            let rX = rP.reloadT;
            rX = nN(rX);
            const rY = Math.PI * 2 * rX;
            rW.rotate(rY * 4);
            rW.beginPath();
            rW.moveTo(0, 0);
            rW.arc(0, 0, 100, 0, rY);
            rW.moveTo(0, 0);
            rW.arc(0, 0, 100, 0, Math.PI * 2, true);
            rW.fillStyle = "rgba(0,0,0,0.35)";
            rW.fill("evenodd");
            rW.restore();
        };
        rU.update = function () {
            rP.reloadT += pR / (rQ.respawnTime + 200);
            let rX = 1;
            let rY = rP.uiHealth;
            if (rP.reloadT >= 1) {
                rX = 0;
            }
            const rZ = rP.targetEl || rP.parentNode;
            if (rZ && rZ.parentNode === nB || !iz) {
                rY = 1;
                rX = 0;
            }
            rS = px(rS, rX, 100);
            rR = px(rR, rY, 100);
            const s0 = Math.round((1 - rR) * 100);
            const s1 = Math.round(rS * 100) / 100;
            if (s1 == 0 && s0 <= 0) {
                rU.canRender = false;
                rU.style.display = "none";
            } else {
                rU.canRender = true;
                rU.style.display = "";
            }
            rT = s0;
        };
        rP.appendChild(nR("<div class=\"petal-icon\" " + qB(rQ) + "></div>"));
    }
    function nQ(rP, rQ, rR = true) {
        if (rR && rQ.ability === undefined) {
            nP(rP, rQ);
        }
    }
    function nR(rP) {
        hA.innerHTML = rP;
        return hA.children[0];
    }
    var nS = document.querySelector(".mob-gallery .dialog-content");
    var nT = [];
    function nU() {
        nS.innerHTML = "<div class=\"slot\"></div>".repeat(eK * dG);
        nT = Array.from(nS.children);
    }
    nU();
    var nV = {};
    for (let rP = 0; rP < eJ.length; rP++) {
        const rQ = eJ[rP];
        if (!nV[rQ.type]) {
            nV[rQ.type] = new lH(-1, rQ.type, 0, 0, rQ.dontUiRotate ? 0 : -Math.PI * 3 / 4, rQ.baseSize, 1);
            nV[rQ.type].isIcon = true;
        }
        const rR = nV[rQ.type];
        let rS = null;
        if (rQ.chain !== undefined) {
            rS = new lH(-1, rQ.chain, 0, 0, 0, rQ.baseSize, 1);
        }
        rQ.drawIcon = function (rT) {
            rT.scale(0.5, 0.5);
            rR.draw(rT);
            if (rS) {
                rT.rotate(rR.angle);
                rT.translate(-rQ.baseSize * 2, 0);
                rS.draw(rT);
            }
        };
    }
    function nW(rT, rU = false) {
        const rV = nR("<div class=\"petal tier-" + rT.tier + "\" " + qB(rT) + "></div>");
        jZ(rV);
        rV.petal = rT;
        if (rU) {
            return rV;
        }
        const rW = dG * rT.uniqueIndex + rT.tier;
        const rX = nT[rW];
        nS.insertBefore(rV, rX);
        rX.remove();
        nT[rW] = rV;
        return rV;
    }
    var nX = document.querySelector(".absorb-petals");
    var nY = document.querySelector(".absorb-petals-btn");
    var nZ = document.querySelector(".box");
    var o0 = document.querySelector(".gamble-petals-btn");
    var o1 = document.querySelector(".level-progress");
    var o2 = o1.querySelector(".main");
    var o3 = o1.querySelector(".prediction");
    var o4 = document.querySelector(".xp");
    var o5 = document.querySelector(".level");
    var o6 = false;
    var o7 = 0;
    var o8 = false;
    nY.onclick = function () {
        o6 = true;
        o7 = 0;
        o8 = false;
    };
    o0.onclick = function () {
        if (this.classList.contains("off") || jz) {
            return;
        }
        kJ("\n\t\t<div stroke=\"Gambling will put your petals in lottery. This is very risky and you can very well lose your petals. A random winner is selected from lottery every 3h and gets all petals polled in lottery. Win rate is more if you gamble higher rarity petals.\"></div>\n\t\t<br>\n\t\t<div stroke=\"Players like fleepoint, CricketCai & Hani have lost their entire inventory by going all in. Be careful and don't be greedy.\"></div>\n\t\t<br>\n\t\t<div stroke=\"Win rate is also capped to 25% to prevent domination. If you already have win rate closer to that, gambling more petals won't affect your win rate.\"></div>\n\t\t<br>\n\t\t<div stroke=\"You can only win petals of rarity upto max rarity you have gambled plus 1. For example, if you gamble a common & an ultra, you will be allowed to win upto super petals.\"></div>\n\t", rT => {
            if (rT) {
                o6 = true;
                o7 = 0;
                o8 = true;
            }
        });
    };
    nX.innerHTML = "<div class=\"slot\"></div>".repeat(dF * dG);
    var o9 = Array.from(nX.children);
    var oa = document.querySelector(".inventory .inventory-petals");
    var ob = {};
    function oc() {
        for (let rT in ob) {
            ob[rT].dispose();
        }
        ob = {};
        for (let rU in iT) {
            pb(rU);
        }
        od();
    }
    function od() {
        oe(oa);
    }
    function oe(rT) {
        const rU = Array.from(rT.querySelectorAll(".petal"));
        rU.sort((rV, rW) => {
            const rX = rW.petal.tier - rV.petal.tier;
            if (rX === 0) {
                return rW.petal.id - rV.petal.id;
            } else {
                return rX;
            }
        });
        for (let rV = 0; rV < rU.length; rV++) {
            const rW = rU[rV];
            rT.appendChild(rW);
        }
    }
    function of(rT, rU) {
        const rV = rU.tier - rT.tier;
        if (rV === 0) {
            return rU.id - rT.id;
        } else {
            return rV;
        }
    }
    function og(rT, rU = true) {
        const rV = nR("<div class=\"petal spin tier-" + rT.tier + "\" " + qB(rT) + ">\n\t\t\n\t\t<div class=\"petal-count\" stroke=\"x99\"></div>\n\t</div>");
        setTimeout(function () {
            rV.classList.remove("spin");
        }, 500);
        rV.petal = rT;
        if (rU) { }
        rV.countEl = rV.querySelector(".petal-count");
        return rV;
    }
    var oh = nR("<div class=\"dialog-content craft\">\n\t<div class=\"absorb-row\">\n\t\t<div class=\"container\"></div>\n\t\t<div class=\"btn craft-btn\">\n\t\t\t<span stroke=\"Craft\"></span>\n\t\t\t<div class=\"craft-rate\" stroke=\"?% success rate\"></div>\n\t\t</div>\n\t</div>\n\t<div stroke=\"Combine 5 of the same petal to craft an upgrade\"></div>\n\t<div stroke=\"Failure will destroy 1-4 petals and put them in lottery\"></div>\n</div>");
    var oi = oh.querySelector(".container");
    var oj = oh.querySelector(".craft-btn");
    var ok = oh.querySelector(".craft-rate");
    var ol = [];
    for (let rT = 0; rT < 5; rT++) {
        const rU = nR("<div class=\"slot\"></div>");
        rU.updatePos = function (rV = 0) {
            const rW = rT / 5 * Math.PI * 2 - Math.PI / 2 + rV * Math.PI * 6;
            const rX = 50 + (rV > 0 ? Math.abs(Math.sin(rV * Math.PI * 6)) * -15 : 0);
            this.style.left = Math.cos(rW) * rX + 50 + "%";
            this.style.top = Math.sin(rW) * rX + 50 + "%";
        };
        rU.updatePos();
        rU.count = 0;
        rU.el = null;
        rU.reset = function () {
            rU.count = 0;
            rU.el = null;
            rU.innerHTML = "";
        };
        rU.addCount = function (rV) {
            if (!rU.el) {
                const rW = og(p0, false);
                rW.onclick = function () {
                    if (p2 || p4) {
                        return;
                    }
                    p8(null);
                };
                rU.appendChild(rW);
                rU.el = rW;
            }
            rU.count += rV;
            p6(rU.el.countEl, rU.count);
        };
        oi.appendChild(rU);
        ol.push(rU);
    }
    var om;
    var on = document.querySelector(".absorb");
    var oo = document.querySelector(".absorb .dialog-header span");
    var op = document.querySelector(".absorb .dialog-content");
    var oq = document.querySelector(".absorb-btn .tooltip span");
    var or = {};
    function os() {
        const rV = document.querySelector(".absorb-rarity-btns");
        for (let rW = 0; rW < dG; rW++) {
            const rX = nR("<div class=\"btn tier-" + rW + "\">\n\t\t\t<span stroke=\"ALL\"></div>\n\t\t</div>");
            rX.onclick = function () {
                let rY = pq;
                pq = true;
                for (const rZ in ob) {
                    const s0 = dB[rZ];
                    if (s0.tier !== rW) {
                        continue;
                    }
                    const s1 = ob[rZ];
                    s1.absorbPetalEl.click();
                }
                pq = rY;
            };
            or[rW] = rX;
            rV.appendChild(rX);
        }
    }
    os();
    var ot = false;
    var ou = document.querySelector(".switch-btn");
    ou.onclick = function () {
        document.body.classList.toggle("switched");
        ot = document.body.classList.contains("switched");
        const rV = ot ? "Craft" : "Absorb";
        k9(oo, rV);
        k9(oq, rV);
        if (ot) {
            on.appendChild(oh);
            oh.appendChild(nX);
            op.remove();
        } else {
            on.appendChild(op);
            op.insertBefore(nX, op.lastElementChild);
            oh.remove();
        }
    };
    var ov = document.querySelector(".flower-stats");
    var ow = oz("Flower Health", nE.green);
    var ox = oz("Flower Damage", nE.red);
    var oy = oz("Petal Slots", nE.blue);
    function oz(rV, rW) {
        const rX = nR("<div>\n\t\t<span style=\"margin-right:2px;color:" + rW + ";\" stroke=\"" + rV + ":\"></span>\n\t\t<span stroke=\"0\"></span>\n\t</div>");
        rX.setValue = function (rY) {
            k9(rX.children[1], ka(Math.round(rY)));
        };
        ov.appendChild(rX);
        return rX;
    }
    var oA = document.querySelector(".collected");
    var oB = document.querySelector(".collected-petals");
    oB.innerHTML = "";
    var oC = document.querySelector(".collected-rarities");
    var oD = {};
    function oE() {
        oB.innerHTML = "";
        oC.innerHTML = "";
        const rV = {};
        const rW = [];
        for (let rX in oD) {
            const rY = dB[rX];
            const rZ = oD[rX];
            rV[rY.tier] = (rV[rY.tier] || 0) + rZ;
            rW.push([rY, rZ]);
        }
        if (rW.length === 0) {
            oA.style.display = "none";
            return;
        }
        oA.style.display = "";
        rW.sort((s0, s1) => {
            return of(s0[0], s1[0]);
        }).forEach(([s0, s1]) => {
            const s2 = og(s0);
            jZ(s2);
            p6(s2.countEl, s1);
            oB.appendChild(s2);
        });
        oF(oC, rV);
    }
    function oF(rV, rW) {
        let rX = 0;
        for (let rY in d8) {
            const rZ = rW[d8[rY]];
            if (rZ !== undefined) {
                rX++;
                const s0 = nR("<div stroke=\"" + ka(rZ) + " " + rY + "\" style=\"color:" + hO[rY] + "\"></div>");
                rV.prepend(s0);
            }
        }
        if (rX % 2 === 1) {
            rV.children[0].style.gridColumn = "span 2";
        }
    }
    var oG = {};
    var oH = 0;
    var oI;
    var oJ;
    var oK;
    var oL;
    var oM = 0;
    var oN = 0;
    var oO = 0;
    var oP = 0;
    var oQ = 0;
    function oR() {
        const rV = d3(oH);
        oI = rV[0];
        oJ = rV[1];
        oL = d1(oI + 1);
        oK = oH - oJ;
        k9(o5, "Level " + (oI + 1) + " - " + iK(oK) + "/" + iK(oL) + " XP");
        const rW = d5(oI);
        ow.setValue(rW * 200);
        ox.setValue(rW * 25);
        oy.setValue(d4(oI));
        oN = Math.min(1, oK / oL);
        oP = 0;
        o0.querySelector(".tooltip").innerHTML = oI >= cG ? "<span stroke=\"Proceed with caution. Very risky!\"></span>" : "<span stroke=\"Unlocks at level " + (cG + 1) + "\"></span>";
    }
    var oS = 0;
    var oT = document.querySelector(".spawn-zones");
    for (let rV = 0; rV < cY.length; rV++) {
        const [rW, rX] = cY[rV];
        const rY = j8[rW];
        const rZ = nR("<div class=\"btn off\" style=\"background:" + hO[rY] + "\">\n\t\t<span stroke=\"" + rY + "\"></span>\n\t\t<div class=\"tooltip\"><span stroke=\"Unlocks at Level " + (rX + 1) + "\"></span></div>\n\t</div>");
        rZ.onclick = function () {
            if (oI >= rX) {
                const s0 = oT.querySelector(".active");
                if (s0) {
                    s0.classList.remove("active");
                }
                oS = rV;
                hC.spawn_zone = rV;
                this.classList.add("active");
            }
        };
        cY[rV].btn = rZ;
        oT.appendChild(rZ);
    }
    function oU() {
        const s0 = parseInt(hC.spawn_zone) || 0;
        cY[0].btn.click();
        cY.forEach((s1, s2) => {
            const s3 = s1[1];
            if (oI >= s3) {
                s1.btn.classList.remove("off");
                if (s0 === s2) {
                    s1.btn.click();
                }
            } else {
                s1.btn.classList.add("off");
            }
        });
    }
    var oV = document.querySelector(".gamble-prediction");
    setInterval(() => {
        if (!on.classList.contains("show")) {
            return;
        }
        oW();
    }, 1000);
    function oW() {
        if (k0) {
            let s0 = 0;
            for (const s2 in k0) {
                s0 += oX(s2, k0[s2]);
            }
            let s1 = 0;
            for (const s3 in oG) {
                const s4 = oX(s3, oG[s3].count);
                s1 += s4;
                s0 += s4;
            }
            if (s1 > 0) {
                const s5 = Math.min(25, s1 / s0 * 100);
                const s6 = s5 > 1 ? s5.toFixed(2) : s5.toFixed(5);
                k9(oV, "+" + s6 + "%");
            }
        }
    }
    function oX(s0, s1) {
        const s2 = dB[s0];
        if (!s2) {
            return 0;
        }
        const s3 = s2.tier;
        return Math.pow(s3 * 10, s3) * s1;
    }
    var oY = document.querySelector(".absorb-clear-btn");
    oY.onclick = function () {
        for (const s0 in oG) {
            const s1 = oG[s0];
            s1.dispose();
        }
        oZ();
    };
    oZ();
    oR();
    function oZ() {
        const s0 = Object.values(oG);
        nZ.classList.remove("expand");
        const s1 = s0.length === 0;
        oY.style.display = s1 ? "none" : "";
        oQ = 0;
        let s2 = 0;
        const s3 = s0.length > 1 ? 50 : 0;
        for (let s5 = 0, s6 = s0.length; s5 < s6; s5++) {
            const s7 = s0[s5];
            const s8 = s5 / s6 * Math.PI * 2;
            s7.setPos(Math.cos(s8) * s3 + 50, Math.sin(s8) * s3 + 50);
            oQ += d2[s7.el.petal.tier] * s7.count;
        }
        nZ.classList[s3 ? "add" : "remove"]("expand");
        nY.classList[s0.length > 0 ? "remove" : "add"]("disabled");
        const s4 = oI >= cG;
        o0.classList[s0.length > 0 && s4 ? "remove" : "add"]("off");
        oW();
        nZ.style.transform = "";
        o6 = false;
        o8 = false;
        o7 = 0;
        oM = Math.min(1, (oK + oQ) / oL) || 0;
        k9(o4, oQ > 0 ? "+" + iK(oQ) + " XP" : "");
    }
    var p0;
    var p1 = 0;
    var p2 = false;
    var p3 = 0;
    var p4 = null;
    function p5() {
        oj.classList[p1 < 5 ? "add" : "remove"]("disabled");
    }
    oj.onclick = function () {
        if (p2 || !p0 || p1 < 5 || !il() || p4) {
            return;
        }
        p2 = true;
        p3 = 0;
        p4 = null;
        oj.classList.add("disabled");
        const s0 = new DataView(new ArrayBuffer(7));
        s0.setUint8(0, cH.iCraft);
        s0.setUint16(1, p0.id);
        s0.setUint32(3, p1);
        im(s0);
    };
    function p6(s0, s1) {
        k9(s0, "x" + iK(s1));
    }
    function p7(s0) {
        if (typeof s0 === "number") {
            s0 = nH(s0);
        }
        k9(ok, s0 + "% success rate");
    }
    function p8(s0) {
        if (p0) {
            n6(p0.id, p1);
        }
        if (om) {
            om.click();
        }
        p0 = s0;
        p1 = 0;
        p5();
        for (let s1 = 0; s1 < ol.length; s1++) {
            ol[s1].reset();
        }
        if (p0) {
            p7(dD[p0.tier] * (jz ? 2 : 1) * (hd ? 0.9 : 1));
            oj.style.background = hP[p0.tier + 1];
        } else {
            p7("?");
        }
    }
    var p9 = 0;
    var pa = 1;
    function pb(s0) {
        const s1 = dB[s0];
        const s2 = og(s1);
        s2.containerDialog = pt;
        jZ(s2);
        s2.isInventoryPetal = true;
        oa.appendChild(s2);
        const s3 = og(s1);
        jZ(s3);
        s3.containerDialog = on;
        if (s1.tier >= db) {
            s3.classList.add("craft-disable");
        }
        s3.onclick = function () {
            if (pQ - p9 < 500) {
                pa++;
            } else {
                pa = 1;
            }
            p9 = pQ;
            if (ot) {
                if (p2 || s1.tier >= db) {
                    return;
                }
                const s7 = iT[s1.id];
                if (!s7) {
                    return;
                }
                if (p0 !== s1) {
                    p8(s1);
                }
                const s8 = ol.length;
                let s9 = pq ? s7 : Math.min(s8 * pa, s7);
                n6(s1.id, -s9);
                p1 += s9;
                p5();
                let sa = s9 % s8;
                let sb = (s9 - sa) / s8;
                const sc = [...ol].sort((se, sf) => se.count - sf.count);
                if (sb > 0) {
                    sc.forEach(se => se.addCount(sb));
                }
                let sd = 0;
                while (sa--) {
                    const se = sc[sd];
                    sd = (sd + 1) % s8;
                    se.addCount(1);
                }
                return;
            }
            if (!oG[s1.id]) {
                const sf = og(s1, false);
                k9(sf.countEl, "x1");
                sf.onclick = function (sh) {
                    sg.dispose();
                    oZ();
                };
                nZ.appendChild(sf);
                const sg = {
                    petal: s1,
                    count: 0,
                    el: sf,
                    setPos(sh, si) {
                        sf.style.left = sh + "%";
                        sf.style.top = si + "%";
                        sf.style.position = "absolute";
                    },
                    dispose(sh = true) {
                        sf.remove();
                        if (sh) {
                            n6(s1.id, this.count);
                        }
                        delete oG[s1.id];
                    }
                };
                oG[s1.id] = sg;
                oZ();
            }
            const s6 = oG[s1.id];
            if (iT[s1.id]) {
                const sh = iT[s1.id];
                const si = pq ? sh : Math.min(pa * 1, sh);
                s6.count += si;
                n6(s1.id, -si);
                p6(s6.el.countEl, s6.count);
            }
            oZ();
        };
        const s4 = dG * s1.uniqueIndex + s1.childIndex;
        const s5 = o9[s4];
        nX.insertBefore(s3, s5);
        s5.remove();
        o9[s4] = s3;
        s2.setCount = function (s6) {
            p6(s2.countEl, s6);
            p6(s3.countEl, s6);
        };
        s2.absorbPetalEl = s3;
        ob[s0] = s2;
        s2.dispose = function () {
            s2.remove();
            delete ob[s0];
            const s6 = nR("<div class=\"slot\"></div>");
            o9[s4] = s6;
            nX.insertBefore(s6, s3);
            s3.remove();
        };
        s2.setCount(iT[s0]);
        return s2;
    }
    var pc = {};
    var pd = {};
    function pe(s0, s1, s2, s3) {
        const s4 = document.querySelector(s2);
        s4.onchange = function () {
            pc[s0] = this.checked;
            hC[s0] = this.checked ? "1" : "0";
            if (s3) {
                s3(this.checked);
            }
        };
        pd[s0] = function () {
            s4.click();
        };
        s4.checked = hC[s0] === undefined ? s1 : hC[s0] === "1";
        s4.onchange();
    }
    var pf = document.querySelector(".clown");
    pf.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" stroke=\"Disclaimer:\"></div>\n\t\t<div class=\"tooltip-subtitle\" stroke=\"(if you say so)\" style=\"color:" + hO.Common + "\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Every asset is recreated manually. None of it is directly taken from florr. Not a single line of code is stolen from florr's source code. In fact, florr's source code wasn't even looked once during the entire development process.\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Prove us wrong, and we shut down the game immediately. But if you fail, you have to give us your first child to immolate it to the devil when the summer solstice has a full moon.\"></div>\n\t\t<div stroke=\"Special privilege for M28:\" style=\"color:" + hO.Unusual + "\"></div>\n\t\t<div stroke=\"We are ready to share the full client-side rendering code of our game with M28 if they wants us to do so.\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"— Zert\" style=\"float: right;\"></div>\n\t</div>");
    };
    pe("enable_kb_movement", false, ".keyboard-cb", mI);
    pe("enable_shake", true, ".shake-cb");
    pe("show_damage", true, ".damage-cb");
    pe("show_debug_info", true, ".debug-cb", s0 => kL.style.display = s0 ? "" : "none");
    pe("show_hitbox", false, ".hitbox-cb");
    pe("show_grid", false, ".grid-cb");
    pe("fixed_name_size", false, ".fixed-name-cb");
    pe("show_helper", true, ".helper-cb");
    pe("show_clown", true, ".clown-cb", s0 => pf.style.display = s0 ? "" : "none");
    pe("enable_min_scaling", false, ".scale-cb", kU);
    pe("low_quality", false, ".low-quality-cb", kY);
    pe("right_align_petals", false, ".right-align-petals-cb", s0 => pg(kp, "right", s0));
    pe("show_population", true, ".show-population-cb", s0 => pg(document.body, "hide-zone-mobs", !s0));
    pe("show_scoreboard", true, ".show-scoreboard-cb", s0 => pg(document.body, "hide-scoreboard", !s0));
    pe("show_bg_grid", true, ".show-bg-grid-cb");
    pe("show_health", false, ".show-health-cb");
    pe("fixed_mob_health_size", false, ".fixed-mob-health-cb");
    pe("fixed_player_health_size", false, ".fixed-player-health-cb");
    pe("change_font", false, ".change-font-cb", s0 => {
        pg(document.body, "change-font", s0);
        iC();
    });
    function pg(s0, s1, s2) {
        s0.classList[s2 ? "add" : "remove"](s1);
    }
    function ph() {
        const s0 = document.querySelector(".ui-scale select");
        const s1 = [];
        for (let s3 = 0; s3 <= 10; s3++) {
            s1.push(1 - s3 * 0.05);
        }
        for (const s4 of s1) {
            const s5 = nR("<option value=\"" + s4 + "\">" + nH(s4 * 100) + "%</option>");
            s0.appendChild(s5);
        }
        let s2 = parseFloat(hC.ui_scale);
        if (isNaN(s2) || !s1.includes(s2)) {
            s2 = s1[0];
        }
        s0.value = s2;
        kQ = s2;
        s0.onchange = function () {
            kQ = parseFloat(this.value);
            hC.ui_scale = this.value;
            kY();
        };
    }
    ph();
    var pi = document.querySelector(".chat");
    var pj = document.querySelector(".chat-input");
    pj.maxLength = cK;
    var pk = document.querySelector(".chat-content");
    function pl(s0) {
        const s1 = nR("<div class=\"msg-overlay\">\n\t\t<div class=\"msg\">\n\t\t\t<div class=\"msg-title\" stroke=\"Export:\"></div>\n\t\t\t<div class=\"msg-warning\" stroke=\"DO NOT SHARE!\"></div> \n\t\t\t<div stroke=\"Below is your account password. It shouldn't be shared with anyone. Anyone with access to it has access to your account and all your petals. They can absorb or gamble all your petals. You have been warned!\"></div>\n\n\t\t\t<div class=\"export-row\">\n\t\t\t\t<input type=\"password\" class=\"textbox\" readonly tabindex=\"-1\">\n\t\t\t\t<input type=\"checkbox\" class=\"checkbox\">\n\t\t\t\t<div class=\"btn green copy-btn\">\n\t\t\t\t\t<span stroke=\"Copy\"></span>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"btn orange download-btn\">\n\t\t\t\t\t<span stroke=\"Download TXT\"></span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"btn close-btn\">\n\t\t\t\t<div class=\"close\"></div>\n\t\t\t</div>\n\t\t</div>\n\t</div>");
        km.appendChild(s1);
        const s2 = s1.querySelector(".textbox");
        s2.value = s0;
        const s3 = s1.querySelector(".checkbox");
        s3.onchange = function () {
            s2.type = this.checked ? "text" : "password";
        };
        s1.querySelector(".copy-btn").onclick = function () {
            jq(s0);
            hb("Copied!");
        };
        s1.querySelector(".download-btn").onclick = function () {
            const s5 = new Blob([s0], {
                type: "text/plain;charset=utf-8;"
            });
            const s6 = document.createElement("a");
            s6.href = URL.createObjectURL(s5);
            s6.download = (jw ? jw : "User") + " [Do Not Share] [Hornex.Pro].txt";
            s6.click();
            hb("Downloaded!");
        };
        s1.querySelector(".close-btn").onclick = function () {
            s1.remove();
        };
    }
    function pm() {
        const s0 = nR("<div class=\"msg-overlay\">\n\t\t<div class=\"msg\">\n\t\t\t<div class=\"msg-title\" stroke=\"Import:\"></div>\n\t\t\t<div stroke=\"Enter your account password below to import it. Don't forget to export your current account before importing or else you will lose your current account.\"></div>\n\t\t\t<br>\n\t\t\t<div stroke=\"You will also be logged out of Discord if you are logged in.\"></div>\n\n\t\t\t<div class=\"export-row\">\n\t\t\t\t<input type=\"password\" class=\"textbox\" placeholder=\"Enter password...\" tabindex=\"-1\">\n\t\t\t\t<input type=\"checkbox\" class=\"checkbox\">\n\t\t\t\t<div class=\"btn orange submit-btn\">\n\t\t\t\t\t<span stroke=\"Import\"></span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"btn close-btn\">\n\t\t\t\t<div class=\"close\"></div>\n\t\t\t</div>\n\t\t</div>\n\t</div>");
        km.appendChild(s0);
        const s1 = s0.querySelector(".textbox");
        const s2 = s0.querySelector(".checkbox");
        s2.onchange = function () {
            s1.type = this.checked ? "text" : "password";
        };
        s0.querySelector(".close-btn").onclick = function () {
            s0.remove();
        };
        s0.querySelector(".submit-btn").onclick = function () {
            const s3 = s1.value.trim();
            if (eU(s3)) {
                delete hC.discord_data;
                hC.player_id = s3;
                if (hV) {
                    try {
                        hV.close();
                    } catch (s4) { }
                }
                hb("Account imported!");
            } else {
                hb("Invalid account!");
            }
        };
    }
    document.querySelector(".export-btn").onclick = function () {
        if (i6) {
            pl(i6);
            return;
            const s0 = prompt("Copy and store it safely.\n\nDO NOT SHARE WITH ANYONE! Anyone with access to this code will have access to your account.\n\nPress OK to download code.", i6);
            if (s0 !== null) {
                const s2 = new Blob([i6], {
                    type: "text/plain;charset=utf-8;"
                });
                const s3 = document.createElement("a");
                s3.href = URL.createObjectURL(s2);
                s3.download = jw + " [DONT SHARE] [HORNEX.PRO].txt";
                s3.click();
                alert("Password downloaded!");
            }
        }
    };
    document.querySelector(".import-btn").onclick = function () {
        pm();
        return;
        const s0 = prompt("WARNING: Export your current account before proceeding to import another account. You will lose your current account otherwise.\n\nEnter account password:");
        if (s0 !== null) {
            if (eU(s0)) {
                let s1 = "Are you sure you want to import this account?";
                if (i7) {
                    s1 += " You will be logged out of your current Discord linked account.";
                }
                if (confirm(s1)) {
                    delete hC.discord_data;
                    hC.player_id = s0;
                    if (hV) {
                        try {
                            hV.close();
                        } catch (s2) { }
                    }
                }
            } else {
                alert("Invalid account!");
            }
        }
    };
    pe("hide_chat", false, ".hide-chat-cb", s0 => pj.classList[s0 ? "add" : "remove"]("hide-chat"));
    pe("anti_spam", true, ".anti-spam-cb");
    var pn = 0;
    var po = 0;
    var pp = 0;
    var pq = false;
    function pr(s0, s1) {
        if (s0 === "ShiftLeft" || s0 === "ShiftRight") {
            pq = s1;
        }
        if (s1) {
            switch (s0) {
                case "KeyV":
                    m3.mobGallery.toggle();
                    break;
                case "KeyC":
                    m3.absorb.toggle();
                    break;
                case "KeyX":
                    m3.inventory.toggle();
                    break;
                case "KeyM":
                    q3.classList.toggle("active");
                    break;
                case "KeyK":
                    pd.enable_kb_movement();
                    hb("[K] Keyboard Controls: " + (pc.enable_kb_movement ? "ON" : "OFF"));
                    break;
                case "KeyY":
                    pd.show_health();
                    hb("[Y] Show Health: " + (pc.show_health ? "ON" : "OFF"));
                    break;
                case "KeyF":
                    pd.show_hitbox();
                    hb("[F] Show Hitbox: " + (pc.show_hitbox ? "ON" : "OFF"));
                    break;
                case "KeyG":
                    pd.show_grid();
                    hb("[G] Show Grid: " + (pc.show_grid ? "ON" : "OFF"));
                    break;
                case "KeyL":
                    pd.show_debug_info();
                    hb("[L] Show Debug Info: " + (pc.show_debug_info ? "ON" : "OFF"));
                    break;
                case "KeyU":
                    pd.fixed_name_size();
                    hb("[U] Fixed Name Size: " + (pc.fixed_name_size ? "ON" : "OFF"));
                    break;
                case "KeyR":
                    if (!mL && hX) {
                        const s2 = nA.querySelectorAll(":scope > .petal");
                        const s3 = nB.querySelectorAll(":scope > .petal");
                        for (let s4 = 0; s4 < s2.length; s4++) {
                            const s5 = s2[s4];
                            const s6 = s3[s4];
                            const s7 = n9(s5);
                            const s8 = n9(s6);
                            if (s7) {
                                na(s7, s6);
                            } else if (s8) {
                                na(s8, s5);
                            }
                        }
                        im(new Uint8Array([cH.iSwapPetalRow]));
                    }
                    break;
                default:
                    if (!mL && hX && (s0.startsWith("Digit") || s0.startsWith("Numpad"))) {
                        sg: {
                            let s9 = parseInt(s0.slice(s0.startsWith("Digit") ? 5 : 6));
                            if (no.KeyL) {
                                if (pq) {
                                    kv(s9);
                                } else {
                                    ky(s9);
                                }
                                break sg;
                            }
                            if (s9 === 0) {
                                s9 = 10;
                            }
                            if (iO > 10 && pq) {
                                s9 += 10;
                            }
                            s9--;
                            if (s9 >= 0) {
                                const sa = nA.querySelectorAll(":scope > .petal")[s9];
                                const sb = nB.querySelectorAll(":scope > .petal")[s9];
                                if (sa && sb) {
                                    const sc = n9(sa);
                                    const sd = n9(sb);
                                    if (sc) {
                                        na(sc, sb);
                                    } else if (sd) {
                                        na(sd, sa);
                                    }
                                }
                            }
                            n8(s9, s9 + iO);
                        }
                    }
            }
            no[s0] = true;
        } else {
            if (s0 === "Enter") {
                if (kl.style.display === "" && pj.style.display === "none") {
                    kE.click();
                } else {
                    pj.focus();
                }
            }
            delete no[s0];
        }
        if (iz) {
            if (pc.enable_kb_movement) {
                let se = 0;
                let sf = 0;
                if (no.KeyW || no.ArrowUp) {
                    sf = -1;
                } else if (no.KeyS || no.ArrowDown) {
                    sf = 1;
                }
                if (no.KeyA || no.ArrowLeft) {
                    se = -1;
                } else if (no.KeyD || no.ArrowRight) {
                    se = 1;
                }
                if (se !== 0 || sf !== 0) {
                    pn = Math.atan2(sf, se);
                    io(pn, 1);
                } else if (po !== 0 || pp !== 0) {
                    io(pn, 0);
                }
                po = se;
                pp = sf;
            }
            ps();
        }
    }
    function ps() {
        const s0 = no.mouse2 || no.ShiftRight || no.ShiftLeft;
        const s1 = no.mouse0 || no.Space;
        const s2 = s0 << 1 | s1;
        if (nb !== s2) {
            nb = s2;
            im(new Uint8Array([cH.iMood, s2]));
        }
    }
    var pt = document.querySelector(".inventory");
    var pu = 0;
    var pv = 0;
    var pw = 0;
    function px(s0, s1, s2) {
        return s0 + (s1 - s0) * Math.min(1, pR / s2);
    }
    var py = 1;
    var pz = [];
    for (let s0 in cR) {
        if (["player", "lightning", "petalDrop", "web", "honeyTile", "portal"].includes(s0)) {
            continue;
        }
        pz.push(cR[s0]);
    }
    var pA = [];
    for (let s1 = 0; s1 < 30; s1++) {
        pB();
    }
    function pB(s2 = true) {
        const s3 = new lH(-1, pz[Math.floor(Math.random() * pz.length)], 0, Math.random() * d0, Math.random() * 6.28);
        if (!s3.isPetal && Math.random() < 0.01) {
            s3.isShiny = true;
        }
        if (s3.isPetal) {
            s3.nSize = s3.size = Math.random() * 8 + 12;
        } else {
            s3.nSize = s3.size = Math.random() * 30 + 25;
        }
        if (s2) {
            s3.x = Math.random() * cZ;
        } else {
            s3.x = -s3.size * 2;
        }
        s3.moveSpeed = (Math.random() * 3 + 4) * s3.nSize * 0.02;
        s3.angleSpeed = (Math.random() * 2 - 1) * 0.05;
        pA.push(s3);
    }
    var pC = 0;
    var pD = 0;
    var pE = 0;
    var pF = 0;
    setInterval(function () {
        const s2 = [kj, qv, ...Object.values(pG), ...nO];
        const s3 = s2.length;
        let s4 = 0;
        for (let s5 = 0; s5 < s3; s5++) {
            const s6 = s2[s5];
            s4 += s6.width * s6.height;
        }
        kL.setAttribute("stroke", Math.round(1000 / pR) + " FPS / " + ix.length + " in view / " + s3 + " ctxs (" + iK(s4) + " pxls) / " + (pF / 1000).toFixed(2) + "kbps");
        pF = 0;
    }, 1000);
    var pG = {};
    function pH(s2, s3, s4, s5, s6, s7 = false) {
        if (!pG[s3]) {
            const sa = hw ? new OffscreenCanvas(1, 1) : document.createElement("canvas");
            sa.ctx = sa.getContext("2d");
            sa.lastResizeTime = 0;
            sa.worldW = s4;
            sa.worldH = s5;
            pG[s3] = sa;
        }
        const s8 = pG[s3];
        const s9 = s8.ctx;
        if (pQ - s8.lastResizeTime > 500) {
            s8.lastResizeTime = pQ;
            const sb = s2.getTransform();
            const sc = Math.hypot(sb.a, sb.b) * 1.5;
            const sd = kX * sc;
            const se = Math.ceil(s8.worldW * sd) || 1;
            if (se !== s8.w) {
                s8.w = se;
                s8.width = se;
                s8.height = Math.ceil(s8.worldH * sd) || 1;
                s9.save();
                s9.scale(sd, sd);
                s6(s9);
                s9.restore();
            }
        }
        s8.wasDrawn = true;
        if (s7) {
            return s8;
        }
        s2.drawImage(s8, -s8.worldW / 2, -s8.worldH / 2, s8.worldW, s8.worldH);
    }
    var pI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var pJ = pI ? 0.25 : 0;
    function pK(s2, s3, s4 = 20, s5 = "#fff", s6 = 4, s7, s8 = "") {
        const s9 = "bolder " + s4 + "px " + iB;
        let sa;
        let sb;
        const sc = s3 + "_" + s9 + "_" + s5 + "_" + s6 + "_" + s8;
        const sd = pG[sc];
        ;
        if (!sd) {
            s2.font = s9;
            const se = s2.measureText(s3);
            sa = se.width + s6;
            sb = s4 + s6;
        } else {
            sa = sd.worldW;
            sb = sd.worldH;
        }
        return pH(s2, sc, sa, sb, function (sf) {
            sf.translate(s6 / 2, s6 / 2 - sb * pJ);
            sf.font = s9;
            sf.textBaseline = "top";
            sf.textAlign = "left";
            sf.lineWidth = s6;
            sf.strokeStyle = "#222";
            sf.fillStyle = s5;
            if (s6 > 0) {
                sf.strokeText(s3, 0, 0);
            }
            sf.fillText(s3, 0, 0);
        }, s7);
    }
    var pL = 1;
    function pM(s2 = cH.iAbsorb) {
        const s3 = Object.values(oG);
        const s4 = new DataView(new ArrayBuffer(3 + s3.length * 6));
        let s5 = 0;
        s4.setUint8(s5++, s2);
        s4.setUint16(s5, s3.length);
        s5 += 2;
        for (let s6 = 0; s6 < s3.length; s6++) {
            const s7 = s3[s6];
            s4.setUint16(s5, s7.petal.id);
            s5 += 2;
            s4.setUint32(s5, s7.count);
            s5 += 4;
        }
        im(s4);
    }
    function pN() {
        om.remove();
        oi.classList.remove("show-petal");
        om = null;
    }
    var pO = [];
    function pP() {
        for (let s2 = 0; s2 < pO.length; s2++) {
            const s3 = pO[s2];
            const s4 = s3.targetPlayer;
            const s5 = s4 && !s4.isDead;
            if (s5) {
                s3.isDead = false;
                s3.angryT = s4.angryT;
                s3.sadT = s4.sadT;
                s3.isPoison = s4.isPoison;
                s3.poisonT = s4.poisonT;
                s3.hurtT = s4.hurtT;
                s3.health = s4.health;
                s3.redHealth = s4.redHealth;
                s3.nick = s4.nick;
                s3.username = s4.username;
                s3.eyeX = s4.eyeX;
                s3.eyeY = s4.eyeY;
                s3.level = s4.level;
                s3.moveCounter = s4.moveCounter;
                s3.angle = s4.angle;
                s3.shield = s4.shield;
                j1(s3, s4);
            } else {
                s3.isDead = true;
                s3.deadT = 0;
                s3.sadT = 1;
                s3.angryT = 0;
                s3.isPoison = false;
                s3.poisonT = 0;
                s3.hurtT = 0;
                s3.redHealth = px(s3.redHealth, 0, 200);
                s3.health = px(s3.health, 0, 200);
                s3.shield = px(s3.shield, 0, 200);
            }
            if (s2 > 0) {
                if (s4) {
                    const s6 = Math.atan2(s4.y - pv, s4.x - pu);
                    if (s3.posAngle === undefined) {
                        s3.posAngle = s6;
                    } else {
                        s3.posAngle = f7(s3.posAngle, s6, 0.1);
                    }
                }
                s3.removeT += (s5 ? -1 : 1) * pR / 800;
                if (s3.removeT < 0) {
                    s3.removeT = 0;
                }
                if (s3.removeT > 1) {
                    pO.splice(s2, 1);
                }
            }
        }
    }
    var pQ = Date.now();
    var pR = 0;
    var pS = 0;
    var pT = pQ;
    function pU() {
        pQ = Date.now();
        pR = pQ - pT;
        pT = pQ;
        pS = pR / 33;
        hc();
        let s2 = 0;
        for (let s4 = 0; s4 < jY.length; s4++) {
            const s5 = jY[s4];
            if (!s5.isConnected) {
                jY.splice(s4, 1);
                s4--;
            } else if (s5.containerDialog && !s5.containerDialog.classList.contains("show") || s5.parentNode.style.display === "none") {
                continue;
            } else {
                jY.splice(s4, 1);
                s4--;
                s5.classList.remove("no-icon");
                s2++;
                if (s2 >= 20) {
                    break;
                }
            }
        }
        pV.targetPlayer = iz;
        pP();
        if (kD.classList.contains("show")) {
            lM = pQ;
        }
        if (hu) {
            const s6 = pQ / 80;
            const s7 = Math.sin(s6) * 7;
            const s8 = Math.abs(Math.sin(s6 / 4)) * 0.15 + 0.85;
            ht.style.transform = "rotate(" + s7 + "deg) scale(" + s8 + ")";
        } else {
            ht.style.transform = "none";
        }
        for (let s9 = jd.length - 1; s9 >= 0; s9--) {
            const sa = jd[s9];
            if (sa.doRemove) {
                jd.splice(s9, 1);
                continue;
            }
            sa.updateProg();
        }
        for (let sb = nO.length - 1; sb >= 0; sb--) {
            const sc = nO[sb];
            if (!sc.isConnected) {
                nO.splice(sb, 1);
                continue;
            }
            sc.update();
        }
        for (let sd = jc.length - 1; sd >= 0; sd--) {
            const se = jc[sd];
            if (se.doRemove && se.t <= 0) {
                se.remove();
                jc.splice(sd, 1);
            }
            se.t += (se.doRemove ? -1 : 1) * pR / se.dur;
            se.t = Math.min(1, Math.max(0, se.t));
            se.update();
        }
        for (let sf = n3.length - 1; sf >= 0; sf--) {
            const sg = n3[sf];
            if (!sg.el.isConnected) {
                sg.doShow = false;
            }
            sg.alpha += (sg.doShow ? 1 : -1) * pR / 200;
            sg.alpha = Math.min(1, Math.max(sg.alpha));
            if (!sg.doShow && sg.alpha <= 0) {
                n3.splice(sf, 1);
                sg.remove();
                continue;
            }
            sg.style.opacity = sg.alpha;
        }
        if (p2) {
            p3 += pR / 2000;
            if (p3 > 1) {
                p3 = 0;
                if (p4) {
                    p2 = false;
                    const sh = p0.next;
                    const si = p4.petalsLeft;
                    if (p4.successCount > 0) {
                        ol.forEach(sj => sj.reset());
                        n6(p0.id, si);
                        p1 = 0;
                        p7("?");
                        oi.classList.add("show-petal");
                        om = og(sh);
                        oi.appendChild(om);
                        p6(om.countEl, p4.successCount);
                        om.onclick = function () {
                            n6(sh.id, p4.successCount);
                            pN();
                            p4 = null;
                        };
                    } else {
                        p1 = si;
                        const sj = [...ol].sort(() => Math.random() - 0.5);
                        for (let sk = 0, sl = sj.length; sk < sl; sk++) {
                            const sm = sj[sk];
                            if (sk >= si) {
                                sm.reset();
                            } else {
                                sm.addCount(1 - sm.count);
                            }
                        }
                        p4 = null;
                    }
                    p5();
                }
            }
        }
        for (let sn = 0; sn < ol.length; sn++) {
            ol[sn].updatePos(p3);
        }
        for (let so in nk) {
            const sp = nk[so];
            if (!sp) {
                delete nk[so];
                continue;
            }
            for (let sq = sp.length - 1; sq >= 0; sq--) {
                const sr = sp[sq];
                sr.t += pR;
                if (sr.isFakeChat) {
                    if (sr.t > lY) {
                        sp.splice(sq, 1);
                    }
                } else if (sr.t > lV) {
                    const ss = 1 - Math.min(1, (sr.t - lV) / 2000);
                    sr.style.opacity = ss;
                    if (ss <= 0) {
                        sp.splice(sq, 1);
                    }
                }
            }
            if (sp.length === 0) {
                delete nk[so];
            }
        }
        if (o6) {
            sM: {
                if (il()) {
                    o7 += pR;
                    nZ.style.transform = "scale(" + (Math.sin(Date.now() / 50) * 0.1 + 1) + ")";
                    if (o7 > 1000) {
                        if (o8) {
                            pM(cH.iGamble);
                            m2(false);
                            break sM;
                        }
                        o6 = false;
                        o8 = false;
                        o7 = 0;
                        pM();
                        oH += oQ;
                        oR();
                        oU();
                        m2(false);
                        const st = d4(oI);
                        if (st !== iO) {
                            const su = st - iO;
                            for (let sw = 0; sw < iO; sw++) {
                                const sx = nB.children[sw];
                                sx.index += su;
                            }
                            const sv = nB.lastElementChild.index + 1;
                            for (let sy = 0; sy < su; sy++) {
                                const sz = nR("<div class=\"petal empty\"></div>");
                                sz.index = iO + sy;
                                nA.appendChild(sz);
                                const sA = nR("<div class=\"petal empty\"></div>");
                                sA.index = sv + sy;
                                sA.appendChild(nR("<div class=\"petal-key\" stroke=\"[" + (sz.index + 1) % 10 + "]\"></div>"));
                                nB.appendChild(sA);
                            }
                            iO = st;
                            iP = iO * 2;
                        }
                    }
                } else {
                    o6 = false;
                    o8 = false;
                    o7 = 0;
                }
            }
        }
        oP = px(oP, oN, 100);
        oO = px(oO, oM, 100);
        o2.style.width = oP * 100 + "%";
        o3.style.width = oO * 100 + "%";
        for (let sB in pG) {
            if (!pG[sB].wasDrawn) {
                delete pG[sB];
            } else {
                pG[sB].wasDrawn = false;
            }
        }
        nc = px(nc, ne, 50);
        nd = px(nd, nf, 50);
        const s3 = Math.min(100, pR) / 60;
        pX -= s3 * 3;
        for (let sC = pA.length - 1; sC >= 0; sC--) {
            const sD = pA[sC];
            sD.x += sD.moveSpeed * s3;
            sD.y += Math.sin(sD.angle * 2) * 0.8 * s3;
            sD.angle += sD.angleSpeed * s3;
            sD.moveCounter += pR * 0.002;
            sD.visible = true;
            const sE = sD.size * 2;
            if (sD.x >= cZ + sE || sD.y < -sE || sD.y >= d0 + sE) {
                pA.splice(sC, 1);
                pB(false);
            }
        }
        for (let sF = 0; sF < iH.length; sF++) {
            iH[sF].update();
        }
        pw = Math.max(0, pw - pR / 300);
        if (pc.enable_shake && pw > 0) {
            const sG = Math.random() * 2 * Math.PI;
            const sH = pw * 3;
            qL = Math.cos(sG) * sH;
            qM = Math.sin(sG) * sH;
        } else {
            qL = 0;
            qM = 0;
        }
        py = px(py, pL, 200);
        nh = px(nh, ng, 100);
        for (let sI = mK.length - 1; sI >= 0; sI--) {
            const sJ = mK[sI];
            sJ.update();
            if (sJ.canRemove) {
                mK.splice(sI, 1);
            }
        }
        for (let sK = ix.length - 1; sK >= 0; sK--) {
            const sL = ix[sK];
            sL.update();
            if (sL.isDead && sL.deadT > 1) {
                ix.splice(sK, 1);
            }
        }
        if (iz) {
            pu = iz.x;
            pv = iz.y;
        }
        qJ();
        window.requestAnimationFrame(pU);
    }
    var pV = pW();
    function pW() {
        const s2 = new lU(-1, 0, 0, 0, 1, cX.neutral, 25);
        s2.removeT = 1;
        return s2;
    }
    var pX = 0;
    var pY = ["#1ea761", "#af6656", "#4d5e56"];
    var pZ = [];
    for (let s2 = 0; s2 < 3; s2++) {
        for (let s3 = 0; s3 < 3; s3++) {
            const s4 = q0(pY[s2], 1 - s3 * 0.05);
            pZ.push(s4);
        }
    }
    function q0(s5, s6) {
        return q1(hz(s5).map(s7 => s7 * s6));
    }
    function q1(s5) {
        return s5.reduce((s6, s7) => s6 + parseInt(s7).toString(16).padStart(2, "0"), "#");
    }
    function q2(s5) {
        return "rgb(" + s5.join(",") + ")";
    }
    var q3 = document.querySelector(".minimap");
    function q4() {
        const s5 = document.createElement("canvas");
        s5.width = s5.height = 3;
        const s6 = s5.getContext("2d");
        for (let s7 = 0; s7 < pZ.length; s7++) {
            const s8 = s7 % 3;
            const s9 = (s7 - s8) / 3;
            s6.fillStyle = pZ[s7];
            s6.fillRect(s8, s9, 1, 1);
            const sa = j8[s7];
            const sb = j9[s7];
            const sc = nR("<span style=\"color:" + sb + ";position:absolute;top:" + (s9 + 0.5) / 3 * 100 + "%;left:" + (s8 + 0.5) / 3 * 100 + "%;\" stroke=\"" + sa + "\"></span>");
            q3.insertBefore(sc, q3.children[0]);
        }
        q3.style.backgroundImage = "url(" + s5.toDataURL() + ")";
    }
    q4();
    var q5 = document.querySelector(".minimap-dot");
    var q6 = document.querySelector(".minimap-cross");
    function q7(s5, s6, s7) {
        s5.style.left = s6 / j3 * 100 + "%";
        s5.style.top = s7 / j3 * 100 + "%";
    }
    function q8() {
        const s5 = qO();
        const s6 = cZ / 2 / s5;
        const s7 = d0 / 2 / s5;
        const s8 = j5;
        const s9 = Math.max(0, Math.floor((pu - s6) / s8) - 1);
        const sa = Math.max(0, Math.floor((pv - s7) / s8) - 1);
        const sb = Math.min(j6 - 1, Math.ceil((pu + s6) / s8));
        const sc = Math.min(j6 - 1, Math.ceil((pv + s7) / s8));
        kk.save();
        kk.scale(s8, s8);
        kk.beginPath();
        for (let sd = s9; sd <= sb + 1; sd++) {
            kk.moveTo(sd, sa);
            kk.lineTo(sd, sc + 1);
        }
        for (let se = sa; se <= sc + 1; se++) {
            kk.moveTo(s9, se);
            kk.lineTo(sb + 1, se);
        }
        kk.restore();
        for (let sf = s9; sf <= sb; sf++) {
            for (let sg = sa; sg <= sc; sg++) {
                kk.save();
                kk.translate((sf + 0.5) * s8, (sg + 0.5) * s8);
                pK(kk, sf + "," + sg, 40, "#fff", 6);
                kk.restore();
            }
        }
        kk.strokeStyle = "rgba(0,0,0,0.2)";
        kk.lineWidth = 10;
        kk.lineCap = "round";
        kk.stroke();
    }
    function q9(s5, s6) {
        const s7 = nR("<div class=\"warning\">\n\t\t<div>\n\t\t\t<div class=\"warning-title\" stroke=\"" + s5 + "\"></div>\n\t\t\t<div stroke=\"" + s6 + "\"></div>\n\t\t</div>\n\t\t<div class=\"timer\"></div>\n\t</div>");
        const s8 = s7.querySelector(".timer");
        kn.appendChild(s7);
        s7.setValue = function (s9) {
            if (s9 > 0 && s9 !== 1) {
                s8.setAttribute("style", "--angle:" + s9 * 360 + "deg");
                s7.classList.add("show");
            } else {
                s7.classList.remove("show");
            }
        };
        kn.insertBefore(s7, q3);
        return s7;
    }
    var qa = q9("LEAVE ZONE!!", "Your level is too low to play waves. Leave this zone or you will be teleported.");
    qa.classList.add("top");
    var qb = nR("<div style=\"color: " + hO.Mythic + "; margin-top: 5px;\" stroke=\"Need to be Lvl 125 at least!\"></div>");
    qa.children[0].appendChild(qb);
    var qc = q9("MOVE AWAY!!", "Too many players nearby. Move away from here or you will be teleported automatically.");
    var qd = q9("ENTERING!!", "Looks like your flower is going to sleep and off to a mysterious place.");
    qd.classList.add("center");
    var qe = "rgba(0,0,0,0.15)";
    var qf = 700;
    var qg = new lU("yt", 0, 0, Math.PI / 2, 1, cX.neutral, 25);
    qg.angryT = 0;
    var qh = [["KePiKgamer", "https://www.youtube.com/@KePiKgamer"], ["2357", "https://www.youtube.com/channel/UCbWBHeYY0siLRnCxoGLHWFw"], ["Neowm", "https://www.youtube.com/@NeowmHornex"], ["Zert", "https://discord.gg/zZsUUg8rbu", "https://www.youtube.com/channel/UCIOS0DXnHeJntd6ykPbCPNg"], ["LavaWater", "https://www.youtube.com/@IAmLavaWater"], ["Fussy Sucker", "https://www.youtube.com/@FussySucker"], ["Fleepoint", "https://www.youtube.com/@gowcaw97"]];
    function qi() {
        let s5 = "";
        const s6 = qh.length - 1;
        for (let s7 = 0; s7 < s6; s7++) {
            const s8 = qh[s7][0];
            s5 += s8;
            if (s7 === s6 - 1) {
                s5 += " & " + qh[s7 + 1][0] + ".";
            } else {
                s5 += ", ";
            }
        }
        return s5;
    }
    var qj = qi();
    var qk = document.querySelector(".featured");
    qk.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" style=\"color:" + hO.Ultra + "\" stroke=\"Featured Youtuber:\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Subscribe and show them some love <3\"></div>\n\t\t<div stroke=\"How to get featured?\" style=\"color:" + hO.Unusual + "\"></div>\n\t\t<div stroke=\"Simply make good videos on the game and let us know about you in our Discord server.\"></div>\n\t\t<br>\n\t\t<div stroke=\"All features:\" style=\"color:" + hO.Common + "\"></div>\n\t\t<div stroke=\"" + qj + "\"></div>\n\t</div>");
    };
    qk.tooltipDown = true;
    var ql = Date.now() < 1707830498299 ? 0 : Math.floor(Math.random() * qh.length);
    function qm() {
        const s5 = qh[ql];
        qg.nick = s5[0];
        qg.url = s5[1];
        for (let s6 of j0) {
            qg[s6] = Math.random() > 0.5;
        }
        ql = (ql + 1) % qh.length;
    }
    qm();
    qk.onclick = function () {
        window.open(qg.url, "_blank");
        qm();
    };
    var qn = new lU("nerd", 0, -25, 0, 1, cX.neutral, 25);
    qn.angryT = 0;
    qn.isClown = true;
    var qo = ["they copied florr code omg!!", "nice stolen florr assets", "direct copy of florr bruh", "dmca it m28!", "literally ctrl+c and ctrl+v", "goofy ahh insect robbery", "hello 911, i would like to report a garden robbery"];
    var qp = ["i make cool videos", "pls sub to me, %nick%", "i need 999 billion subs", "subscribe for 999 super petals", "u sub = me happy :>", "plis plis sub 2 me %nick% uwu", "no sub, no gg", "ignore if u already subbed"];
    var qq = 0;
    function qr() {
        const s5 = {
            text: qo[qq % qo.length],
            isFakeChat: true,
            col: nj.me
        };
        nn("nerd", s5);
        nn("yt", {
            text: qp[qq % qp.length].replace("%nick%", kF.value.trim() || "unnamed"),
            isFakeChat: true,
            col: nj.me
        });
        qq++;
    }
    qr();
    setInterval(qr, 4000);
    var qs = 0;
    var qt = Math.ceil(Math.max(screen.width, screen.height, kV(), kW()) * window.devicePixelRatio / 12);
    var qu = new lU(-1, 0, 0, 0, 1, cX.sad, 25);
    qu.isDead = true;
    qu.sadT = 1;
    qu.scale = 0.6;
    var qv = function () {
        const s5 = document.createElement("canvas");
        const s6 = qt * 2;
        s5.width = s5.height = s6;
        s5.style.width = s5.style.height = "100%";
        const s7 = document.querySelector(".my-player");
        s7.appendChild(s5);
        const s8 = s5.getContext("2d");
        s5.render = function () {
            qu.isShiny = false;
            s8.clearRect(0, 0, s6, s6);
            s8.save();
            s8.scale2(s6 / 100);
            s8.translate(50, 50);
            s8.scale2(0.8);
            s8.rotate(-Math.PI / 8);
            qu.draw(s8);
            s8.restore();
        };
        return s5;
    }();
    var qw;
    var qx;
    var qy;
    var qz = false;
    function qA() {
        if (qz) {
            return;
        }
        qz = true;
        iC();
        const s5 = qE(qt);
        qy = s5.toDataURL("image/png");
        const s6 = qw * 100 + "% " + qx * 100 + "% !important";
        const s7 = nR("<style>\n\t\t" + hP.map((s8, s9) => ".tier-" + s9 + "{background-color:" + s8 + " !important;}").join("\n") + "\n\n\t\t.rewards .dialog-content > *:nth-child(4n+2) span {color:" + nE.green + "}\n\t\t.rewards .dialog-content > *:nth-child(4n+3) span {color:" + nE.red + "}\n\t\t.rewards .dialog-content > *:nth-child(4n+4) span {color:" + nE.blue + "}\n\n\t\tbody {\n\t\t\t--num-tiers: " + dG + ";\n\t\t}\n\n\t\t.petal, .petal-icon {\n\t\t\tbackground-image: url(" + qy + ") !important;\n\t\t\tbackground-size: " + s6 + ";\n\t\t\t-webkit-background-size: " + s6 + ";\n\t\t\t-moz-background-size: " + s6 + ";\n\t\t\t-o-background-size: " + s6 + ";\n\t\t}\n\n\t\t.hide-icons .petal {\n\t\t\tbackground-image: none !important;\n\t\t}\n\n\t\t.petal.empty, .petal.no-icon {\n\t\t\tbackground-image: none !important;\n\t\t}\n\n\t\t.petal-icon {\n\t\t\tposition: absolute;\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t}\n\t</style>");
        document.body.appendChild(s7);
    }
    function qB(s5) {
        const s6 = -s5.sprite.x * 100 + "% " + -s5.sprite.y * 100 + "%";
        return "style=\"background-position: " + s6 + ";-webkit-background-position: " + s6 + ";-moz-background-position: " + s6 + "; -o-background-position:" + s6 + ";\"";
    }
    if (document.fonts && document.fonts.ready) {
        const s5 = setTimeout(qA, 8000);
        document.fonts.ready.then(() => {
            console.log("Fonts loaded!");
            clearTimeout(s5);
            qA();
        });
    } else {
        qA();
    }
    var qC = [];
    qD();
    function qD() {
        const s6 = {};
        qw = 15;
        qC = [];
        let s7 = 0;
        for (let s9 = 0; s9 < dB.length; s9++) {
            const sa = dB[s9];
            const sb = "petal_" + sa.uiName + "_" + (sa.count || 1);
            const sc = s6[sb];
            if (sc === undefined) {
                sa.sprite = s6[sb] = s8();
                qC.push(sa);
            } else {
                sa.sprite = sc;
                continue;
            }
        }
        for (let sd = 0; sd < eJ.length; sd++) {
            const se = eJ[sd];
            const sf = "mob_" + se.uiName;
            const sg = s6[sf];
            if (sg === undefined) {
                se.sprite = s6[sf] = s8();
            } else {
                se.sprite = sg;
                continue;
            }
        }
        function s8() {
            return {
                x: s7 % qw,
                y: Math.floor(s7 / qw),
                index: s7++
            };
        }
    }
    function qE(s6) {
        const s7 = qC.length + eK;
        qx = Math.ceil(s7 / qw);
        const s8 = document.createElement("canvas");
        s8.width = s6 * qw;
        s8.height = s6 * qx;
        const s9 = s8.getContext("2d");
        const sa = 90;
        const sb = sa / 2;
        const sc = s6 / sa;
        s9.scale(sc, sc);
        s9.translate(sb, sb);
        for (let sd = 0; sd < qC.length; sd++) {
            const se = qC[sd];
            s9.save();
            s9.translate(se.sprite.x * sa, se.sprite.y * sa);
            s9.save();
            s9.translate(0 + se.uiX, -5 + se.uiY);
            se.drawIcon(s9);
            s9.restore();
            s9.fillStyle = "#fff";
            s9.textAlign = "center";
            s9.textBaseline = "bottom";
            s9.font = "bolder 17px " + iB;
            s9.lineWidth = h4 ? 5 : 3;
            s9.strokeStyle = "#000";
            s9.lineCap = s9.lineJoin = "round";
            s9.translate(0, sb - 8 - s9.lineWidth);
            let sf = se.uiName;
            if (h4) {
                sf = h6(sf);
            }
            const sg = s9.measureText(sf).width + s9.lineWidth;
            const sh = Math.min(76 / sg, 1);
            s9.scale(sh, sh);
            s9.strokeText(sf, 0, 0);
            s9.fillText(sf, 0, 0);
            s9.restore();
        }
        for (let si = 0; si < eK; si++) {
            const sj = eJ[si];
            s9.save();
            s9.translate(sj.sprite.x * sa, sj.sprite.y * sa);
            if (sj.chain !== undefined) {
                s9.beginPath();
                s9.rect(-sb, -sb, sa, sa);
                s9.clip();
            }
            s9.translate(sj.uiX, sj.uiY);
            sj.drawIcon(s9);
            s9.restore();
        }
        return s8;
    }
    var qF = new lH(-1, cR.m28, 0, 0, Math.random() * 6.28);
    qF.size = 50;
    function qG() {
        kk.arc(j3 / 2, j3 / 2, j3 / 2, 0, Math.PI * 2);
    }
    function qH(s6) {
        const s7 = s6.length;
        const s8 = document.createElement("canvas");
        s8.width = s8.height = s7;
        const s9 = s8.getContext("2d");
        const sa = s9.createImageData(s7, s7);
        for (let sb = 0; sb < s7; sb++) {
            for (let sc = 0; sc < s7; sc++) {
                const sd = s6[sb][sc];
                if (!sd) {
                    continue;
                }
                const se = (sb * s7 + sc) * 4;
                sa.data[se + 3] = 255;
            }
        }
        s9.putImageData(sa, 0, 0);
        return s8;
    }
    function qI() {
        if (!jL) {
            return;
        }
        kk.save();
        kk.beginPath();
        qG();
        kk.clip();
        if (!jL.canvas) {
            jL.canvas = qH(jL);
        }
        kk.imageSmoothingEnabled = false;
        kk.globalAlpha = 0.08;
        kk.drawImage(jL.canvas, 0, 0, j3, j3);
        kk.restore();
    }
    function qJ() {
        lN = 0;
        const s6 = kS * kX;
        qs = 0;
        for (let sb = 0; sb < nO.length; sb++) {
            const sc = nO[sb];
            if (sc.canRender) {
                sc.render();
            }
        }
        if (kl.style.display === "" || document.body.classList.contains("hide-all")) {
            kk.fillStyle = "#1ea761";
            kk.fillRect(0, 0, kj.width, kj.height);
            kk.save();
            let sd = Math.max(kj.width / cZ, kj.height / d0);
            kk.scale(sd, sd);
            kk.rect(0, 0, cZ, d0);
            kk.save();
            kk.translate(pX, -pX);
            kk.scale(1.25, 1.25);
            kk.fillStyle = kZ;
            kk.fill();
            kk.restore();
            for (let se = 0; se < pA.length; se++) {
                pA[se].draw(kk);
            }
            kk.restore();
            if (pc.show_clown && pf.offsetWidth > 0) {
                const sf = pf.getBoundingClientRect();
                kk.save();
                let sg = kX;
                kk.scale(sg, sg);
                kk.translate(sf.x + sf.width / 2, sf.y + sf.height);
                kk.scale2(kS * 0.8);
                qn.draw(kk);
                kk.scale(0.7, 0.7);
                qn.drawChats(kk);
                kk.restore();
            }
            if (qk.offsetWidth > 0) {
                const sh = qk.getBoundingClientRect();
                kk.save();
                let si = kX;
                kk.scale(si, si);
                kk.translate(sh.x + sh.width / 2, sh.y + sh.height * 0.6);
                kk.scale2(kS * 0.8);
                qg.draw(kk);
                kk.scale2(0.7);
                kk.save();
                kk.translate(0, -qg.size - 35);
                pK(kk, qg.nick, 18, "#fff", 3);
                kk.restore();
                qg.drawChats(kk);
                kk.restore();
            }
            if (hl.offsetWidth > 0) {
                const sj = hl.getBoundingClientRect();
                kk.save();
                let sk = kX;
                kk.scale(sk, sk);
                kk.translate(sj.x + sj.width / 2, sj.y + sj.height * 0.5);
                kk.scale2(kS);
                qF.draw(kk);
                kk.restore();
            }
            return;
        }
        if (jz) {
            kk.fillStyle = pZ[0];
            kk.fillRect(0, 0, kj.width, kj.height);
        } else {
            kk.save();
            qN();
            for (let sl = -1; sl < 4; sl++) {
                for (let sm = -1; sm < 4; sm++) {
                    const sn = Math.max(0, Math.min(sm, 2));
                    const so = Math.max(0, Math.min(sl, 2));
                    kk.fillStyle = pZ[so * 3 + sn];
                    kk.fillRect(sm * j4, sl * j4, j4, j4);
                }
            }
            kk.beginPath();
            kk.rect(0, 0, j3, j3);
            kk.clip();
            kk.beginPath();
            kk.moveTo(-10, j4);
            kk.lineTo(j4 * 2, j4);
            kk.moveTo(j4 * 2, j4 * 0.5);
            kk.lineTo(j4 * 2, j4 * 1.5);
            kk.moveTo(j4 * 1, j4 * 2);
            kk.lineTo(j3 + 10, j4 * 2);
            kk.moveTo(j4, j4 * 1.5);
            kk.lineTo(j4, j4 * 2.5);
            kk.lineWidth = qf * 2;
            kk.lineCap = "round";
            kk.strokeStyle = qe;
            kk.stroke();
            kk.restore();
        }
        kk.save();
        kk.beginPath();
        kk.rect(0, 0, kj.width, kj.height);
        qN();
        if (pc.show_bg_grid) {
            kk.fillStyle = kZ;
            kk.fill();
        }
        kk.beginPath();
        if (jz) {
            qG();
        } else {
            kk.rect(0, 0, j3, j3);
        }
        kk.restore();
        kk.rect(0, 0, kj.width, kj.height);
        kk.fillStyle = qe;
        kk.fill("evenodd");
        kk.save();
        qN();
        if (pc.show_grid) {
            q8();
        }
        qI();
        const s7 = [];
        let s8 = [];
        for (let sp = 0; sp < ix.length; sp++) {
            const sq = ix[sp];
            if (sq.isConsumable) {
                if (iz) {
                    if (pQ - sq.consumeTime < 1000 || Math.hypot(sq.nx - iz.x, sq.ny - iz.y) < Math.hypot(sq.ox - iz.x, sq.oy - iz.y)) {
                        s7.push(sq);
                        sq.consumeTime = pQ;
                        continue;
                    }
                }
            }
            if (sq !== iz) {
                s8.push(sq);
            }
        }
        s8 = qK(s8, sr => sr.type === cR.honeyTile);
        s8 = qK(s8, sr => sr.type === cR.web);
        s8 = qK(s8, sr => sr.type === cR.portal);
        s8 = qK(s8, sr => sr.renderBelowEverything);
        s8 = qK(s8, sr => sr.isPet);
        s8 = qK(s8, sr => sr.isPetal && !sr.renderOverEverything);
        s8 = qK(s8, sr => !sr.renderOverEverything);
        qK(s8, sr => true);
        if (iz) {
            iz.draw(kk);
        }
        for (let sr = 0; sr < s7.length; sr++) {
            s7[sr].draw(kk);
        }
        if (pc.show_hitbox) {
            kk.beginPath();
            for (let ss = 0; ss < ix.length; ss++) {
                const st = ix[ss];
                if (st.isDead) {
                    continue;
                }
                if (st.isRectHitbox) {
                    kk.save();
                    kk.translate(st.x, st.y);
                    kk.rotate(st.angle);
                    if (!st.rectAscend) {
                        kk.rect(-st.size, -10, st.size * 2, 20);
                    } else {
                        kk.moveTo(-st.size, -10);
                        kk.lineTo(-st.size, 10);
                        const su = 10 + st.rectAscend * st.size * 2;
                        kk.lineTo(st.size, su);
                        kk.lineTo(st.size, -su);
                        kk.lineTo(-st.size, -10);
                    }
                    kk.restore();
                } else {
                    kk.moveTo(st.x + st.size, st.y);
                    kk.arc(st.x, st.y, st.size, 0, l1);
                }
            }
            kk.lineWidth = 2;
            kk.strokeStyle = "blue";
            kk.stroke();
        }
        const s9 = pc.fixed_name_size ? 1 / qP() : 1;
        for (let sv = 0; sv < ix.length; sv++) {
            const sw = ix[sv];
            if (!sw.isPetal && sw.visible) {
                lZ(sw, kk, s9);
            }
        }
        for (let sx = 0; sx < ix.length; sx++) {
            const sy = ix[sx];
            if (sy.isPlayer) {
                sy.drawChats(kk, s9);
            }
        }
        const sa = pR / 18;
        kk.save();
        kk.lineWidth = 7;
        kk.strokeStyle = "#fff";
        kk.lineCap = kk.lineJoin = "miter";
        for (let sz = iG.length - 1; sz >= 0; sz--) {
            const sA = iG[sz];
            sA.a -= pR / 500;
            if (sA.a <= 0) {
                iG.splice(sz, 1);
                continue;
            }
            kk.globalAlpha = sA.a;
            kk.stroke(sA.path);
        }
        kk.restore();
        if (pc.show_damage) {
            for (let sB = iA.length - 1; sB >= 0; sB--) {
                const sC = iA[sB];
                sC.x += sC.vx * sa;
                sC.y += sC.vy * sa;
                sC.vy += sa * 0.35;
                if (sC.vy > 10) {
                    iA.splice(sB, 1);
                    continue;
                }
                kk.save();
                kk.translate(sC.x, sC.y);
                kk.globalAlpha = 1 - Math.max(0, sC.vy / 10);
                kk.scale(sC.size, sC.size);
                if (sC.text !== undefined) {
                    pK(kk, sC.text, 21, "#f55", 2, false, sC.size);
                } else {
                    kk.rotate(sC.angle);
                    pH(kk, "particle_heart_" + sC.size, 30, 30, function (sD) {
                        sD.translate(15, 15);
                        nC(sD);
                    });
                }
                kk.restore();
            }
        }
        kk.restore();
        if (iz && pc.show_helper && !pc.enable_kb_movement) {
            kk.save();
            kk.translate(kj.width / 2, kj.height / 2);
            kk.rotate(Math.atan2(nd, nc));
            kk.scale(s6, s6);
            const sD = 40;
            let sE = Math.hypot(nc, nd) / kS;
            kk.beginPath();
            kk.moveTo(sD, 0);
            kk.lineTo(sE, 0);
            kk.lineTo(sE + -20, -20);
            kk.moveTo(sE, 0);
            kk.lineTo(sE + -20, 20);
            kk.lineWidth = 12;
            kk.lineCap = "round";
            kk.lineJoin = "round";
            kk.globalAlpha = sE < 100 ? Math.max(sE - 50, 0) / 50 : 1;
            kk.strokeStyle = "rgba(0,0,0,0.2)";
            kk.stroke();
            kk.restore();
        }
        kk.save();
        kk.scale(s6, s6);
        kk.translate(40, 80);
        kk.scale2(0.85);
        for (let sF = 0; sF < pO.length; sF++) {
            const sG = pO[sF];
            if (sF > 0) {
                const sH = lJ(Math.max(sG.removeT - 0.5, 0) / 0.5);
                kk.translate(0, (sF === 0 ? 70 : 65) * (1 - sH));
            }
            kk.save();
            if (sF > 0) {
                kk.translate(lJ(sG.removeT) * -400, 0);
                kk.scale2(0.85);
            }
            kk.save();
            m0(sG, kk, true);
            sG.id = sG.targetPlayer && sG.targetPlayer.id || -1;
            sG.draw(kk);
            sG.id = -1;
            kk.restore();
            if (sG.posAngle !== undefined) {
                kk.save();
                kk.rotate(sG.posAngle);
                kk.translate(32, 0);
                kk.beginPath();
                kk.moveTo(0, 6);
                kk.lineTo(0, -6);
                kk.lineTo(6, 0);
                kk.closePath();
                kk.lineWidth = 4;
                kk.lineCap = kk.lineJoin = "round";
                kk.strokeStyle = "#333";
                kk.stroke();
                kk.fillStyle = "#fff";
                kk.fill();
                kk.restore();
            }
            kk.restore();
        }
        kk.restore();
    }
    function qK(s6, s7) {
        const s8 = [];
        for (let s9 = 0; s9 < s6.length; s9++) {
            const sa = s6[s9];
            if (s7.name !== undefined ? s7(sa) : sa[s7]) {
                sa.draw(kk);
            } else {
                s8.push(sa);
            }
        }
        return s8;
    }
    var qL = 0;
    var qM = 0;
    function qN() {
        kk.translate(kj.width / 2, kj.height / 2);
        let s6 = qO();
        kk.scale(s6, s6);
        kk.translate(-pu, -pv);
        if (pc.enable_shake) {
            kk.translate(qL, qM);
        }
    }
    function qO() {
        return Math.max(kj.width / cZ, kj.height / d0) * qP();
    }
    function qP() {
        return nh / py;
    }
    kY();
    pU();
    var qW = {
        eu_ffa1: {
            name: "EU #1",
            url: "wss://eu1.hornex.pro",
            color: "rgb(166 56 237)"
        },
        eu_ffa2: {
            name: "EU #2",
            url: "wss://eu2.hornex.pro",
            color: "rgb(81 121 251)"
        },
        as_ffa1: {
            name: "AS #1",
            url: "wss://as1.hornex.pro",
            color: "rgb(237 61 234)"
        },
        us_ffa1: {
            name: "US #1",
            url: "wss://us1.hornex.pro",
            color: "rgb(219 130 41)"
        },
        us_ffa2: {
            name: "US #2",
            url: "wss://us2.hornex.pro",
            color: "rgb(237 236 61)"
        },
        as_ffa2: {
            name: "AS #2",
            url: "wss://as2.hornex.pro",
            color: "#3db3cb"
        },
        euSandbox: {
            name: "Sandbox",
            color: "#82c92f",
            onClick() {
                window.open("https://sandbox.hornex.pro", "_blank");
            }
        }
    };
    if (window.location.hostname !== "hornex.pro") {
        for (let s6 in qW) {
            const s7 = qW[s6];
            if (!s7.url) {
                continue;
            }
            s7.url = s7.url.replace("hornex.pro", "zert.pro").replace("wss://", "wss://hornex-");
        }
    }
    var qX = document.querySelector(".server-area");
    var qY = document.querySelector(".global-user-count");
    var qZ = 0;
    for (let s8 in qW) {
        const s9 = qW[s8];
        const sa = document.createElement("div");
        sa.className = "btn";
        const sb = document.createElement("span");
        sb.setAttribute("stroke", s9.name);
        sa.appendChild(sb);
        const sc = document.createElement("span");
        sc.className = "small";
        s9.userCount = 0;
        s9.setUserCount = function (sd) {
            qZ -= s9.userCount;
            s9.userCount = sd;
            qZ += sd;
            k9(sc, ki(sd, "user"));
            sa.appendChild(sc);
            const se = "(total " + ki(qZ, "user") + " online)";
            k9(r2, se);
            k9(qY, se);
        };
        s9.hideUserCount = function () {
            s9.setUserCount(0);
            sc.remove();
        };
        sa.style.backgroundColor = s9.color;
        qX.appendChild(sa);
        sa.onclick = s9.onClick || function () {
            const sd = qX.querySelector(".active");
            if (sd === sa) {
                return;
            }
            if (sd) {
                sd.classList.remove("active");
            }
            this.classList.add("active");
            r5(s9.url);
            hC.server = s8;
        };
        s9.el = sa;
    }
    var r0 = nR("<div class=\"btn triep-btn\">\n\t<span stroke=\"Triep.IO\"></span>\n\t<span class=\"small\" stroke=\"Play now!\"></span>\n</div>");
    r0.onclick = function () {
        window.open("https://triep.io", "_blank");
    };
    qX.appendChild(r0);
    var r1 = qW.euSandbox.el;
    r1.classList.add("sandbox-btn");
    r1.petal = function () {
        return nR("<div class=\"tooltip\">\n\t\t<div class=\"tooltip-title\" style=\"color:" + hO.Ultra + "\" stroke=\"Hornex Sandbox:\"></div>\n\t\t<div class=\"tooltip-desc\" stroke=\"Singleplayer Hornex with admin commands and access to unlimited petals. Might be fun for testing random stuff.\"></div>\n\t\t<div stroke=\"- 30+ dev commands\"></div>\n\t\t<div stroke=\"- Access to all rarity petals!\"></div>\n\t\t<div stroke=\"- Craft billions of petals!\"></div>\n\t\t<div stroke=\"- Sussy Map Editor\"></div>\n\t\t<div stroke=\"- Some new mobs & petals.\"></div>\n\t\t<br>\n\t\t<div stroke=\"Go check it out!\"></div>\n\t</div>");
    };
    r1.tooltipDown = true;
    var r2 = document.createElement("span");
    r2.className = "small full";
    qX.appendChild(r2);
    if (true) {
        r3();
        let sd = Date.now();
        setInterval(function () {
            if (pQ - sd > 10000) {
                r3();
                sd = pQ;
            }
        }, 1000);
    }
    function r3() {
        fetch("https://stats.hornex.pro/api/userCount").then(se => se.json()).then(se => {
            for (let sf in se) {
                const sg = qW[sf];
                if (sg) {
                    sg.setUserCount(se[sf]);
                }
            }
        }).catch(se => {
            console.error("Failed to get userCount!", se);
        });
    }
    var r4 = window.isDevelopmentMode || window.location.search === "?dev";
    if (r4) {
        hW(window.location.origin.replace("http", "ws"));
    } else {
        const se = qW[hC.server];
        if (se) {
            se.el.click();
        } else {
            let sf = "EU";
            fetch("https://ipapi.co/json/").then(sg => sg.json()).then(sg => {
                if (["NA", "SA"].includes(sg.continent_code)) {
                    sf = "US";
                } else if (["AS", "OC"].includes(sg.continent_code)) {
                    sf = "AS";
                }
            }).catch(sg => {
                console.log("Failed to find region.");
            }).finally(function () {
                const sg = [];
                for (let si in qW) {
                    const sj = qW[si];
                    if (sj.name.startsWith(sf)) {
                        sg.push(sj);
                    }
                }
                const sh = sg[Math.floor(Math.random() * sg.length)] || qW.eu_ffa;
                console.log("Region: " + sf + "\nServer: " + sh.name);
                sh.el.click();
            });
        }
    }
    document.querySelector(".loader").style.display = "none";
    kB.classList.add("show");
    kC.classList.remove("show");
    window.sendBadMsg = function () {
        im(new Uint8Array([255]));
    };
    function r5(sg) {
        clearTimeout(kG);
        iv();
        const sh = {
            url: sg
        };
        hV = sh;
        kh(true);
    }
    window.connect = r5;
    var r6 = null;
    function r7(sg) {
        if (!sg || typeof sg !== "object") {
            console.log("Invalid data. Data must be an object.");
            return;
        }
        if (r6) {
            r6.dispose();
        }
        const sh = sg.metaData || {};
        const sj = {
            title: "Some Data",
            titleColor: "Super",
            desc: "Very sussy data!",
            descColor: "Unusual",
            addGroupNumbers: true,
            showItemLabel: true,
            labelPrefix: "",
            labelSuffix: "",
            sortGroupItems: true,
            sortGroups: true
        };
        for (let sp in sj) {
            if (sh[sp] === undefined || sh[sp] === null) {
                sh[sp] = sj[sp];
            }
        }
        const sk = [];
        for (let sq in sh) {
            if (sj[sq] === undefined) {
                sk.push(sq);
            }
        }
        if (sk.length > 0) {
            console.log("[WARNING] Unknown meta data parameters: " + sk.join(", "));
        }
        if (sh.labelPrefix === "" && sh.labelSuffix === "") {
            sh.labelPrefix = "x";
        }
        sh.titleColor = hO[sh.titleColor] || sh.titleColor;
        sh.descColor = hO[sh.descColor] || sh.descColor;
        const sl = nR("<div class=\"dialog show expand no-hide data\">\n\t\t<div class=\"dialog-header\">\n\t\t\t<div class=\"data-title\" stroke=\"" + sh.title + "\" style=\"color:" + sh.titleColor + "\"></div>\n\t\t\t" + (sh.desc ? "<div class=\"data-desc\" stroke=\"" + sh.desc + "\" " + (sh.descColor ? "style=\"color:" + sh.descColor + "\"" : "") + "></div>" : "") + "\n\t\t</div>\n\t\t<div class=\"close-btn btn\">\n\t\t\t<div class=\"close\"></div>\n\t\t</div>\n\t\t<div class=\"dialog-content\"></div>\n\t</div>");
        r6 = sl;
        sl.dispose = function () {
            document.body.classList.remove("hide-all");
            sl.remove();
            r6 = null;
        };
        sl.querySelector(".close-btn").onclick = sl.dispose;
        const sm = sl.querySelector(".dialog-content");
        const sn = [];
        const so = [];
        for (let sr in sg) {
            if (sr === "metaData") {
                continue;
            }
            const ss = sg[sr];
            let st = [];
            const su = Array.isArray(ss);
            let sv = 0;
            if (su) {
                for (let sw = 0; sw < ss.length; sw++) {
                    const sx = ss[sw];
                    const sy = dE[sx];
                    if (!sy) {
                        sn.push(sx);
                        continue;
                    }
                    sv++;
                    st.push([sx, undefined]);
                }
            } else {
                for (let sz in ss) {
                    const sA = dE[sz];
                    if (!sA) {
                        sn.push(sz);
                        continue;
                    }
                    const sB = ss[sz];
                    sv += sB;
                    st.push([sz, sB]);
                }
            }
            if (st.length === 0) {
                continue;
            }
            so.push([sv, sr, st, su]);
        }
        if (sh.sortGroups) {
            so.sort((sC, sD) => sD[0] - sC[0]);
        }
        for (let sC = 0; sC < so.length; sC++) {
            const [sD, sE, sF, sG] = so[sC];
            if (sh.sortGroupItems && !sG) {
                sF.sort((sK, sL) => sL[1] - sK[1]);
            }
            let sH = "";
            if (sh.addGroupNumbers) {
                sH += sC + 1 + ". ";
            }
            sH += sE;
            const sI = nR("<div stroke=\"" + sH + "\"></div>");
            sm.appendChild(sI);
            const sJ = nR("<div class=\"petal-container\"></div>");
            for (let sK = 0; sK < sF.length; sK++) {
                const [sL, sM] = sF[sK];
                const sN = dE[sL];
                const sO = nR("<div class=\"petal tier-" + sN.tier + "\" " + qB(sN) + "></div>");
                if (!sG && sh.showItemLabel) {
                    const sP = sh.labelPrefix + ka(sM) + sh.labelSuffix;
                    const sQ = nR("<div class=\"petal-count\" stroke=\"" + sP + "\"></div>");
                    if (sP.length > 6) {
                        sQ.classList.add("small");
                    }
                    sO.appendChild(sQ);
                }
                sO.petal = sN;
                sJ.appendChild(sO);
            }
            sm.appendChild(sJ);
        }
        km.appendChild(sl);
        if (sn.length > 0) {
            console.log("[WARNING] Unknown petals: " + sn.join(", "));
        }
        document.body.classList.add("hide-all");
    }
    window.displayData = r7;
    document.body.ondrop = function (sg) {
        sg.preventDefault();
        const sh = sg.dataTransfer.files[0];
        if (sh && sh.type === "application/json") {
            console.log("Importing data file: " + sh.name + "...");
            const si = new FileReader();
            si.onload = function (sj) {
                const sk = sj.target.result;
                try {
                    const sl = JSON.parse(sk);
                    r7(sl);
                } catch (sm) {
                    console.error("[ERROR] Failed to parse json.", sm);
                }
            };
            si.readAsText(sh);
        }
    };
    document.body.ondragover = function (sg) {
        sg.preventDefault();
    };
    Object.defineProperty(window, "msgpack", {
        get() {
            return {
                serialize() { },
                deserialize() { },
                encode() {
                    return new Uint8Array(1);
                },
                decode() {
                    return [];
                }
            };
        },
        set() { }
    });
    ks();
})();