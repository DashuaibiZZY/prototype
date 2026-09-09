/**
 * 邀请返佣管理 — 数据预览 / 用户列表 / 回收待结算
 */
(function () {
    const INVITE_REBATE_USERS = [
        {
            uid: '100234',
            wallet: '0xA1b2...9F3e',
            email: 'alice@forx.io',
            level: 3,
            rebateRatio: 25,
            inviteCount: 18,
            activeFriends: 11,
            subordinateVol: 12800000,
            subordinateFee: 18420,
            totalRebated: 4286.50,
            pendingRebate: 312.80,
            settlementStatus: 'normal'
        },
        {
            uid: '100891',
            wallet: '0xB3c4...2D8a',
            email: '',
            level: 2,
            rebateRatio: 20,
            inviteCount: 9,
            activeFriends: 6,
            subordinateVol: 6200000,
            subordinateFee: 8920,
            totalRebated: 1684.00,
            pendingRebate: 156.40,
            settlementStatus: 'normal'
        },
        {
            uid: '100567',
            wallet: '0xC5d6...7E1b',
            email: 'carol@mail.com',
            level: 1,
            rebateRatio: 15,
            inviteCount: 5,
            activeFriends: 3,
            subordinateVol: 3100000,
            subordinateFee: 4210,
            totalRebated: 612.35,
            pendingRebate: 48.20,
            settlementStatus: 'normal'
        },
        {
            uid: '100802',
            wallet: '0xD7e8...4C2f',
            email: 'david@forx.io',
            level: 0,
            rebateRatio: 10,
            inviteCount: 2,
            activeFriends: 0,
            subordinateVol: 420000,
            subordinateFee: 580,
            totalRebated: 58.00,
            pendingRebate: 12.60,
            settlementStatus: 'frozen'
        },
        {
            uid: '100915',
            wallet: '0xE9f0...8A5d',
            email: '',
            level: 2,
            rebateRatio: 20,
            inviteCount: 7,
            activeFriends: 5,
            subordinateVol: 5400000,
            subordinateFee: 7680,
            totalRebated: 1420.80,
            pendingRebate: 0,
            settlementStatus: 'normal'
        },
        {
            uid: '100678',
            wallet: '0xF1a2...3B6c',
            email: 'eva@forx.io',
            level: 1,
            rebateRatio: 15,
            inviteCount: 4,
            activeFriends: 2,
            subordinateVol: 2680000,
            subordinateFee: 3520,
            totalRebated: 498.20,
            pendingRebate: 36.75,
            settlementStatus: 'frozen'
        },
        {
            uid: '100443',
            wallet: '0x12Ab...Cd45',
            email: 'frank@forx.io',
            level: 0,
            rebateRatio: 10,
            inviteCount: 1,
            activeFriends: 0,
            subordinateVol: 86000,
            subordinateFee: 120,
            totalRebated: 12.00,
            pendingRebate: 4.80,
            settlementStatus: 'normal'
        },
        {
            uid: '100329',
            wallet: '0x34Cd...Ef67',
            email: '',
            level: 3,
            rebateRatio: 25,
            inviteCount: 22,
            activeFriends: 12,
            subordinateVol: 15200000,
            subordinateFee: 22100,
            totalRebated: 5120.00,
            pendingRebate: 428.50,
            settlementStatus: 'normal'
        },
        {
            uid: '100776',
            wallet: '0x56Ef...Gh89',
            email: 'grace@forx.io',
            level: 2,
            rebateRatio: 20,
            inviteCount: 8,
            activeFriends: 4,
            subordinateVol: 4980000,
            subordinateFee: 7120,
            totalRebated: 1288.40,
            pendingRebate: 92.30,
            settlementStatus: 'normal'
        },
        {
            uid: '100512',
            wallet: '0x78Gh...Ij01',
            email: 'henry@forx.io',
            level: 1,
            rebateRatio: 15,
            inviteCount: 3,
            activeFriends: 3,
            subordinateVol: 2850000,
            subordinateFee: 3680,
            totalRebated: 520.60,
            pendingRebate: 0,
            settlementStatus: 'normal'
        },
        {
            uid: '100998',
            wallet: '0x90Ij...Kl23',
            email: '',
            level: 0,
            rebateRatio: 10,
            inviteCount: 0,
            activeFriends: 0,
            subordinateVol: 0,
            subordinateFee: 0,
            totalRebated: 0,
            pendingRebate: 0,
            settlementStatus: 'normal'
        },
        {
            uid: '100654',
            wallet: '0xAb12...Mn34',
            email: 'iris@forx.io',
            level: 2,
            rebateRatio: 20,
            inviteCount: 6,
            activeFriends: 4,
            subordinateVol: 4720000,
            subordinateFee: 6540,
            totalRebated: 1186.00,
            pendingRebate: 74.15,
            settlementStatus: 'normal'
        }
    ];

    let listPage = 1;
    let listFilters = { q: '', level: '', status: '' };
    let reclaimState = { uid: null };

    function fmtNum(n) {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toLocaleString('en-US');
    }

    function fmtMoney(n) {
        if (n == null || isNaN(n)) return '—';
        return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtCompactMoney(n) {
        if (n == null || isNaN(n)) return '—';
        const num = Number(n);
        if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
        return fmtMoney(num);
    }

    function chip(v, type) {
        if (!v || v === '—') return '<span class="text-slate-400">—</span>';
        if (window.AdminCopyChip) return AdminCopyChip.render(v, { type: type || (String(v).indexOf('0x') >= 0 ? 'wallet' : 'uid') });
        return v;
    }

    function levelLabel(level) {
        return 'Lv ' + level;
    }

    function formatWalletEmail(user) {
        if (user.email) return chip(user.email, 'email');
        if (user.wallet) return chip(user.wallet, 'wallet');
        return '<span class="text-slate-400">—</span>';
    }

    function settlementStatusBadge(status) {
        if (status === 'frozen') {
            return '<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">冻结</span>';
        }
        return '<span class="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[10px]">正常</span>';
    }

    function getUser(uid) {
        return INVITE_REBATE_USERS.find(function (u) { return u.uid === uid; });
    }

    function matchesFilters(user) {
        const q = (listFilters.q || '').trim().toLowerCase();
        if (q) {
            const hay = [user.uid, user.wallet, user.email].join(' ').toLowerCase();
            if (hay.indexOf(q) < 0) return false;
        }
        if (listFilters.level !== '' && String(user.level) !== String(listFilters.level)) return false;
        if (listFilters.status && user.settlementStatus !== listFilters.status) return false;
        return true;
    }

    function getFilteredUsers() {
        return INVITE_REBATE_USERS.filter(matchesFilters);
    }

    function computeOverviewMetrics(users) {
        const scoped = users || INVITE_REBATE_USERS;
        return {
            userCount: scoped.length,
            totalRebated: scoped.reduce(function (s, u) { return s + (u.totalRebated || 0); }, 0),
            pendingRebate: scoped.reduce(function (s, u) { return s + (u.pendingRebate || 0); }, 0),
            frozenCount: scoped.filter(function (u) { return u.settlementStatus === 'frozen'; }).length
        };
    }

    function renderOverview() {
        const m = computeOverviewMetrics(getFilteredUsers());
        const setText = function (id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        setText('invite-overview-users', fmtNum(m.userCount));
        setText('invite-overview-rebated', fmtMoney(m.totalRebated));
        setText('invite-overview-pending', fmtMoney(m.pendingRebate));
        setText('invite-overview-frozen', fmtNum(m.frozenCount));
    }

    function renderUserList() {
        const filtered = getFilteredUsers();
        const pageSize = 10;
        const total = filtered.length;
        const start = (listPage - 1) * pageSize;
        const pageItems = filtered.slice(start, start + pageSize);
        const tbody = document.getElementById('invite-rebate-list-body');
        if (!tbody) return;

        if (!pageItems.length) {
            tbody.innerHTML = '<tr><td colspan="12" class="px-4 py-12 text-center text-slate-400 font-bold">暂无符合条件的用户</td></tr>';
        } else {
            tbody.innerHTML = pageItems.map(function (u) {
                const canReclaim = (u.pendingRebate || 0) > 0;
                const actionHtml = canReclaim
                    ? '<button type="button" onclick="InviteRebateAdmin.openReclaimModal(\'' + u.uid + '\')" class="text-red-600 font-bold hover:underline">回收待结算</button>'
                    : '<span class="text-slate-300">—</span>';
                return '<tr class="hover:bg-slate-50 border-b">' +
                    '<td class="px-4 py-3 whitespace-nowrap">' + chip(u.uid, 'uid') + '</td>' +
                    '<td class="px-3 py-3 whitespace-nowrap">' + formatWalletEmail(u) + '</td>' +
                    '<td class="px-3 py-3 font-bold text-slate-700">' + levelLabel(u.level) + '</td>' +
                    '<td class="px-3 py-3 font-bold text-blue-600">' + u.rebateRatio + '%</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(u.inviteCount) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(u.activeFriends) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtCompactMoney(u.subordinateVol) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(u.subordinateFee) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold text-green-700">' + fmtMoney(u.totalRebated) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold text-amber-700">' + fmtMoney(u.pendingRebate) + '</td>' +
                    '<td class="px-3 py-3 whitespace-nowrap">' + settlementStatusBadge(u.settlementStatus) + '</td>' +
                    '<td class="px-4 py-3 whitespace-nowrap text-right">' + actionHtml + '</td></tr>';
            }).join('');
        }

        if (window.AdminPagination) {
            AdminPagination.mount('invite-rebate-pagination', total, listPage, 'invite-rebate-list', 10);
        }
        renderOverview();
    }

    function applyFilters() {
        listPage = 1;
        listFilters.q = (document.getElementById('invite-filter-q') || {}).value || '';
        listFilters.level = (document.getElementById('invite-filter-level') || {}).value || '';
        listFilters.status = (document.getElementById('invite-filter-status') || {}).value || '';
        renderUserList();
    }

    function resetFilters() {
        ['invite-filter-q', 'invite-filter-level', 'invite-filter-status'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        listFilters = { q: '', level: '', status: '' };
        listPage = 1;
        renderUserList();
    }

    function openReclaimModal(uid) {
        const user = getUser(uid);
        if (!user || !(user.pendingRebate > 0)) return;
        reclaimState.uid = uid;
        const setText = function (id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        setText('reclaim-modal-uid', user.uid);
        setText('reclaim-modal-pending-total', fmtMoney(user.pendingRebate));
        const amountEl = document.getElementById('reclaim-modal-amount');
        const reasonEl = document.getElementById('reclaim-modal-reason');
        if (amountEl) {
            amountEl.value = '';
            amountEl.max = user.pendingRebate;
            amountEl.placeholder = '最多 ' + fmtMoney(user.pendingRebate);
        }
        if (reasonEl) reasonEl.value = '';
        const modal = document.getElementById('reclaim-pending-modal');
        if (modal) modal.classList.remove('hidden');
    }

    function closeReclaimModal() {
        reclaimState.uid = null;
        const modal = document.getElementById('reclaim-pending-modal');
        if (modal) modal.classList.add('hidden');
    }

    function submitReclaim() {
        const user = getUser(reclaimState.uid);
        if (!user) return;
        const amountEl = document.getElementById('reclaim-modal-amount');
        const reasonEl = document.getElementById('reclaim-modal-reason');
        const amount = parseFloat((amountEl && amountEl.value) || '');
        const reason = ((reasonEl && reasonEl.value) || '').trim();
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('请填写有效的回收待结算金额');
            return;
        }
        if (amount > user.pendingRebate + 0.001) {
            alert('回收金额不可超过累计待返佣金额');
            return;
        }
        if (!reason) {
            alert('请填写回收原因（将写入站内信）');
            return;
        }
        user.pendingRebate = Math.max(0, +(user.pendingRebate - amount).toFixed(2));
        closeReclaimModal();
        renderUserList();
        alert('回收指令已提交，将于次日 0:00（UTC+8）执行；执行后将向用户发送站内信通知。');
    }

    window.InviteRebateAdmin = {
        renderOverview: renderOverview,
        renderUserList: renderUserList,
        applyFilters: applyFilters,
        resetFilters: resetFilters,
        openReclaimModal: openReclaimModal,
        closeReclaimModal: closeReclaimModal,
        submitReclaim: submitReclaim,
        getUser: getUser
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (window.AdminPagination) {
            AdminPagination.register('invite-rebate-list', function (p) {
                listPage = p;
                renderUserList();
            });
        }
        renderUserList();
    });
})();
