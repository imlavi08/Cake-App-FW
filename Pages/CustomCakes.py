from time import sleep

from selenium.webdriver.support.ui import Select


class CustomCakes:
    flavor_list = ("id", "cake-flavour")
    buttercream_option = ("xpath", '//span[@class="radio-custom"][1]')
    vegan_option = ("xpath", '(//span[@class="radio-custom"])[3]')
    tiered_option = ("xpath", '(//span[@class="radio-custom"])[5]')
    cake_shape = ("id", "cake-shape")
    cake_size = ("id", "cake-size")
    design_option = ("xpath", '(//span[@class="radio-custom"])[7]')
    cake_message = ("id", "cake-message")
    delivery_date = ("id", "delivery-date")
    delivery_mode = ("xpath", '(//span[@class="radio-custom"])[10]')
    delivery_time = ("id", "preferred-time")
    customer_name = ("id", "customer-name")
    customer_email = ("id", "customer-email")
    customer_phone = ("id", "customer-phone")
    delivery_address = ("id", "delivery-address")
    confirmation_checkbox = ("id", "checkbox-custom")
    submit_order = ("id", "btn-submit-order")

    def __init__(self, browser):
        self.browser = browser

    def select_flavor(self):
        flavor = self.browser.find_element(*self.flavor_list)
        Select(flavor).select_by_index(4)
        sleep(3)


    def select_buttercream(self):
        self.browser.find_element(*self.buttercream_option).click()
        sleep(3)


    def select_vegan(self):
        self.browser.find_element(*self.vegan_option).click()
        sleep(3)


    def select_tiered(self):
        self.browser.find_element(*self.tiered_option).click()
        sleep(3)


    def select_shape(self):
        shape = self.browser.find_element(*self.cake_shape)
        Select(shape).select_by_index(1)
        sleep(3)


    def select_size(self):
        size = self.browser.find_element(*self.cake_size)
        Select(size).select_by_index(2)
        sleep(3)


    def select_design(self):
        self.browser.find_element(*self.design_option).click()
        sleep(3)


    def enter_message(self, message):
        self.browser.find_element(*self.cake_message).send_keys(message)
        sleep(3)


    def choose_delivery_date(self, date):
        self.browser.find_element(*self.delivery_date).send_keys(date)
        sleep(3)

    def select_delivery_mode(self):
        self.browser.find_element(*self.delivery_mode).click()
        sleep(3)


    def select_delivery_time(self):
        delivery_time = self.browser.find_element(*self.delivery_time)
        Select(delivery_time).select_by_index(14)
        sleep(3)


    def enter_customer_name(self, name):
        self.browser.find_element(*self.customer_name).send_keys(name)
        sleep(3)


    def enter_customer_email(self, email):
        self.browser.find_element(*self.customer_email).send_keys(email)
        sleep(3)


    def enter_customer_phone(self, phone):
        self.browser.find_element(*self.customer_phone).send_keys(phone)
        sleep(3)


    def enter_delivery_address(self, address):
        self.browser.find_element(*self.delivery_address).send_keys(address)
        sleep(3)


    def confirm_checkbox(self):
        self.browser.find_element(*self.confirmation_checkbox).click()
        sleep(3)


    def submit(self):
        self.browser.find_element(*self.submit_order).click()
        sleep(3)
