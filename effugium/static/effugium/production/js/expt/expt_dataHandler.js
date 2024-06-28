function saveExperiment(path_data){
    /*
    Summary:
        - NB Updated by AG 5/9/22
        - Here we will replace the local saving with Ajax to send it back to Django and store in in the DB
    */
    // set the data to be saved

    // Cache data to browser at the end and start of each level
  
    var alldata = {
        task:       participant_task,
        id:         participant_id,
        
        sdata:      JSON.stringify(sdata),
        edata:      JSON.stringify(edata),
        parameters: JSON.stringify(parameters),
    };
    saveDataToServer(sdata)
}

function cacheState(){
    /*
        Summary:
                - Cache the data needed to completely recreate game state: sdata, edata, parameters
                - Data stored as 
    */

    // If not undefined, store flag states
    if (flag_test != undefined) {coding.flag_test = flag_test};
    if (flag_transfer != undefined) {coding.flag_transfer = flag_transfer};
    if (flag_restart != undefined) {coding.flag_restart = flag_restart};

    localStorage.setItem('sdata', JSON.stringify(sdata));
    localStorage.setItem('edata', JSON.stringify(edata));
    localStorage.setItem('parameters', JSON.stringify(parameters));
    localStorage.setItem('coding', JSON.stringify(coding));
    localStorage.setItem('playerId', JSON.stringify(participant_RISE));
}

function retrieveState(storeResults=true){
    /*
        Summary:
                - Retrieve all cached state data with params: sdata, edata, parameters
    */
    if (!storeResults) {
        // Return the data but do not store globally
        return({
            "sdata" : JSON.parse(localStorage.getItem('sdata')),
            "edata" : JSON.parse(localStorage.getItem('edata')),
            "parameters" : JSON.parse(localStorage.getItem('parameters')),
            "coding" : JSON.parse(localStorage.getItem('coding')),
            "cachedId" : JSON.parse(localStorage.getItem('playerId'))
        })
    } else {
        sdata = JSON.parse(localStorage.getItem('sdata'));
        edata = JSON.parse(localStorage.getItem('edata'));
        parameters = JSON.parse(localStorage.getItem('parameters'));
        coding = JSON.parse(localStorage.getItem('coding'));
        cachedId = JSON.parse(localStorage.getItem('playerId'))

        flag_test = coding.flag_test;
        flag_transfer = coding.flag_transfer;
        flag_restart = coding.flag_restart;

        return({
            "sdata" : sdata,
            "edata" : edata,
            "parameters" : parameters,
            "coding" : coding,
        })
    }
}

function hasCachedData(){
    if (localStorage.getItem('sdata') == null || 
        localStorage.getItem('coding') == null || 
        localStorage.getItem('edata') == null || 
        localStorage.getItem('parameters') == null) 
        {
            return false;
    }
    return true;
}

function clearState(){
    localStorage.removeItem('sdata');
    localStorage.removeItem('edata');
    localStorage.removeItem('parameters');
    localStorage.removeItem('coding');
}

function compareIds(){
    /*
    Summary:
            - Compare the ID from the current URL parameters with what's stored in the cache
            - If they don't match, then the player is using a new game instance, so clear the cache with clearState()
    */

    if (cachedId != undefined) {
        if (cachedId != participant_RISE) {
            clearState();
            return true;
        }
    }
    return false;
}

function saveDataToServer(sdata, alldata) {
    /*
        Summary:
                - Save data at a checkpoint or at the end of the experiment
    */

    // Store URL params too
    const urlParams = getRiseUrlParams();
    
    $.ajax({
        type: "POST",
        url: METAPARAMS.IP+"/effugium/save/",
        data: {
            "csrfmiddlewaretoken" : window.CSRF_TOKEN,
            "userId" : participant_RISE,
            "sdata": JSON.stringify(sdata),
            "edata": JSON.stringify(edata),
            "parameters": JSON.stringify(parameters),
            "urlParameters" : JSON.stringify(urlParams),
            "env" : METAPARAMS.ENV
        },
        success: (data, success) => {
            // If no ID given, assign the new server-side ID to the player
            if (participant_RISE == '') {participant_RISE = data}
        }
    })
  }

