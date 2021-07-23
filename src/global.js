class Global{
    static modPath = import.meta.url.substring( 0, import.meta.url.lastIndexOf("/") + 1 );
    static cssPath = this.modPath + "bundle.css";
    static cssLink = `<link href="${this.cssPath}" rel="stylesheet" type="text/css">`;

    static newUUID(){
        let dt = new Date().getTime();
        if( window.performance && typeof window.performance.now === "function" ) dt += performance.now(); //use high-precision timer if available
        
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, ( c )=>{
            let r = ( dt + Math.random() * 16 ) % 16 | 0;
            dt = Math.floor( dt / 16 );
            return ( c == "x" ? r : ( r & 0x3 | 0x8 ) ).toString( 16 );
        });
    }
}

export default Global;