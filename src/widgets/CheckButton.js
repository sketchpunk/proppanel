import Global from "../global.js";

// #region CheckButton
class CheckButton extends HTMLElement{
    constructor(){
        super();
        let id = Global.newUUID()
        this.appendChild( document.importNode( CheckButton.Template.content, true ) );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.chkbox	= this.querySelector( "input" );
        this.label	= this.querySelector( "label" );
        
        this.chkbox.setAttribute( "id", id );
        this.label.setAttribute( "for", id );

        if( this.hasAttribute( "on" ) ) this.chkbox.checked = ( this.getAttribute( "on" ) == "true" );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.chkbox.addEventListener( "input", (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.dispatchEvent( new CustomEvent( "input", { 
                bubbles    : true, 
                cancelable : true, 
                composed   : false,
                detail     : { 
                    value : this.chkbox.checked,
                }
            }));
        });
    }
    connectedCallback(){}
}
CheckButton.Template = document.createElement( "template" );
CheckButton.Template.innerHTML = `<input type="checkbox" id="rcc" checked/><label for="rcc"></label>`;

window.customElements.define( "check-button", CheckButton );
// #endregion

export default CheckButton;