// #region DRAG NUMBER INPUT
class DragNumberInput extends HTMLElement{
    // #region MAIN
    constructor(){
        super();

        this.isInt = false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.min_value = 0;
        this.max_value = Infinity;
        this.step      = 1;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //this.attachShadow( {mode: 'open'} );
        //this.shadowRoot.appendChild( DragNumberInput.Template.content.cloneNode( true ) );
        this.appendChild( document.importNode( DragNumberInput.Template.content, true ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.init_x         = 0;
        this.inc_step       = 10;
        this.start_value    = 0;

        if( this.hasAttribute( "value" ) )  this.start_value    = parseFloat( this.getAttribute( "value" ) );
        if( this.hasAttribute( "step" ) )   this.step           = parseFloat( this.getAttribute( "step" ) );
        if( this.hasAttribute( "min" ) )    this.min_value      = parseFloat( this.getAttribute( "min" ) );
        if( this.hasAttribute( "max" ) )    this.max_value      = parseFloat( this.getAttribute( "max" ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Events
		this.mouse_down_bind = this.on_mouse_down.bind( this );
		this.mouse_move_bind = this.on_mouse_move.bind( this );
        this.mouse_up_bind   = this.on_mouse_up.bind( this );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.svg            = this.querySelector( "svg" );
        this.svg_line       = this.svg.querySelector( "path:nth-of-type(1)" );
        this.svg_line_end   = this.svg.querySelector( "path:nth-of-type(2)" );

        this.input          = this.querySelector( "input" );
        this.input.value    = this.start_value;

        let div = this.querySelector( "div" );
        div.addEventListener( "mousedown", this.mouse_down_bind, false );

        this.input.addEventListener( "input", (e)=>{
            e.stopPropagation(); e.preventDefault();

            let v = parseFloat( this.input.value );
            if( v > this.max_value )      this.input.value = this.max_value;
            else if( v < this.min_value ) this.input.value = this.min_value;
    
            this.dispatch_event( "input" );
        });
    }
    
    // #endregion ////////////////////////////////////////

    // #region GETTER / SETTERS
    set_value( val ){
        this.input.value = val;
    }

    get value(){ return parseFloat( this.input.value ); }
    // #endregion ////////////////////////////////////////

    // #region WEB COM 
	connectedCallback(){}
    // #endregion ////////////////////////////////////////

    // #region EVENTS 
    dispatch_event( evt_name ){
        let v = this.value;
        if( isNaN(v) ) return;

        this.dispatchEvent( new CustomEvent( evt_name, { 
            bubbles    : true, 
            cancelable : true, 
            composed   : false,
            detail     : { value : v }
        }));
    }

	on_mouse_down( e ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.init_x         = this.svg.getBoundingClientRect().left;
        this.start_value    = parseFloat( this.input.value );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.svg_line.setAttribute( "d", "M 0,0 L 0,0" );
        this.svg_line_end.setAttribute( "d", `M 0,-4 L 0,4` );
        this.classList.add( "show" );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        window.addEventListener( "mousemove", this.mouse_move_bind );
        window.addEventListener( "mouseup", this.mouse_up_bind );
    }
    
	on_mouse_move( e ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let x   = e.clientX - this.init_x; 
        let inc = Math.floor( x / this.inc_step );

        this.svg_line.setAttribute( "d", "M 0,0 L" + x +",0" );
        this.svg_line_end.setAttribute( "d", `M ${x},-4 L${x},4` );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let val = this.start_value + inc * this.step;
        
        if( this.max_value != this.min_value ){
            if( val > this.max_value )      val = this.max_value;
            else if( val < this.min_value ) val = this.min_value;
        }

        if( this.isInt ) val = Math.round( val );
        else             val = parseFloat( val.toFixed( 2 ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.set_value( val );
        this.dispatch_event( "input" );
	}

	on_mouse_up( e ){
        window.removeEventListener( "mousemove", this.mouse_move_bind );
        window.removeEventListener( "mouseup", this.mouse_up_bind );
        this.classList.remove( "show" );
        this.dispatch_event( "change" );
	}	
    // #endregion ////////////////////////////////////////
}

DragNumberInput.Template = document.createElement( "template" );
DragNumberInput.Template.innerHTML = `<input type="number" value="0">
<div><svg>
    <path d="M 0,0 L15,0"></path>
    <path d="M 15,-4 L15,4"></path>
    <circle cx="0" cy="0" r="4"></circle>
</svg></div>`;

window.customElements.define( "drag-number-input", DragNumberInput );
// #endregion /////////////////////////////////////////////////////////////////////////


export default DragNumberInput;