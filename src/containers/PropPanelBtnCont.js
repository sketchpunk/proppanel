import Global from "../global.js";

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

export default PropPanelBtnCont;