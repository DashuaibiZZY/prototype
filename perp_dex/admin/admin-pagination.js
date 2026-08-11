/**
 * 后台统一列表分页：< 1 2 3 ... N >
 */
(function () {
    const PAGE_SIZE = 10;
    const handlers = {};

    function totalPages(total, pageSize) {
        pageSize = pageSize || PAGE_SIZE;
        return Math.max(1, Math.ceil(total / pageSize));
    }

    function clampPage(page, total, pageSize) {
        return Math.max(1, Math.min(page, totalPages(total, pageSize)));
    }

    function slice(items, page, pageSize) {
        pageSize = pageSize || PAGE_SIZE;
        const total = items.length;
        const p = clampPage(page || 1, total, pageSize);
        const start = (p - 1) * pageSize;
        return { items: items.slice(start, start + pageSize), page: p, total: total, pageSize: pageSize };
    }

    function pageNumbers(current, pages) {
        if (pages <= 7) {
            return Array.from({ length: pages }, function (_, i) { return i + 1; });
        }
        const set = new Set([1, pages, current]);
        for (let d = -1; d <= 1; d++) {
            const n = current + d;
            if (n >= 1 && n <= pages) set.add(n);
        }
        if (current <= 4) { set.add(2); set.add(3); }
        if (current >= pages - 3) { set.add(pages - 1); set.add(pages - 2); }
        const sorted = Array.from(set).sort(function (a, b) { return a - b; });
        const result = [];
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
            result.push(sorted[i]);
        }
        return result;
    }

    function buildHtml(total, page, pageSize, handlerId) {
        if (!total) return '';
        pageSize = pageSize || PAGE_SIZE;
        const pages = totalPages(total, pageSize);
        page = clampPage(page, total, pageSize);
        let html = '<div class="admin-pagination flex items-center justify-center gap-1 py-3 text-[11px]">';
        html += '<button type="button" class="px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-600 hover:bg-slate-50' +
            (page <= 1 ? ' opacity-40 pointer-events-none' : '') +
            '" onclick="adminPaginationGo(\'' + handlerId + '\',' + (page - 1) + ')">&lt;</button>';
        pageNumbers(page, pages).forEach(function (item) {
            if (item === '...') {
                html += '<span class="px-2 text-slate-400 select-none">...</span>';
            } else {
                const active = item === page;
                html += '<button type="button" class="min-w-[28px] px-2 py-1 rounded border font-bold ' +
                    (active ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50') +
                    '" onclick="adminPaginationGo(\'' + handlerId + '\',' + item + ')">' + item + '</button>';
            }
        });
        html += '<button type="button" class="px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-600 hover:bg-slate-50' +
            (page >= pages ? ' opacity-40 pointer-events-none' : '') +
            '" onclick="adminPaginationGo(\'' + handlerId + '\',' + (page + 1) + ')">&gt;</button>';
        html += '</div>';
        return html;
    }

    window.adminPaginationGo = function (handlerId, page) {
        if (handlers[handlerId]) handlers[handlerId](page);
    };

    window.AdminPagination = {
        PAGE_SIZE: PAGE_SIZE,
        slice: slice,
        totalPages: totalPages,
        clampPage: clampPage,
        register: function (id, fn) { handlers[id] = fn; },
        unregister: function (id) { delete handlers[id]; },
        html: buildHtml,
        mount: function (containerId, total, page, handlerId, pageSize) {
            const el = document.getElementById(containerId);
            if (!el) return;
            el.innerHTML = buildHtml(total, page, pageSize, handlerId);
        }
    };
})();
