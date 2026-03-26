// ==UserScript==
// @name         Clipboard Code Link Popup with Labels
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Shows a foldout with dynamic links based on clipboard content (VUnetID, email, knowledge item, asset tag or asset location). Opens links in new tabs, with labels and format validation alerts.
// @author       You
// @match        https://vu.service-now.com/*
// @match        https://iga.it.vu.nl/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('load', () => {

        // Patterns
        const vunetPattern = /^[A-Za-z]{3}\d{3}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const kbPattern = /^KB\d{7}$/i;
        const locatiePattern = /((HG|TR|IN|OW|NU|02|EC|AC|VO|BV|MF|SH)-[a-zA-Z0-9]{0,5}[^0-9])/;
        const assetPattern = /([a-zA-Z]{2}-[0-9]{6})/;
        const cinamePattern = /(VU-MWP-[0-9a-zA-Z]{7}|MGM-[0-9a-zA-Z]{6})/;
        const stdnumPattern = /[0-9]{7}/;

        const vunetLinks = [
            { label: 'Password Resets', url: 'https://vu.service-now.com/now/nav/ui/classic/params/target/pwd_reset_request_list.do%3Fsysparm_query%3Duser.u_samaccountnameSTARTSWITH${value}%26sysparm_first_row%3D1%26sysparm_view%3D' },
            { label: 'SD Aided reset', url: 'https://servicedesk.ucit.vu.nl/pwd.php?vunet=${value}&pass=yes' },
            { label: 'Omada', url: 'https://iga.it.vu.nl/dataobjlst.aspx?view=1000908&PTITLEAPPSTRID=1010426&SEARCH=${value}' },
        ];

        const emailLinks = [
            { label: 'Azure MFA', url: 'https://servicedesk.ucit.vu.nl/pwd.php?vunet=${value}&azure=yes'},
            { label: 'ra.SURFconext.nl', url: 'https://ra.surfconext.nl/second-factors?ra_search_ra_second_factors%5Bemail%5D=${value}' },
            { label: 'Omada', url: 'https://iga.it.vu.nl/dataobjlst.aspx?view=1000908&PTITLEAPPSTRID=1010426&SEARCH=${value}' },
        ];

        const kbLinks = [
            { label: 'KB Article', url: 'https://vu.service-now.com/now/nav/ui/classic/params/target/kb_knowledge_list.do%3Fsysparm_query%3DGOTOnumber%253d${value}' },
        ];

        const cilocaitieLinks = [
            { label: 'Locatie', url: 'https://vu.service-now.com/now/nav/ui/classic/params/target/cmdb_ci_list.do%3Fsysparm_query%3Dlocation.nameSTARTSWITH${value}%26sysparm_first_row%3D1%26sysparm_view%3Dsow%26sysparm_choice_query_raw%3D%26sysparm_list_header_search%3Dtrue'},
        ];

        const ciassetLinks = [
            { label: 'Asset tag', url: 'https://vu.service-now.com/now/nav/ui/classic/params/target/cmdb_ci_list.do%3Fsysparm_query%3Dasset_tagSTARTSWITH${value}%26sysparm_first_row%3D1%26sysparm_view%3Dsow%26sysparm_choice_query_raw%3D%26sysparm_list_header_search%3Dtrue'},
        ];

        const cinameLinks = [
            { label: 'CI name', url: 'https://vu.service-now.com/now/nav/ui/classic/params/target/cmdb_ci_list.do%3Fsysparm_query%3DnameSTARTSWITH${value}%26sysparm_first_row%3D1%26sysparm_view%3Dsow%26sysparm_choice_query_raw%3D%26sysparm_list_header_search%3Dtrue'},
        ];

        const stdnumLinks = [
            { label: 'Omada', url: 'https://iga.it.vu.nl/dataobjlst.aspx?view=1000908&PTITLEAPPSTRID=1010426&SEARCH=${value}' },
        ];

        // Create toggle button
        const button = document.createElement('button');
        button.textContent = 'Show Links';

        Object.assign(button.style, {
            position: 'fixed',
            top: '10px',
            left: '1080px',
            zIndex: 9999,
            padding: '8px',
            backgroundColor: '#486675',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            font: 'Arial',
        });

        document.body.appendChild(button);

        // Create panel
        const panel = document.createElement('div');
        Object.assign(panel.style, {
            position: 'fixed',
            top: '55px',
            left: '1080px',
            minWidth: '220px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            padding: '15px',
            fontFamily: 'sans-serif',
            display: 'none',
            zIndex: 10000,
        });

        document.body.appendChild(panel);

        let panelVisible = false;

        button.addEventListener('click', async () => {

            if (panelVisible) {
                panel.style.display = 'none';
                panelVisible = false;
                return;
            }

            try {
                const text = (await navigator.clipboard.readText()).trim().toUpperCase();

                let type = null;
                let value = text;

                if (vunetPattern.test(text)) {
                    type = 'vunet';
                    value = text.toLowerCase();
                }
                else if (emailPattern.test(text)) {
                    type = 'email';
                    value = text.toLowerCase();
                }
                else if (kbPattern.test(text)) {
                    type = 'kb';
                }
                else if (locatiePattern.test(text)) {
                    type = 'cilocatie';
                }
                else if (assetPattern.test(text)) {
                    type = 'ciasset';
                }
                else if (cinamePattern.test(text)) {
                    type = 'ciname';
                }
                else if (stdnumPattern.test(text)) {
                    type = 'stdnum';
                }

                if (!type) {
                    alert(
                        '❗ Clipboard must contain:\n' +
                        '- A valid VUnetID (e.g. ABC123)\n' +
                        '- A valid email address (e.g. name@example.com)\n' +
                        '- A valid KB number (e.g. KB1234567)\n' +
                        '- A valid Asset Tag, CI name or Location\n' +
                        '- A valid Student number\n'
                    );
                    return;
                }

                let linkSet;
                if (type === 'vunet') linkSet = vunetLinks;
                else if (type === 'email') linkSet = emailLinks;
                else if (type === 'kb') linkSet = kbLinks;
                else if (type === 'cilocatie') linkSet = cilocaitieLinks;
                else if (type === 'ciasset') linkSet = ciassetLinks;
                else if (type === 'ciname') linkSet = cinameLinks;
                else if (type === 'stdnum') linkSet = stdnumLinks;

                // Auto-open if only 1 link
                if (linkSet.length === 1) {
                    const finalUrl = linkSet[0].url.replace('${value}', encodeURIComponent(value));

                    panel.style.display = 'none';
                    panelVisible = false;

                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                } else {
                    showLinks(type, value);
                    panel.style.display = 'block';
                    panelVisible = true;
                }

            } catch (err) {
                alert('🚫 Failed to read from clipboard.\n' + err);
            }
        });

        function showLinks(type, value) {
            panel.innerHTML = '';

            const title = document.createElement('div');
            title.style.fontWeight = 'bold';
            title.style.marginBottom = '10px';

            title.textContent = `Links for ${type}: ${value}`;
            panel.appendChild(title);

            let linkSet;
            if (type === 'vunet') linkSet = vunetLinks;
            else if (type === 'email') linkSet = emailLinks;
            else if (type === 'kb') linkSet = kbLinks;
            else if (type === 'cilocatie') linkSet = cilocaitieLinks;
            else if (type === 'ciasset') linkSet = ciassetLinks;
            else if (type === 'ciname') linkSet = cinameLinks;
            else if (type === 'stdnum') linkSet = stdnumLinks;

            linkSet.forEach(link => {

                const finalUrl = link.url.replace('${value}', encodeURIComponent(value));

                const a = document.createElement('a');
                a.href = finalUrl;
                a.textContent = link.label;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';

                Object.assign(a.style, {
                    display: 'block',
                    marginBottom: '8px',
                    color: '#007bff',
                    textDecoration: 'none',
                    fontSize: '14px',
                });

                a.onmouseover = () => a.style.textDecoration = 'underline';
                a.onmouseout = () => a.style.textDecoration = 'none';

                // Close panel on click
                a.addEventListener('click', () => {
                    panel.style.display = 'none';
                    panelVisible = false;
                });

                panel.appendChild(a);
            });

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';

            Object.assign(closeBtn.style, {
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });

            closeBtn.onclick = () => {
                panel.style.display = 'none';
                panelVisible = false;
            };

            panel.appendChild(closeBtn);
        }
    });
})();
