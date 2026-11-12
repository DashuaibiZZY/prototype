/**
 * 用户数据 · 类型配置 / 做市商账号（团队标签决定内/外部）
 * 冻结配置 UI 已移除，归档见 document/备份/用户中心冻结UI归档/
 */
(function (global) {
    let getUserByUid = null;
    let listAllUsers = null;
    let onUserUpdated = null;
    let typeEditUid = null;

    function store() {
        return global.AdminMmTeamStore;
    }

    function isMmUserType(t) {
        return t === 'mm_internal' || t === 'mm_external';
    }

    function normalizeUserType(t) {
        if (t === 'mm') return 'mm_external';
        return t || 'retail';
    }

    function syncUsersIntoTags() {
        if (!store() || !listAllUsers) return;
        const names = [];
        listAllUsers().forEach(function (u) {
            if (u && u.teamTag) names.push(u.teamTag);
        });
        store().migrateLegacyTagNames(names);
    }

    function renderTeamTagSelect(selected, selectId) {
        selectId = selectId || 'typeTeamTagSelect';
        const sel = document.getElementById(selectId);
        if (!sel || !store()) return;
        syncUsersIntoTags();
        const tags = store().getAll();
        sel.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '请选择团队标签';
        sel.appendChild(placeholder);
        tags.forEach(function (tag) {
            const o = document.createElement('option');
            o.value = tag.name;
            o.textContent = store().formatSelectLabel(tag);
            sel.appendChild(o);
        });
        sel.value = selected && tags.some(function (t) { return t.name === selected; }) ? selected : '';
    }

    function syncTypeModalTeamField() {
        const pick = document.querySelector('input[name="userTypePick"]:checked');
        const wrap = document.getElementById('typeTeamTagWrap');
        if (!wrap) return;
        wrap.classList.toggle('hidden', !pick || pick.value !== 'mm');
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
        const isMm = u && isMmUserType(normalizeUserType(u.userType));
        document.querySelectorAll('input[name="userTypePick"]').forEach(function (r) {
            r.checked = isMm ? r.value === 'mm' : r.value === 'retail';
            r.onchange = syncTypeModalTeamField;
        });
        renderTeamTagSelect(isMm ? u.teamTag : '');
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
            if (pick.value === 'retail') {
                u.userType = 'retail';
                delete u.teamTag;
            } else {
                const tag = (document.getElementById('typeTeamTagSelect').value || '').trim();
                if (!tag) {
                    showToast('请选择团队标签');
                    return;
                }
                u.teamTag = tag;
                u.userType = store() ? store().userTypeFromTag(tag) : 'mm_external';
            }
        }
        const savedUid = typeEditUid;
        closeTypeModal();
        if (onUserUpdated && savedUid) onUserUpdated(savedUid);
        showToast('用户类型已更新');
    }

    function openTeamTagCreateModal() {
        document.getElementById('teamTagCreateInput').value = '';
        document.querySelectorAll('input[name="teamTagKindPick"]').forEach(function (r, i) {
            r.checked = i === 0;
        });
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
        const kindPick = document.querySelector('input[name="teamTagKindPick"]:checked');
        const kind = kindPick ? kindPick.value : 'mm_external';
        if (!tag) {
            err.textContent = '请输入标签名称';
            err.classList.remove('hidden');
            return;
        }
        if (store() && store().getByName(tag)) {
            err.textContent = '该团队标签已存在';
            err.classList.remove('hidden');
            return;
        }
        if (store()) store().upsert(tag, kind);
        renderTeamTagSelect(tag);
        renderTeamTagSelect(tag, 'mmCreateTeamTagSelect');
        closeTeamTagCreateModal();
        showToast('团队标签已新增');
    }

    function generateMmUid() {
        let s = '';
        for (let i = 0; i < 16; i++) s += Math.floor(Math.random() * 10);
        return s;
    }

    function openMmCreateModal() {
        const modal = document.getElementById('mmAccountCreateModal');
        if (!modal) {
            showToast('无法打开弹窗，请刷新页面后重试');
            return;
        }
        renderTeamTagSelect('', 'mmCreateTeamTagSelect');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeMmCreateModal() {
        document.getElementById('mmAccountCreateModal').classList.add('hidden');
        document.getElementById('mmAccountCreateModal').classList.remove('flex');
    }

    function confirmMmCreate() {
        const tag = (document.getElementById('mmCreateTeamTagSelect').value || '').trim();
        if (!tag) {
            showToast('请选择团队标签');
            return;
        }
        const uid = generateMmUid();
        const userType = store() ? store().userTypeFromTag(tag) : 'mm_external';
        const newUser = {
            uid: uid,
            email: '',
            wallet: '',
            userType: userType,
            teamTag: tag,
            teamBindAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            lastLogin: '—',
            totalAsset: '0.00',
            vol14d: '0',
            vip: 'VIP 0'
        };
        if (listAllUsers) {
            const list = listAllUsers();
            if (list && list.unshift) list.unshift(newUser);
        }
        closeMmCreateModal();
        document.getElementById('mmCreatedUidText').textContent = uid;
        document.getElementById('mmAccountCreatedModal').classList.remove('hidden');
        document.getElementById('mmAccountCreatedModal').classList.add('flex');
        if (onUserUpdated) onUserUpdated(uid);
    }

    function closeMmCreatedModal() {
        document.getElementById('mmAccountCreatedModal').classList.add('hidden');
        document.getElementById('mmAccountCreatedModal').classList.remove('flex');
    }

    function bindMmCreateUi() {
        const btn = document.getElementById('btnOpenMmCreateModal');
        if (!btn || btn.dataset.mmCreateBound === '1') return;
        btn.dataset.mmCreateBound = '1';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openMmCreateModal();
        });
    }

    function init(opts) {
        getUserByUid = opts.getUserByUid;
        listAllUsers = opts.listAllUsers;
        onUserUpdated = opts.onUserUpdated || function () {};
        syncUsersIntoTags();
        bindMmCreateUi();
    }

    global.AdminUserCenterActions = {
        init: init,
        openMmCreateModal: openMmCreateModal,
        closeMmCreateModal: closeMmCreateModal,
        confirmMmCreate: confirmMmCreate,
        closeMmCreatedModal: closeMmCreatedModal
    };

    global.openTypeModal = openTypeModal;
    global.closeTypeModal = closeTypeModal;
    global.saveUserType = saveUserType;
    global.openTeamTagCreateModal = openTeamTagCreateModal;
    global.closeTeamTagCreateModal = closeTeamTagCreateModal;
    global.saveNewTeamTag = saveNewTeamTag;
    global.showToast = showToast;
    global.openMmCreateModal = openMmCreateModal;
    global.closeMmCreateModal = closeMmCreateModal;
    global.confirmMmCreate = confirmMmCreate;
    global.closeMmCreatedModal = closeMmCreatedModal;
})(window);
