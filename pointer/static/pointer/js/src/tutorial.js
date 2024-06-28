let query = (new URL(window.location.href)).searchParams;
var gotPlayer = false;
var newParticipant = {
    source : query.get("source"),
    age : undefined,
    gender : undefined,
    prolificId: undefined,
    id : query.get("id"),
    curriculum : query.get("curriculum"),
    study_id : query.get("study_id"),
    session_id : query.get("session_id")
}
let hasSubmitted = false;
var id = undefined;

// document.getElementById("consentForm").addEventListener("submit", (e) => {
//     e.preventDefault()
//     let formData = new FormData(e.target)
//     newParticipant.age = formData.get('age')
//     newParticipant.gender = formData.get('gender')
//     newParticipant.prolificId = formData.get('prolificId')
//     let sbm = document.getElementById("submitBtn")
//     sbm.value = "Thank you!"
//     sbm.setAttribute("disabled", "")
//     document.getElementById("nextButton").removeAttribute("disabled")

// })

function loadWebContent(type){
    if (type == "information"){
        $("#textContent").load(`${METAPARAMS.IP}${METAPARAMS.BASEPATH}html/information_sheet.html`)
    } else if (type == "consent"){
        $("#textContent").load(`${METAPARAMS.IP}${METAPARAMS.BASEPATH}html/consent_form.html`)
    } else if (type == "instructions"){
        $("#textContent").load(`${METAPARAMS.IP}${METAPARAMS.BASEPATH}html/pointer_instructions.html`)
    } else if (type == "participant"){
        $("#textContent").load(`${METAPARAMS.IP}${METAPARAMS.BASEPATH}html/participant_form.html`)
    }
}

// -- Consent form version --
// document.getElementById("consentForm").onsubmit(function(e) {
//     e.preventDefault()
// })

document.getElementById("nextButton").addEventListener("click", function(){
    loadWebContent("information")
    this.innerHTML = "Continue"
    this.id = "consentButton"
    document.getElementById("consentButton").addEventListener("click", function() {
        loadWebContent("consent")
        this.innerHTML = "I agree to the above and am willing to continue"
        this.id = "beginButton"
        document.getElementById("beginButton").addEventListener("click", function() {
            this.innerHTML = "Loading..."
            this.id = "launchPointer"
            
            loadWebContent("instructions");
            this.setAttribute("disabled", true)
            game = new Game()
            if (!gotPlayer){
                Game.newPlayer(newParticipant)
                .then(async res => {
                    uid = await res.json()
                    // uid = JSON.parse(uid)
                    let pn = document.getElementById("launchPointer")
                    pn.removeEventListener('click', this)
                    pn.removeAttribute("disabled")
                    pn.innerHTML = "Begin"
                    pn.addEventListener("click", (e) => {
                        window.location.href = `${METAPARAMS.IP}pointer/game/?id=${uid}&source=${newParticipant.source}&curriculum=${newParticipant.curriculum}&session_id=${newParticipant.session_id}&study_id=${newParticipant.study_id}`
                    })
                    gotPlayer = true;
                })
            }
        })
    }) 
})

// -- Version without consent form --
// loadWebContent("instructions");
// game = new Game()
//     Game.newPlayer(newParticipant)
//     .then(async res => {
//         uid = await res.json()
//         // uid = JSON.parse(uid)
//         let pn = document.getElementById("nextButton")
//         pn.removeEventListener('click', this)
//         pn.removeAttribute("disabled")
//         pn.innerHTML = "Begin"
//         pn.addEventListener("click", (e) => {
//             window.location.href = `${METAPARAMS.IP}pointer/game/?id=${uid}&source=${newParticipant.source}&curriculum=${newParticipant.curriculum}&session_id=${newParticipant.session_id}&study_id=${newParticipant.study_id}`
//         })
//         // gotPlayer = true;
// })
