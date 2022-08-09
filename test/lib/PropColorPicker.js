class PropColorPicker extends HTMLElement{
    // #region MAIN
    _grayMode       = false;

    _canvas_col     = null;
    _ctx_col        = null;
    _canvas_gray    = null;
    _ctx_gray       = null;
    _lblColor       = null;
    _bgColor        = null;
    _markColor      = null;
    _markGray       = null;

    _selGray        = 1.0;
    _selRgb         = [255, 0, 0 ];
    _selHex         = '#FF0000';
    _selColor       = 0xff0000;

    _resizeObserver = null;

    _bindColorDown  = this.onColorDown.bind( this );
    _bindColorMove  = this.onColorMove.bind( this );
    _bindColorUp    = this.onColorUp.bind( this );
    _bindGrayDown   = this.onGrayDown.bind( this );
    _bindGrayMove   = this.onGrayMove.bind( this );
    _bindGrayUp     = this.onGrayUp.bind( this );

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropColorPicker.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._canvas_col    = sroot.querySelector( '#selColor' );
        this._ctx_col       = this._canvas_col.getContext( '2d' );

        this._canvas_gray   = sroot.querySelector( '#selGray' );
        this._ctx_gray      = this._canvas_gray.getContext( '2d' );

        this._bgColor       = sroot.querySelector( '#info' );
        this._lblColor      = sroot.querySelector( '#lblColor' );

        this._markColor     = sroot.querySelector( '#markColor' );
        this._markGray      = sroot.querySelector( '#markGray' );

        this._canvas_gray.addEventListener( 'pointerdown', this._bindGrayDown );
        this._canvas_col.addEventListener( 'pointerdown', this._bindColorDown );

        this._lblColor.addEventListener( 'dblclick', _=>{
            this._grayMode = !this._grayMode;
            this.onColorChange( 0 );
        });

        const container = sroot.querySelector( '#selContainer' );
        this._resizeObserver = new ResizeObserver( this.onResize.bind(this) );
        this._resizeObserver.observe( container );
    }
    // #endregion

    // #region SETTERS
    setColor( c ){
        const NORMALIZE_RGB	= 1 / 255.0;
        this._selRgb[ 0 ] = ( c >> 16 & 255 )	* NORMALIZE_RGB;
        this._selRgb[ 1 ] = ( c >> 8 & 255 )	* NORMALIZE_RGB;
        this._selRgb[ 2 ] = ( c & 255 )		    * NORMALIZE_RGB;

        this._selColor    = c;
        this._selHex      = '#' + ( '000000' + c.toString(16) ).slice( -6 ).toUpperCase();
        
        this._bgColor.style.backgroundColor = this._selHex;
        this._lblColor.innerText            = this._selHex;

        return this;
    }
    // #endregion

    // #region ATTRIBUTES
    static get observedAttributes(){
        return [];//[ 'value', 'label', 'placeholder', 'step' ];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            // case 'value'        : this.value        = newval; break;
            // case 'label'        : this.label        = newval; break;
            // case 'placeholder'  : this.placeholder  = newval; break;
            // case 'step'         : this.step         = parseFloat( newval ); break;
        }
    }

    // get value(){ return parseFloat( this._input.value ); }
    // set value( v ){ this._input.value = v; }
    // set label( v ){ this._label.innerHTML = v; }
    // set placeholder( v ){ this._input.setAttribute( 'placeholder', v ); }
    
    // set dragScale( v ){ this._dragScale = v; }
    // set step( v ){ this._step = v; }
    // #endregion
    
    // #region CANVAS EVENTS
    onColorDown( e ){
        this._canvas_col.addEventListener( 'pointermove', this._bindColorMove );
        document.body.addEventListener( 'pointerup', this._bindColorUp );    
        this._pickColor( e.layerX, e.layerY );
    }

    onColorMove( e ){ this._pickColor( e.layerX, e.layerY ); }
    onColorUp( e ){
        this._canvas_col.removeEventListener( 'pointermove', this._bindColorMove );
        document.body.removeEventListener( 'pointerup', this._bindColorUp );
        this.onColorChange( 2 );
    }

    onGrayDown( e ){
        this._canvas_gray.addEventListener( 'pointermove', this._bindGrayMove );
        document.body.addEventListener( 'pointerup', this._bindGrayUp );
        this._pickGray( e.layerX, e.layerY );
    }

    onGrayMove( e ){ this._pickGray( e.layerX, e.layerY ); }
    onGrayUp( e ){
        this._canvas_gray.removeEventListener( 'pointermove', this._bindGrayMove );
        document.body.removeEventListener( 'pointerup', this._bindGrayUp );
        this.onColorChange( 2 );
    }
    // #endregion

    // #region RENDER GRADIENTS
    _updateCanvas(){
        this._drawColor();
        this._drawGray();
    }

    _drawColor(){
        const w     = this._canvas_col.width;
        const h     = this._canvas_col.height;
        const ctx   = this._ctx_col;
        const step  = 1 / 360;

        const grad  = ctx.createLinearGradient( 0, 0, w, 0 );
        const steps = 360;
        let ii;
        for( let i = 0; i <= steps; i++ ){
            ii = i / steps;
            grad.addColorStop( ii, `hsl(${ 361 * (1 - ii)}, 100%, 50%)`); // Need 1 extra step to get pure red at the end
        }

        ctx.fillStyle = grad;
        ctx.fillRect( 0, 0, w, h );
    }

    _drawGray(){
        const w     = this._canvas_gray.width;
        const h     = this._canvas_gray.height;
        const ctx   = this._ctx_gray;

        const grad  = ctx.createLinearGradient( 0, 0, w, 0 );
        grad.addColorStop( 0, '#ffffff' );
        grad.addColorStop( 1, '#000000' );

        ctx.fillStyle = grad;
        ctx.fillRect( 0, 0, w, h );
    }
    // #endregion

    // #region RESIZE
    onResize( ary ){
        let cr       = ary[0].contentRect;
        let w        = cr.width;
        let h        = cr.height;
        let hh       = Math.floor( h / 2 );

        this._size( this._canvas_col, w, hh );
        this._size( this._canvas_gray, w, hh );

        this._updateCanvas();
    }

    _size( elm, w, h ){
        elm.style.width		= w + 'px';
		elm.style.height	= h + 'px';
		elm.width			= w;
		elm.height			= h;
    }
    // #endregion

    // #region COLOR PICKING
    _pickColor( x, y ){
        const a = this._ctx_col.getImageData( x, y, 1, 1).data;
        this._selRgb[ 0 ] = a[ 0 ];
        this._selRgb[ 1 ] = a[ 1 ];
        this._selRgb[ 2 ] = a[ 2 ];

        this._markColor.style.left = x + 'px';
        this.onColorChange();
    }

    _pickGray( x, y ){
        const a = this._ctx_gray.getImageData( x, y, 1, 1).data;
        this._selGray = a[ 0 ] / 255;
        this._markGray.style.left = x  + 'px';
        this.onColorChange();
    }
    // #endregion

    // #region INNER EVENTS
    // 0 both, 1 input, 2 change
    onColorChange( evtCall=1 ){
        let c;

        if( !this._grayMode ){
            const r  = this._selGray * this._selRgb[ 0 ];
            const g  = this._selGray * this._selRgb[ 1 ];
            const b  = this._selGray * this._selRgb[ 2 ];
            c  = (r << 16) | (g << 8) | b;
        }else{
            const r = Math.round( 255 * this._selGray );
            c  = ( r << 16 ) | ( r << 8 ) | r;
        }
        
        this._selColor = c;
        this._selHex   = '#' + ( '000000' + c.toString(16) ).slice( -6 ).toUpperCase();

        this._bgColor.style.backgroundColor = this._selHex;
        this._lblColor.innerText            = this._selHex;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const detail = {
            color : c,
            hex   : this._selHex,
        };

        if( evtCall == 1 || evtCall == 0 )
            this.dispatchEvent( new CustomEvent( 'input', { detail, composed: true, bubbles: true }) );
        else if( evtCall == 2 || evtCall == 0 )
            this.dispatchEvent( new CustomEvent( 'change', { detail, composed: true, bubbles: true }) );
    }

    onChange( fn ){
        this.addEventListener( 'change', fn);
        return this;
    }
    // #endregion
}

