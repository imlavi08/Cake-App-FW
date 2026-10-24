from xlrd import *

msg = open_workbook("Test Data/birthday message.xlsx")

sheet = msg.sheet_by_name("mssg")
cust_data = msg.sheet_by_name("customer_details")


def message():
    messg = sheet.row_values(0)[0]
    return messg


def customer_details():
    cust_details = cust_data.row_values(1)  # [Nilaa, Nilaa1234@gmail.com, 9870534126, address, delivery date]
    cust_name = cust_details[0]
    cust_email = cust_details[1]
    cust_phone = cust_details[2]
    cust_address = cust_details[3]
    cust_date = cust_details[4]
    return cust_name, cust_email, cust_phone, cust_address, cust_date
