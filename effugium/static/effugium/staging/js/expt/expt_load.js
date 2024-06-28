function startLoad(){

  var list =  gen_imgList();
  preloadImages(list, function() {

  startExperiment();

  });
}

function preloadImages(srcs, continueExp) {
    if (!preloadImages.cache) {
        preloadImages.cache = [];
    }
    var img;
    var remaining = srcs.length;
    for (var i = 0; i < srcs.length; i++) {
        img = new Image();
        img.onload = function () {
            --remaining;

            if (remaining <= 0) {
                continueExp();
            }
        };
        img.src = srcs[i];
        preloadImages.cache.push(img);

    }
      
}

function gen_imgList() {
 
  max_img_n_1 = 10 + 1;
  max_pairs   = 6;
  max_shapes  = 4;
  imglist = [];

  for (var i = 1; i<max_img_n_1; i++){
    for (var j=1; j<max_img_n_1; j++) {

      imglist.push(METAPARAMS.BASEPATH + "imgs/shapes/" + 's' + i +'_c' + j  + ".png");
    }
  }

  imglist.push(METAPARAMS.BASEPATH + "imgs/char.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/goal.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/f_new.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/f_noleft.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/f_restart.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/f_success.png");
  imglist.push(METAPARAMS.BASEPATH + "imgs/challenge.png");

  if (mobile==0){
  } else {

    imglist.push(METAPARAMS.BASEPATH + "imgs/button_d.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_l.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_r.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_u.png");

    imglist.push(METAPARAMS.BASEPATH + "imgs/button_d_clicked.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_l_clicked.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_r_clicked.png");
    imglist.push(METAPARAMS.BASEPATH + "imgs/button_u_clicked.png");
  }

    return imglist;

}
