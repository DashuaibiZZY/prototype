"""Generate the ForX Fund Flow Architecture SVGs in Chinese and English.

Usage:
    python3 render_forx_fund_flow.py                 # renders both zh & en
    python3 render_forx_fund_flow.py --language en   # renders English only

Outputs:
    perp_dex/流程图/ForX资金架构图.svg
    perp_dex/流程图/ForX-Fund-Flow-Architecture-EN.svg
"""

from argparse import ArgumentParser
from html import escape
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_NAMES = {
    "zh": "ForX资金架构图.svg",
    "en": "ForX-Fund-Flow-Architecture-EN.svg",
}

FONT_STACK = (
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", '
    '"WenQuanYi Micro Hei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
)

INK = "#182B41"
MUTED = "#465D72"
BLUE = "#235DB3"
BLUE_BG = "#F2F7FF"
BLUE_PILL_BG = "#DBEAFE"
BLUE_PILL_FG = "#1D4ED8"
PURPLE = "#63478A"
PURPLE_BORDER = "#BBA9CE"
PURPLE_STRONG = "#7C5DA3"
PURPLE_BG = "#F8F4FC"
PURPLE_TILE_BG = "#F6F1FA"
PURPLE_SOFT_BG = "#FAF7FD"
TEAL = "#1B7471"
TEAL_BORDER = "#88B8B1"
TEAL_BG = "#F0F8F7"
TEAL_TILE_BG = "#EAF5F3"
TEAL_PILL_BG = "#CCFBF1"
TEAL_PILL_FG = "#115E59"
AMBER = "#B4690E"
AMBER_BORDER = "#D9A86C"
AMBER_BG = "#FDF9F0"
AMBER_PILL_BG = "#FEF3C7"
AMBER_PILL_FG = "#92400E"
SLATE = "#51687F"
BORDER_STD = "#9DB4CD"


