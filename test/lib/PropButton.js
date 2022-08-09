class PropButton extends HTMLElement{
    // #region MAIN
    _label      = null;
    _input      = null;
    _value      = null;

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropButton.Template.content.cloneNode( true ) );
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._label = sroot.querySelector( 'span' );
        this._input = sroot.querySelector( 'button' );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._input.addEventListener( 'click', e=>{
            e.stopPropagation();
            this.dispatchEvent( new CustomEvent( 'input', { detail: this._value, composed: true, bubbles: true }) );
        });
    }
    // #endregion

    // #region ATTRIBUTES
    static get observedAttributes(){
        return [ 'value', 'label' ];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            case 'value'    : this.value = newval; break;
            case 'label'    : this.label = newval; break;
        }
    }

    get value(){ return this._value; }
    set value( v ){ this._value = v; }
    set label( v ){ this._label.innerHTML = v; }
    // #endregion
}

// #region TEMPLATE
PropButton.Template = document.createElement( 'template' );
PropButton.Template.innerHTML = `
<style type="text/css">
:host{
    display                 : grid;
    grid-template-columns   : 1fr;
    grid-template-rows      : 1fr;
    grid-template-areas     : "a";
}

.input{
    grid-area       : a;
    align-self      : stretch;
    justify-self    : stretch;
    cursor          : pointer;
}

.label{
    cursor          : pointer;
}

.input:focus { outline:none; }
</style>
<button part="input">
    <span part="label" class="label">label</span>
</button>`;
globalThis.customElements.define( 'prop-button', PropButton );
// #endregion

export default PropButton;