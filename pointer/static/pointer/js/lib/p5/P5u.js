class P5u{
    /*
        --- The p5 unit module, which automatically converts pixel values to percentages of screen size, for uniform viewing on all devices ---

        ---- USAGE ----
            1) Define a new class that uses P5js. In the constructor, initialise a a new P5u class with
                    `this.p5u = new P5u()`
            2) Use the class methods to define position and dimensions for the object, in % units:
                    `this.p5u.setPosition(createVector(25, 25))` // Creates a position object at 25% width and 25% height of the page
                    `this.p5u.setDimensions({'width' : 50, 'height': 50})` // Sets the width and height to be 50% the w and h of the page.
                            NB: Must be defined with the 'width' and 'height' keywords.
            3) In the object's draw() function, set position and dimension with the p5u values, like:
                    `rect(this.p5u.position.x, this.p5u.position.y, this.p5u.dimensions.width, this.p5u.dimensions.height)`
                and call the p5u update function, allowing it to respond to page changes:
                    `this.p5u.update()`

        To use relative positioning, an object must define a parent class:
            1) When the child and parent have been defined, typically in p5.js's setup() function, define a new parent object
                    `myChild.p5u.setParent(myParent)`
            2) And repeat this line in `p5.draw();` - NB that defining this in both prevents flashing in the first frame
                - The child object's position and dimensions are now relative to its' parents. This works within a hierarchy, and children will
                  move relative to the parent, the parent to the grandparent, etc.
                  Positioning is set relative to the parent's p5.js anchor point, defined by rectMode(). If CENTER, then a child having
                  position (0, 0) will be set to the centre point of the parent. (-50, 0) would move it by parent.width/2 to the left, etc.
    */
    constructor(){
        this.position = undefined;
        this.parent = 'root';
        this.scaleFactor = createVector(windowWidth/100, windowHeight/100);
    }

    static NR(){
        return 1.926260346124906;
    }

    setParent(parent){
        /*
            - Set the parent of the object that this unit is being created for. In doing this, % becomes relative to the size of the parent's boundaries, eg. width/height, radius etc.
            - The parent must have properties either:
                - `w`, `h` or `width`, `height` for a rect, or `r` or `radius` for a circle

            - TODO:
                - Set for corner mode
                - Do circles and radii mode
        */
        // if (!Object.hasOwn(parent, 'p5u')){
        //     throw new Error("When allocating a parent object, the parent must have a p5u instance as an attribute. You can create this by extending the parent and creating a new P5u() object")
        // }

        this.parent = parent;
        // Position of the child, relative to the anchor point of the parent, in units of % of parent's dimensions
        if (RMODE == "CENTER" || RMODE == "center" || RMODE == CENTER){
            if (parent.dimensions != undefined){
                if (Object.hasOwn(parent.dimensions, 'width') && Object.hasOwn(parent.dimensions, 'height')){
                    // Make width and height proportional to the parent's width and height (using parent.dimensions)
                let dims = {
                    "width" : parent.dimensions.width * (this.initDimensions.width/100),
                    "height" : parent.dimensions.height * (this.initDimensions.height/100)
                }
                // parentPosition.x[pixels] + parent.width[pixels] * this.initPosition.x/100
                this.position = createVector(
                    parent.position.x + (parent.dimensions.width * (this.initPosition.x/100)),
                    parent.position.y + (parent.dimensions.height * (this.initPosition.y/100))
                )
                // Set child dimensions
                this.dimensions = dims;

                // And now scale factor just becomes the ratio of parentWidth to childWidth
                this.scaleFactor = createVector(
                    parent.dimensions.width / this.dimensions.width,
                    parent.dimensions.height / this.dimensions.height
                )
                } else if (Object.hasOwn(parent.dimensions, 'radius')) {
                    this.position = createVector(
                        parent.position.x + (parent.dimensions.radius * (this.initPosition.x/100)),
                        parent.position.y + (parent.dimensions.radius * (this.initPosition.y/100))
                    )
                    // RADIUS
                    let dims = {
                        "radius" : parent.dimensions.radius * (this.initDimensions.radius/100)
                    }
                    this.dimensions = dims
                    // Set scale factor
                    this.scaleFactor = (parent.dimensions.radius * (this.initDimensions.radius))
                }
            } else {
                throw new Error("A p5u object must have defined dimensions in order to be made a parent to a child shape. Dimensions can be defined through P5u.setDimensions().")
            }
        }
    }

    positionChild(){
        if (this.parent == 'root'){
            throw new Error("P5u object must be have a parent assigned to use repositionChild(). Either attach a parent via this.setParent(), or use setPosition to reposition relative to the window.")
        }

        if (RMODE == "CENTER" || RMODE == "center" || RMODE == CENTER){
            if (this.parent.dimensions != undefined){
                // Make width and height proportional to the this.parent's width and height (using this.parent.dimensions)
                let dims = {
                    "width" : this.parent.dimensions.width * (this.initDimensions.width/100),
                    "height" : this.parent.dimensions.height * (this.initDimensions.height/100)
                }
                // this.parentPosition.x[pixels] + this.parent.width[pixels] * this.initPosition.x/100
                this.position = createVector(
                    this.parent.position.x + (this.parent.dimensions.width * (this.initPosition.x/100)),
                    this.parent.position.y + (this.parent.dimensions.height * (this.initPosition.y/100))
                )

                this.dimensions = dims;
            } else {
                throw new Error("A p5u object must have defined dimensions in order to be made a parent to a child shape. Dimensions can be defined through P5u.setDimensions().")
            }
        }

    }

    setPosition(coords, returnVector=false){
        /*
            Converts a set of coordinates as pixels to percentages of the available screen width and height

            Inputs:
                - coords [x<px>, y<px>] as an array or p5 vector class
                - returnVector: Optional to always return as a p5 class, even if the input is an array
            Returns:
                - coords [x<%>, y<%>] of same type as input
        */

        // If input type is p5Vector
        if ((coords.isPInst != undefined && coords.isPInst === true)){
            this.initPosition = coords;
            this.position = createVector(
                coords.x * this.scaleFactor.x,
                coords.y * this.scaleFactor.y
            )
            return this.position;
        } 
        // If array
        if (coords.isPInst === undefined && typeof(coords) == 'object') {
            this.initPosition = createVector(coords[0], coords[1])
            if (returnVector){
                this.position = createVector(
                    coords[0] * this.scaleFactor.x,
                    coords[1] * this.scaleFactor.y
                )
            // } else {
                this.position = [
                    coords[0] * this.scaleFactor.x,
                    coords[1] * this.scaleFactor.y
                ]
            }

            return this.position
        }
        else {
            throw new TypeError("Coords type must be either p5.Vector or array as [x, y]. You can instantiate a p5 vector using p5.createVector(x, y). For more information see the p5.js docs @ https://p5js.org/reference/#/p5/createVector")
        }
    }

    setDimensions(b, makeEven=true) {
        /*
            - Define the dimensions of a shape
            - A method that can make life easier if defining a parent class of shape that will have child classes.
                    Defining the bounds means the children can have relative positioning to the parent more easily.
            - If the child has run setParent(), then this will use scaleFactor to give us relative sizing

            Inputs:
                - b: An object containing the types of dimensions the object has. Eg. for a circle, expect b.radius; for a rect, expect b.width and b.height
                    - width and height are expected to be % values of the parent
                - makeEven: Optional. If width and height dimensions are set to be equal, adjust the provided initDimensions to be such that width and height appear even at all screen sizes.
        */
        if (b === undefined) {
            b = this.initDimensions;
        } else {
            this.initDimensions = b
        }

        if (typeof(b) === 'object'){
            if (Object.hasOwn(b, 'width') && Object.hasOwn(b, 'height')){
                if (makeEven){
                    let s = ((this.scaleFactor.x + this.scaleFactor.y)/2)
                    this.dimensions = {'width' : b.width*s, 'height' : b.height*s}
                } else {
                    this.dimensions = {'width' : b.width*this.scaleFactor.x, 'height' : b.height*this.scaleFactor.y}
                }
            } else if (Object.hasOwn(b, 'radius')){
                this.dimensions = {'radius' : b.radius*(this.scaleFactor.x+this.scaleFactor.y)/2} // Taking the mean isn't the best solution but will do for now
            } else {
                throw new TypeError(`Input must have either height and width properties, or a radius value, using those keywords.`)
            }
        } else {
            throw new TypeError(`Expected input to be an object mapping dimensions (e.g. width, height) to values - instead received a ${typeof(b)}`)
        }
    }

    static convert(coords, returnVector=false){
        /*
            Statically converts a set of coordinates as pixels to percentages of the available screen width and height

            Inputs:
                - coords [x<px>, y<px>] as an array or p5 vector class
                - returnVector: Optional to always return as a p5 class, even if the input is an array
            Returns:
                - coords [x<%>, y<%>] of same type as input
        */

        // If input type is p5Vector
        if ((coords.isPInst != undefined && coords.isPInst === true)){
            return createVector(
                coords.x * windowWidth/100,
                coords.y * windowHeight/100
            )
        } 
        // If array
        if (coords.isPInst === undefined && typeof(coords) == 'object') {
            if (returnVector){
                return createVector(
                    coords[0] * windowWidth/100,
                    coords[1] * windowHeight/100
                )
            } else {
                return [
                    coords[0] * windowWidth/100,
                    coords[1] * windowHeight/100
                ]
            }   
        }
        else {
            throw new TypeError("Coords type must be either p5.Vector or array as [x, y]. You can instantiate a p5 vector using p5.createVector(x, y). For more information see the p5.js docs @ https://p5js.org/reference/#/p5/createVector")
        }
    }

    x(x, returnVector=false){
        /*
            Converts a singular coordinate in the x-direction to the equivalent value in terms of % width of the available screen

            Inputs:
                - x: A pixel value in the x-axis as a number or p5 Vector of type p5.Vector(x, 0)
                - returnVector: Optional to always return as a p5 class, even if the input is number
            Returns:
                - x as a % of screen width
        */

        if ((x.isPInst != undefined && x.isPInst === true)){
            this.position = createVector(x.x * this.scaleFactor.x, 0)
        } 

        if (x.isPInst === undefined && typeof(x) == 'number'){
            if (returnVector) {
                this.position = createVector(x*this.scaleFactor, 0)
            } else {
                this.position = x * this.scaleFactor
            }
        } else {
            throw new TypeError("Coords type must be either p5.Vector or `number`. You can instantiate a p5 vector using p5.createVector(x, y). When calling p5u.x(), the y-dimension of an input p5.Vector will be ignored. See also p5u.setPosition. For more information see the p5.js docs @ https://p5js.org/reference/#/p5/createVector")
        }

    }

    y(y, returnVector=false){
        /*
            Converts a singular coordinate in the y-direction to the equivalent value in terms of % height of the available screen

            Inputs:
                - y: A pixel value in the y-axis as a number or p5 Vector of type p5.Vector(0, y)
                - returnVector: Optional to always return as a p5 class, even if the input is number
            Returns:
                - y as a % of screen height
        */

        if ((y.isPInst != undefined && y.isPInst === true)){
            this.position = createVector(y.y * this.scaleFactor.y, 0)
        } 

        if (y.isPInst === undefined && typeof(y) == 'number'){
            if (returnVector) {
                this.position = createVector(y*this.scaleFactor, 0)
            } else {
                this.position = y * this.scaleFactor
            }
        } else {
            throw new TypeError("Coords type must be either p5.Vector or `number`. You can instantiate a p5 vector using p5.createVector(x, y). When calling p5u.x(), the y-dimension of an input p5.Vector will be ignored. See also p5u.setPosition. For more information see the p5.js docs @ https://p5js.org/reference/#/p5/createVector")
        }

    }

    updateScaleFactor(){
        /*
            Update the scale factor between parent and child
            Remember that scale factor is defined as the % * scaleFactor = pixels
        */
        if (this.parent == 'root'){
            this.scaleFactor = createVector(windowWidth/100, windowHeight/100);
        } else {
            if (Object.hasOwn(this.parent.dimensions, "radius")){
                this.scaleFactor = this.parent.dimensions.radius * (this.initDimensions.radius/100)
            } else {
                this.scaleFactor = createVector(
                    this.parent.scaleFactor.x*(this.initDimensions.width/100), 
                    this.parent.scaleFactor.y*(this.initDimensions.height/100)
                )
            }
        }
    }

    setImage(img){
        this.isImage = true;
        this.initWindowDims = createVector(windowWidth, windowHeight);
        this.currentWindowDims = this.initWindowDims;
        this.initImageDims = createVector(img.width, img.height);
        this.natRatio = img.width/img.height;
    }

    update(image=undefined){
        /*
            Set the value of this.position on every draw loop, to automatically resize if window size changes
            // Check the windowWidth and windowHeight on a new draw to automatically resize if window changes
            // [Or alternatively if we can store all instantiations of p5js, then when windowResized() is called, loop through them and run draw(), which would be have less overall load?]
            // [Or just set a global param for windowResized and if true, then run through them all in draw, perhaps]
        */

        if (this.isImage){
            // Change the window dimensions based on the natural image size on load, vs. the new window size
            // If the screen width grows by 10%, then windowWidth/initWindowWidth = 1.1
            // Hence new image width should be originalWidth * 1.1
            let ratio = windowWidth/this.initWindowDims.x
            // console.log(ratio)
            this.dimensions = {
                "width" : ratio * this.initImageDims.x,
                "height" : (ratio * this.initImageDims.x)/this.natRatio
            }

            this.position = createVector(
                windowWidth * this.initPosition.x/100,
                windowHeight * this.initPosition.y/100
            )

            return
        }

        if (this.parent == 'root'){
            this.updateScaleFactor()
            this.setPosition(this.initPosition, true);
            this.setDimensions()
        } else {
            this.updateScaleFactor()
        }
    }
}