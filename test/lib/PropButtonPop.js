import { GlobalMove } from './PropUtil.js';

class PropButtonPop extends HTMLElement{
    // #region MAIN
    _input  = null;

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropButtonPop.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._input = sroot.querySelector( 'button' );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._input.addEventListener( 'click', e=>{
            e.stopPropagation();
            this.classList.toggle( 'open' );
        });
    }
    // #endregion

    // #region METHODS
    fixedTopRight( x=20, y=20 ){
        this.style.position = 'fixed';
        this.style.top      = y + 'px';
        this.style.right    = x + 'px';
        return this;
    }

    fixedBottomRight( x=20, y=20 ){
        this.style.position = 'fixed';
        this.style.bottom   = y + 'px';
        this.style.right    = x + 'px';
        return this;
    }
    // #region

    // #region ATTRIBUTES
    static get observedAttributes(){
        return [ 'open' ];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            case 'open': this.open = newval; break;
        }
    }

    set open( v ){
        if( v == true || v == 'true' ) this.classList.add( 'open' );
        else                           this.classList.remove( 'open' );
    }
    // #endregion
}

// #region TEMPLATE
PropButtonPop.Template = document.createElement( 'template' );
PropButtonPop.Template.innerHTML = `
<style type="text/css">
:host{
    position    : relative;
}

::slotted(*){
    flex	: 1 1 auto;
}

.panel{
    position        : absolute;
    display         : flex;
    flex-direction  : column;
}

.btnOuter{
    padding     : 0px;
    margin      : 0px;
    position    : absolute; 
    bottom      : 0px; 
    right       : 0px;
    display     : flex; flex-direction:column; align-items: stretch;
    box-sizing  : border-box;
    cursor      : pointer;
}

.btnInner{
    display                 : grid;
    grid-template-columns   : 1fr;
    grid-template-rows      : 1ft;
}

.btnInner *{
    align-self      : center;
    justify-self    : center;
}

</style>
<section part="panel" class="panel"><slot></slot></section>
<button part="btnOuter" class="btnOuter"><div part="btnInner" class="btnInner">
<svg part="ico" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;">
    <path id="menu" d="M6,15h12c0.553,0,1,0.447,1,1v1c0,0.553-0.447,1-1,1H6c-0.553,0-1-0.447-1-1v-1C5,15.447,5.447,15,6,15z M5,11v1
        c0,0.553,0.447,1,1,1h12c0.553,0,1-0.447,1-1v-1c0-0.553-0.447-1-1-1H6C5.447,10,5,10.447,5,11z M5,6v1c0,0.553,0.447,1,1,1h12
        c0.553,0,1-0.447,1-1V6c0-0.553-0.447-1-1-1H6C5.447,5,5,5.447,5,6z"/>
</svg>
</div></button>`;
globalThis.customElements.define( 'prop-button-pop', PropButtonPop );
// #endregion

export default PropButtonPop;