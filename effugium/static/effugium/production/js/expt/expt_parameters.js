var sdata;
var edata;
var parameters;
var board;

function setExperiment() {
  // EDATA ----------------
  edata = {};
  // expt
  edata.expt_subject = participant_id;
  edata.expt_task    = participant_task;
  edata.expt_RISE    = participant_RISE;
  edata.mobile       = mobile;
  edata.gameCompleted = false;
  edata.postedConfirmation = false;
  edata.cacheRestoreTimes = [];

  // PARAMETERS -----------
  parameters = {};

  //time outs (check)
  // parameters.response_timeout =  2000;  // response time
  // parameters.warnings_timeout = 20000;  // response warning time
  // parameters.feedpos_timeout  =   400;  // feedback time (good)
  // parameters.feedneg_timeout  =  2000;  // feedback time (bad)

  // numbers
  parameters.nb_trials        =   60;
  parameters.nb_transfer      =   20;

  // version
  //mobile = JSON.parse("[" + getQueryParams().m + "]");
  parameters.mobile = mobile;

  // image mappings
  //parameters.img_tool = arr[0];
  //parameters.img_pair = arr[1];
  parameters.img_tool = 's';
  parameters.img_pair = 'c';

  
  s_order = Array.from(Array(max_img_n_1).keys()).slice(1);
  s_order = shuffle(s_order);

  c_order = Array.from(Array(max_img_n_1).keys()).slice(1);
  c_order = shuffle(s_order);


  if (parameters.img_tool=='s') {
    parameters.img_teleporter   = 's' + s_order[max_pairs+0]+'_c';
    parameters.img_key          = 's' + s_order[max_pairs+1]+'_c';
    parameters.img_door         = 's' + s_order[max_pairs+2]+'_c';
    parameters.img_catapult     = 's' + s_order[max_pairs+3]+'_c';

    parameters.img_teleporter_t = '_c'+ c_order[max_pairs+0] +'.png';
    parameters.img_key_t        = '_c'+ c_order[max_pairs+1] +'.png';
    parameters.img_door_t       = '_c'+ c_order[max_pairs+2] +'.png';
    parameters.img_catapult_t   = '_c'+ c_order[max_pairs+3]+'.png';

} else {
    parameters.img_teleporter   = '_c'+ c_order[max_pairs+0]+'.png';
    parameters.img_key          = '_c'+ c_order[max_pairs+1]+'.png';
    parameters.img_door         = '_c'+ c_order[max_pairs+2]+'.png';
    parameters.img_catapult     = '_c'+ c_order[max_pairs+3]+'.png';

    parameters.img_teleporter_t = 's'+ s_order[max_pairs+0] +'_c';
    parameters.img_key_t        = 's'+ s_order[max_pairs+1] +'_c';
    parameters.img_door_t       = 's'+ s_order[max_pairs+2] +'_c';
    parameters.img_catapult_t   = 's'+ s_order[max_pairs+3] +'_c';
}

parameters.s_order = s_order;
parameters.c_order = c_order;

parameters.shape_teleporter = s_order[max_pairs+0];
parameters.shape_key        = s_order[max_pairs+1];
parameters.shape_door       = s_order[max_pairs+2];
parameters.shape_catapult   = s_order[max_pairs+3];

parameters.color_teleporter = c_order[max_pairs+0];
parameters.color_key        = c_order[max_pairs+1];
parameters.color_door       = c_order[max_pairs+2];
parameters.color_catapult   = c_order[max_pairs+3];


// levels
parameters.levels_def = {};
parameters.levels_def[1] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60];
parameters.levels_def[2] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55];
parameters.levels_def[3] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
parameters.levels_def[4] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45];
parameters.levels_def[5] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];

parameters.levels_test       = shuffle([1,2,3,4,5,6,7,8,9,10,11,12]);
parameters.levels_transfer   = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

  // SDATA ----------------
  sdata = {};
  // expt
  sdata.expt_index        = [];
  sdata.expt_trial        = [];
  sdata.trial_layout      = [];
  sdata.trial_level       = [];
  sdata.trial_solved      = [];
  sdata.trial_attempts    = [];
  sdata.trial_game        = [];
  sdata.trial_transfer    = [];
  sdata.trial_test        = [];

  sdata.game              = [];
  sdata.game_solved       = [];
  sdata.game_layout       = []; 
  sdata.game_level        = []; 
  sdata.game_attempts     = [];
  sdata.game_transfer     = [];
  sdata.game_test         = [];

  sdata.test_index        = [];
  sdata.test_solved       = [];
  sdata.test_layout       = [];

  sdata.RPM               = [];

  sdata.attempted_layouts = []; // Addition to store which layouts it attempts to store, and if they're successful as [layout, success bool]

  // resp
  sdata.resp              = {};
  // BOARD ----------------
  board = {};

  // CODING ---------------
  coding = {}
  // index
  coding.index  = -1;
  coding.trial  = 0;
  coding.game   = -1;
  coding.test   = -1;
  // counts
  coding.attempts      = 0;
  coding.level         = 0;
  coding.level_count   = 0;
  coding.transf_count  = 0;
  // other
  coding.answering = false;
  coding.timestamp = NaN;
  // location
  coding.xloc = 0;
  coding.yloc = 0;
  // Cache restore times
  coding.cacheRestoreTimes = [];
  coding.registeredControls = false;
  coding.isSkipBlocked = false;

  flag_restart  = false;
  flag_test     = false;
  flag_transfer = false;

}






