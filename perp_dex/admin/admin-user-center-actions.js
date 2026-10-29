/**
 * 用户数据 · 类型配置 / 冻结配置弹窗（列表页与详情页共用）
 */
(function (global) {
    const UC_TEAM_TAG_STORAGE = 'forx_admin_uc_team_tags_v1';
    const UC_TEAM_TAG_DEFAULTS = ['Alpha MM', 'Desk-Quant', 'Beta Liquidity', 'External Desk A'];

    const UC_FREEZE_CONFIGS = [
        { key: 'withdrawFreeze', title: '提现冻结', desc: '禁止发起链上提现申请' },
        { key: 'transferFreeze', title: '资金划转冻结', desc: '禁止交易账户、资金账户之间的资金划转' },
        { key: 'orderFreeze', title: '下单冻结', desc: '禁止下单，开平仓都不允许' },
        { key: 'closeOnly', title: '仅平仓模式', desc: '仅允许平掉已有仓位，禁止任何开仓行为' },
        { key: 'apiFreeze', title: 'API 交易冻结', desc: '禁止使用 API Key 进行下单，Web/App 不受影响' },
        { key: 'loginFreeze', title: '登录冻结', desc: '禁止用户登录账号' }
    ];

    let getUserByUid = null;
    let listAllUsers = null;
    let onUserUpdated = null;
    let typeEditUid = null;
    let freezeEditUid = null;
    let draftFlags = null;

    function isMmUserType(t) {
        return t === 'mm_internal' || t === 'mm_external';
    }

    function normalizeUserType(t) {
        if (t === 'mm') return 'mm_external';
        return t || 'retail';
    }

    function loadStoredTeamTags() {
        try {
            const raw = localStorage.getItem(UC_TEAM_TAG_STORAGE);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return [];
    }

    function rememberTeamTag(tag) {
        const t = String(tag || '').trim();
        if (!t) return;
        const set = new Set(loadStoredTeamTags());
        UC_TEAM_TAG_DEFAULTS.forEach(function (x) { set.add(x); });
        set.add(t);
        localStorage.setItem(UC_TEAM_TAG_STORAGE, JSON.stringify(Array.from(set)));
    }

    function getTeamTagCatalog() {
        const set = new Set(UC_TEAM_TAG_DEFAULTS);
        loadStoredTeamTags().forEach(function (t) { if (t) set.add(t); });
        (listAllUsers ? listAllUsers() : []).forEach(function (u) {
            if (u && u.teamTag) set.add(u.teamTag);
        });
        return Array.from(set).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    }

    function renderTeamTagSelect(selected) {
        const sel = document.getElementById('typeTeamTagSelect');
        if (!sel) return;
        const catalog = getTeamTagCatalog();
        const options = catalog.slice();
        if (selected && options.indexOf(selected) < 0) options.push(selected);
        sel.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '请选择团队标签';
        sel.appendChild(placeholder);
        options.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).forEach(function (t) {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t;
            sel.appendChild(o);
        });
        sel.value = selected && options.indexOf(selected) >= 0 ? selected : '';
    }

    function syncTypeModalTeamField() {
        const pick = document.querySelector('input[name="userTypePick"]:checked');
        const wrap = document.getElementById('typeTeamTagWrap');
        if (!wrap) return;
        const show = pick && isMmUserType(pick.value);
        wrap.classList.toggle('hidden', !show);
    }

    function statusFromFlags(flags) {
        if (!flags) return 'normal';
        if (flags.loginFreeze && Object.keys(flags).filter(function (k) { return flags[k]; }).length >= 3) return 'frozen';
        const any = UC_FREEZE_CONFIGS.some(function (c) { return flags[c.key]; });
        return any ? 'partial' : 'normal';
    }

    function showToast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(function () { el.classList.add('hidden'); }, 2500);
    }

    function openTypeModal(uid) {
        if (!getUserByUid) return;
        typeEditUid = uid;
        const u = getUserByUid(uid);
        document.getElementById('typeModalMeta').textContent = 'UID ' + uid;
        const pickedType = normalizeUserType(u && u.userType);
        document.querySelectorAll('input[name="userTypePick"]').forEach(function (r) {
            r.checked = r.value === pickedType;
            r.onchange = syncTypeModalTeamField;
        });
        renderTeamTagSelect(u && u.teamTag);
        syncTypeModalTeamField();
        document.getElementById('typeModal').classList.remove('hidden');
        document.getElementById('typeModal').classList.add('flex');
    }

    function closeTypeModal() {
        document.getElementById('typeModal').classList.add('hidden');
        document.getElementById('typeModal').classList.remove('flex');
        typeEditUid = null;
    }

    function saveUserType() {
        const pick = document.querySelector('input[name="userTypePick"]:checked');
        if (!pick) {
            showToast('请选择用户类型');
            return;
        }
        const u = getUserByUid && typeEditUid ? getUserByUid(typeEditUid) : null;
        if (u) {
            u.userType = pick.value;
            if (isMmUserType(pick.value)) {
                const tag = (document.getElementById('typeTeamTagSelect').value || '').trim();
                if (!tag) {
                    showToast('请选择团队标签');
                    return;
                }
                u.teamTag = tag;
            } else {
                delete u.teamTag;
            }
        }
        const savedUid = typeEditUid;
        closeTypeModal();
        if (onUserUpdated && savedUid) onUserUpdated(savedUid);
        showToast('用户类型已更新');
    }

    function openTeamTagCreateModal() {
        document.getElementById('teamTagCreateInput').value = '';
        const err = document.getElementById('teamTagCreateError');
        err.classList.add('hidden');
        err.textContent = '';
        document.getElementById('teamTagCreateModal').classList.remove('hidden');
        document.getElementById('teamTagCreateModal').classList.add('flex');
        document.getElementById('teamTagCreateInput').focus();
    }

    function closeTeamTagCreateModal() {
        document.getElementById('teamTagCreateModal').classList.add('hidden');
        document.getElementById('teamTagCreateModal').classList.remove('flex');
    }

    function saveNewTeamTag() {
        const input = document.getElementById('teamTagCreateInput');
        const err = document.getElementById('teamTagCreateError');
        const tag = (input.value || '').trim();
        if (!tag) {
            err.textContent = '请输入标签名称';
            err.classList.remove('hidden');
            return;
        }
        if (getTeamTagCatalog().some(function (t) { return t === tag; })) {
            err.textContent = '该团队标签已存在';
            err.classList.remove('hidden');
            return;
        }
        rememberTeamTag(tag);
        renderTeamTagSelect(tag);
        closeTeamTagCreateModal();
        showToast('团队标签已新增');
    }

    function renderFreezeList(flags) {
        document.getElementById('freezeConfigList').innerHTML = UC_FREEZE_CONFIGS.map(function (c) {
            return (
                '<div class="config-row"><div><div class="config-row-title">' + c.title + '</div>' +
                '<div class="config-row-desc">' + c.desc + '</div></div>' +
                '<label class="switch"><input type="checkbox" ' + (flags[c.key] ? 'checked' : '') +
                ' onchange="onFreezeToggle(\'' + c.key + '\', this.checked)"><span class="slider"></span></label></div>'
            );
        }).join('');
    }

    function openFreezeDrawer(uid) {
        if (!getUserByUid) return;
        const u = getUserByUid(uid);
        if (!u) return;
        freezeEditUid = uid;
        if (!u.flags) u.flags = {};
        draftFlags = Object.assign({}, u.flags);
        document.getElementById('freezeDrawerMeta').textContent = 'UID ' + uid;
        document.getElementById('freezeRemark').value = '';
        renderFreezeList(draftFlags);
        document.getElementById('freezeOverlay').classList.remove('hidden');
        document.getElementById('freezeDrawer').classList.remove('hidden');
    }

    function closeFreezeDrawer() {
        document.getElementById('freezeOverlay').classList.add('hidden');
        document.getElementById('freezeDrawer').classList.add('hidden');
        freezeEditUid = null;
        draftFlags = null;
    }

    function onFreezeToggle(key, checked) {
        if (!draftFlags) return;
        draftFlags[key] = checked;
    }

    function saveFreezeConfig() {
        const remark = document.getElementById('freezeRemark').value.trim();
        if (!remark) {
            showToast('请填写操作备注');
            return;
        }
        const u = getUserByUid && freezeEditUid ? getUserByUid(freezeEditUid) : null;
        if (u && draftFlags) {
            u.flags = Object.assign({}, draftFlags);
            u.status = statusFromFlags(u.flags);
        }
        const savedUid = freezeEditUid;
        closeFreezeDrawer();
        if (onUserUpdated && savedUid) onUserUpdated(savedUid);
        showToast('冻结配置已保存');
    }

    function init(opts) {
        getUserByUid = opts.getUserByUid;
        listAllUsers = opts.listAllUsers;
        onUserUpdated = opts.onUserUpdated || function () {};
    }

    global.AdminUserCenterActions = {
        init: init,
        statusFromFlags: statusFromFlags,
        UC_FREEZE_CONFIGS: UC_FREEZE_CONFIGS
    };

    global.openTypeModal = openTypeModal;
    global.closeTypeModal = closeTypeModal;
    global.saveUserType = saveUserType;
    global.openTeamTagCreateModal = openTeamTagCreateModal;
    global.closeTeamTagCreateModal = closeTeamTagCreateModal;
    global.saveNewTeamTag = saveNewTeamTag;
    global.openFreezeDrawer = openFreezeDrawer;
    global.closeFreezeDrawer = closeFreezeDrawer;
    global.onFreezeToggle = onFreezeToggle;
    global.saveFreezeConfig = saveFreezeConfig;
    global.showToast = showToast;
})(window);
