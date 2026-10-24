import pytest

from Pages.CustomCakes import CustomCakes
from Utilities.read_data import customer_details, message


@pytest.mark.order(3)
def test_custom_cakes(customer_browser):
    order_message = message()
    name, email, phone, address, date = customer_details()

    custom_cake_page = CustomCakes(customer_browser)

    custom_cake_page.select_flavor()
    custom_cake_page.select_buttercream()
    custom_cake_page.select_vegan()
    custom_cake_page.select_tiered()
    custom_cake_page.select_shape()
    custom_cake_page.select_size()
    custom_cake_page.select_design()
    custom_cake_page.enter_message(order_message)
    custom_cake_page.choose_delivery_date(date)
    custom_cake_page.select_delivery_mode()
    custom_cake_page.select_delivery_time()
    custom_cake_page.enter_customer_name(name)
    custom_cake_page.enter_customer_email(email)
    custom_cake_page.enter_customer_phone(phone)
    custom_cake_page.enter_delivery_address(address)
    custom_cake_page.confirm_checkbox()
    custom_cake_page.submit()