def build_svg(language: str = "zh") -> str:
    zh = language == "zh"

    def loc(cn: str, en: str) -> str:
        return cn if zh else en

    W, H = 1440, 1364
    els: list[str] = []

    def add(s: str) -> None:
        els.append(s)

    def rect(x, y, w, h, fill="#FFFFFF", stroke=BORDER_STD, sw=1.5, rx=6, dash=None):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        add(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{dash_attr}/>'
        )

    def line(x1, y1, x2, y2, stroke="#CBD5E1", sw=1.0, dash=None):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{dash_attr}/>')

    def text(x, y, content, size=14, fill=INK, weight="normal", anchor="start"):
        add(
            f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" '
            f'font-weight="{weight}" text-anchor="{anchor}" '
            f'dominant-baseline="middle">{escape(content)}</text>'
        )

    def pill(x, y, w, h, label, bg, fg, stroke=None, size=11.5):
        s_attr = f' stroke="{stroke}" stroke-width="1"' if stroke else ""
        add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{bg}"{s_attr}/>')
        text(x + w / 2, y + h / 2 + 0.5, label, size=size, fill=fg, weight="bold", anchor="middle")

    def polyline_arrow(pts, color=BLUE, sw=2.0, dash=None, start_marker=None, end_marker=None):
        d = "M " + " L ".join(f"{px} {py}" for px, py in pts)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        sm = f' marker-start="url(#{start_marker})"' if start_marker else ""
        em = f' marker-end="url(#{end_marker})"' if end_marker else ""
        add(
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linejoin="round" stroke-linecap="round"{dash_attr}{sm}{em}/>'
        )

    def edge_label(x, y, label, color=BLUE, size=12.5, bg="#FFFFFF", pad_x=7, pad_y=3):
        est_w = sum(size * (0.98 if ord(ch) > 127 else 0.56) for ch in label) + pad_x * 2
        est_h = size + pad_y * 2
        add(
            f'<rect x="{x - est_w / 2:.1f}" y="{y - est_h / 2:.1f}" '
            f'width="{est_w:.1f}" height="{est_h:.1f}" rx="3" fill="{bg}"/>'
        )
        text(x, y + 0.5, label, size=size, fill=color, weight="600", anchor="middle")

    def box(x, y, w, h, title, subtitle="", fill="#FFFFFF", stroke=BORDER_STD, sw=1.5, rx=6, badge=None, title_size=15.5):
        rect(x, y, w, h, fill=fill, stroke=stroke, sw=sw, rx=rx)
        cx = x + w / 2
        cy = y + h / 2
        if subtitle:
            if badge:
                text(x + 20, y + 29, title, size=16, fill=INK, weight="bold", anchor="start")
                pill(x + w - badge[1] - 18, y + 17, badge[1], 24, badge[0], badge[2], badge[3], badge[4])
                text(x + 20, y + 57, subtitle, size=12.2 if not zh else 12.5, fill=MUTED, anchor="start")
            else:
                text(cx, cy - 11, title, size=title_size, fill=INK, weight="bold", anchor="middle")
                text(cx, cy + 14, subtitle, size=12 if not zh else 12.5, fill=MUTED, anchor="middle")
        else:
            if "\n" in title:
                lines = title.split("\n")
                text(cx, cy - 10, lines[0], size=title_size, fill=INK, weight="bold", anchor="middle")
                text(cx, cy + 12, lines[1], size=title_size, fill=INK, weight="bold", anchor="middle")
            else:
                text(cx, cy + 1, title, size=title_size, fill=INK, weight="bold", anchor="middle")

    def wallet_group_card(
        x, y, w, h,
        title,
        tiles,
        desc_lines,
        accent_color=PURPLE,
        border_color=PURPLE_BORDER,
        tile_bg=PURPLE_TILE_BG,
        note_bg=PURPLE_SOFT_BG,
        note_border="#DDD0EC",
        pill_bg=PURPLE_TILE_BG,
    ):
        rect(x, y, w, h, fill="#FFFFFF", stroke=border_color, sw=1.6, rx=8)
        badge_w = 80 if zh else 112
        text(x + 18, y + 23, title, size=15, fill=INK, weight="bold", anchor="start")
        pill(
            x + w - badge_w - 18, y + 11, badge_w, 23,
            loc("专用温钱包", "Dedicated Warm"),
            pill_bg, accent_color, border_color, size=11,
        )
        text(
            x + 18, y + 44,
            loc("多个同类钱包，根据资金量分配调整", "Multiple wallets, scaled dynamically by fund volume"),
            size=11.5, fill=accent_color, anchor="start",
        )

        inner_x = x + 18
        inner_w = w - 36
        tile_y = y + 56
        tile_h = 33
        gap = 8
        ellipsis_w = 40
        normal_w = (inner_w - ellipsis_w - gap * 3) / 3
        cur_x = inner_x
        for label in tiles:
            tw = ellipsis_w if label == "…" else normal_w
            rect(cur_x, tile_y, tw, tile_h, fill=tile_bg, stroke=border_color, sw=1.2, rx=4)
            text(
                cur_x + tw / 2, tile_y + tile_h / 2 + 0.5, label,
                size=12 if not zh else 12.5, fill=accent_color, weight="600", anchor="middle",
            )
            cur_x += tw + gap

        note_y = tile_y + tile_h + 11
        note_h = h - (note_y - y) - 12
        rect(inner_x, note_y, inner_w, note_h, fill=note_bg, stroke=note_border, sw=1.0, rx=5, dash="3 3")
        line_y = note_y + 17
        note_size = 11.4 if not zh else 12
        for idx, l_text in enumerate(desc_lines):
            if idx == 0 and l_text.startswith("说明："):
                text(inner_x + 12, line_y, "说明：", size=note_size, fill=INK, weight="bold", anchor="start")
                text(inner_x + 48, line_y, l_text[3:], size=note_size, fill=MUTED, anchor="start")
            elif idx == 0 and l_text.startswith("Note: "):
                text(inner_x + 12, line_y, "Note:", size=note_size, fill=INK, weight="bold", anchor="start")
                text(inner_x + 47, line_y, l_text[6:], size=note_size, fill=MUTED, anchor="start")
            else:
                text(inner_x + 12, line_y, l_text, size=note_size, fill=MUTED, anchor="start")
            line_y += 17 if not zh else 18

    def mpc_single_panel(x, y, w, h, badge_text, content_line, accent, border, bg, pill_bg, pill_fg):
        rect(x, y, w, h, fill=bg, stroke=border, sw=1.3, rx=7)
        text(
            x + 16, y + 20,
            loc("提币密钥多签方案", "Withdrawal MPC Signing Scheme"),
            size=12.5, fill=INK, weight="bold", anchor="start",
        )
        pill_w = 88 if zh else 92
        pill(x + w - pill_w - 14, y + 9, pill_w, 22, badge_text, pill_bg, pill_fg, border, size=10.5)
        text(x + 16, y + 46, content_line, size=11.6 if not zh else 12, fill=accent, weight="500", anchor="start")

    def mpc_dual_option_panel(
        x, y, w, h,
        opt_a_badge, opt_a_lines,
        opt_b_badge, opt_b_lines,
        accent, border, bg, sub_bg, sub_border, pill_bg, pill_fg,
    ):
        rect(x, y, w, h, fill=bg, stroke=border, sw=1.3, rx=7)
        text(
            x + 14, y + 18,
            loc("提币密钥多签方案", "Withdrawal MPC Signing Scheme"),
            size=12.5, fill=INK, weight="bold", anchor="start",
        )
        badge_w = 96 if zh else 88
        pill(
            x + w - badge_w - 14, y + 7, badge_w, 22,
            loc("可选方案 A / B", "Option A / B"),
            pill_bg, pill_fg, border, size=10.5,
        )

        inner_x = x + 12
        inner_w = w - 24
        sub_h = (h - 46) / 2
        opt_font = 11.0 if not zh else 11.5

        for idx, (opt_badge, lines) in enumerate(((opt_a_badge, opt_a_lines), (opt_b_badge, opt_b_lines))):
            sy = y + 34 + idx * (sub_h + 6)
            rect(inner_x, sy, inner_w, sub_h, fill=sub_bg, stroke=sub_border, sw=1.0, rx=5)
            text(inner_x + 10, sy + 14, opt_badge, size=11.5, fill=accent, weight="bold", anchor="start")
            ly = sy + 32
            for ln in lines:
                text(inner_x + 10, ly, ln, size=opt_font, fill=MUTED, anchor="start")
                ly += 16.5

    # ------------------------------------------------------------------
    # Background & Title
    # ------------------------------------------------------------------
    add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>')
    text(40, 40, loc("ForX 资金架构", "ForX Fund Flow Architecture"), size=26, fill=INK, weight="bold")
    text(
        W - 40, 42,
        loc(
            "Cobo 多 Vault 权限隔离 · 温热钱包分层 · MPC 提币多签架构",
            "Cobo Multi-Vault Isolation · Hot & Warm Tiering · MPC Withdrawal Governance",
        ),
        size=13, fill=SLATE, anchor="end",
    )

    # ------------------------------------------------------------------
    # 1. Top Concept Definition Banner
    # ------------------------------------------------------------------
    rect(40, 64, 1360, 122, fill="#F8FAFC", stroke="#CBD5E1", sw=1.5, rx=8)
    text(
        58, 86,
        loc(
            "Cobo 钱包与 Vault 概念定义（基于 Cobo 定义逻辑）",
            "Cobo Wallet & Vault Concept Definitions (Per Cobo Logic)",
        ),
        size=13.5, fill=INK, weight="bold",
    )

    # Card 1: Cobo Hot Wallet
    rect(58, 102, 310, 70, fill="#FFFFFF", stroke=BLUE, sw=1.5, rx=6)
    text(74, 123, loc("Cobo 热钱包", "Cobo Hot Wallet"), size=14, fill=INK, weight="bold")
    pill(
        168 if zh else 206, 112, 72 if zh else 66, 21,
        loc("Cobo 定义", "By Cobo"), BLUE_PILL_BG, BLUE_PILL_FG, size=10.5,
    )
    text(
        74, 151,
        loc("支持 API Key 程序化调用的钱包", "Supports programmatic API Key calls"),
        size=12.5, fill=MUTED,
    )

    # Card 2: Cobo Warm Wallet
    rect(382, 102, 290, 70, fill=PURPLE_TILE_BG, stroke=PURPLE_BORDER, sw=1.5, rx=6)
    text(398, 123, loc("Cobo 温钱包", "Cobo Warm Wallet"), size=14, fill=INK, weight="bold")
    pill(
        492 if zh else 544, 112, 72 if zh else 66, 21,
        loc("Cobo 定义", "By Cobo"), "#EDE9FE", PURPLE, PURPLE_BORDER, size=10.5,
    )
    text(
        398, 151,
        loc("仅 Portal 操作 · 无 API Key", "Cobo Portal only · No API Key"),
        size=12.5, fill=PURPLE,
    )

    # Card 3: Cobo Vault
    rect(686, 102, 366, 70, fill=TEAL_BG, stroke=TEAL_BORDER, sw=1.5, rx=6)
    text(702, 121, "Cobo Vault", size=14, fill=INK, weight="bold")
    pill(
        788, 110, 72 if zh else 112, 21,
        loc("权限边界", "Permission Scope"), TEAL_PILL_BG, TEAL_PILL_FG, size=10.5,
    )
    text(
        702, 144,
        loc("Vault 创建并管理钱包，钱包最终用于存钱", "Vaults create & manage wallets that hold funds"),
        size=12, fill=TEAL,
    )
    text(
        702, 161,
        loc("不同 Vault 之间按业务隔离操作权限", "Strict permission isolation across Vaults"),
        size=12, fill=TEAL,
    )

    # Card 4: Note
    rect(1066, 102, 316, 70, fill="#FAF5FF", stroke=PURPLE_BORDER, sw=1.5, rx=6, dash="4 3")
    text(
        1082, 121,
        loc("备注（热温划转审批规则）", "Note (Hot ↔ Warm Transfer Policy)"),
        size=13, fill=PURPLE, weight="bold",
    )
    text(
        1082, 144,
        loc("热转温、温转热均需人工发起", "Manual initiation in both directions"),
        size=12, fill=PURPLE,
    )
    text(
        1082, 161,
        loc("财务与风控审批后签名出款", "Finance & Risk approve before signing"),
        size=12, fill=PURPLE,
    )

    # ------------------------------------------------------------------
    # 2. Upper Entry & Swap Flow Row
    # ------------------------------------------------------------------
    box(40, 214, 232, 72, loc("用户外部钱包", "External User Wallet"), title_size=15 if not zh else 15.5)
    box(
        352, 214, 248, 72,
        loc("Privy 用户钱包", "Privy User Wallet"),
        loc("用户充值入口", "User deposit entry point"),
    )
    box(
        690, 214, 260, 72,
        loc("Swap 结算", "Swap Settlement"),
        loc("用户确认兑换", "User confirms the swap"),
    )
    box(
        1076, 214, 324, 72,
        loc("充提后台", "Deposits & Withdrawals"),
        loc("按链配置收益收款地址", "Back office sets fee addresses by chain"),
        fill="#F7F9FC",
    )

    polyline_arrow([(272, 250), (350, 250)], color=BLUE, end_marker="arr-blue")
    edge_label(311, 232, loc("充值", "Deposit"), color=BLUE, size=12.5)
    polyline_arrow([(600, 250), (688, 250)], color=BLUE, end_marker="arr-blue")
    polyline_arrow([(1076, 250), (952, 250)], color=SLATE, dash="5 4", end_marker="arr-slate")
    edge_label(1014, 232, loc("按链配置", "By chain"), color=SLATE, size=12)

    # ------------------------------------------------------------------
    # 3. Left Column — Vault 1 (Cobo Hot Wallet Vault · Standalone)
    # ------------------------------------------------------------------
    rect(40, 356, 616, 350, fill=BLUE_BG, stroke=BLUE, sw=2.0, rx=10)
    text(60, 384, loc("Cobo 热钱包 Vault", "Cobo Hot Wallet Vault"), size=17, fill=INK, weight="bold")
    pill(
        220 if zh else 258, 372, 78 if zh else 116, 24,
        loc("独立 Vault", "Standalone Vault"), BLUE_PILL_BG, BLUE_PILL_FG, "#93C5FD", size=11.5,
    )
    text(
        60, 408,
        loc(
            "独立 Vault 权限边界 · 独立充值地址归集热钱包",
            "Isolated Vault scope · Per-user deposits sweep to hot wallet",
        ),
        size=12.2 if not zh else 12.5, fill=MUTED,
    )

    box(
        62, 426, 572, 64,
        loc("Cobo 充值地址", "Cobo Deposit Address"),
        loc("每位用户独立分配", "One per user"),
    )

    # Cobo Hot Wallet card (with integrated MPC 2-of-2 signing scheme section)
    rect(62, 546, 572, 142, fill="#FFFFFF", stroke=BLUE, sw=2.0, rx=8)
    text(82, 573, loc("Cobo 热钱包", "Cobo Hot Wallet"), size=16, fill=INK, weight="bold")
    badge_w = 136 if zh else 154
    pill(
        62 + 572 - badge_w - 18, 561, badge_w, 24,
        loc("API Key 程序化调用", "Programmatic API Key"),
        BLUE_PILL_BG, BLUE_PILL_FG, "#93C5FD", size=11.5,
    )
    text(
        82, 600,
        loc(
            "归集到账 · 日常出款（隶属独立热钱包 Vault）",
            "Receives sweeps · Pays withdrawals (Standalone Hot Vault)",
        ),
        size=12.2 if not zh else 12.5, fill=MUTED,
    )
    line(80, 619, 616, 619, stroke="#BFDBFE", sw=1.1, dash="4 3")
    rect(78, 628, 540, 50, fill="#F5F9FF", stroke="#BFDBFE", sw=1.0, rx=5)
    text(
        90, 644,
        loc("提币密钥多签方案", "Withdrawal MPC Signing Scheme"),
        size=12, fill=INK, weight="bold",
    )
    pill(
        618 - 88 - 10, 634, 88, 20,
        "MPC 2-of-2", BLUE_PILL_BG, BLUE_PILL_FG, "#93C5FD", size=10.5,
    )
    text(
        90, 665,
        loc(
            "双分片协同签名：自托管服务器 TSS Node（1 分片） + Cobo 官方托管（1 分片）",
            "2-of-2 TSS Shares: Self-hosted TSS Node (1 share) + Cobo Managed (1 share)",
        ),
        size=11.5 if not zh else 11.8, fill=BLUE, weight="500",
    )

    polyline_arrow([(348, 490), (348, 544)], color=BLUE, end_marker="arr-blue")
    text(362, 517, loc("Cobo 自动归集", "Cobo auto-sweep"), size=12.5, fill=BLUE, weight="600")

    # ------------------------------------------------------------------
    # 4. Lower-Left — User Withdrawal Address + Vault 2 (User Asset Storage)
    # ------------------------------------------------------------------
    box(
        40, 774, 152, 66,
        loc("用户提现地址", "User Withdrawal\nAddress"),
        title_size=13.5 if not zh else 15.5,
    )

    rect(210, 774, 446, 472, fill=PURPLE_BG, stroke=PURPLE_STRONG, sw=2.0, rx=10)
    text(228, 801, loc("用户资产存储 Vault", "User Asset Storage Vault"), size=16.5 if zh else 16, fill=INK, weight="bold")
    pill(
        386 if zh else 434, 789, 78 if zh else 116, 24,
        loc("独立 Vault", "Standalone Vault"), "#EDE9FE", PURPLE, PURPLE_BORDER, size=11.5,
    )
    text(
        228, 824,
        loc(
            "独立 Vault 权限边界 · 仅 Portal 操作 · 无 API Key",
            "Isolated Vault scope · Portal only · No API Key",
        ),
        size=12, fill=PURPLE,
    )

    wallet_group_card(
        226, 839, 414, 194,
        title=loc("用户资产存储", "User Asset Storage"),
        tiles=(
            loc("用户钱包 U1", "User U1"),
            loc("用户钱包 U2", "User U2"),
            "…",
            loc("用户钱包 U", "User U"),
        ),
        desc_lines=(
            (
                "说明：专用存储平台用户充值资金中，超出充提",
                "底仓需求的部分，定期从 Cobo 热钱包转入温钱包",
            )
            if zh
            else (
                "Note: Stores user deposit funds above hot-wallet",
                "liquidity thresholds; transferred regularly from",
                "Cobo Hot Wallet into warm wallets",
            )
        ),
    )

    # Vault 2 MPC Dual-Option Panel
    mpc_dual_option_panel(
        226, 1045, 414, 186,
        opt_a_badge=loc("方案 A · MPC 2-of-2 + Cobo 审批流", "Option A · MPC 2-of-2 + Cobo Approval Flow"),
        opt_a_lines=(
            (
                "分片：投资人（Cobo App，1 分片） + Cobo 官方（1 分片）",
                "审批：Cobo 审批流（KEdward + 集团财务）通过后签名",
            )
            if zh
            else (
                "Shares: Investor (Cobo App, 1) + Cobo Managed (1)",
                "Approval: KEdward + Group Finance in Cobo before signing",
            )
        ),
        opt_b_badge=loc("方案 B · MPC 2-of-3 门限多签", "Option B · MPC 2-of-3 Threshold Signing"),
        opt_b_lines=(
            (
                "分片：投资人、集团财务、KEdward 各持 1 分片（Cobo App）",
                "规则：3 分片 2 门限，任意 2 方协同签名生效",
            )
            if zh
            else (
                "Shares: Investor, Group Finance & KEdward (1 each, App)",
                "Rule: 2-of-3 threshold (any 2 of 3 shares to sign)",
            )
        ),
        accent=PURPLE,
        border=PURPLE_BORDER,
        bg="#FFFFFF",
        sub_bg=PURPLE_SOFT_BG,
        sub_border="#DDD0EC",
        pill_bg="#EDE9FE",
        pill_fg=PURPLE,
    )

    polyline_arrow([(116, 688), (116, 772)], color=BLUE, end_marker="arr-blue")
    edge_label(116, 738, loc("风控通过后出款", "Sent after risk checks"), color=BLUE, size=11.5 if not zh else 12)

    polyline_arrow(
        [(433, 690), (433, 772)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    edge_label(433, 738, loc("热温双向划转", "Hot ↔ Warm Transfer"), color=PURPLE, size=12)

    # ------------------------------------------------------------------
    # 5. Right Column — Vault 3 (Platform Revenue Vault) & Vault 4 (Reserve Vault)
    # ------------------------------------------------------------------
    # Vault 3: 平台收入 Vault（平台 Swap 费用 + 平台手续费收入 + MPC 2-of-2）
    rect(784, 356, 616, 526, fill=TEAL_BG, stroke=TEAL, sw=2.0, rx=10)
    text(804, 384, loc("平台收入 Vault", "Platform Revenue Vault"), size=17, fill=INK, weight="bold")
    pill(
        938 if zh else 1012, 372, 78 if zh else 116, 24,
        loc("独立 Vault", "Standalone Vault"), TEAL_PILL_BG, TEAL_PILL_FG, TEAL_BORDER, size=11.5,
    )
    text(
        804, 408,
        loc(
            "同一 Vault 统一管理 2 类平台收入专用温钱包 · 禁用 API Key",
            "Single Vault managing 2 platform revenue warm groups · No API Key",
        ),
        size=12.0 if not zh else 12.5, fill=TEAL,
    )

    # 3a: Platform Swap Fees
    wallet_group_card(
        804, 426, 576, 166,
        title=loc("平台 Swap 费用", "Platform Swap Fees"),
        tiles=(
            loc("Swap钱包 S1", "Swap Fee S1"),
            loc("Swap钱包 S2", "Swap Fee S2"),
            "…",
            loc("Swap钱包 S", "Swap Fee S"),
        ),
        desc_lines=(
            ("说明：专收平台应得的 Swap 手续费，由 Swap 结算直接转入对应链收款钱包",)
            if zh
            else (
                "Note: Receives platform swap fees directly from Swap Settlement",
                "into each chain's configured recipient warm wallet",
            )
        ),
        accent_color=TEAL,
        border_color=TEAL_BORDER,
        tile_bg=TEAL_TILE_BG,
        note_bg="#F4FAF9",
        note_border="#C2DFDA",
        pill_bg=TEAL_TILE_BG,
    )

    # 3b: Platform Fee Revenue
    wallet_group_card(
        804, 606, 576, 180,
        title=loc("平台手续费收入", "Platform Fee Revenue"),
        tiles=(
            loc("手续费钱包 F1", "Fee Wallet F1"),
            loc("手续费钱包 F2", "Fee Wallet F2"),
            "…",
            loc("手续费钱包 F", "Fee Wallet F"),
        ),
        desc_lines=(
            (
                "说明：专用存储平台手续费收入，定期从 Cobo 热钱包转入温钱包，",
                "但须保留充提底仓资金",
            )
            if zh
            else (
                "Note: Stores platform fee revenue transferred regularly from Cobo",
                "Hot Wallet while retaining deposit/withdrawal reserve liquidity",
            )
        ),
    )

    # 3c: Vault 3 MPC Single Panel (KEdward Cobo App + Cobo Official)
    mpc_single_panel(
        804, 800, 576, 66,
        badge_text="MPC 2-of-2",
        content_line=loc(
            "双分片协同签名：KEdward 通过 Cobo App 持有（1 分片） + Cobo 官方托管（1 分片）",
            "2-of-2 TSS Shares: KEdward via Cobo App (1 share) + Cobo Managed (1 share)",
        ),
        accent=TEAL,
        border=TEAL_BORDER,
        bg="#FFFFFF",
        pill_bg=TEAL_PILL_BG,
        pill_fg=TEAL_PILL_FG,
    )

    # Vault 4: 平台资产底仓 Vault（平台资产底仓储备 + 可选 MPC 方案 A / B）
    rect(784, 902, 616, 434, fill=AMBER_BG, stroke=AMBER, sw=2.0, rx=10)
    text(804, 930, loc("平台资产底仓 Vault", "Platform Liquidity Reserve Vault"), size=17, fill=INK, weight="bold")
    pill(
        972 if zh else 1088, 918, 78 if zh else 116, 24,
        loc("独立 Vault", "Standalone Vault"), AMBER_PILL_BG, AMBER_PILL_FG, AMBER_BORDER, size=11.5,
    )
    text(
        804, 953,
        loc(
            "独立 Vault 权限边界 · 仅 Portal 操作 · 无 API Key",
            "Isolated Vault scope · Portal only · No API Key",
        ),
        size=12.2 if not zh else 12.5, fill=AMBER,
    )

    # 4a: Platform Liquidity Reserve
    wallet_group_card(
        804, 968, 576, 178,
        title=loc("平台资产底仓储备", "Platform Liquidity Reserve"),
        tiles=(
            loc("底仓钱包 N1", "Reserve N1"),
            loc("底仓钱包 N2", "Reserve N2"),
            "…",
            loc("底仓钱包 N", "Reserve N"),
        ),
        desc_lines=(
            (
                "说明：专用存储平台自有资产直接入温钱包，不先充 Cobo 热钱包；",
                "Cobo 热钱包充提不足时再划拨补足",
            )
            if zh
            else (
                "Note: Stores platform treasury assets deposited directly into warm",
                "wallets (bypassing Hot Wallet); tops up Hot Wallet when needed",
            )
        ),
    )

    # 4b: Vault 4 MPC Dual-Option Panel
    mpc_dual_option_panel(
        804, 1158, 576, 162,
        opt_a_badge=loc("方案 A · MPC 2-of-2 + Cobo 审批流", "Option A · MPC 2-of-2 + Cobo Approval Flow"),
        opt_a_lines=(
            (
                "密钥分片：投资人（Cobo App，1 分片） + Cobo 官方托管（1 分片）",
                "审批流程：Cobo 提币审批流 → 经 KEdward + 集团财务审批通过后触发签名",
            )
            if zh
            else (
                "Key Shares: Investor via Cobo App (1 share) + Cobo Managed (1 share)",
                "Approval Flow: Cobo withdrawal approval (KEdward + Group Finance) before signing",
            )
        ),
        opt_b_badge=loc("方案 B · MPC 2-of-3 门限多签", "Option B · MPC 2-of-3 Threshold Signing"),
        opt_b_lines=(
            (
                "密钥分片：投资人、集团财务、KEdward 各自通过 Cobo App 持有 1 分片",
                "签名规则：3 分片 2 门限，任意 2 方协同签名即可完成提币授权",
            )
            if zh
            else (
                "Key Shares: Investor, Group Finance & KEdward hold 1 share each via Cobo App",
                "Threshold Rule: 2-of-3 threshold (any 2 of 3 key shares required to sign)",
            )
        ),
        accent=AMBER,
        border=AMBER_BORDER,
        bg="#FFFFFF",
        sub_bg="#FFFDF7",
        sub_border="#E9CFA8",
        pill_bg=AMBER_PILL_BG,
        pill_fg=AMBER_PILL_FG,
    )

    # ------------------------------------------------------------------
    # 6. Top-to-Vault Routing Arrows
    # ------------------------------------------------------------------
    polyline_arrow([(476, 286), (476, 424)], color=BLUE, end_marker="arr-blue")
    edge_label(
        402 if zh else 340, 322,
        loc("直接转入支持币种", "Direct transfer of supported tokens"),
        color=BLUE, size=12 if not zh else 12.5,
    )

    polyline_arrow([(768, 286), (768, 322), (566, 322), (566, 424)], color=BLUE, end_marker="arr-blue")
    edge_label(667, 306, loc("用户兑换净额", "Net swap proceeds"), color=BLUE, size=12.2 if not zh else 12.5)

    polyline_arrow([(882, 286), (882, 322), (1216, 322), (1216, 424)], color=TEAL, end_marker="arr-teal")
    edge_label(1049, 306, loc("平台 Swap 费用", "Platform swap fees"), color=TEAL, size=12.2 if not zh else 12.5)

    # ------------------------------------------------------------------
    # 7. Hot Wallet <--> Right Platform Warm Vaults (Corridor x=656..784)
    # ------------------------------------------------------------------
    # Hot Wallet <-> 平台手续费收入 (inside 平台收入 Vault)
    polyline_arrow(
        [(636, 582), (748, 582), (748, 696), (802, 696)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    # Hot Wallet <-> 平台资产底仓储备 (inside 平台资产底仓 Vault)
    polyline_arrow(
        [(636, 612), (692, 612), (692, 1056), (802, 1056)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    edge_label(748, 648, loc("热温双向划转", "Hot ↔ Warm"), color=PURPLE, size=11.5)
    edge_label(738, 1006, loc("热温双向划转", "Hot ↔ Warm"), color=PURPLE, size=11.5)

    aria = loc("ForX 资金架构图", "ForX Fund Flow Architecture")
    body = "\n  ".join(els)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{aria}">
  <defs>
    <style>
      text {{ font-family: {FONT_STACK}; }}
    </style>
    <marker id="arr-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="{BLUE}"/>
    </marker>
    <marker id="arr-teal" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="{TEAL}"/>
    </marker>
    <marker id="arr-slate" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="{SLATE}"/>
    </marker>
    <marker id="arr-purple" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="{PURPLE}"/>
    </marker>
    <marker id="arr-purple-start" viewBox="0 0 10 10" refX="1.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 10 1.2 L 1 5 L 10 8.8 z" fill="{PURPLE}"/>
    </marker>
  </defs>
  {body}
</svg>
"""


def main() -> None:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--language", choices=("zh", "en", "both"), default="both")
    args = parser.parse_args()
    languages = ("zh", "en") if args.language == "both" else (args.language,)
    for lang in languages:
        svg = build_svg(lang)
        out_path = SCRIPT_DIR / OUTPUT_NAMES[lang]
        out_path.write_text(svg, encoding="utf-8")
        print(f"Wrote {out_path} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
