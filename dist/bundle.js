class Global{
    static modPath = import.meta.url.substring( 0, import.meta.url.lastIndexOf("/") + 1 );
    static cssPath = this.modPath + "bundle.css";
    static cssLink = `<link href="${this.cssPath}" rel="stylesheet" type="text/css">`;

    static newUUID(){
        let dt = new Date().getTime();
        if( window.performance && typeof window.performance.now === "function" ) dt += performance.now(); //use high-precision timer if available
        
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, ( c )=>{
            let r = ( dt + Math.random() * 16 ) % 16 | 0;
            dt = Math.floor( dt / 16 );
            return ( c == "x" ? r : ( r & 0x3 | 0x8 ) ).toString( 16 );
        });
    }
}

function isElm( s ){ return ( typeof s === "string" )? document.getElementById( s ) : s; }

class Dom{
    static getId( id ){ return document.getElementById( id ); }

    static on( elm, evtName, doStop, fn ){
        elm = isElm( elm );

        if( doStop ){
            elm.addEventListener( evtName, e=>{
                e.stopPropagation();
                e.preventDefault();
                fn( e );
            });
        }else elm.addEventListener( evtName, fn );
        return elm;
    }

    // #region INPUT SELECT
    static addOption( sElm, txt, val, optBefore=null ){
        let opt     = document.createElement( "option" );
        opt.text    = txt;
        opt.value   = val;
        sElm.add( opt, optBefore );
    }

    static rmOptionByValue( elm, v ){
        elm = isElm( elm );
        const opt = elm.options;

        for( let i=0; i < opt.length; i++ ){
            if( opt[ i ].value == v ){
                elm.remove( i );
                return true;
            }
        }
        return false;
    }

    static setSelectIndex( elm, idx ){
        elm = isElm( elm );

        switch( idx ){
            case "last" : idx = elm.options.length - 1;
        }

        elm.selectedIndex = idx;
    }
    // #endregion //////////////////////////////////////////////////////////////////
}

/**
@example
let myData = { woot:0 };

let state = StateProxy.new( myData );
state.$
    .useDynamicProperties( false )
    .converter( "woot", "int" )
    .on( "wootChange", (e)=>{ console.log( "wootChange", e.detail ) } );

state.woot = "500.5";   // Converter will change data to int( 500 )
state.woot = "yo";      // Converter Prevents this from being Saved since it produces NaN value

console.log( state.woot );
*/

class StateProxy{

    // #region STATIC
    static new( data={} ){ return new Proxy( data, new StateProxy( data ) ); }
    // #endregion ////////////////////////////////////////////////////////////

    // #region MAIN
    constructor( data ){
        this._emitter           = new EventTarget();
        this._converters        = new Map();
        this._dynamicProperties = false;
        this._data              = data;
    }

    getData(){ return this._data; }
    useDynamicProperties( v ){ this._dynamicProperties = v; return this; }
    // #endregion ////////////////////////////////////////////////////////////

    // #region PROXY TRAPS
    get( target, prop, receiver ){
        //console.log( "GET", "target", target, "prop", prop, "rec", receiver );    
        if( prop == "$" ) return this;
    
        return Reflect.get( target, prop, receiver ); //target[ prop ];
    }

