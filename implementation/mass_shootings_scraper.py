from bs4 import BeautifulSoup
import urllib2
import csv

url_base = "https://www.gunviolencearchive.org/reports/mass-shooting?page="
incident_base = "https://www.gunviolencearchive.org"

def get_incident_links(url):

    res = []

    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"})
    p = urllib2.urlopen( req )
    page = BeautifulSoup(p, 'html.parser')
    #
    rows = page.find("table", class_="sticky-enabled").find("tbody").find_all("tr")

    for r in rows:
        res.append(r.find("a").get("href"))
    return res

def process_incident(url):
    req = urllib2.Request(url, headers={'User-Agent' : "Magic Browser"})
    p = urllib2.urlopen( req )
    page = BeautifulSoup(p, 'html.parser')
    participants = page.find_all("ul", class_=None)
    for ps in participants:
        li_items = ps.find_all("li")
        if len(li_items) == 4:
            for li in li_items:
                for text in li.contents:
                    print text.split(":")
            print "---"

incident_pages = []
for i in range(13):
    incident_pages.append(get_incident_links(url_base + str(i)))

process_incident(incident_base + "/incident/1257508")
