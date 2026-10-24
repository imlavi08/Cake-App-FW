import pytest

from Pages.Order_cake import OrderCustomCakes


@pytest.mark.order(2)
def test_order_cake(customer_browser):
    order_page = OrderCustomCakes(customer_browser)
    order_page.open_custom_cakes()