const HTML_LAYOUT = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap">
<link href="PanelLayout.css" rel="stylesheet" type="text/css">

<header>Header</header>
<div>
    <nav class="pgBtnBar" name='btnL' style="display:none">
        <slot name="btn-lh"></slot>
        <slot name="btn-lm"></slot>
        <slot name="btn-lf"></slot>        
    </nav>

    <slot name="panel-l"></slot>
    <slot name="main"></slot>
    <slot name="panel-r"></slot>

    <nav class="pgBtnBar" name='btnR' style="display:none">
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
    async connectedCallback(){

        
        // const wrapper = document.createElement('div');
        // const slot = document.createElement('slot');
        // wrapper.appendChild(slot);
        // shadow.appendChild(wrapper);

        // let slots = this.shadowRoot.querySelectorAll("slot");
        // slots[1].addEventListener("slotchange", (e) => {
        //   let nodes = slots[1].assignedNodes(); 
        //   console.log( `Element in Slot "${slots[1].name}" changed to "${nodes[0].outerHTML}".`,
        // );

        // const sheet = new CSSStyleSheet();
        // sheet.replaceSync(':host { border: 5px solid #ccc; display:inline-block; } :host(:hover){border-color: #666;}' );
        // this.shadowRoot.adoptedStyleSheets = [sheet];

        
        // const x = '00';
        // const t = html`Testing One ${x} Two ${0} Three`;


        /*
        const sheet = new CSSStyleSheet();
        sheet.replaceSync('span { color: red; border: 5px dotted black;}');
        shadow.adoptedStyleSheets = [sheet];

        const span = document.createElement("span");
        span.textContent = "I'm in the shadow DOM";
        shadow.appendChild(span);
        */

        // // Create some CSS to apply to the shadow dom
        // const style = document.createElement("style");
        // console.log(style.isConnected);

        // style.textContent = ``;
        // shadow.appendChild( style );

        // Apply external styles to the shadow dom
        // const linkElem = document.createElement("link");
        // linkElem.setAttribute("rel", "stylesheet");
        // linkElem.setAttribute("href", "style.css");
        // shadow.appendChild(linkElem);
    }

    // Custom element removed from page
    disconnectedCallback(){}

    // called when attributes are changed
    attributeChangedCallback( name, oldValue, newValue ){
        console.log( `Attribute ${name} has changed.`, oldValue, newValue );
        switch( name ){
            case 'panel-l': this.toggleView( 'slot[name="panel-l"]', newValue, 'flex' ); break;
            case 'panel-r': this.toggleView( 'slot[name="panel-r"]', newValue, 'flex' ); break;
            case 'btn-l': this.toggleView( 'nav[name="btnL"]', newValue, 'flex' ); break;
            case 'btn-r': this.toggleView( 'nav[name="btnR"]', newValue, 'flex' ); break;
        }
    }

    // Custom element moved to new page
    adoptedCallback(){}
    // #endregion

    // #region HELPERS
    toggleView( q, show, cssName ){
        this.shadowRoot.querySelector( q ).style.display = (show ==='true')? cssName : 'none';
    }
    // #endregion
}

customElements.define( 'panel-layout', PanelLayout );