    set( target, prop, value ){
        //console.log( "SET", "target", target, "prop", prop, "value", value );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( prop == "$" )                                    return false;
        if( !this._dynamicProperties && !( prop in target ) ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this._converters.has( prop ) ){
            let tuple = this._converters.get( prop )( value );
            if( tuple[ 0 ] == false ) return false;
            value = tuple[ 1 ];
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Reflect.set( target, prop, value ); // Save data to Object
        this.emit( prop+"Change", value );  // Emit event that property changed
        return true;
    }
    // #endregion ////////////////////////////////////////////////////////////

    // #region CONVERTERS
    /** fn = ( v: any ) : [ boolean, any ] */
    converter( propName, fn ){
        switch( fn ){
            case "float"    : fn = this._floatConverter;   break;
            case "int"      : fn = this._intConverter;     break;
        }

        this._converters.set( propName, fn );
        return this;
    }

    _floatConverter( v ){
        v = parseFloat( v );
        return [ !isNaN( v ), v ];
    }

    _intConverter( v ){
        v = parseInt( v );
        return [ !isNaN( v ), v ];
    }
    // #endregion ////////////////////////////////////////////////////////////

    // #region EVENTS
    on( evtName, fn ){ this._emitter.addEventListener( evtName, fn ); return this; }
    off( evtName, fn ){ this._emitter.removeEventListener( evtName, fn ); return this; }
    once( evtName, fn ){ this._emitter.addEventListener( evtName, fn, { once:true } ); return this; }

    emit( evtName, data ){
        this._emitter.dispatchEvent( new CustomEvent( evtName, { detail:data, bubbles: false, cancelable:true, composed:false } ) );
        return this;
    }
    // #endregion ////////////////////////////////////////////////////////////

}

class PropPanelBtnCont extends HTMLElement{
    constructor(){
        super();
        this.attachShadow( {mode: 'open'} );
        this.shadowRoot.appendChild( PropPanelBtnCont.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
    }
    
    connectedCallback(){
        let sr          = this.shadowRoot;
        this.btn        = sr.querySelector( ":scope > div > button");
        this.section    = sr.querySelector( ":scope > div > section");
        this.click_bind = this.on_click.bind( this );

        this.btn.addEventListener( "click", this.click_bind );

        if( this.getAttribute( "open" ) == "true" ){
            this.btn.className      = "open";
            this.section.className  = "open";
        }

        let tmp = this.getAttribute( "panelWidth" );
        if( tmp ) this.section.style.width = tmp;
    }

    on_click( e ){
        this.section.classList.toggle( "open" );
        this.btn.classList.toggle( "open" );
    }
}

PropPanelBtnCont.Template = document.createElement( "template" );
PropPanelBtnCont.Template.innerHTML = `${Global.cssLink}
<div class="prop-panel-btncont">
    <section class=""><slot></slot></section>
    <button><div>
    <svg width="40px" height="40px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;">
        <path id="menu" d="M6,15h12c0.553,0,1,0.447,1,1v1c0,0.553-0.447,1-1,1H6c-0.553,0-1-0.447-1-1v-1C5,15.447,5.447,15,6,15z M5,11v1
            c0,0.553,0.447,1,1,1h12c0.553,0,1-0.447,1-1v-1c0-0.553-0.447-1-1-1H6C5.447,10,5,10.447,5,11z M5,6v1c0,0.553,0.447,1,1,1h12
            c0.553,0,1-0.447,1-1V6c0-0.553-0.447-1-1-1H6C5.447,5,5,5.447,5,6z"/>
    </svg>
    </div></button>
</div>`;
window.customElements.define( "prop-panel-btncont", PropPanelBtnCont );

// #region PROP PANEL
class PropPanel extends HTMLElement{
	constructor(){
        super();
        this.attachShadow( {mode: 'open'} );
        //this.className = "prop-panel"; // Need this set so Input Styles Would Work.
        this.shadowRoot.appendChild( PropPanel.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
    }
    
    connectedCallback(){
        let sr   = this.shadowRoot;
        let head = sr.querySelector( "header" );
        let foot = sr.querySelector( "footer" );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let tmp = this.getAttribute( "head" );
        if( tmp ) head.innerHTML     = tmp;
        else      head.style.display = "none";

        tmp = this.getAttribute( "foot" );
        if( tmp ) foot.innerHTML     = tmp;
        else      foot.style.display = "none";
    }
}

PropPanel.Template = document.createElement( "template" );
PropPanel.Template.innerHTML = `${Global.cssLink}<div class="prop-panel"><header></header><main><slot></slot></main><footer></footer></div>`;
window.customElements.define( "prop-panel", PropPanel );

// #region PROP ROW
class PropRow extends HTMLElement{
    constructor(){
        super();
        this.attachShadow( {mode: 'open'} );
        this.shadowRoot.appendChild( PropRow.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
    
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.cont   = this.shadowRoot.querySelector( "div" );
		this.label	= this.shadowRoot.querySelector( "label" );
		this.main	= this.shadowRoot.querySelector( "main" );
    }

    connectedCallback(){
        let tmp = this.getAttribute( "label" );
        if( tmp ) this.set_label( tmp );

        let size = this.getAttribute( "size" );
        switch( size ){
            case "2080": this.cont.classList.add( "size2080" ); break;
            default: this.cont.classList.add( "size3070" ); break;
        }
    }

	set_label( txt ){ this.label.innerHTML = txt; return this; }
	append_control( elm ){ this.main.appendChild( elm ); return this; }
}
PropRow.Template = document.createElement( "template" );
PropRow.Template.innerHTML = `${Global.cssLink}
<div class="prop-row">
    <label></label>
    <main><slot></slot></main>
</div>`;

window.customElements.define( "prop-row", PropRow );

// #region PROP GROUP
class PropGroup extends HTMLElement{
	constructor(){
        super();
        this.attachShadow( {mode: 'open'} );
        this.shadowRoot.appendChild( PropGroup.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        
        let sh     = this.shadowRoot;
        this.root  = sh.querySelector( ":scope > div" );
        this.label = sh.querySelector( "header > span" );
        this.main  = sh.querySelector( "main" );
        this.icon  = sh.querySelector( "header > svg" );

        this.icon.addEventListener( "click", (e)=>{ 
            if( this.root.classList.contains( "close" ) )   this.open();
            else									        this.close();
        });
	}

    connectedCallback(){
        let tmp = this.getAttribute( "label" );
        if( tmp ) this.label.innerHTML = tmp;
    }
    
	// Observed Attribute
	static observedAttributes = [ "open" ];
	attributeChangedCallback( name, old_value, new_value ){
		//console.log( "attributeChangedCallback : name - %s : old value - %s : new value - %s", name, old_value, new_value );
		switch( name ){
			case "open":
				if( new_value == "true" )	this.open();
				else 						this.close();
			break;
		}
	}

	open(){  this.root.classList.remove( "close" ); this.icon.checked = true; return this; }
    close(){ this.root.classList.add( "close" );    this.icon.checked = false; return this; }
}

PropGroup.Template = document.createElement( "template" );
PropGroup.Template.innerHTML = `${Global.cssLink}
<div class="prop-group">
    <header><span></span>
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm80 248c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80z"></path>
        <path d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"></path>
    </svg>

    </header>
    <main><slot></slot></main>
</div>`;

window.customElements.define( "prop-group", PropGroup );

// #region FlexStack
class FlexStack extends HTMLElement{
    constructor(){
        super();
        if( this.hasAttribute( "row" ) ) this.className = "row" + this.getAttribute( "row" );
        else                             this.className = "row3";
    }
    connectedCallback(){}
}
window.customElements.define( "flex-stack", FlexStack );

// #region CheckButton
class CheckButton extends HTMLElement{
    constructor(){
        super();
        let id = Global.newUUID();
        this.appendChild( document.importNode( CheckButton.Template.content, true ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.chkbox	= this.querySelector( "input" );
        this.label	= this.querySelector( "label" );
        
        this.chkbox.setAttribute( "id", id );
        this.label.setAttribute( "for", id );

        if( this.hasAttribute( "on" ) ) this.chkbox.checked = ( this.getAttribute( "on" ) == "true" );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.chkbox.addEventListener( "input", (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.dispatchEvent( new CustomEvent( "input", { 
                bubbles    : true, 
                cancelable : true, 
                composed   : false,
                detail     : { 
                    value : this.chkbox.checked,
                }
            }));
        });
    }
    connectedCallback(){}
}
CheckButton.Template = document.createElement( "template" );
CheckButton.Template.innerHTML = `<input type="checkbox" id="rcc" checked/><label for="rcc"></label>`;

window.customElements.define( "check-button", CheckButton );

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
        }else {
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

class SlideInput extends HTMLElement{
    // #region MAIN
    constructor(){
        super();
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.decPlace   = 2;
        this.isInt      = false;
        this.min_value	= 0;            // Smallest Possible Value
		this.max_value	= 10;           // Greatest Possible Value
		this.range 		= 10;           // Range Between the Min and Max
        //this.steps      = 0;            // How to step between min/max
        this._value     = 0;            // Current Values

        if( this.hasAttribute( "min" ) )        this.min_value  = parseFloat( this.getAttribute( "min" ) );
        if( this.hasAttribute( "max" ) )        this.max_value  = parseFloat( this.getAttribute( "max" ) );
        if( this.hasAttribute( "value" ) )      this._value     = parseFloat( this.getAttribute( "value" ) );
        if( this.hasAttribute( "decPlace" ) )   this.decPlace   = parseInt( this.getAttribute( "decPlace" ) );
        
        this.range = this.max_value - this.min_value;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.appendChild( document.importNode( SlideInput.Template.content, true ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.width     = 0; // Width of Component
        this.height    = 0; // Heigh of component
        this.max_x     = 0; // Max X thumb may scroll to
        
        this.svg       = this.querySelector( "svg" );
        this.track     = this.querySelector( "path.rng_track" );
        this.conn      = this.querySelector( "path.rng_connect" );
        this.thumbs    = this.querySelector( '[name="minThumb"]' );

        this.labels    = this.thumbs.querySelector( 'text' );

        this.thumb_width  = 35;         // Width of Thumb
        this.thumb_height = 14;         // Height of thumb
        this.thumb_y      = 0;          // Y Position to render thumbs
        this.sel_thumb    = null;       // Index of which Thumb is selected
        this.page_pos     = [0,0];      // XY of Page Postion of SVG
        this.thumb_pos    = 0;          // X Position of Both Thumbs
        this.offset_x     = 0;          // Offset on mouse down to keep thumb under same spot under mouse

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Events
		this.mouse_down_bind = this.on_mouse_down.bind( this );
		this.mouse_move_bind = this.on_mouse_move.bind( this );
        this.mouse_up_bind   = this.on_mouse_up.bind( this );

        this.observer = new ResizeObserver( this.on_resize.bind(this) );
        this.observer.observe( this );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.thumbs.addEventListener( "mousedown", this.mouse_down_bind, false );
    }
    // #endregion ////////////////////////////////////////

    // #region GETTER / SETTERS
    get value(){ return this._value; }

    set_thumb_value( v ){
        let t = (v - this.min_value) / this.range;
        this.set_thumb_pos( t * this.max_x );
    }

    set_thumb_pos( x ){
        let thumb = this.thumbs;        // Which Thumb Object to Move
        let h     = this.thumb_y;       // Shortcut to Height
        let t     = x / this.max_x;     // T of x
        let val   = this.min_value * (1.0-t) + this.max_value * t;

        if( this.isInt ) val = Math.round( val );
        else             val = parseFloat( val.toFixed( this.decPlace ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.thumb_pos          = x;     // Update X Position
        this._value             = val;   // Save Value
        this.labels.textContent = val;   // Display Value

        thumb.setAttribute( "transform", `translate(${x},${h})` ); // Move Thumb
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Update line that connects the two thumbs
        this.min_x;
        h     = this.height / 2;
        this.conn.setAttribute( "d", `M 5,${h} L ${x},${h}` );
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
                value : this._value,
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
        this.set_thumb_value( this._value );
	}

	on_mouse_down( e ){
        e.target.closest( "g" );
        let rect           = this.svg.getBoundingClientRect();
        this.page_pos[ 0 ] = rect.left + window.scrollX;
        this.page_pos[ 1 ] = rect.top  + window.scrollY;

        this.offset_x      = e.pageX - this.page_pos[ 0 ] - this.thumb_pos;

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
        }else {
            if( x < this.thumb_pos[ 0 ] + this.thumb_width ) x = this.thumb_pos[ 0 ] + this.thumb_width;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Border Check
        if( x < 0 )               x = 0;
        else if( x > this.max_x ) x = this.max_x;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.set_thumb_pos( x );
        this.dispatch_event( "input" );
	}

	on_mouse_up( e ){
        window.removeEventListener( "mousemove", this.mouse_move_bind );
        window.removeEventListener( "mouseup", this.mouse_up_bind );
        this.dispatch_event( "change" );
	}	
    // #endregion ////////////////////////////////////////
}

SlideInput.Template = document.createElement( "template" );
SlideInput.Template.innerHTML = `<svg>
    <path class="rng_track" d="M 0,1 L50,10"></path>
    <path class="rng_connect" d="M 0,10 L 100,10"></path>
    <g class="rng_thumb" name="minThumb">
        <rect width="35" height="14"/>
        <text x="17" y="8" dominant-baseline="middle" text-anchor="middle" >000</text>
    </g>
</svg>`;
window.customElements.define( "slide-input", SlideInput );

// #region ButtonStrip
class ButtonStrip extends HTMLElement{
    constructor(){
        super();
        if( this.getAttribute( "side" ) == "right" ) this.classList.add( "right" );
        else                                         this.classList.add( "left" );
    }
    connectedCallback(){}
}
window.customElements.define( "button-strip", ButtonStrip );

(function(){
	let link    = document.createElement( "link" );
	link.rel	= "stylesheet";
	link.type	= "text/css";
	link.media	= "all";
	link.href	= Global.cssPath;
	document.getElementsByTagName( "head" )[0].appendChild( link );
})();

export { CheckButton, Dom, DragNumberInput, FlexStack, PropGroup, PropPanel, PropPanelBtnCont, PropRow, RangeInput, SlideInput, StateProxy };
