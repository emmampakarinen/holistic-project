import re
import requests
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup

def get_sitemap_urls(target_sitemap_url):

    curve_urls = [] # list to store charging curve URLs
    spec_urls = [] # list to store vehicle specification URLs

    xml_namespaces = {
        'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9' # xml namespace for sitemap parsing
    }

    try:
        api_response = requests.get(target_sitemap_url)
        api_response.raise_for_status()

        xml_root = ET.fromstring(api_response.content) # parse the xml response content

        for url_node in xml_root.findall('ns:url', xml_namespaces):
            loc_node = url_node.find('ns:loc', xml_namespaces) # find the location (url) tag
            if loc_node is not None:
                if '/models/' in loc_node.text and loc_node.text.endswith('/chargingcurve/'):
                    curve_urls.append(loc_node.text)
                elif '/models/' in loc_node.text and loc_node.text.endswith('/specifications/'):
                    spec_urls.append(loc_node.text)

        return curve_urls, spec_urls

    except requests.exceptions.RequestException as request_error:
        print(f"error fetching url: {request_error}")
        return None
    except ET.ParseError as xml_error:
        print(f"error parsing xml: {xml_error}")
        return None
    except Exception as unknown_error:
        print(f"an unexpected error occurred: {unknown_error}")
        return None

def get_public_ev_data():

    sitemap_xml_url = "https://evkx.net/en/sitemap.xml"

    # curve_urls, spec_urls = get_sitemap_urls(sitemap_xml_url)

    curve_urls = ['test'] # temporary placeholder list
    spec_urls = ['test'] # temporary placeholder list

    vehicle_specs = {} # dictionary to hold scraped EV data

    for item in curve_urls:

        target_url = "https://evkx.net/models/bmw/ix/ix_xdrive45/specifications/"

        if target_url.__contains__("specifications"):
            try:
                page_response = requests.get(target_url)
                page_response.raise_for_status() 
                html_soup = BeautifulSoup(page_response.text, 'html.parser') # parse html content
            except requests.exceptions.RequestException as request_error:
                print(f"error fetching URL: {request_error}")

            name_selector = "#main > div > div.w-full.xl\:w-8\/12.p-4 > div.mx-auto.max-w-3xl.space-y-6 > ul > li:nth-child(1) > a"
            name_element = html_soup.select_one(name_selector)
            if name_element:
                raw_name_text = name_element.get_text()
                vehicle_specs["ev_name"] = raw_name_text.strip()            
            else:
                print("could not find element using the exact class string") 

            capacity_selector = "#main > div > div.w-full.xl\:w-8\/12.p-4 > div.mx-auto.max-w-3xl.space-y-6 > section:nth-child(10) > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)"
            capacity_element = html_soup.select_one(capacity_selector)
            if capacity_element:
                raw_cap_text = capacity_element.get_text(strip = True)
                vehicle_specs["max_capacity"] = raw_cap_text.split(' ')[0]            
            else:
                print("could not find element using the exact class string") 

            charger_type_selector = "#main > div > div.w-full.xl\:w-8\/12.p-4 > div.mx-auto.max-w-3xl.space-y-6 > section:nth-child(10) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)"
            type_element = html_soup.select_one(charger_type_selector)
            if type_element:
                raw_type_text = type_element.get_text(strip = True)
                vehicle_specs["charger_type"] = raw_type_text.split(' ')[0]            
            else:
                print("could not find element using the exact class string") 

    for item in spec_urls:

        target_url = "https://evkx.net/models/bmw/ix/ix_xdrive45/chargingcurve/"

        if target_url.__contains__("chargingcurve"):
            try:
                page_response = requests.get(target_url)
                page_response.raise_for_status()
                html_soup = BeautifulSoup(page_response.text, 'html.parser') # parse html content
            except requests.exceptions.RequestException as request_error:
                print(f"error fetching url: {request_error}")

            curve_points = [] # list to hold charging curve data
            table_selector = "#curve-tbody-0"  
            table_body = html_soup.select_one(table_selector)
            if table_body:
                table_rows = table_body.find_all('tr')
                for row in table_rows:
                    table_cells = row.find_all('td')
                    if len(table_cells) >= 4:
                        soc_str = table_cells[0].get_text(strip=True)
                        try:
                            soc_val = int(soc_str.replace(' %', ''))
                        except ValueError:
                            soc_val = None 
                        speed_str = table_cells[1].get_text(strip=True)
                        try:
                            speed_val = int(speed_str.replace(' kW', ''))
                        except ValueError:
                            speed_val = None
                        time_str = table_cells[2].get_text(strip=True)
                        energy_str = table_cells[3].get_text(strip=True)
                        try:
                            energy_val = float(energy_str.replace(' kWh', ''))
                        except ValueError:
                            energy_val = None
                        if soc_val is not None and speed_val is not None and time_str is not None and energy_val is not None:
                            data_point = {
                                'soc': soc_val,
                                'speed': speed_val,
                                'time': time_str,
                                'energy_charged': energy_val
                            }
                            curve_points.append(data_point)      
            else:
                print("could not find element using the exact class string") 
            
            vehicle_specs['charging_curve_data'] = curve_points