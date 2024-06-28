function testFileLoad() {
    /*
        Test Summary:
                - Perform file load on N different files across `test`, `train` and `transfer` and check for success
    */

    
    let plevels_def = {};
    plevels_def[1] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60];
    plevels_def[2] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55];
    plevels_def[3] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
    plevels_def[4] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45];
    plevels_def[5] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];
    
    let plevels_test       = shuffle([1,2,3,4,5,6,7,8,9,10,11,12]);
    let plevels_transfer   = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

    let codingLevel = 0
    let codingLevelCount = 2
    let codingTest = 0

    let seenLayouts = [];

    // Loop over all the values

    for (let lvl=1; lvl<=5; lvl++) {
        for (let inst=0; inst<plevels_def[lvl].length; inst++){
            let nL = generateLayout("train", `${lvl.toString()}_${inst.toString()}`)
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
            let valArray = []
            let r = this.responseText;
            let splr = r.split("\n")
            for (var en in splr){
                let nv = splr[en].split("\r")[0].split(",")
                // nv[nv.length-1].replace("\\r", "")
                valArray.push(nv);
            }
            resolve(valArray);
            };
            req.onerror = reject;
            req.open("GET", `${METAPARAMS.IP}${METAPARAMS.BASEPATH}layout/${file}.txt`);
            req.send();
        })
    }

    // Increment coding level
    //      Increment codingLevelCount from 0->pLevelsDef[codingLevel].length

    function generateLayout(type, fileName) {
        function newLayout(type) {
          switch(type) {
            case "train":
              // Train
              function _runTrain() {
                let count_layout = plevels_def[codingLevel][codingLevelCount];
                let rand_layout = Math.floor(Math.random() * 25) + 1;
                return('r' + fileName.toString());
              }
              return _runTrain()
            case "test":
              // Test
              function _runTest() { return('test_' + fileName.toString()); };
              return _runTest()
            case "transfer":
              // Transfer
              function _runTransfer() { return('transfer_' + fileName.toString()); };
              return _runTransfer()
            default:
              console.log("Bad case");
              return undefined
          }
        }
    
        // NB: saving to global var `sdata` happens in expt_launcher.js
        let tmpLayout = newLayout(type)
        if (tmpLayout === undefined) { throw "Bad level layout type"}
        while (seenLayouts.includes(tmpLayout)) {
          tmpLayout = newLayout(type)
        }
    }

}