"""Generate the ForX Fund Flow Architecture SVG (`ForX资金架构图.svg`).

Usage:
    python3 render_forx_fund_flow.py

Output:
    perp_dex/流程图/ForX资金架构图.svg
    Online URL (GitHub Pages):
    https://dashuaibizzy.github.io/prototype/perp_dex/流程图/ForX资金架构图.svg
"""

from html import escape
from pathlib import Path

OUT_PATH = Path(__file__).resolve().parent / "ForX资金架构图.svg"

FONT_STACK = (
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", '
    '"WenQuanYi Micro Hei", -apple-system, BlinkMacSystemFont, sans-serif'
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
SLATE = "#51687F"
BORDER_STD = "#9DB4CD"


def build_svg() -> str:
    W, H = 1440, 1054
    els: list[str] = []

    def add(s: str) -> None:
        els.append(s)

    def rect(x, y, w, h, fill="#FFFFFF", stroke=BORDER_STD, sw=1.5, rx=6, dash=None):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        add(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{dash_attr}/>'
        )

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
        est_w = sum(size * (0.98 if ord(ch) > 127 else 0.58) for ch in label) + pad_x * 2
        est_h = size + pad_y * 2
        add(
            f'<rect x="{x - est_w / 2:.1f}" y="{y - est_h / 2:.1f}" '
            f'width="{est_w:.1f}" height="{est_h:.1f}" rx="3" fill="{bg}"/>'
        )
        text(x, y + 0.5, label, size=size, fill=color, weight="600", anchor="middle")

    def box(x, y, w, h, title, subtitle="", fill="#FFFFFF", stroke=BORDER_STD, sw=1.5, rx=6, badge=None):
        rect(x, y, w, h, fill=fill, stroke=stroke, sw=sw, rx=rx)
        cx = x + w / 2
        cy = y + h / 2
        if subtitle:
            if badge:
                text(x + 20, y + 29, title, size=16, fill=INK, weight="bold", anchor="start")
                pill(x + w - badge[1] - 18, y + 17, badge[1], 24, badge[0], badge[2], badge[3], badge[4])
                text(x + 20, y + 57, subtitle, size=12.5, fill=MUTED, anchor="start")
            else:
                text(cx, cy - 11, title, size=15.5, fill=INK, weight="bold", anchor="middle")
                text(cx, cy + 14, subtitle, size=12.5, fill=MUTED, anchor="middle")
        else:
            text(cx, cy + 1, title, size=15.5, fill=INK, weight="bold", anchor="middle")

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
        # Card header + 专用温钱包 badge
        text(x + 18, y + 24, title, size=15, fill=INK, weight="bold", anchor="start")
        pill(x + w - 98, y + 12, 80, 23, "专用温钱包", pill_bg, accent_color, border_color, size=11)
        text(x + 18, y + 46, "多个同类钱包，根据资金量分配调整", size=11.5, fill=accent_color, anchor="start")

        # 4 horizontal wallet tiles (like 自有钱包 A/B/C/…)
        inner_x = x + 18
        inner_w = w - 36
        tile_y = y + 59
        tile_h = 34
        gap = 8
        ellipsis_w = 40
        normal_w = (inner_w - ellipsis_w - gap * 3) / 3
        cur_x = inner_x
        for label in tiles:
            tw = ellipsis_w if label == "…" else normal_w
            rect(cur_x, tile_y, tw, tile_h, fill=tile_bg, stroke=border_color, sw=1.2, rx=4)
            text(cur_x + tw / 2, tile_y + tile_h / 2 + 0.5, label, size=12.5, fill=accent_color, weight="600", anchor="middle")
            cur_x += tw + gap

        # Note panel below tiles
        note_y = tile_y + tile_h + 12
        note_h = h - (note_y - y) - 14
        rect(inner_x, note_y, inner_w, note_h, fill=note_bg, stroke=note_border, sw=1.0, rx=5, dash="3 3")
        line_y = note_y + 18
        for idx, line in enumerate(desc_lines):
            if idx == 0 and line.startswith("说明："):
                text(inner_x + 12, line_y, "说明：", size=12, fill=INK, weight="bold", anchor="start")
                text(inner_x + 48, line_y, line[3:], size=12, fill=MUTED, anchor="start")
            else:
                text(inner_x + 12, line_y, line, size=12, fill=MUTED, anchor="start")
            line_y += 19

    # ------------------------------------------------------------------
    # Background & Title
    # ------------------------------------------------------------------
    add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>')
    text(40, 40, "ForX 资金架构", size=26, fill=INK, weight="bold")
    text(
        W - 40, 42,
        "Cobo 多 Vault 权限隔离 · 温热钱包分层架构",
        size=13, fill=SLATE, anchor="end",
    )

    # ------------------------------------------------------------------
    # 1. Top Concept Definition Banner (Cobo 温热定义 + Vault + 备注)
    # ------------------------------------------------------------------
    rect(40, 64, 1360, 122, fill="#F8FAFC", stroke="#CBD5E1", sw=1.5, rx=8)
    text(58, 86, "Cobo 钱包与 Vault 概念定义（基于 Cobo 定义逻辑）", size=13.5, fill=INK, weight="bold")

    # Card 1: Cobo 热钱包
    rect(58, 102, 310, 70, fill="#FFFFFF", stroke=BLUE, sw=1.5, rx=6)
    text(74, 123, "Cobo 热钱包", size=14, fill=INK, weight="bold")
    pill(168, 112, 72, 21, "Cobo 定义", BLUE_PILL_BG, BLUE_PILL_FG, size=10.5)
    text(74, 151, "支持 API Key 程序化调用的钱包", size=12.5, fill=MUTED)

    # Card 2: Cobo 温钱包
    rect(382, 102, 290, 70, fill=PURPLE_TILE_BG, stroke=PURPLE_BORDER, sw=1.5, rx=6)
    text(398, 123, "Cobo 温钱包", size=14, fill=INK, weight="bold")
    pill(492, 112, 72, 21, "Cobo 定义", "#EDE9FE", PURPLE, PURPLE_BORDER, size=10.5)
    text(398, 151, "仅 Portal 操作 · 无 API Key", size=12.5, fill=PURPLE)

    # Card 3: Cobo Vault
    rect(686, 102, 366, 70, fill=TEAL_BG, stroke=TEAL_BORDER, sw=1.5, rx=6)
    text(702, 121, "Cobo Vault", size=14, fill=INK, weight="bold")
    pill(788, 110, 72, 21, "权限边界", TEAL_PILL_BG, TEAL_PILL_FG, size=10.5)
    text(702, 144, "Vault 创建并管理钱包，钱包最终用于存钱", size=12, fill=TEAL)
    text(702, 161, "不同 Vault 之间按业务隔离操作权限", size=12, fill=TEAL)

    # Card 4: 备注
    rect(1066, 102, 316, 70, fill="#FAF5FF", stroke=PURPLE_BORDER, sw=1.5, rx=6, dash="4 3")
    text(1082, 121, "备注（热温划转审批规则）", size=13, fill=PURPLE, weight="bold")
    text(1082, 144, "热转温、温转热均需人工发起", size=12, fill=PURPLE)
    text(1082, 161, "财务与风控审批后签名出款", size=12, fill=PURPLE)

    # ------------------------------------------------------------------
    # 2. Upper Entry & Swap Flow Row
    # ------------------------------------------------------------------
    box(40, 214, 232, 72, "用户外部钱包")
    box(352, 214, 248, 72, "Privy 用户钱包", "用户充值入口")
    box(690, 214, 260, 72, "Swap 结算", "用户确认兑换")
    box(1076, 214, 324, 72, "充提后台", "按链配置收益收款地址", fill="#F7F9FC")

    polyline_arrow([(272, 250), (350, 250)], color=BLUE, end_marker="arr-blue")
    edge_label(311, 232, "充值", color=BLUE, size=12.5)
    polyline_arrow([(600, 250), (688, 250)], color=BLUE, end_marker="arr-blue")
    polyline_arrow([(1076, 250), (952, 250)], color=SLATE, dash="5 4", end_marker="arr-slate")
    edge_label(1014, 232, "按链配置", color=SLATE, size=12)

    # ------------------------------------------------------------------
    # 3. Left Column — Vault 1 (Cobo 热钱包 Vault · 独立 Vault)
    # ------------------------------------------------------------------
    rect(40, 356, 616, 304, fill=BLUE_BG, stroke=BLUE, sw=2.0, rx=10)
    text(60, 384, "Cobo 热钱包 Vault", size=17, fill=INK, weight="bold")
    pill(220, 372, 78, 24, "独立 Vault", BLUE_PILL_BG, BLUE_PILL_FG, "#93C5FD", size=11.5)
    text(60, 408, "独立 Vault 权限边界 · 独立充值地址归集热钱包", size=12.5, fill=MUTED)

    box(62, 426, 572, 64, "Cobo 充值地址", "每位用户独立分配")
    box(
        62, 552, 572, 84,
        "Cobo 热钱包",
        "归集到账 · 日常出款（隶属独立热钱包 Vault）",
        stroke=BLUE, sw=2.0,
        badge=("API Key 程序化调用", 136, BLUE_PILL_BG, BLUE_PILL_FG, "#93C5FD"),
    )

    # Auto-sweep arrow inside Vault 1
    polyline_arrow([(348, 490), (348, 550)], color=BLUE, end_marker="arr-blue")
    text(362, 520, "Cobo 自动归集", size=12.5, fill=BLUE, weight="600")

    # ------------------------------------------------------------------
    # 4. Lower-Left — 用户提现地址 + Vault 2 (用户资产存储 Vault · 独立 Vault)
    # ------------------------------------------------------------------
    box(40, 730, 152, 66, "用户提现地址")

    rect(210, 730, 446, 294, fill=PURPLE_BG, stroke=PURPLE_STRONG, sw=2.0, rx=10)
    text(228, 758, "用户资产存储 Vault", size=16.5, fill=INK, weight="bold")
    pill(386, 746, 78, 24, "独立 Vault", "#EDE9FE", PURPLE, PURPLE_BORDER, size=11.5)
    text(228, 781, "独立 Vault 权限边界 · 仅 Portal 操作 · 无 API Key", size=12, fill=PURPLE)

    wallet_group_card(
        226, 796, 414, 210,
        title="用户资产存储",
        tiles=("用户钱包 U1", "用户钱包 U2", "…", "用户钱包 U"),
        desc_lines=(
            "说明：专用存储平台用户充值资金中，超出充提",
            "底仓需求的部分，定期从 Cobo 热钱包转入温钱包",
        ),
    )

    # Arrows from Cobo 热钱包 downward to 提现地址 & 用户资产存储 Vault
    polyline_arrow([(116, 636), (116, 728)], color=BLUE, end_marker="arr-blue")
    edge_label(116, 694, "风控通过后出款", color=BLUE, size=12)

    polyline_arrow(
        [(433, 638), (433, 728)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    edge_label(433, 694, "热温双向划转", color=PURPLE, size=12)

    # ------------------------------------------------------------------
    # 5. Right Column — Vault 3 (平台资产 Vault · 独立 Vault · 大框)
    # ------------------------------------------------------------------
    rect(784, 356, 616, 668, fill=TEAL_BG, stroke=TEAL, sw=2.0, rx=10)
    text(804, 384, "Cobo 平台资产 Vault", size=17, fill=INK, weight="bold")
    pill(980, 372, 78, 24, "独立 Vault", TEAL_PILL_BG, TEAL_PILL_FG, TEAL_BORDER, size=11.5)
    text(804, 408, "同一 Vault 统一管理 3 类平台专用温钱包 · 禁用 API Key", size=12.5, fill=TEAL)

    # 3a: 平台 Swap 费用（多钱包卡片组）
    wallet_group_card(
        804, 426, 576, 174,
        title="平台 Swap 费用",
        tiles=("Swap钱包 S1", "Swap钱包 S2", "…", "Swap钱包 S"),
        desc_lines=(
            "说明：专收平台应得的 Swap 手续费，由 Swap 结算直接转入对应链收款钱包",
        ),
        accent_color=TEAL,
        border_color=TEAL_BORDER,
        tile_bg=TEAL_TILE_BG,
        note_bg="#F4FAF9",
        note_border="#C2DFDA",
        pill_bg=TEAL_TILE_BG,
    )

    # 3b: 平台资产底仓储备（多钱包卡片组）
    wallet_group_card(
        804, 616, 576, 188,
        title="平台资产底仓储备",
        tiles=("底仓钱包 N1", "底仓钱包 N2", "…", "底仓钱包 N"),
        desc_lines=(
            "说明：专用存储平台自有资产直接入温钱包，不先充 Cobo 热钱包；",
            "Cobo 热钱包充提不足时再划拨补足",
        ),
    )

    # 3c: 平台手续费收入（多钱包卡片组）
    wallet_group_card(
        804, 820, 576, 188,
        title="平台手续费收入",
        tiles=("手续费钱包 F1", "手续费钱包 F2", "…", "手续费钱包 F"),
        desc_lines=(
            "说明：专用存储平台手续费收入，定期从 Cobo 热钱包转入温钱包，",
            "但须保留充提底仓资金",
        ),
    )

    # ------------------------------------------------------------------
    # 6. Top-to-Vault Routing Arrows (Deposit, Net Swap, Platform Swap Fee)
    # ------------------------------------------------------------------
    # Privy -> Cobo 充值地址 (Direct transfer)
    polyline_arrow([(476, 286), (476, 424)], color=BLUE, end_marker="arr-blue")
    edge_label(402, 322, "直接转入支持币种", color=BLUE, size=12.5)

    # Swap -> Cobo 充值地址 (Net swap proceeds)
    polyline_arrow([(768, 286), (768, 322), (566, 322), (566, 424)], color=BLUE, end_marker="arr-blue")
    edge_label(667, 306, "用户兑换净额", color=BLUE, size=12.5)

    # Swap -> 平台 Swap 费用 (Platform swap fees) — route past Vault subtitle
    polyline_arrow([(882, 286), (882, 322), (1216, 322), (1216, 424)], color=TEAL, end_marker="arr-teal")
    edge_label(1049, 306, "平台 Swap 费用", color=TEAL, size=12.5)

    # ------------------------------------------------------------------
    # 7. Hot Wallet <--> Platform Warm Wallets (Horizontal Corridor x=656..784)
    # ------------------------------------------------------------------
    # Cobo 热钱包 <-> 平台资产底仓储备
    polyline_arrow(
        [(636, 580), (748, 580), (748, 710), (802, 710)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    # Cobo 热钱包 <-> 平台手续费收入
    polyline_arrow(
        [(636, 610), (692, 610), (692, 914), (802, 914)],
        color=PURPLE, sw=2.2,
        start_marker="arr-purple-start",
        end_marker="arr-purple",
    )
    edge_label(748, 664, "热温双向划转", color=PURPLE, size=11.5)
    edge_label(740, 868, "热温双向划转", color=PURPLE, size=11.5)

    body = "\n  ".join(els)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="ForX 资金架构图">
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
    svg = build_svg()
    OUT_PATH.write_text(svg, encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
