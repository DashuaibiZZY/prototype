(function (global) {
    const REFERRAL_PAGE = '邀请返佣.html';
    const PARTNER_PAGE = '代理中心.html';
    const STORAGE_KEY = 'forx_app_is_partner';

    function isPartnerUser(force) {
        if (typeof force === 'boolean') return force;
        try {
            const params = new URLSearchParams(global.location.search);
            if (params.has('partner')) return params.get('partner') === '1';
            return global.localStorage.getItem(STORAGE_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function setPartnerUser(isPartner) {
        try {
            global.localStorage.setItem(STORAGE_KEY, isPartner ? '1' : '0');
        } catch (e) { /* noop */ }
    }

    function getInviteEntryHref(isPartner) {
        const partner = typeof isPartner === 'boolean' ? isPartner : isPartnerUser();
        return partner ? PARTNER_PAGE : REFERRAL_PAGE;
    }

    function applyInviteEntryLinks(root, isPartner) {
        const scope = root || global.document;
        const href = getInviteEntryHref(isPartner);
        scope.querySelectorAll('[data-invite-entry]').forEach(function (el) {
            el.setAttribute('href', href);
        });
    }

    function applyPartnerInviteCard(root, isPartner) {
        const scope = root || global.document;
        const partner = typeof isPartner === 'boolean' ? isPartner : isPartnerUser();
        scope.querySelectorAll('[data-invite-benefit-card]').forEach(function (card) {
            card.setAttribute('href', partner ? PARTNER_PAGE : REFERRAL_PAGE);
            card.querySelectorAll('[data-invite-progress]').forEach(function (el) {
                if (partner) {
                    el.classList.add('hidden');
                } else if (!card.classList.contains('is-guest')) {
                    el.classList.remove('hidden');
                }
            });
            const subtitle = card.querySelector('[data-partner-subtitle]');
            if (subtitle) subtitle.classList.toggle('hidden', !partner);
        });
    }

    global.AppRoleRouting = {
        REFERRAL_PAGE: REFERRAL_PAGE,
        PARTNER_PAGE: PARTNER_PAGE,
        isPartnerUser: isPartnerUser,
        setPartnerUser: setPartnerUser,
        getInviteEntryHref: getInviteEntryHref,
        applyInviteEntryLinks: applyInviteEntryLinks,
        applyPartnerInviteCard: applyPartnerInviteCard
    };
})(window);
