/** 
* A auto-scaling image class for p5js that maintains natural image ratio as a player changes the screen size
* @param {p5.Image} img - An image loaded using the p5.js loadImage() method
* @param {number} x - the x-coordinates of the image as % of its width from the left-hand side bounary of the screen
* @param {number} y - the y-coordinates of the image as % of its height from the upper bounary of the screen 
*/
class p5Image{
    constructor(img, x, y) {
        this.img = img
        this.imgPixels = this.img.get()
        this.copyImg = this.img
        this.nr = this.img.width/this.img.height
        this.natW = this.img.width // The natural width of the image
        this.natH = this.img.height // At base (i.e 2560x1440), w should = natW
        this.natWPercentage = 100*this.natW/2560
        this.x = x
        this.y = y
        this.position = createVector(x, y)
        this.w = 100*this.img.width/width
        this.angle = 0;

        this.dims = createVector(this.natW, this.natH) // You can use dims if you want to calculate optimal width and height for another instance of the image
    }

    /** 
    * Update the image dimensions if the screen width:height ratio changes (such as a player changing the window size)
    * @param {boolean=false} override - force the image dims to update with height only, if not use the initial ratio of width/height and keep ratio
    */
    update(override=false){
        const baseline = (displayWidth+displayHeight)/2
        const size = (width+height)/2
        const ratio = size/baseline
        // If baseline ratio = 1, then halving screen size makes ratio = 0.5
        // If ratio = 0.5, then image size needs to decrease by 0.5 too
        let wwn = this.natW*ratio // Which gives a percentage
        this.copyImg = this.img.get()
        if (override) {
            this.copyImg.resize(wwn, Math.floor(this.natH))
        } else {
            this.copyImg.resize(wwn, Math.floor(wwn/this.nr))
        }
        this.dims = createVector(wwn, Math.floor(wwn/this.nr))
    }

    /** 
    * Wrapper function for updating image angle
    * @param {number} angle - The new angle of the image, in either degrees or radians according to what `imageMode` is set as
    */
    setRotation(angle) {
        this.angle = angle;
    }

    /** 
    * Image render instructions
    */
    draw(){
        let pos = this.position
        let xn = width*pos.x/100
        let yn = height*pos.y/100
        push();
        rotate(this.angle);
        image(this.copyImg, xn, yn)
        pop();
    }
}