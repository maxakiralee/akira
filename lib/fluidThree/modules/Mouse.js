import * as THREE from "three";
import Common from "./Common";

class Mouse{
    constructor(){
        this.mouseMoved = true; // Always active for automated movement
        this.coords = new THREE.Vector2();
        this.coords_old = new THREE.Vector2();
        this.diff = new THREE.Vector2();
        this.timer = null;
        this.count = 0;
        this.time = 0; // Time for figure-8 animation
        this.speed = 0.3; // Speed of the figure-8 motion (lower = slower)
        this.scale = 0.6; // Size of the figure-8 (0.6 = 60% of screen)
    }

    init(){
        // Remove mouse/touch event listeners for automated mode
        // document.body.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
        // document.body.addEventListener( 'touchstart', this.onDocumentTouchStart.bind(this), false );
        // document.body.addEventListener( 'touchmove', this.onDocumentTouchMove.bind(this), false );
    }

    setCoords( x, y ) {
        if(this.timer) clearTimeout(this.timer);
        this.coords.set( ( x / Common.width ) * 2 - 1, - ( y / Common.height ) * 2 + 1 );
        this.mouseMoved = true;
        this.timer = setTimeout(() => {
            this.mouseMoved = false;
        }, 100);
        
    }
    onDocumentMouseMove( event ) {
        this.setCoords( event.clientX, event.clientY );
    }
    onDocumentTouchStart( event ) {
        if ( event.touches.length === 1 ) {
            // event.preventDefault();
            this.setCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        }
    }
    onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            // event.preventDefault();
            
            this.setCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        }
    }

    update(){
        // Update time for figure-8 animation
        this.time += this.speed * 0.032; // Assume ~60fps (16ms per frame)
        
        // Generate figure-8 pattern using parametric equations
        // x = scale * sin(t)
        // y = scale * sin(2t) / 2
        const x = this.scale * Math.sin(this.time);
        const y = this.scale * Math.sin(2 * this.time) / 2;
        
        // Update coordinates
        this.coords.set(x, y);
        
        // Calculate difference for fluid simulation
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
    }
}

export default new Mouse();
