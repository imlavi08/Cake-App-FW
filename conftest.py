import pytest
from selenium.webdriver import Chrome


@pytest.fixture(scope="session")
def customer_browser():
    browser = Chrome()
    browser.maximize_window()
    browser.get("http://127.0.0.1:5000/")

    yield browser

    browser.quit()
