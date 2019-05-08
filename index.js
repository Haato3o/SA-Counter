const SA_ID = [131100, 131130]; // 131100 = hard cast | 131130 = chains
const BLOCK_ID = 20200;

module.exports = function saCounter(mod) {

    let counter = 0;
    let castingSA = false;
    let lastSkillSA = false;
    let cid;
    let enabledResults = true // Actual results that pop after boss is killed
    let enabledSmall = false // "Blocked after: X hits" message
    let job;
    let boss = {};

    function printTotalAndClear(bossId){
        setTimeout(function(){
            mod.command.message(`You casted ${boss[bossId]["totalSa"]} SAs`)
            mod.command.message(`Max hits you could possibly get: ${boss[bossId]["totalSa"]*4}`)
            mod.command.message(`You did: ${boss[bossId]["bigCounter"]} hits`)
            delete boss[bossId]
        }, 250)
        
    }

    mod.command.add('block', (ext) => {
        if (ext == 'help') {
            mod.command.message('Commands:')
            mod.command.message("block sa -> Enables/Disables SA counter text after every SA")
            mod.command.message("block results -> Enables/Disables results after killing a boss")
        } else if (ext == 'sa') {
            enabledSmall = !enabledSmall
            mod.command.message(`SA Counter is now ${enabledSmall ? 'en' : 'dis'}abled.`)
        } else if (ext == 'results') {
            enabledResults = !enabledResults
            mod.command.message(`SA Result is now ${enabledResults ? 'en' : 'dis'}abled.`)
        } else {
            mod.command.message("Command doesn't exist! Use 'block help' to see the available commands.")
        }
        
    })

    mod.hook('S_BOSS_GAGE_INFO', 3, (event) => {
        if (!Object.keys(boss).includes(event.id.toString())) {
            boss[event.id.toString()] = {"totalSa":0, "bigCounter":0}
        }
        if (event.curHp == 0n && Object.keys(boss).includes(event.id.toString())) {
            if (enabledResults && job == 1) {
                printTotalAndClear(event.id.toString())
            }
        }
    })

    mod.hook('S_LOGIN', 13, (event) => {
        cid = event.gameId
        job = (event.templateId - 10101) % 100
    })

    mod.hook('S_EACH_SKILL_RESULT', 12, (event) => {
        if (job == 1) {
            if (SA_ID.includes(event.skill.id) && event.source == cid && !lastSkillSA && Object.keys(boss).includes(event.target.toString())) {
                boss[event.target]['totalSa']++
            }
            if (SA_ID.includes(event.skill.id) && event.source == cid) {
                if (Object.keys(boss).includes(event.target.toString())) {
                    boss[event.target]['bigCounter']++
                }
                counter++
                lastSkillSA = true
                castingSA = true
            } else if (!SA_ID.includes(event.skill.id) && event.source == cid) {
                lastSkillSA = false
                castingSA = false
                counter = 0
            }
        }
    })

    mod.hook('C_PRESS_SKILL', 4, (event) => {
        setTimeout(function(){
            if (event.skill.id == BLOCK_ID && lastSkillSA) {
                if (enabledSmall && job == 1) {
                    mod.command.message(`Blocked after: ${counter} hits`)
                }
                counter = 0
                lastSkillSA = false
            }
        }, 200)
    })
}
