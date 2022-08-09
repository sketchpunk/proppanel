import PropPanel        from './PropPanel.js';
import PropGroup        from './PropGroup.js';
import PropButtonPop    from './PropButtonPop.js';
import PropStackPanel   from './PropStackPanel.js';

import PropInput        from './PropInput.js';
import PropSelect       from './PropSelect.js';
import PropInputRange   from './PropInputRange.js';
import PropButton       from './PropButton.js';

import PropColorPicker  from './PropColorPicker.js';

import { PropTree, PropTreeNode }  from './PropTree.js';


// #region STARTUP
const mod_path = import.meta.url.substring( 0, import.meta.url.lastIndexOf("/") + 1 );
const css_path = mod_path + "PropUI.css";

(function(){
    let link    = document.createElement( "link" );
    link.rel	= "stylesheet";
    link.type	= "text/css";
    link.media	= "all";
    link.href	= css_path;
    document.getElementsByTagName( "head" )[0].appendChild( link );
})();
// #endregion /////////////////////////////////////////////////////////////////////////


export { 
    PropPanel, PropButtonPop, PropGroup, PropStackPanel,
    PropInput, PropSelect, PropInputRange, PropButton,
    PropColorPicker,
    PropTree, PropTreeNode,
};