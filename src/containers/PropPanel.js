import Global from "../global.js";

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
// #endregion /////////////////////////////////////////////////////////////////////////

export default PropPanel;