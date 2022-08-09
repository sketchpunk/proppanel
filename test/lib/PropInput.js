import { GlobalMove } from './PropUtil.js';

class PropInput extends HTMLElement{
    // #region MAIN
    _label      = null;
    _input      = null;
    _dragScale  = 0.05;
    _step       = 1.0;

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropInput.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
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
            this.dispatchEvent( new CustomEvent( 'input', { detail: this._input.value, composed: true, bubbles: true }) );
        });

        this._input.addEventListener( 'keydown', e=>{
            if( e.key == 'Enter' ) this._input.blur();
        });

        this._label.addEventListener( 'mousedown', e=>{
            let initValue = this.value;
            if( isNaN( initValue ) ) initValue = 0;

            GlobalMove.begin( e, ( pos, delta )=>{
                this.value = initValue + this._step * Math.floor( delta[0] * this._dragScale );
                this.dispatchEvent( new CustomEvent( 'change', { detail: this._input.value, composed: true, bubbles: true }) );
            } );
        });
    }
    // #endregion

    // #region SETTERS
    setLabel( txt ){ this.label = txt; return this; }
    setValue( x ){ this.value = x; return this; }
    setStep( x ){ this.step = x; return this; }
    // #endregion

    // #region EVENTS
    onChange( fn ){ this.addEventListener( 'change', fn ); return this; }
    // #endregion

    // #region ATTRIBUTES
    static get observedAttributes(){
        return [ 'value', 'label', 'placeholder', 'step' ];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            case 'value'        : this.value        = newval; break;
            case 'label'        : this.label        = newval; break;
            case 'placeholder'  : this.placeholder  = newval; break;
            case 'step'         : this.step         = parseFloat( newval ); break;
        }
    }

    get value(){ return parseFloat( this._input.value ); }
    set value( v ){ this._input.value = v; }
    set label( v ){ this._label.innerHTML = v; }
    set placeholder( v ){ this._input.setAttribute( 'placeholder', v ); }
    
    set dragScale( v ){ this._dragScale = v; }
    set step( v ){ this._step = v; }
    // #endregion
}

// #region TEMPLATE
PropInput.Template = document.createElement( 'template' );
PropInput.Template.innerHTML = `
<style type="text/css">
:host{
    display                 : grid;
    grid-template-columns   : fit-content(200px) 1fr;
    grid-template-rows      : 1fr;
    grid-template-areas     : "a b";
}

.label {
    grid-area   : a;
    user-select : none;
}

.input{
    grid-area: b;
    align-self      : stretch;
    justify-self    : stretch;
}

.input:focus { outline:0; }
.input::-webkit-inner-spin-button, 
.input::-webkit-outer-spin-button{ display:none; }

/* .input:focus + .label{ background-color:lime; } */
</style>
<input part="input" class="input" type="number">
<label part="label" class="label">label</label>`;
globalThis.customElements.define( 'prop-input', PropInput );
// #endregion




export default PropInput;