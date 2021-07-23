// #region FlexStack
class FlexStack extends HTMLElement{
    constructor(){
        super();
        if( this.hasAttribute( "row" ) ) this.className = "row" + this.getAttribute( "row" );
        else                             this.className = "row3";
    }
    connectedCallback(){}
}
window.customElements.define( "flex-stack", FlexStack );
// #endregion

export default FlexStack;