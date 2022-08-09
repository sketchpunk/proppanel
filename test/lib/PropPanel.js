import { CollapseContent } from './PropUtil.js';

class PropPanel extends HTMLElement{
    // #region MAIN
    _isOpen         = true;
    _contentArea    = null;
    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropPanel.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._contentArea = sroot.querySelector( 'div' );
    }
    // #endregion

    // #region SETTERS
    fixedTopRight( x=10, y=10 ){
        this.style.position = 'fixed';
        this.style.top      = y + 'px';
        this.style.right    = x + 'px';
        return this;
    }

    setWidth( v ){ this.style.width = v+'px'; return this }
    // #endregion

    // #region WEB COMPONENT 
    connectedCallback(){}
    // #endregion

    // #region METHODS
    close(){
        CollapseContent.close( this, this._contentArea );
        this._isOpen = false;
    }

    open(){
        CollapseContent.open( this, this._contentArea );
        this._isOpen 		= true;
    }

    toggle(){
        if( this._isOpen )  this.close();
        else                this.open();
    }
    // #endregion
}

// #region TEMPLATE
PropPanel.Template = document.createElement( 'template' );
PropPanel.Template.innerHTML = `
<style>
:host{
    background-color        : silver;
    display                 : grid;
    grid-template-columns   : auto;
    grid-template-rows      : auto;
    transition              : height 0.3s ease-out;
}

::slotted(*){
    flex	: 1 1 auto;
}

#contentArea{
    align-self      : stretch;
    justify-self    : stretch;
    display         : flex;
    flex-direction  : column;
    box-sizing      : border-box;
}
</style>
<div part="content" id="contentArea"><slot></slot></div>`;

window.customElements.define( "prop-panel", PropPanel );
// #endregion


export default PropPanel;