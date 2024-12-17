import random
from colour import Color
from color_contrast import AccessibilityLevel, check_contrast


def generate_hex_color():
    """ Generates a valid hex color """
    values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D']
    color = ''
    for r in range(6):
        color += random.choice(values)
    return color

def generate_avatar():

    flip = "true" if random.choice([1,2]) == 1 else "false"
    rotate = random.choice([0, 90, 270])
    background_color = generate_hex_color()

    shape_color = generate_hex_color()
    while not check_contrast(Color(f"#{shape_color}"), Color(f"#{background_color}"), level=AccessibilityLevel.AA18):
        shape_color = generate_hex_color()

    translate_x = random.choices(range(-5, 5))
    eyes_variant = random.choice(["variant1W16", "variant2W16", "variant3W16", "variant4W16", "variant5W16",
                                  "variant6W16", "variant7W16", "variant8W16", "variant9W16"])
    face_elements_color = random.choice(["000000", "ffffff"])
    eyes_color = face_elements_color
    mouth_color = face_elements_color
    face = random.randint(1, 5)
    mouth = random.randint(1, 5)

    face_offset_x =  random.choices(range(-15, 15))
    face_offset_y =  random.choices(range(-15, 15))

    return f"https://api.dicebear.com/9.x/thumbs/svg?flip={flip}&rotate={rotate}&backgroundColor={background_color}&translateX={translate_x[0]}&eyes={eyes_variant}&face=variant{face}&faceOffsetX={face_offset_x[0]}&faceOffsetY={face_offset_y[0]}&mouth=variant{mouth}&shapeColor={shape_color}&radius=50"