function postConfirmComplete(addr) {
/*
    Summary:
            - Tell the server that this participant has completed the game
*/
    $.ajax({
        type: "POST",
        url: METAPARAMS.IP+"/effugium/completed/",
        data: {
            "csrfmiddlewaretoken" : window.CSRF_TOKEN,
            "userId" : participant_RISE,
            "startTime" : timer.timers["player"]["start"],
            "endTime" : timer.timers["player"]["end"],
            "hasCompleted" : true,
            "riseData" : JSON.stringify(getRiseUrlParams()),
            "env" : METAPARAMS.ENV
        },
        success: (data, success, xhr) => {
            edata.postedConfirmation = true;
            console.log(`Completed with status ${xhr.status}`)
        },
        failure: (e, xhr) => {
            console.log(`Failed with status ${xhr.status}`);
            console.log(e)
        }
    })
}

function validate(){

    try {
        urlParams = getRiseUrlParams()
    } catch (error) {
        return false;
    }

    if (urlParams['DEBUG'] == "true") {
        PPT_GO = true;
        return true;
    };

    if (urlParams["prolific"] == "true") {
        PPT_GO = true;
        return true;
    }
    
    let id = urlParams["id"];
    let tag = urlParams["tag"];
    let iv = urlParams["iv"];
    let email = urlParams["email"];

    $.ajax({
        type : "POST",
        url: METAPARAMS.IP + `/effugium/validateParticipant/?id=${id}&tag=${tag}&iv=${iv}&email=${email}`,
        data: {
            "csrfmiddlewaretoken" : window.CSRF_TOKEN,
            "id" : id,
            "tag" : tag,
            "iv" : iv,
            "email" : email
        },
        success: (data, success, xhr) => {
            if (xhr.status == 200) {
                PPT_GO = true;
                return true;
            } else {
                PPT_GO = false;
                return false
            }
        },
        failure: (e, xhr) => {
            PPT_GO = false;
            return false;
        }
    })
}

function getRiseUrlParams(){
    let query = (new URL(window.location.href)).searchParams;
    return {
        "id" : query.get("id"),
        "tag" : query.get("tag"),
        "iv" : query.get("iv"),
        "email" : query.get("email"),
        "DEBUG" : query.get("DEBUG"),
        "prolific" : query.get("prolific")
    }
}

function requestLayout(file) {
    /*
      Summary:
          - A modern(esque) file read approach using Promises
    */
    return new Promise(function(resolve, reject){
      const req = new XMLHttpRequest();
      req.onload = function() {
        resolve(this.responseText);
      };
      req.onerror = reject;
      req.open("GET", `${METAPARAMS.IP}${METAPARAMS.BASEPATH}layout/${file}.txt`);
      req.send();
    })
  }

class Timer{
    /*
        Summary:
                - Common methods for timing sections of the script, and store/retrieval methods for these times.
                - Times returned are in Unix time. Time differences are thus in milliseconds (1E-3s)
    */
    constructor() {
        this.timers = {}
    }

    static getCurrentTime(){
        return new Date().getTime();
    }

    startNewTimer(label){
        /*
            Summary:
                    - Start a new timer method and store it in the object. If no label is provided, store with label N, where N is timer instance number.
            Inputs:
                    - label: A label for this timer. Equates to the key in the timers obj (str)
            Returns:
                    - The ended timer object containing start, end, and elapsed data
        */
       label === undefined ? this.timers[Object.keys(this.timers).length.toString()] = {"start": new Date().getTime()} : this.timers[label] = {"start" : new Date().getTime()};
    }

    endTimer(label) {
        /*
            Summary:
                    - End the timer indicated by the label and calculate the time elapsed. If no label provided, end the last stored.
            Inputs:
                    - label: A label for this timer. Equates to the key in the timers obj (str)
        */
        label === undefined ? label = (Object.keys(this.timers).length-1).toString() : label
        this.timers[label]["end"] = new Date().getTime();
        this.timers[label]["elapsed"] = this.timers[label]["end"] - this.timers[label]["start"]

        return this.timers[label]
    }

    getTimeElapsed(label){
        /*
            Summary:
                    - Get the time elapsed in ms from a provided label
            Inputs:
                    - label: A label for this timer. Equates to the key in the timers obj (str)
        */
        try {
            return this.timers[label].elapsed;
        } catch (error) {
            "Timer label does not exist"
        }
       
    }
}