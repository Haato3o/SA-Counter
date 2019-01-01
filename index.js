const SA_ID = [131100, 131130]; // 131100 = hard cast | 131130 = chains
const BLOCK_ID = 20200;

module.exports = function saCounter(mod) {

    let counter = 0;
    let castingSA = false;
    let lastSkillSA = false;
    let cid;
    let enabledResults = true // Actual results that pop after boss is killed
    let enabledSmall = false // "Blocked after: X hits" message
    let totalSa = 0;
    let bigCounter = 0;
    let job;
    let boss;

    function printTotalAndClear(){
        setTimeout(function(){
            mod.command.message(`You casted ${totalSa} SAs`)
            mod.command.message(`Max hits you could possibly get: ${totalSa*4}`)
            mod.command.message(`You did: ${bigCounter} hits`)
            bigCounter = 0;
            totalSa = 0;
        }, 250)
        
    }

    mod.command.add('block', (ext) => {
        if (ext == 'help') {
            mod.command.message('Commands:')
            mod.command.message("block sa -> Enables/Disables SA counter text after every SA")
            mod.command.message("block results -> Enables/Disables results after killing a boss")
        } else if (ext == 'sa') {
            enabledSmall = !enabledSmall
            mod.command.message(`SA Counter is now ${enabled ? 'en' : 'dis'}abled.`)
        } else if (ext == 'results') {
            enabledResults = !enabledResults
            mod.command.message(`SA Result is now ${enabled ? 'en' : 'dis'}abled.`)
        } else {
            mod.command.message("Command doesn't exist! Use 'block help' to see the available commands.")
        }
        
    })

    mod.hook('S_BOSS_GAGE_INFO', 3, (event) => {
        boss = event.id
        if (event.curHp == 0n) {
            if (enabledResults && job == 1) {
                printTotalAndClear()
            }
        }
    })

    mod.hook('S_LOGIN', 12, (event) => {
        cid = event.gameId
        job = (event.templateId - 10101) % 100
    })

    mod.hook('S_EACH_SKILL_RESULT', 12, (event) => {
        if (job == 1) {
            if (SA_ID.includes(event.skill.id) && event.source == cid && !lastSkillSA && event.target == boss) {
                totalSa++
            }
            if (SA_ID.includes(event.skill.id) && event.source == cid) {
                counter++
                bigCounter++
                lastSkillSA = true
                castingSA = true
            } else {
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