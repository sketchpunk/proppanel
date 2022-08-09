import { CollapseContent } from './PropUtil.js';

class PropTree extends HTMLElement{
    // #region MAIN
    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropTree.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        //const sroot = this.shadowRoot;
    }
    // #endregion

    // #region WEB COMPONENT 
    connectedCallback(){}
    // #endregion
}

// #region TEMPLATE
PropTree.Template = document.createElement( 'template' );
PropTree.Template.innerHTML = `
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
</style>
<slot></slot>`;

window.customElements.define( 'prop-tree', PropTree );
// #endregion


class PropTreeNode extends HTMLElement{
    // #region MAIN
    _isOpen         = false;
    _clickCallback  = null;
    userData        = null;

    constructor(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super();
        this.attachShadow( { mode: 'open' } );
        
        this.shadowRoot.appendChild( PropTreeNode.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
        const sroot = this.shadowRoot;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this._itemContainer = sroot.querySelector( '#itemContainer' );
        this._subItems      = sroot.querySelector( '#subItems' );

        sroot.querySelector( 'header > button' ).addEventListener( 'click', this._onFoldClick );
        sroot.querySelector( 'header > a' ).addEventListener( 'click', this._onClick );
    }
    // #endregion

    // #region EVENTS
    _onFoldClick = ()=>{ this.toggle(); };
    _onClick     = ()=>{ if( this._clickCallback ) this._clickCallback( this ); };
    // #endregion

    // #region WEB COMPONENT 
    connectedCallback(){
        if( this.hasAttribute( 'open' ) === true ){
            this._isOpen = true;
            this.classList.add( 'open' );

        }else if( this.hasAttribute( 'open' ) === 'false' || this._isOpen === false ){
            this._itemContainer.style.overflow  = 'hidden';
            this._itemContainer.style.height    = '0px';  
            this._isOpen                        = false;
        }
    }

    static get observedAttributes(){
        return [ 'label'];
    }

    attributeChangedCallback( name, oldval, newval ){
        // console.log( name, 'old', oldval, 'new', newval );
        switch( name ){
            case 'label'    : this.label    = newval; break;
            case 'open'     : this.open     = !!newval; break;
        }
    }

    set label( str ){ this.shadowRoot.querySelector( 'header > a' ).innerHTML = str; }
    set open( b ){ 
        this._isOpen = b;
        if( b ){
            this._itemContainer.style.removeProperty( 'height' );
            this._itemContainer.style.removeProperty( 'overflow' );
            this.classList.add( 'open' );
        }else{
            this._itemContainer.style.overflow = 'hidden';
            this._itemContainer.style.height   = '0px';
            this.classList.remove( 'open' );
        }
    }
    // #endregion

    // #region SETTERS
    setLabel( str ){ this.label = str; return this; }
    setOpen( b ){ this.open = b; return this; }
    setClick( fn ){ this._clickCallback = fn; return this; }
    // #endregion

    // #region METHODS
    fold(){
        CollapseContent.close( this._itemContainer, this._subItems );
        this.classList.remove( 'open' );
        this._isOpen = false;
    }

    unfold(){
        CollapseContent.open( this._itemContainer, this._subItems );
        this.classList.add( 'open' );
        this._isOpen = true;
    }

    toggle(){
        if( this._isOpen )  this.fold();
        else                this.unfold();
    }

    append(){
        for( const itm of arguments ){
            this.appendChild( itm );
        }
        return this;
    }
    // #endregion
}

// #region TEMPLATE
PropTreeNode.Template = document.createElement( 'template' );
PropTreeNode.Template.innerHTML = `
<style>
:host{
    display                 : grid;
    grid-template-columns   : auto;
    grid-template-rows      : auto;
}

::slotted(*){
    flex	: 1 1 auto;
}

header{
    display                 : grid;
    grid-template-columns   : fit-content(40px) 1fr;
    grid-template-rows      : 1fr;
}

header > a{ text-decoration:none; }

header > button{
    align-self      : stretch;
    justify-self    : stretch;
    padding         : 0px;
    margin          : 0px;
    cursor          : pointer;
}

#itemContainer{ 
    transition      : height 0.3s ease-out;
}

#subItems{
    padding-left    : 12px;
}
</style>

<header>
    <button part="btnFold">
        <svg part="ico" class="ico" width="9" height="5" viewBox="0 0 9 5" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z"></path>
        </svg>
    </button>    
    <a part="link" href="javascript:void(0)">Tree Node</a>
</header>
<footer id="itemContainer">
    <section id="subItems"><slot></slot></section>
</footer>`;

window.customElements.define( 'prop-tree-node', PropTreeNode );
// #endregion


export { PropTree, PropTreeNode };