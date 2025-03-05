import os
import django
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import re

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project.settings")  # Replace with your Django project name
django.setup()

from fantasy.models import FantasyTeam, Team, Player, Game, GameStats, FantasyRoster

# Set up Selenium with a headless browser
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Run in headless mode

BASE_URL = "https://en.cpbl.com.tw"

from fractions import Fraction

def parse_innings_pitched(s):
    # Find all numbers in the string using regex
    #receive string like this: 52/3, to mean 5 2/3 IP. That's just how it works. 
    numbers = s.split("/")
    if len(numbers) == 1:
        # If only one number, it's a whole number of innings
        return float(numbers[0])
    else:
        # If there are multiple numbers, first is whole innings, others form fraction
        whole = int(numbers[0][:-1])  # All but last digit
        frac = float(Fraction(int(numbers[0][-1]), int(numbers[1])))
        return whole + frac



def get_or_create_team(name):
    team, _ = Team.objects.get_or_create(name=name)
    return team


def get_or_create_player(name_block, team, acnt):
    if "（" in name_block and "）" in name_block:
        name, indigenous_name = name_block.split("（")
        indigenous_name = indigenous_name.strip("）")
    else:
        name = name_block
        indigenous_name = None
    player, created = Player.objects.update_or_create(acnt=acnt, defaults={
        "position": "Unknown", 
        "team": team, 
        "name": name, 
        "indigenous_name": indigenous_name 
        })
    if(created):
        print("Created new Player", name, team, acnt)
    return player

def update_or_create_gamestats(game, player, role, position, stats):
    gamestats, created = GameStats.objects.update_or_create(game=game, player=player, role=role, defaults={"position": position, "stats":stats})
    return gamestats, created


    
def get_team_data(team_container, team, game):
    """Extracts and saves player stats from the given team container."""
    batting_table = team_container.find_elements(By.CLASS_NAME, "RecordTable")[0]
    pitching_table = team_container.find_elements(By.CLASS_NAME, "RecordTable")[1]

    html_batting = batting_table.get_attribute("outerHTML")
    html_pitching = pitching_table.get_attribute("outerHTML")

    batting_soup = BeautifulSoup(html_batting, "html.parser")
    pitching_soup = BeautifulSoup(html_pitching, "html.parser")

    # Extract batting data
    batting_header_row = batting_soup.select("tbody tr")[0]
    #all this just for weird full length parentehses in IBB
    batting_headers = [re.sub(r"[()（）]", "", th.get_text(strip=True)) for th in batting_header_row.find_all("th")]
    print(batting_headers)
    batting_stats = ["AB","R","H","RBI","2B","3B","HR","GIDP","BB","IBB","HBP","SO","SAC","SF","SB","CS","E","AVG"]

    for row in batting_soup.select("tbody tr")[1:-1]:
        cols = row.find_all("td")
        if cols:
            player_col = cols[0]
            player_name = player_col.find("a").text.strip()
            position = player_col.find(class_="position").text.strip()
            player_url= BASE_URL + player_col.find("a").get("href")
            acnt = player_url.lower().split("acnt=")[-1]

            stats_data = {}
            for stat in batting_stats:
                stat_text = cols[batting_headers.index(stat)].text.strip()
                
                match stat:
                    case "AVG":
                        stats_data[stat] = float(stat_text)
                    case "IBB":
                        stats_data[stat] = int(re.sub(r"[()（）]", "",stat_text))
                    case _:
                        stats_data[stat] = int(stat_text)

            player = get_or_create_player(player_name, team, acnt)

            #Create gamestat
            gamestats, created = update_or_create_gamestats(game=game, player=player, role="batter", position=position, stats=stats_data)
            
            # Update all FantasyRosters that have this player
            fantasy_rosters = list(FantasyRoster.objects.filter(player=player.id))
            for roster in fantasy_rosters:
                print(roster)
                roster.update_stats()


    # Extract pitching data
    pitching_header_row = pitching_soup.select("tbody tr")[0]
    pitching_headers = [re.sub(r"[()（）]", "", th.get_text(strip=True)) for th in pitching_header_row.find_all("th")]

    pitching_stats = ["IP","BF","NP", "S", "H", "HR", "BB", "IBB", "HBP", "SO",	"WP", "BK", "R", "ER", "E", "ERA", "WHIP"]


    pitcherPos = "SP"
    for row in pitching_soup.select("tbody tr")[1:-1]:
        cols = row.find_all("td")
        if cols:
            player_col = cols[0]
            player_name = player_col.find("a").text.strip()
            position = pitcherPos
            pitcherPos = "RP"
            player_url= BASE_URL + player_col.find("a").get("href")
            acnt = player_url.lower().split("acnt=")[-1]

            stats_data = {}
            for stat in pitching_stats:
                stat_text = cols[pitching_headers.index(stat)].text.strip()
                match stat:
                    case "IP":
                        stats_data[stat] = (int(parse_innings_pitched(stat_text) * 3))/3.0
                    case "ERA":
                        stats_data[stat] = float(stat_text)
                    case "WHIP":
                        stats_data[stat] = float(stat_text)
                    case "IBB":
                        stats_data[stat] = int(re.sub(r"[()（）]", "",stat_text))
                    case _:
                        stats_data[stat] = int(stat_text)
            

            player = get_or_create_player(player_name, team, acnt)

            update_or_create_gamestats(game=game, player=player, role="pitcher", position=position, stats=stats_data)
                
            print(player, stats_data["IP"])
            fantasy_rosters = list(FantasyRoster.objects.filter(player=player.id))
            for roster in fantasy_rosters:
                print(roster)
                roster.update_stats()
            # Update all FantasyRosters that have this player

