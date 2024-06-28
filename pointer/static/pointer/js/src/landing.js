var STATICBASE = `${IP_BASE}static/pointer/imgs/`
var STATICBASEFONTS = `${IP_BASE}static/pointer/fonts/`
var BASE = IP_BASE
var limg;
var assets = {"graphics" : {}}
var source;
var CT;

function preload(){
    // Pointer logo image
    assets["graphics"]["logo"] = loadImage(STATICBASE + 'logoMain.png')
}

function setup(){
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("gameCanvas");
    frameRate(60);
    pixelDensity(1)
    rectMode(CENTER);
    imageMode(CENTER);

    let query = (new URL(window.location.href)).searchParams;
    let source = query.get("source")
    let id = query.get("id")
    let curriculum = query.get("curriculum")

    if (source == undefined) {source="unknown"}

    document.getElementById("toTutorial").addEventListener("click", (e) => {
        console.log("clicked")
        if (id != undefined){
            window.location.href = `${BASE}pointer/tutorial/?source=${source}&id=${id}&curriculum=${curriculum}`
        } else {
            window.location.href = `${BASE}pointer/tutorial/?source=${source}`
        }
        
    })

    limg = new p5Image(assets["graphics"]["logo"], 80, 50)
}

function windowResized() {
    // p5 on resize function
    resizeCanvas(windowWidth, windowHeight);
    limg.update();
}

function draw(){
    clear;
    background("rgb(239, 214, 172");
    scale(0.6);
    limg.draw();
}