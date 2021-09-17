// #region ButtonStrip
class ButtonStrip extends HTMLElement{
    constructor(){
        super();
        if( this.getAttribute( "side" ) == "right" ) this.classList.add( "right" );
        else                                         this.classList.add( "left" );
    }
    connectedCallback(){}
}
window.customElements.define( "button-strip", ButtonStrip );
// #endregion

export default ButtonStrip;