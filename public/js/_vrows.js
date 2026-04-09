
/* VITAL ROWS-PER-PAGE */
function toggleVitalRowsMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('vitalRowsMenu');
    if (!menu) return;
    document.getElementById('vitalExportMenu') && document.getElementById('vitalExportMenu').classList.remove('open');
    if (menu.classList.toggle('open')) {
        var cur = window.vitalPerPageVal || 12;
        menu.querySelectorAll('button').forEach(function(btn) {
            var v = parseInt(btn.textContent, 10);
            btn.classList.toggle('active', v === cur);
        });
    }
}

function setVitalRowsPer(n) {
    var menu = document.getElementById('vitalRowsMenu');
    if (menu) menu.classList.remove('open');
    var sel = document.getElementById('vitalPerPage');
    if (sel) { sel.value = n; sel.dispatchEvent(new Event('change')); }
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('vitalRowsMenu');
    var btn  = document.getElementById('btnVitalRowsPer');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});
