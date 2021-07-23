import Global from "../global.js";

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
// #endregion /////////////////////////////////////////////////////////////////////////

export default PropRow;