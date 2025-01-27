const HTML_LAYOUT = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap">
<link href="PanelLayout_v2.css" rel="stylesheet" type="text/css">

<header>Header</header>
<div>
    <nav class="pgBtnBar">
        <slot name="btn-lh"></slot>
        <slot name="btn-lm"></slot>
        <slot name="btn-lf"></slot>        
    </nav>

    <slot name="panel-l"></slot>
    <slot name="main"></slot>
    <slot name="panel-r"></slot>

    <nav class="pgBtnBar">
        <slot name="btn-rh"></slot>
        <slot name="btn-rm"></slot>
        <slot name="btn-rf"></slot>    
    </nav>
</div>
<footer>footer</footer>
`;

export class PanelLayout extends HTMLElement{
    // #region MAIN
    static observedAttributes = [ 'panel-l', 'panel-r', 'btn-l', 'btn-r' ];
    #internals = null;

    constructor(){
        super();
        // this.#internals = this.attachInternals(); // Handle custom CSS States
        
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = HTML_LAYOUT;
    }
    // #endregion

    // #region CUSTOM CSS STATES
    // The :state() pseudo-class can also be used within the :host() pseudo-class function to match a custom 
    // state within a custom element's shadow DOM. Additionally, the :state() pseudo-class can be used after 
    // the ::part() pseudo-element to match the shadow parts of a custom element that is in a particular state.
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet

    get collapsed(){ return this.#internals.states.has( 'hidden' ); }
    set collapsed( v ){
        (v) ? this.#internals.states.add( 'hidden' )
            : this.#internals.states.delete( 'hidden' );

        console.log( this.#internals.states.has( 'hidden' ) );
    }
    // #endregion

    // #region LIFECYCLE
    // Custom element added to page
    async connectedCallback(){}

    // Custom element removed from page
    disconnectedCallback(){}

    // called when attributes are changed
    attributeChangedCallback( name, oldValue, newValue ){
        console.log( `Attribute ${name} has changed.`, oldValue, newValue );
        // switch( name ){
        //     case 'panel-l': this.toggleView( 'slot[name="panel-l"]', newValue, 'flex' ); break;
        //     case 'panel-r': this.toggleView( 'slot[name="panel-r"]', newValue, 'flex' ); break;
        //     case 'btn-l': this.toggleView( 'nav[name="btnL"]', newValue, 'flex' ); break;
        //     case 'btn-r': this.toggleView( 'nav[name="btnR"]', newValue, 'flex' ); break;
        // }
    }

    // Custom element moved to new page
    adoptedCallback(){}
    // #endregion

    // #region HELPERS
    // toggleView( q, show, cssName ){
    //     this.shadowRoot.querySelector( q ).style.display = (show ==='true')? cssName : 'none';
    // }
    // #endregion
}

customElements.define( 'panel-layout', PanelLayout );


const HTML_BUTTONS = `
<style>
    :host{ border: 1px solid red; display:flex; flex-direction:column;
    width:50px; }

    ::slotted(button){     
        aspect-ratio: 1; margin:0px; border:none; background:none; cursor:pointer;
        display:flex; justify-content: center; align-items: center;

        /* styling */
        font-size: 1.5em;
        transition: background 0.3s ease-in-out, color 0.2s ease;
        border-left: 3px solid transparent;
    }
</style>
<slot></slot>`;

class PanelLayoutButtonNav extends HTMLElement{
    // #region MAIN
    static observedAttributes = [ ];
    constructor(){
        super();
        // this.#internals = this.attachInternals(); // Handle custom CSS States
        const sh = this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = HTML_BUTTONS;

    }
    // #endregion

    // #region LIFECYCLE
    // Custom element added to page
    connectedCallback(){
        // const sh = this.attachShadow({ mode: 'open' });
        // sh.innerHTML = '<slot></slot>';
    }

    // Custom element removed from page
    disconnectedCallback(){}

    // called when attributes are changed
    attributeChangedCallback( name, oldValue, newValue ){
        console.log( `Attribute ${name} has changed.`, oldValue, newValue );
        // switch( name ){
        //     case 'panel-l': this.toggleView( 'slot[name="panel-l"]', newValue, 'flex' ); break;
        //     case 'panel-r': this.toggleView( 'slot[name="panel-r"]', newValue, 'flex' ); break;
        //     case 'btn-l': this.toggleView( 'nav[name="btnL"]', newValue, 'flex' ); break;
        //     case 'btn-r': this.toggleView( 'nav[name="btnR"]', newValue, 'flex' ); break;
        // }
    }

    // Custom element moved to new page
    adoptedCallback(){}
    // #endregion
}

customElements.define( 'panel-layout-button-nav', PanelLayoutButtonNav );
