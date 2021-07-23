class RangeInput extends HTMLElement{
    // #region MAIN
    constructor(){
        super();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.decPlace   = 2;
        this.isInt      = false;
        this.min_value	= 0;            // Smallest Possible Value
		this.max_value	= 10;           // Greatest Possible Value
		this.range 		= 10;           // Range Between the Min and Max
        this.steps      = 0;            // How to step between min/max
        this._value     = [ 0, 10 ];    // Current Values
        
        if( this.hasAttribute( "min" ) )        this.min_value      = parseFloat( this.getAttribute( "min" ) );
        if( this.hasAttribute( "max" ) )        this.max_value      = parseFloat( this.getAttribute( "max" ) );
        if( this.hasAttribute( "minValue" ) )   this._value[ 0 ]    = parseFloat( this.getAttribute( "minValue" ) );
        if( this.hasAttribute( "maxValue" ) )   this._value[ 1 ]    = parseFloat( this.getAttribute( "maxValue" ) );
        if( this.hasAttribute( "decPlace" ) )   this.decPlace       = parseInt( this.getAttribute( "decPlace" ) );
        
        this.range = this.max_value - this.min_value;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.appendChild( document.importNode( RangeInput.Template.content, true ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.width     = 0; // Width of Component
        this.height    = 0; // Heigh of component
        this.max_x     = 0; // Max X thumb may scroll to
        
        this.svg       = this.querySelector( "svg" );
        this.track     = this.querySelector( "path.rng_track" );
        this.conn      = this.querySelector( "path.rng_connect" );
        this.thumbs    = [
            this.querySelector( '[name="minThumb"]'),
            this.querySelector( '[name="maxThumb"]'),
        ];
        this.labels    = [
            this.thumbs[ 0 ].querySelector( 'text'),
            this.thumbs[ 1 ].querySelector( 'text'),
        ];

        this.thumb_width  = 30;         // Width of Thumb
        this.thumb_height = 14;         // Height of thumb
        this.thumb_y      = 0;          // Y Position to render thumbs
        this.sel_thumb    = null;       // Index of which Thumb is selected
        this.page_pos     = [0,0];      // XY of Page Postion of SVG
        this.thumb_pos    = [0,100];    // X Position of Both Thumbs
        this.offset_x     = 0;          // Offset on mouse down to keep thumb under same spot under mouse

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Events
		this.mouse_down_bind = this.on_mouse_down.bind( this );
		this.mouse_move_bind = this.on_mouse_move.bind( this );
        this.mouse_up_bind   = this.on_mouse_up.bind( this );

        this.observer = new ResizeObserver( this.on_resize.bind(this) );
        this.observer.observe( this );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.thumbs[0].addEventListener( "mousedown", this.mouse_down_bind, false );
        this.thumbs[1].addEventListener( "mousedown", this.mouse_down_bind, false );
    }
    // #endregion ////////////////////////////////////////

    // #region GETTER / SETTERS
    get value(){ 
        return { 
            min : this._value[ 0 ], 
            max : this._value[ 1 ]
        };
    }

    set_thumb_value( idx, v ){
        let t = (v - this.min_value) / this.range;
        this.set_thumb_pos( idx, t * this.max_x );
    }

    set_thumb_pos( idx, x ){
        let thumb = this.thumbs[ idx ]; // Which Thumb Object to Move
        let h     = this.thumb_y;       // Shortcut to Height
        let t     = x / this.max_x;     // T of x
        let val   = this.min_value * (1.0-t) + this.max_value * t;

        if( this.isInt ) val = Math.round( val );
        else             val = parseFloat( val.toFixed( this.decPlace ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.thumb_pos[ idx ]          = x;     // Update X Position
        this._value[ idx ]             = val;   // Save Value
        this.labels[ idx ].textContent = val;   // Display Value

        thumb.setAttribute( "transform", `translate(${x},${h})` ); // Move Thumb
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Update line that connects the two thumbs
        let a = this.thumb_pos[ 0 ] + 5;
        let b = this.thumb_pos[ 1 ];
        h     = this.height / 2;
        this.conn.setAttribute( "d", `M ${a},${h} L ${b},${h}` );
    }
    // #endregion ////////////////////////////////////////

    // #region WEB COM 
	connectedCallback(){
    }
    // #endregion ////////////////////////////////////////

    // #region EVENTS 
    dispatch_event( evt_name ){
        this.dispatchEvent( new CustomEvent( evt_name, { 
            bubbles    : true, 
            cancelable : true, 
            composed   : false,
            detail     : { 
                min : this._value[ 0 ],
                max : this._value[ 1 ],
            }
        }));
    }

    on_resize( ary ){
        let cr       = ary[0].contentRect;
        let w        = cr.width;
        let h        = cr.height;
        let hh       = h / 2;       // Half Height
        let o        = 4;           // With offset, so round caps can be seen.

        this.width   = w;
        this.height  = h;
        this.max_x   = w - this.thumb_width;
        this.thumb_y = hh - this.thumb_height / 2;

        // Resize Track
        this.track.setAttribute( "d", `M ${o},${hh} L ${w-o},${hh}` );

        // Reposition Thumbs
        this.set_thumb_value( 0, this._value[ 0 ] );
        this.set_thumb_value( 1, this._value[ 1 ] );
	}

	on_mouse_down( e ){
        let g              = e.target.closest( "g" );
        let i              = this.sel_thumb = ( g.getAttribute( "name" ) == 'minThumb' )? 0 : 1;

        let rect           = this.svg.getBoundingClientRect();
        this.page_pos[ 0 ] = rect.left + window.scrollX;
        this.page_pos[ 1 ] = rect.top  + window.scrollY;

        this.offset_x      = e.pageX - this.page_pos[ 0 ] - this.thumb_pos[ i ];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        window.addEventListener( "mousemove", this.mouse_move_bind );
        window.addEventListener( "mouseup", this.mouse_up_bind );
    }
    
	on_mouse_move( e ){
        let x  = e.pageX - this.page_pos[ 0 ] - this.offset_x;
        let i  = this.sel_thumb;
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Overlap Check
        if( i == 0 ){
            if( x + this.thumb_width > this.thumb_pos[ 1 ] ) x = this.thumb_pos[ 1 ] - this.thumb_width;
        }else{
            if( x < this.thumb_pos[ 0 ] + this.thumb_width ) x = this.thumb_pos[ 0 ] + this.thumb_width;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Border Check
        if( x < 0 )                   x = 0;
        else if( x > this.max_x ) x = this.max_x;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.set_thumb_pos( i, x );
        this.dispatch_event( "input" );
	}

	on_mouse_up( e ){
        window.removeEventListener( "mousemove", this.mouse_move_bind );
        window.removeEventListener( "mouseup", this.mouse_up_bind );
        this.dispatch_event( "change" );
	}	
    // #endregion ////////////////////////////////////////
}

RangeInput.Template = document.createElement( "template" );
RangeInput.Template.innerHTML = `<svg>
    <path class="rng_track" d="M 0,1 L50,10"></path>
    <path class="rng_connect" d="M 0,10 L 100,10"></path>
    <g class="rng_thumb" name="minThumb">
        <rect width="30" height="14"/>
        <text x="15" y="12" text-anchor="middle">000</text>
    </g>
    <g class="rng_thumb" name="maxThumb" transform="translate(50,0)">
        <rect width="30" height="14"/>
        <text x="15" y="12" text-anchor="middle">999</text>
    </g>
</svg>`;
window.customElements.define( "range-input", RangeInput );

export default RangeInput;