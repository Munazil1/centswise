from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from PIL import Image
import os


def generate_receipt_pdf(receipt, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # --------------------------------------------------
    # Paths
    # --------------------------------------------------
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ASSETS = os.path.join(BASE_DIR, "assets")

    TEMPLATE_IMG = os.path.join(ASSETS, "sys_receipt_full_template.png")
    RUPEE_FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

    if not os.path.exists(TEMPLATE_IMG):
        raise FileNotFoundError("Template image not found")

    if not os.path.exists(RUPEE_FONT_PATH):
        raise FileNotFoundError("DejaVuSans-Bold.ttf not found")

    pdfmetrics.registerFont(TTFont("RupeeFont", RUPEE_FONT_PATH))

    # --------------------------------------------------
    # Page
    # --------------------------------------------------
    PAGE_WIDTH, PAGE_HEIGHT = A4
    c = canvas.Canvas(output_path, pagesize=A4)

    # --------------------------------------------------
    # Load template image size (PIXELS)
    # --------------------------------------------------
    img = Image.open(TEMPLATE_IMG)
    img_width_px, img_height_px = img.size

    scale_x = PAGE_WIDTH / img_width_px
    scale_y = PAGE_HEIGHT / img_height_px

    # --------------------------------------------------
    # Draw template
    # --------------------------------------------------
    c.drawImage(
        TEMPLATE_IMG,
        0,
        0,
        width=PAGE_WIDTH,
        height=PAGE_HEIGHT,
        preserveAspectRatio=True,
        mask="auto",
    )

    # --------------------------------------------------
    # Header Meta
    # --------------------------------------------------
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.black)

    date_str = (
        receipt.date.strftime("%d-%m-%Y")
        if isinstance(receipt.date, datetime)
        else receipt.date
    )

    c.drawString(40, PAGE_HEIGHT - 35, f"Receipt No: {receipt.serial_number}")
    c.drawRightString(PAGE_WIDTH - 40, PAGE_HEIGHT - 35, f"Date: {date_str}")

    # ==================================================
    # SENDER NAME (PIXEL-LOCKED, +10 SIZE AGAIN)
    # ==================================================
    NAME_PX_X = 466
    NAME_PX_Y = 545

    NAME_X = NAME_PX_X * scale_x
    NAME_Y_TOP = PAGE_HEIGHT - (NAME_PX_Y * scale_y)

    NAME_ZONE_HEIGHT = 40 * scale_y
    NAME_MAX_WIDTH = 420 * scale_x

    name_text = receipt.donor_name.upper() + ","
    name_font = "Helvetica-Bold"
    size = 44  # 🔥 increased by +10 again

    c.setFillColor(colors.black)

    while c.stringWidth(name_text, name_font, size) > NAME_MAX_WIDTH and size > 22:
        size -= 1

    c.setFont(name_font, size)

    text_height = size * 0.7
    y_centered = NAME_Y_TOP - (NAME_ZONE_HEIGHT + text_height) / 2
    y_centered += 6  # previous fine-tune

    c.drawString(NAME_X, y_centered, name_text)

    # ==================================================
    # AMOUNT (MOVE SLIGHTLY RIGHT & DOWN)
    # ==================================================
    AMOUNT_PX_X = 60
    AMOUNT_PX_Y = 1674

    base_x = AMOUNT_PX_X * scale_x
    base_center_y = PAGE_HEIGHT - (AMOUNT_PX_Y * scale_y)

    # 🔧 micro adjustments
    AMOUNT_ADJUST_RIGHT = 18
    AMOUNT_ADJUST_DOWN = 12

    amount_x = base_x + AMOUNT_ADJUST_RIGHT
    amount_center_y = base_center_y - AMOUNT_ADJUST_DOWN

    amount_text = f"₹ {receipt.amount:,.0f}/-"
    AMOUNT_MAX_WIDTH = 320 * scale_x

    size = 30
    c.setFont("RupeeFont", size)
    c.setFillColor(colors.black)

    while c.stringWidth(amount_text, "RupeeFont", size) > AMOUNT_MAX_WIDTH and size > 20:
        size -= 1
        c.setFont("RupeeFont", size)

    face = pdfmetrics.getFont("RupeeFont").face
    ascent = (face.ascent * size) / 1000
    y_amount = amount_center_y - ascent / 2

    c.drawString(amount_x, y_amount, amount_text)

    # --------------------------------------------------
    # Save
    # --------------------------------------------------
    c.showPage()
    c.save()

    return output_path
