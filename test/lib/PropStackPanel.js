class PropStackPanel extends HTMLElement{
    // #region MAIN
    _contentArea    = null;
    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropStackPanel.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._contentArea = sroot.querySelector( 'div' );
    }
    // #endregion

    // #region WEB COMPONENT 
    connectedCallback(){}
    // #endregion
}

// #region TEMPLATE
PropStackPanel.Template = document.createElement( 'template' );
PropStackPanel.Template.innerHTML = `
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

window.customElements.define( "prop-stack-panel", PropStackPanel );
// #endregion


export default PropStackPanel;