// #region TEMPLATE
PropColorPicker.Template = document.createElement( 'template' );
PropColorPicker.Template.innerHTML = `
<style type="text/css">
:host{
    box-sizing: border-box;
    display                 : grid;
    grid-template-columns   : 80px 1fr;
    grid-template-rows      : 1fr;
    grid-template-areas     : "left right";
    min-height:30px;
    border-radius: 4px;
    overflow:hidden;
}

canvas{ border:0px solid white; user-select: none; position:absolute; height:100%; width:100%; box-sizing: border-box; }
#lblColor{ background-color:rgba( 0,0,0, 0.5); color:white; font-family:monospace; padding:2px 5px; border-radius: 6px;  user-select: none; }

#info{
    grid-area: left;
    background-color: #ff0000;
    display:flex;
    align-items:center;
    justify-content:center;
    border-right:1px solid black;
}

#selContainer{
    grid-area: right;
    position:relative;
    box-sizing: border-box;

    display                 : grid;
    grid-template-columns   : 1fr;
    grid-template-rows      : 1fr 1fr;
    grid-template-areas     : "top" "bot";
}

#selColor{ grid-area: top; }
#selGray{ grid-area: bot; }

#markColor{ grid-area: top; 
    position:absolute;
    user-select: none; 
    background-color:black;
    width:2px;
    height:100%;
    left:0px;
    z-index:20;
}

#markGray{ grid-area: bot; 
    position:absolute;
    background-color:red;
    user-select: none; 
    width:2px;
    height:100%;
    left:0px;
    z-index:20;
}

</style>
<div id="info">
    <span id="lblColor">#FF0000</span>
</div>
<div id="selContainer">
    <canvas id="selColor"></canvas>
    <canvas id="selGray"></canvas>
    <span id="markColor"></span>
    <span id="markGray"></span>
</div>`;
globalThis.customElements.define( 'prop-color-picker', PropColorPicker );
// #endregion


export default PropColorPicker;