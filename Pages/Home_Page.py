from time import sleep
class Homepage:
    order_page_button = ("id", "btn-place-order")

    def __init__(self, browser):
        self.browser = browser

    def open_order_page(self):
        self.browser.find_element(*self.order_page_button).click()
        sleep(3)
