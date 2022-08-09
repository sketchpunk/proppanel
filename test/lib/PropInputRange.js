import { GlobalMove } from './PropUtil.js';

class PropInputRange extends HTMLElement{
    // #region MAIN
    _label      = null;
    _input      = null;

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropInputRange.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._label = sroot.querySelector( 'label' );
        this._input = sroot.querySelector( 'input' );

        if( !this.hasAttribute( 'value' ) ) this._input.value = 0;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._input.addEventListener( 'change', e=>{
            e.stopPropagation();
            this.dispatchEvent( new CustomEvent( 'change', { detail: this._input.value, composed: true, bubbles: true }) );
        });

        this._input.addEventListener( 'input', e=>{
            e.stopPropagation();
            this._label.innerText = this._input.value;
            this.dispatchEvent( new CustomEvent( 'input', { detail: this._input.value, composed: true, bubbles: true }) );
        });
    }
    // #endregion

    // #region SETTERS
    setValue( v ){ this.value = v; return this; }
    setRange( min, max, step ){
        this._input.min  = min;
        this._input.max  = max;
        this._input.step = step;
        return this;
    }
    // #endregion

    // #region EVENTS
    onChange( fn ){ this.addEventListener( 'change', fn ); return this; }
    // #endregion

    // #region ATTRIBUTES
    static get observedAttributes(){
        return [ 'value', 'label', 'min', 'max', 'step' ];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            case 'value'        : this.value        = newval; break;
            case 'label'        : this.label        = newval; break;
            case 'min'          : this._input.min   = newval; break;
            case 'max'          : this._input.max   = newval; break;
            case 'step'         : this._input.step  = newval; break;
        }
    }

    get value(){ return parseFloat( this._input.value ); }
    set value( v ){
        this._input.value       = v;
        this._label.innerText   = v;
    }
    // #endregion
}

// #region TEMPLATE
PropInputRange.Template = document.createElement( 'template' );
PropInputRange.Template.innerHTML = `
<style type="text/css">
:host{
    display                 : grid;
    grid-template-columns   : 50px 1fr;
    grid-template-rows      : 1fr;
    grid-template-areas     : "a b";
}

.label {
    grid-area       : a;
    user-select     : none;
    align-self      : center;
    justify-self    : center;
}

.input{
    grid-area       : b;
    align-self      : stretch;
    justify-self    : stretch;
}

.input:focus{ outline: none; }

.input{
    -webkit-appearance: none;
    margin: 8px 8px 8px 0px;
}

.input::-webkit-slider-runnable-track {
    height      : 6px;
    cursor      : pointer;
    background  : #4E5457;
}

.input::-webkit-slider-thumb {
    -webkit-appearance: none;
    height          : 14px;
    width           : 14px;
    border-radius   : 20px;
    background      : #a1a1a1;
    cursor          : pointer;
    margin-top      : -4px;
    margin-left     : -2px;
}

.input:focus::-webkit-slider-runnable-track {
    background: #707070;
}
</style>
<input part="input" class="input" type="range">
<label part="label" class="label">0</label>`;
globalThis.customElements.define( 'prop-input-range', PropInputRange );
// #endregion

export default PropInputRange;