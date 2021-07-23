import Global from "../global.js";

// #region PROP GROUP
class PropGroup extends HTMLElement{
	constructor(){
        super();
        this.attachShadow( {mode: 'open'} );
        this.shadowRoot.appendChild( PropGroup.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        
        let sh     = this.shadowRoot;
        this.root  = sh.querySelector( ":scope > div" );
        this.label = sh.querySelector( "header > span" );
        this.main  = sh.querySelector( "main" );
        this.icon  = sh.querySelector( "header > svg" );

        this.icon.addEventListener( "click", (e)=>{ 
            if( this.root.classList.contains( "close" ) )   this.open();
            else									        this.close();
        });
	}

    connectedCallback(){
        let tmp = this.getAttribute( "label" );
        if( tmp ) this.label.innerHTML = tmp;
    }
    
	// Observed Attribute
	static observedAttributes = [ "open" ];
	attributeChangedCallback( name, old_value, new_value ){
		//console.log( "attributeChangedCallback : name - %s : old value - %s : new value - %s", name, old_value, new_value );
		switch( name ){
			case "open":
				if( new_value == "true" )	this.open();
				else 						this.close();
			break;
		}
	}

	open(){  this.root.classList.remove( "close" ); this.icon.checked = true; return this; }
    close(){ this.root.classList.add( "close" );    this.icon.checked = false; return this; }
}

PropGroup.Template = document.createElement( "template" );
PropGroup.Template.innerHTML = `${Global.cssLink}
<div class="prop-group">
    <header><span></span>
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm80 248c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80z"></path>
        <path d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"></path>
    </svg>

    </header>
    <main><slot></slot></main>
</div>`;

window.customElements.define( "prop-group", PropGroup );
// #endregion /////////////////////////////////////////////////////////////////////////

export default PropGroup;