def get_game_data(game_link, driver):
    """Fetches and stores data for a single game."""
    driver.get(game_link)

    wait = WebDriverWait(driver, 30)
    try:
        tab_group = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".GameBoxDetail.tabs_group")))
    except:
        return False

    team_names = tab_group.find_elements(By.CSS_SELECTOR, ".tabs a")
    team_containers = tab_group.find_elements(By.CLASS_NAME, "tab_cont")

    home_team = get_or_create_team(team_names[0].get_attribute("title"))
    away_team = get_or_create_team(team_names[1].get_attribute("title"))

    soup = BeautifulSoup(driver.page_source, "html.parser")
    game_no = int(soup.find(id="GameSno")["value"])
    game_date_text = soup.find("div", class_="date").get_text().strip()
    game_date = datetime.datetime.strptime(game_date_text, "%Y/%m/%d").date()

    game, _ = Game.objects.get_or_create(
        date=game_date, game_number=game_no, home_team=home_team, away_team=away_team
    )

    print(f"Processing game {game_no}: {home_team.name} vs {away_team.name} on {game_date}")

    get_team_data(team_containers[0], home_team, game)
    get_team_data(team_containers[1], away_team, game)
    return True

def scrape_data():
    
    driver = webdriver.Chrome(options=options)
    
    driver.get("https://en.cpbl.com.tw/box?year=2024&kindCode=A&gameSno=19")

    wait = WebDriverWait(driver, 30)  # Increased wait time
    wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "RecordTable")))


    # Scrape all games on the page
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")
    games_list = soup.find("div", class_="game_list")

    for game in games_list.find_all("li"):
        game_link = game.find("a")["href"]
        get_game_data(BASE_URL + game_link, driver)

    driver.quit()

def scrape_year(year: int, start: int = 1, end: int = 1000):
    driver = webdriver.Chrome(options=options)
    
    #run until no more games
    for gameNo in range(start, end):
        game_link = "/box?year={year}&KindCode=A&gameSno={gameNo}".format(year=year, gameNo=gameNo)
        print(BASE_URL + game_link)
        print("GAME NUMBER :" + str(gameNo))
        result = get_game_data(BASE_URL + game_link, driver)
        if not result:
            print("No more games")
            break

    update_fantasy()
    
    driver.quit()

def update_fantasy():
    teams = list(FantasyTeam.objects.all())
    for team in teams:
        team.update_total_stats()
    
    players = list(Player.objects.all())
    for player in players:
        player.update_eligible_positions()