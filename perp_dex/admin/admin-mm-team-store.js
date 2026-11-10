/**
 * 做市商团队标签（名称 + 内/外部），用户中心与数据看板共用
 */
(function (global) {
    const STORAGE_KEY = 'forx_admin_uc_team_tags_v2';

    const DEFAULT_TAGS = [
        { name: 'Alpha MM', kind: 'mm_external' },
        { name: 'Desk-Quant', kind: 'mm_internal' },
        { name: 'Beta Liquidity', kind: 'mm_external' },
        { name: 'External Desk A', kind: 'mm_external' }
    ];

    function kindLabel(kind) {
        return kind === 'mm_internal' ? '内部做市商' : '外部做市商';
    }

    function loadTags() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length) return parsed;
            }
        } catch (e) { /* ignore */ }
        return DEFAULT_TAGS.map(function (t) { return Object.assign({}, t); });
    }

    function saveTags(tags) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    }

    function getAll() {
        return loadTags().sort(function (a, b) { return a.name.localeCompare(b.name, 'zh-CN'); });
    }

    function getByName(name) {
        return getAll().filter(function (t) { return t.name === name; })[0] || null;
    }

    function upsert(name, kind) {
        const n = String(name || '').trim();
        if (!n) return false;
        const tags = loadTags();
        const idx = tags.findIndex(function (t) { return t.name === n; });
        const row = { name: n, kind: kind === 'mm_internal' ? 'mm_internal' : 'mm_external' };
        if (idx >= 0) tags[idx] = row;
        else tags.push(row);
        saveTags(tags);
        return true;
    }

    function formatSelectLabel(tag) {
        return tag.name + '（' + kindLabel(tag.kind) + '）';
    }

    function migrateLegacyTagNames(extraNames) {
        const tags = loadTags();
        const set = new Set(tags.map(function (t) { return t.name; }));
        let changed = false;
        (extraNames || []).forEach(function (n) {
            if (!n || set.has(n)) return;
            tags.push({ name: n, kind: 'mm_external' });
            set.add(n);
            changed = true;
        });
        if (changed) saveTags(tags);
    }

    global.AdminMmTeamStore = {
        getAll: getAll,
        getByName: getByName,
        upsert: upsert,
        kindLabel: kindLabel,
        formatSelectLabel: formatSelectLabel,
        migrateLegacyTagNames: migrateLegacyTagNames,
        userTypeFromTag: function (tagName) {
            const t = getByName(tagName);
            return t ? t.kind : 'mm_external';
        }
    };
})(window);
