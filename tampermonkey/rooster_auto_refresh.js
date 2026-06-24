// ==UserScript==
// @name         rooster auto refreshen
// @namespace    https://vunl.sharepoint.com/sites/Servicedesk/Gedeelde%20documenten/Forms/AllItems.aspx?id=%2Fsites%2FServicedesk%2FGedeelde%20documenten%2FGeneral%2FIT%20Servicedesk%2FRooster%2Frooster%2Ehtm&parent=%2Fsites%2FServicedesk%2FGedeelde%20documenten%2FGeneral%2FIT%20Servicedesk%2FRooster
// @version      0.2
// @description  Rooster auto refreshen
// @author       John de Bever
// @match        https://vunl.sharepoint.com/sites/Servicedesk/Gedeelde%20documenten/Forms/AllItems.aspx?id=%2Fsites%2FServicedesk%2FGedeelde%20documenten%2FGeneral%2FIT%20Servicedesk%2FRooster%2Frooster%2Ehtm&parent=%2Fsites%2FServicedesk%2FGedeelde%20documenten%2FGeneral%2FIT%20Servicedesk%2FRooster
// ==/UserScript==

setTimeout(function(){ window.location.href = window.location.href; }, 500000); // getal is tijd in ms
