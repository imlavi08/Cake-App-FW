import pytest

from Pages.Home_Page import Homepage


@pytest.mark.order(1)
def test_homepage(customer_browser):
    homepage = Homepage(customer_browser)

    homepage.open_order_page()

    assert "http://127.0.0.1:5000/order" in customer_browser.current_url