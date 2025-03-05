import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from fantasy.models import Player, Team
from django.core.files.base import ContentFile
import os

BASE_URL = "https://en.cpbl.com.tw"
PLAYERS_URL = "https://en.cpbl.com.tw/player"

def get_player_links():
    """Scrape player profile links from a team roster page."""
    response = requests.get(PLAYERS_URL)
    soup = BeautifulSoup(response.text, "html.parser")

    players = []
    for team in soup.find_all("div", class_="PlayersList"):
        for player in team.find_all("dd"):
            name = player.text.strip()
            profile_url = BASE_URL + player.find("a")["href"]
            players.append((name, profile_url))

    return players

def normalize_position(position_text):
    """Normalize position text to standard format."""
    position_map = {
        "First-Base Man": "1B",
        "Second-Base Man": "2B",
        "Third-Base Man": "3B",
        "Shortstop": "SS",
        "Center-Fielder": "CF",
        "Right-Fielder": "RF",
        "Left-Fielder": "LF",
        "Pitcher": "P",
        "Catcher": "C"
    }
    return position_map.get(position_text, position_text)

def parse_player_profile(player_name, profile_url):
    """Scrape player details from their profile page."""
    response = requests.get(profile_url)
    soup = BeautifulSoup(response.text, "html.parser")

    team_name = soup.select_one(".team").text.strip()
    # Ensure the team exists in the database
    team, created = Team.objects.get_or_create(name=team_name)
    
    # Extract Indigenous Name (if present)
    if "（" in player_name and "）" in player_name:
        name, indigenous_name = player_name.split("（")
        indigenous_name = indigenous_name.strip("）")
    else:
        name = player_name
        indigenous_name = None

    number = soup.select_one(".number")
    number = int(number.text.strip()) if number else None

    position_text = soup.select_one(".pos .desc").text.strip()
    position = normalize_position(position_text)
    bats_throws = soup.select_one(".b_t .desc").text.strip()
    throws, bats = bats_throws.split("/")

    # Parse height and weight
    height_weight = soup.select_one(".ht_wt .desc").text.strip().split("/")
    height = int(height_weight[0].replace("(CM)", "").strip())
    weight = int(height_weight[1].replace("(KG)", "").strip())

    # Parse dates
    birthdate = soup.select_one(".born .desc").text.strip()
    birthdate = datetime.strptime(birthdate, "%Y/%m/%d").date() if birthdate else None

    debut = soup.select_one(".debut .desc").text.strip()
    debut_date = datetime.strptime(debut, "%Y/%m/%d").date() if debut else None

    nationality = soup.select_one(".nationality .desc").text.strip()

    # Extract player image from CSS background-image
    player_image = None
    img_container = soup.select_one("div.img span")
    if img_container and img_container.get('style'):
        # Extract URL from background-image: url(/files/atts/0L087782037175521853/詹子賢2024.png)
        bg_style = img_container.get('style')
        url_match = re.search(r'background-image:url\((.*?)\)', bg_style)
        if url_match:
            img_url = url_match.group(1)
            # Make relative URL absolute if needed
            if img_url.startswith('/'):
                img_url = BASE_URL + img_url
                
            try:
                img_response = requests.get(img_url)
                if img_response.status_code == 200:
                    player_image = ContentFile(img_response.content)
            except Exception as e:
                print(f"Error downloading image for {name}: {e}")
    
    return {
        "name": name,
        "indigenous_name": indigenous_name,
        "number": number,
        "team": team,
        "position": position,
        "bats": bats,
        "throws": throws,
        "height": height,
        "weight": weight,
        "birthdate": birthdate,
        "debut_date": debut_date,
        "nationality": nationality,
        "acnt": profile_url.lower().split("acnt=")[-1],
        "profile_image": player_image  # Add the image
    }

def save_player_to_db(player_data):
    """Save player details to the database."""
    # Extract the image from player data
    player_image = player_data.pop("profile_image", None)
    
    # Create or update player record
    player, created = Player.objects.update_or_create(
        acnt=player_data["acnt"],
        defaults=player_data
    )
    
    # Save image if available
    if player_image:
        player.profile_image.save(f"{player.acnt}.png", player_image, save=True)
        
    return player

def scrape_players():

    players = get_player_links()

    for name, profile_url in players:
        print(f"Scraping {name} - {profile_url}")
        player_data = parse_player_profile(name, profile_url)
        save_player_to_db(player_data)

