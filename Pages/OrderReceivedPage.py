from time import sleep
class OrderReceived:
    success_modal = ("id", "success-modal")

    def __init__(self, browser):
        self.browser = browser

    def order_recd(self):
        try:
            assert self.browser.find_element(*self.success_modal).is_displayed()
        except AssertionError:
            self.browser.save_screenshot("Screenshots/error_receiving_order.png")
            raise
        sleep(3)
