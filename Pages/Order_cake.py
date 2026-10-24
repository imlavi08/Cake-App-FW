from time import sleep
class OrderCustomCakes:
    custom_cakes_badge = ("id", "badge-custom")

    def __init__(self, browser):
        self.browser = browser

    def open_custom_cakes(self):
        self.browser.find_element(*self.custom_cakes_badge).click()
        sleep(3)
