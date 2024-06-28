// Update methods
function updateSdata() {
    sdata.expt_index[coding.index]  = coding.index;
    sdata.expt_trial[coding.index]  = coding.trial;
    // keep track of moves within a trial
    sdata.resp[coding.index] 				= {};
    sdata.resp[coding.index].layout       = [];
    sdata.resp[coding.index].timestamp    = [];
    sdata.resp[coding.index].reactiontime = [];
    sdata.resp[coding.index].direction    = [];
    sdata.resp[coding.index].allowed      = [];
    sdata.resp[coding.index].tool         = [];
    sdata.resp[coding.index].xloc         = [];
    sdata.resp[coding.index].yloc         = [];
}
