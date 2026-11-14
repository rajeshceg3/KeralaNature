/* Explicit coastal controls. Map style, coordinates and flight parameters stay in map.js. */
(() => {
    const panel = document.getElementById('beach-explorer');
    panel.prepend(document.getElementById('explorer-close'));
    const toggle = document.getElementById('explorer-toggle');
    const detail = document.getElementById('infoPanel');
    const legend = detail.querySelector('.legend');
    panel.insertBefore(legend, document.getElementById('beach-list-container'));
    document.body.appendChild(detail);
    detail.setAttribute('role', 'dialog');
    detail.setAttribute('aria-modal', 'true');
    detail.setAttribute('aria-label', 'Beach story');
    detail.inert = true; detail.setAttribute('aria-hidden', 'true');
    let previous = toggle;
    const background = () => [document.querySelector('.map-container'), document.querySelector('.coast-heading')];
    const setBackground = value => background().forEach(e => e.inert = value);
    window.closeBeachExplorer = (restore = true) => {
        panel.classList.remove('is-open'); panel.inert = true; panel.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false'); setBackground(false);
        if (restore) toggle.focus();
    };
    const closeStory = (restore = true) => {
        detail.classList.remove('expanded', 'has-selection'); detail.inert = true; detail.setAttribute('aria-hidden', 'true');
        setBackground(false); if (restore) (previous?.isConnected && !previous.closest('[inert]') ? previous : toggle).focus();
    };
    window.prepareBeachStory = () => { previous = document.activeElement; setBackground(true); };
    toggle.onclick = () => {
        closeStory(false); panel.classList.add('is-open'); panel.inert = false; panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true'); setBackground(true); document.getElementById('explorer-close').focus();
    };
    document.getElementById('explorer-close').onclick = () => window.closeBeachExplorer();
    document.getElementById('detail-close').onclick = () => closeStory();
    document.getElementById('locate-beaches').onclick = () => {
        const status = document.getElementById('location-status'); status.textContent = 'Checking your location…';
        if (!navigator.geolocation) return showGeolocationError();
        navigator.geolocation.getCurrentPosition(position => {
            status.textContent = 'Location found. The map is centered near you.';
            map.flyTo([position.coords.latitude, position.coords.longitude], 9, {animate: true, duration: 2});
        }, showGeolocationError, {timeout: 10000, maximumAge: 60000});
    };
    document.getElementById('reset-beaches').onclick = () => {
        currentFilter = 'all'; currentSearch = ''; document.getElementById('search-input').value = '';
        document.querySelectorAll('.legend-item').forEach(b => {const active = b.dataset.filter === 'all'; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));});
        updateUI();
    };
    legend.querySelector('[data-filter="all"]').setAttribute('aria-pressed', 'true');
    document.addEventListener('keydown', e => {
        // Memory dialogs own Escape while they are open.
        if ([...document.querySelectorAll('.photo-gallery-modal,.memory-modal')].some(m => m.style.display === 'block')) return;
        const open = !panel.inert ? panel : (!detail.inert ? detail : null);
        if (!open) return;
        if (e.key === 'Escape') { e.preventDefault(); open === panel ? window.closeBeachExplorer() : closeStory(); }
        if (e.key === 'Tab') {
            const nodes = [...open.querySelectorAll('button,a[href],input,textarea,[tabindex="0"]')].filter(el => el.getClientRects().length);
            const first = nodes[0], last = nodes.at(-1);
            if (!first) return;
            if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
            else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
        }
    });
    for (const close of document.querySelectorAll('.close-gallery,.close-memory-modal')) close.addEventListener('keydown', e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); close.click();}});
})();
