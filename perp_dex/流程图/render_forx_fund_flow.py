"""Render the editable ForX fund flow diagram in Chinese and English.

Install Pillow with `python3 -m pip install Pillow`.
Run `python3 render_forx_fund_flow.py` to render both PNGs next to this file.

Source of truth for GitHub Pages: edit `ForX资金架构图.mmd` and re-run
`npx @mermaid-js/mermaid-cli -i ForX资金架构图.mmd -o ForX资金架构图.svg`.
"""

from argparse import ArgumentParser
from functools import lru_cache
from pathlib import Path
import math
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Missing Pillow. Install: python3 -m pip install Pillow", file=sys.stderr)
    raise

_SCRIPT_DIR = Path(__file__).resolve().parent
_DEFAULT_FONTS = (
    Path("/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"),
    Path("/System/Library/Fonts/Hiragino Sans GB.ttc"),
)

OUTPUT_NAMES = {
    "zh": "Privy-Cobo-资金架构图.png",
    "en": "ForX-Fund-Flow-Architecture-EN.png",
}
TREASURY_WALLET_LABELS = ("A", "B", "C", "…")
INK, MUTED = "#182B41", "#465D72"
BLUE, VIOLET, TEAL, SLATE = "#235DB3", "#63478A", "#1B7471", "#51687F"


def resolve_font(explicit: Path | None) -> Path:
    if explicit and explicit.is_file():
        return explicit
    for candidate in _DEFAULT_FONTS:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        "No CJK font found. Pass --font with the path to an installed CJK font."
    )


def scaled(values):
    return tuple(round(value * 2) for value in values)


