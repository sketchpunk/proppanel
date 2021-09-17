function isStr( s ){ return ( typeof s === "string" ); }
function isElm( s ){ return ( typeof s === "string" )? document.getElementById( s ) : s; }

class Dom{
    static getId( id ){ return document.getElementById( id ); }

    static on( elm, evtName, doStop, fn ){
        elm = isElm( elm );

        if( doStop ){
            elm.addEventListener( evtName, e=>{
                e.stopPropagation();
                e.preventDefault();
                fn( e );
            });
        }else elm.addEventListener( evtName, fn );
        return elm;
    }

    // #region INPUT SELECT
    static addOption( sElm, txt, val, optBefore=null ){
        let opt     = document.createElement( "option" );
        opt.text    = txt;
        opt.value   = val;
        sElm.add( opt, optBefore );
    }

    static rmOptionByValue( elm, v ){
        elm = isElm( elm );
        const opt = elm.options;

        for( let i=0; i < opt.length; i++ ){
            if( opt[ i ].value == v ){
                elm.remove( i );
                return true;
            }
        }
        return false;
    }

    static setSelectIndex( elm, idx ){
        elm = isElm( elm );

        switch( idx ){
            case "last" : idx = elm.options.length - 1;
        }

        elm.selectedIndex = idx;
    }
    // #endregion //////////////////////////////////////////////////////////////////
}

export default Dom;