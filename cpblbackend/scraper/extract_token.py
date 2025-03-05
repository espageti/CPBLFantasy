import requests
from bs4 import BeautifulSoup

# Step 1: Fetch the webpage
session = requests.Session()
url = "https://en.cpbl.com.tw/box/getlive"  # Adjust if needed
headers = {
    "User-Agent": "Mozilla/5.0",
}

response = session.get(url, headers=headers)

# Step 2: Parse HTML to extract the token
soup = BeautifulSoup(response.text, "html.parser")
token_element = soup.find("input", {"name": "_RequestVerificationToken"})

if token_element:
    token = token_element["value"]
    print("CSRF Token:", token)
else:
    print("CSRF token not found in HTML.")
