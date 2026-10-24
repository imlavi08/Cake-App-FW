import pytest

from Pages.OrderReceivedPage import OrderReceived


@pytest.mark.order(5)
def test_order_recd(customer_browser):
    order_received = OrderReceived(customer_browser)
    order_received.order_recd()