def render(language, font_path, output):
    zh = language == "zh"

    def local(chinese, english):
        return chinese if zh else english

    extra_height = max(0, (len(TREASURY_WALLET_LABELS) - 1) // 4) * 38
    image = Image.new("RGB", scaled((1320, 850 + extra_height)), "#FFFFFF")
    draw = ImageDraw.Draw(image)

    @lru_cache(maxsize=None)
    def font(size, bold=False):
        try:
            return ImageFont.truetype(str(font_path), round(size * 2), index=int(bold))
        except OSError:
            if not bold:
                raise
            return font(size)

    def text(x, y, label, size=20, color=INK, bold=False, anchor="lm", max_width=None):
        if max_width is not None:
            while size > 12 and draw.textlength(label, font=font(size, bold)) > max_width * 2:
                size -= 0.5
            if draw.textlength(label, font=font(size, bold)) > max_width * 2:
                raise ValueError(f"Label is too long for its box: {label}")
        draw.text(scaled((x, y)), label, font=font(size, bold), fill=color, anchor=anchor)

    def rectangle(x, y, width, height, fill, border, thickness=1):
        draw.rectangle(
            scaled((x, y, x + width, y + height)),
            fill=fill, outline=border, width=thickness * 2,
        )

    def box(x, y, width, height, title, subtitle="", *, fill="#FFFFFF",
            border="#9DB4CD", subtitle_size=17):
        rectangle(x, y, width, height, fill, border)
        center = x + width / 2
        midline = y + height / 2
        max_width = None if zh else width - 18
        text(center, midline - 12 if subtitle else midline, title, 22, INK, True, "mm", max_width)
        if subtitle:
            text(center, midline + 16, subtitle, subtitle_size, MUTED, False, "mm", max_width)

    def arrow(points, color=BLUE, dashed=False):
        for (x1, y1), (x2, y2) in zip(points, points[1:]):
            if dashed:
                length = math.hypot(x2 - x1, y2 - y1)
                for start in range(0, round(length), 12):
                    end = min(start + 6, length)
                    draw.line(scaled((
                        x1 + (x2 - x1) * start / length, y1 + (y2 - y1) * start / length,
                        x1 + (x2 - x1) * end / length, y1 + (y2 - y1) * end / length,
                    )), fill=color, width=4)
            else:
                draw.line(scaled((x1, y1, x2, y2)), fill=color, width=4)
        (a, b), (x, y) = points[-2:]
        angle = math.atan2(y - b, x - a)
        cos, sin = math.cos(angle), math.sin(angle)
        draw.polygon([
            scaled((x, y)),
            scaled((x - 9 * cos + 4.8 * sin, y - 9 * sin - 4.8 * cos)),
            scaled((x - 9 * cos - 4.8 * sin, y - 9 * sin + 4.8 * cos)),
        ], fill=color)

    text(52, 57, local("ForX资金架构", "ForX Fund Flow Architecture"), 39, INK, True)
    rectangle(52, 311, 594, 406 + extra_height, "#F2F7FF", "#A3BBDB", 2)
    rectangle(674, 311, 594, 406 + extra_height, "#F0F8F7", "#9FC9C4", 2)
    text(80, 345, local("Cobo 用户资产 Vault", "Cobo User Asset Vault"), 27, INK, True)
    text(80, 374, local("每人独立充值地址，统一归集到热钱包", "Per-user deposits sweep to the hot wallet"),
         local(17, 16), MUTED, max_width=365)
    text(702, 345, local("Cobo 平台资产 Vault", "Cobo Platform Asset Vault"), 27, INK, True)
    text(702, 374, local("Vault 内所有钱包均禁用 API Key", "API keys disabled for all wallets in this vault"),
         17, TEAL, max_width=420)

    box(52, 142, 240, 74, local("用户外部钱包", "External User Wallet"))
    box(364, 142, 240, 74, local("Privy 用户钱包", "Privy User Wallet"),
        local("用户充值入口", "User deposit entry point"))
    box(676, 142, 240, 74, local("Swap 结算", "Swap Settlement"),
        local("用户确认兑换", "User confirms the swap"))
    box(988, 142, 280, 74, local("充提后台", "Deposits & Withdrawals"),
        local("按链配置收益收款地址", "Back office sets fee addresses by chain"),
        fill="#F7F9FC", subtitle_size=local(17, 14))
    box(80, 407, 538, 62, local("Cobo 充值地址", "Cobo Deposit Address"),
        local("每位用户独立分配", "One per user"))
    box(80, 528, 240, 80, local("Cobo 热钱包", "Cobo Hot Wallet"),
        local("归集到账 · 日常出款", "Receives sweeps · Pays withdrawals"), subtitle_size=local(17, 14))
    box(378, 528, 240, 80, local("Cobo 温钱包", "Cobo Warm Wallet"),
        local("仅 Portal 操作 · 无 API Key", "Cobo Portal only · No API key"),
        fill="#F6F1FA", border="#BBA9CE", subtitle_size=local(15.5, 15))
    box(702, 407, 538, 62, local("Swap 收益钱包", "Swap Fee Wallet"),
        local("专收平台应得的 Swap 费用", "Receives platform swap fees"), border="#88B8B1")
    box(702, 528, 538, 80, local("平台收益钱包", "Platform Revenue Wallet"),
        local("与温钱包双向划转 · 人工发起＋审批组审批",
              "Transfers with warm wallet · Manual initiation + approval group sign-off"),
        border="#88B8B1", subtitle_size=local(17, 15))
    box(80, 762 + extra_height, 240, 56, local("用户提现地址", "User Withdrawal Address"))

    rectangle(702, 625, 538, 77 + extra_height, "#FFFFFF", "#88B8B1")
    text(971, 644, local("平台自有资产钱包组", "Platform Treasury Wallets"), 19, INK, True, "mm", 510)
    for index, label in enumerate(TREASURY_WALLET_LABELS):
        row, column = divmod(index, 4)
        x, y = 716 + 130 * column, 660 + 38 * row
        rectangle(x, y, 120, 30, "#F0F8F7", "#A7CAC4")
        name = label if label == "…" else local(f"自有钱包 {label}", f"Treasury {label}")
        text(x + 60, y + 15, name, 15, TEAL, False, "mm", 104)

    arrow([(292, 179), (364, 179)])
    arrow([(604, 179), (676, 179)])
    arrow([(988, 179), (916, 179)], SLATE, dashed=True)
    text(328, 159, local("充值", "Deposit"), local(16, 15), BLUE, False, "mm")
    arrow([(470, 216), (470, 407)])
    text(454, 245, local("直接转入支持币种", "Direct transfer of supported tokens"),
         local(18, 17), BLUE, False, "rm", 360)
    arrow([(720, 216), (720, 275), (552, 275), (552, 407)])
    text(local(636, 705), 255, local("用户兑换净额", "Net swap proceeds"),
         local(18, 16), BLUE, False, local("mm", "rm"), None if zh else 151)
    arrow([(867, 216), (867, 275), (1149, 275), (1149, 407)], TEAL)
    text(1008, 255, local("平台 Swap 费用", "Platform swap fees"), 18, TEAL, False, "mm")
    arrow([(200, 469), (200, 528)])
    text(217, 497, local("Cobo 自动归集", "Cobo auto-sweep"), 18, BLUE)
    arrow([(200, 608), (200, 762 + extra_height)])
    text(215, local(688, 744) + extra_height, local("风控通过后出款", "Sent after risk checks"),
         local(18, 16), BLUE)

    arrow([(320, 554), (378, 554)], VIOLET)
    arrow([(378, 582), (320, 582)], VIOLET)
    arrow([(618, 554), (702, 554)], VIOLET)
    arrow([(702, 582), (618, 582)], VIOLET)
    rectangle(350, 634, 268, 60, "#F6F1FA", "#BBA9CE")
    text(484, 653, local("热转温、温转热均需人工发起", "Manual initiation in both directions"),
         local(16, 14), VIOLET, True, "mm", 248)
    text(484, 676, local("财务与风控审批后签名出款", "Finance and Risk approve before signing"),
         local(16, 13), VIOLET, False, "mm", 248)

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, optimize=True)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--language", choices=("zh", "en", "both"), default="both")
    parser.add_argument("--output-dir", type=Path, default=_SCRIPT_DIR)
    parser.add_argument("--font", type=Path, default=None, help="Path to a CJK font")
    args = parser.parse_args()
    font_path = resolve_font(args.font)
    languages = OUTPUT_NAMES if args.language == "both" else (args.language,)
    for language in languages:
        output = args.output_dir / OUTPUT_NAMES[language]
        render(language, font_path, output)
        print(output.resolve())


if __name__ == "__main__":
    main()